// Saphene Audit — a panel of personalized senior-reviewer personas audits the
// codebase in parallel. The model proposes findings; every quote is
// re-verified by grep before it is believed; results are ledgered and diffed
// across runs so code rot becomes visible over time. Reports land in a
// chosen folder with long-term impact notes, open questions for the
// developer, and context-rich fix prompts.

import { chat, loadModelConfig } from "./model.js";
import { readFileSync, existsSync, statSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname, relative, dirname, basename, resolve } from "node:path";
import { loadLedger, saveLedger, diffLedger, sleep, type LedgerEntry } from "./ledger.js";
import { grepLine } from "./verify.js";

const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql", ".prisma", ".php"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".venv", "__pycache__", ".idea", ".vscode", "design-system", "targets", "audits"]);
const MAX_FILE_BYTES = 24_000;
const MAX_FILE_CHARS = 8_000;
const CONCURRENCY = 3;

interface Persona {
  id: string;
  name: string;
  brief: string;
}

const PERSONAS: Persona[] = [
  { id: "security", name: "Security Engineer", brief: "injection, broken authz, missing auth, secrets exposure, tenant isolation failures" },
  { id: "performance", name: "Performance Engineer", brief: "N+1 queries, unbounded work, redundant I/O, missing transactions, scaling traps" },
  { id: "flow", name: "Business-Flow Analyst", brief: "dead-end workflows, missing process steps, unenforced business rules, half-finished features" },
  { id: "quality", name: "Maintainability Reviewer", brief: "fragile patterns, error-handling gaps, duplication, dead code, hidden coupling" },
];

const SEVERITIES = ["critical", "major", "minor"] as const;
const CATEGORIES = ["bug", "security", "performance", "business-flow", "incomplete"] as const;
const PERSONA_IDS = PERSONAS.map((p) => p.id);

export interface Finding {
  id: string;
  persona: string;
  title: string;
  severity: (typeof SEVERITIES)[number];
  category: (typeof CATEGORIES)[number];
  file: string;
  line: number;
  quote: string;
  impact: string;
  questions: string[];
  suggestion: string;
  verified: boolean;
}

const args = process.argv.slice(2);
let repoDir: string | undefined;
let ledgerPath = ".saphene/audit.ledger.json";
let maxFiles = 12;
let updateLedger = false;
let focus = "all";
let outDir = "audits";
let reportPath: string | undefined;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--repo": repoDir = args[++i]; break;
    case "--ledger": ledgerPath = args[++i]; break;
    case "--max-files": maxFiles = parseInt(args[++i] ?? "", 10) || maxFiles; break;
    case "--update-ledger": updateLedger = true; break;
    case "--focus": focus = args[++i] ?? focus; break;
    case "--out-dir": outDir = args[++i] ?? outDir; break;
    case "--report": reportPath = args[++i]; break;
  }
}

if (!repoDir || !existsSync(repoDir)) {
  console.error("Usage: npm run audit -- --repo <dir> [--focus code|flow|all] [--max-files N] [--out-dir audits] [--report <file>] [--update-ledger]");
  process.exit(1);
}

const cfg = loadModelConfig();
if (!cfg) {
  console.error("[saphene] audit requires a model: set MODEL_* in .env");
  process.exit(2);
}

const AUDIT_SYSTEM =
  "You simulate a panel of " + PERSONAS.length + " senior code reviewers, each with a distinct specialty: " +
  PERSONAS.map((p) => `${p.id} (${p.name}: ${p.brief})`).join("; ") +
  ". Each reviewer examines the file INDEPENDENTLY and only reports issues inside their specialty. " +
  "Report concrete, defensible issues — no style nits. For every finding include: the reviewer id, a title, " +
  "severity (critical/major/minor), category (bug/security/performance/business-flow/incomplete), a 1-based line number, " +
  "a quote that appears VERBATIM in the file, the long-term impact if left unresolved (2+ sentences, concretely: what rots, " +
  "what compounds, what it costs later), up to 2 clarifying questions a fixer should ask the developer first, and a fix direction. " +
  'Respond with ONLY a JSON array: [{"reviewer": string, "title": string, "severity": string, "category": string, ' +
  '"line": number, "quote": string, "impact": string, "questions": string[], "suggestion": string}]. No markdown fences.';

function listCodeFiles(dir: string, out: string[] = []): string[] {
  if (out.length >= 200) return out;
  let entries: string[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }).map((e) => e.name);
  } catch {
    return out;
  }
  for (const name of entries.sort()) {
    if (out.length >= 200) break;
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(name)) listCodeFiles(full, out);
    } else if (stat.isFile() && stat.size <= MAX_FILE_BYTES && CODE_EXTS.has(extname(name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function prioritize(files: string[]): string[] {
  const score = (f: string): number => {
    const p = f.replace(/\\/g, "/").toLowerCase();
    if (p.includes("/actions/")) return 0;
    if (p.includes("/lib/")) return 1;
    if (p.includes("/api/") || p.includes("/services/")) return 2;
    if (p.endsWith(".sql") || p.endsWith(".prisma")) return 3;
    if (p.includes("/middleware/") || p.includes("/proxy")) return 4;
    return 5;
  };
  return files.sort((a, b) => score(a) - score(b)).slice(0, maxFiles);
}

function stableId(file: string, persona: string, title: string): string {
  let hash = 0;
  const input = `${file}::${persona}::${title.toLowerCase()}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `fnd_${Math.abs(hash).toString(16)}`;
}

function extractContext(file: string, line: number, span = 8): { start: number; block: string } {
  try {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    const start = Math.max(1, line - span);
    const end = Math.min(lines.length, line + span);
    const block = lines
      .slice(start - 1, end)
      .map((l, idx) => `${String(start + idx).padStart(4)} | ${l}`)
      .join("\n");
    return { start, block };
  } catch {
    return { start: Math.max(1, line - span), block: "(context unavailable)" };
  }
}

function parseFindings(raw: string, file: string): Array<Omit<Finding, "id" | "verified">> {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  let arr: unknown[];
  try {
    arr = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  const out: Array<Omit<Finding, "id" | "verified">> = [];
  for (const item of arr.slice(0, 12)) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const quote = typeof o.quote === "string" ? o.quote.trim() : "";
    const line = typeof o.line === "number" && Number.isFinite(o.line) ? Math.max(1, Math.floor(o.line)) : 1;
    if (title.length < 10 || quote.length < 4) continue;
    const personaRaw = typeof o.reviewer === "string" ? o.reviewer.toLowerCase() : "";
    const persona =
      PERSONAS.find((p) => personaRaw.includes(p.id) || personaRaw.includes(p.name.toLowerCase()))?.id ?? "quality";
    const severity = SEVERITIES.includes(o.severity as (typeof SEVERITIES)[number])
      ? (o.severity as (typeof SEVERITIES)[number])
      : "major";
    const category = CATEGORIES.includes(o.category as (typeof CATEGORIES)[number])
      ? (o.category as (typeof CATEGORIES)[number])
      : "bug";
    out.push({
      persona,
      title,
      severity,
      category,
      file: relative(repoDir!, file) || file,
      line,
      quote,
      impact: typeof o.impact === "string" ? o.impact.trim() : "",
      questions: Array.isArray(o.questions) ? o.questions.filter((q): q is string => typeof q === "string" && q.trim().length > 0) : [],
      suggestion: typeof o.suggestion === "string" ? o.suggestion.trim() : "",
    });
  }
  return out;
}

async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const files = prioritize(listCodeFiles(repoDir!));
console.log(`Saphene audit — ${repoDir}`);
console.log(`Panel: ${PERSONAS.map((p) => p.name).join(" · ")}`);
console.log(`Focus: ${focus} | Files: ${files.length} | Model: ${cfg!.model} | Concurrency: ${CONCURRENCY}`);

let checked = 0;
const findings: Finding[] = [];

await pool(files, CONCURRENCY, async (file) => {
  let content = readFileSync(file, "utf8");
  if (content.length > MAX_FILE_CHARS) content = content.slice(0, MAX_FILE_CHARS) + "\n...[truncated]";
  try {
    const { content: out } = await chat(
      cfg!,
      [
        { role: "system", content: AUDIT_SYSTEM },
        {
          role: "user",
          content:
            (focus === "flow"
              ? "Panel: Business-Flow Analyst leads; other reviewers may add only high-severity findings. "
              : "") +
            `File: ${file}\n\n${content}`,
        },
      ],
      3072,
    );
    const parsed = parseFindings(out, file);
    for (const f of parsed) {
      const abs = join(repoDir!, f.file);
      const hit = grepLine(abs, f.quote) ?? grepLine(file, f.quote);
      findings.push({ ...f, id: stableId(f.file, f.persona, f.title), verified: hit !== null });
    }
    checked += 1;
    process.stdout.write(`  [${checked}/${files.length}] ${relative(repoDir!, file)} — ${parsed.length} findings\n`);
  } catch (err) {
    checked += 1;
    process.stdout.write(`  [${checked}/${files.length}] ${relative(repoDir!, file)} — audit failed: ${err instanceof Error ? err.message.slice(0, 80) : err}\n`);
  }
});

const unverified = findings.filter((f) => !f.verified).length;
const bySev = (s: string) => findings.filter((f) => f.severity === s).length;
const byPersona = (id: string) => findings.filter((f) => f.persona === id).length;

const entries: LedgerEntry[] = findings.map((f) => ({
  claimId: f.id,
  text: `[${f.severity}/${f.category}] ${f.title}`,
  source: f.file,
  status: f.verified ? "matched" : "partial",
  citation: `${f.file}:${f.line}: ${f.quote.slice(0, 120)}`,
  verifiedAt: new Date().toISOString(),
}));

const prev = loadLedger(ledgerPath);
const diff = diffLedger(prev, entries);

console.log(
  `\n${findings.length} findings across ${checked} files | ` +
    `critical ${bySev("critical")} · major ${bySev("major")} · minor ${bySev("minor")}` +
    (unverified ? ` | ${unverified} quote-unverified (dropped to partial)` : ""),
);
console.log(`By reviewer: ${PERSONAS.map((p) => `${p.name}: ${byPersona(p.id)}`).join(" · ")}`);

const order = { critical: 0, major: 1, minor: 2 } as const;
for (const f of [...findings].sort((a, b) => order[a.severity] - order[b.severity])) {
  const reviewer = PERSONAS.find((p) => p.id === f.persona)?.name ?? f.persona;
  const flag = f.verified ? "" : " (unverified quote)";
  console.log(`\n  [${f.severity.toUpperCase()}][${f.category}] ${f.title}${flag}`);
  console.log(`    reviewer: ${reviewer} · ${f.file}:${f.line}`);
  console.log(`    > ${f.quote.slice(0, 140)}`);
  if (f.questions.length) console.log(`    asks: ${f.questions[0].slice(0, 120)}`);
}

if (diff.drifted.length > 0 || diff.resolved.length > 0 || diff.added.length > 0) {
  console.log(`\n  vs previous audit: ${diff.unchanged} unchanged, ${diff.added.length} new, ${diff.resolved.length} fixed, ${diff.drifted.length} regressed`);
}

if (updateLedger) {
  saveLedger(ledgerPath, {
    version: 1,
    lastRunAt: new Date().toISOString(),
    entries: Object.fromEntries(entries.map((e) => [e.claimId, e])),
  });
  console.log(`\nLedger saved: ${ledgerPath}`);
}

if (reportPath || outDir) {
  const esc = (s: string): string => s.replace(/`/g, "'").replace(/\r?\n/g, " ");
  const byCat = (c: string) => findings.filter((f) => f.category === c).length;
  const ts = new Date();
  const stamp = `${ts.getFullYear()}${String(ts.getMonth() + 1).padStart(2, "0")}${String(ts.getDate()).padStart(2, "0")}-${String(ts.getHours()).padStart(2, "0")}${String(ts.getMinutes()).padStart(2, "0")}`;
  const resolvedPath = reportPath ?? join(outDir, `${basename(resolve(repoDir!))}-${stamp}.md`);
  const md: string[] = [
    "# Saphene Audit Report",
    "",
    `**Repository:** \`${repoDir}\`  `,
    `**Generated:** ${ts.toISOString()}  `,
    `**Model:** ${cfg!.model} · focus: ${focus} · files scanned: ${checked} · concurrency: ${CONCURRENCY}  `,
    `**Findings:** ${findings.length} total — critical ${bySev("critical")} · major ${bySev("major")} · minor ${bySev("minor")}`,
    "",
    "## Review panel",
    "",
    "| Reviewer | Specialty | Findings |",
    "| --- | --- | --- |",
    ...PERSONAS.map((p) => `| ${p.name} | ${p.brief} | ${byPersona(p.id)} |`),
    "",
    "| Severity | Count | | Category | Count |",
    "| --- | --- | --- | --- | --- |",
    `| critical | ${bySev("critical")} | | bug | ${byCat("bug")} |`,
    `| major | ${bySev("major")} | | security | ${byCat("security")} |`,
    `| minor | ${bySev("minor")} | | performance | ${byCat("performance")} |`,
    `| | | | business-flow | ${byCat("business-flow")} |`,
    `| | | | incomplete | ${byCat("incomplete")} |`,
    "",
    prev ? `**vs previous audit:** ${diff.unchanged} unchanged · ${diff.added.length} new · ${diff.resolved.length} fixed · ${diff.drifted.length} regressed` : "**vs previous audit:** first run — baseline established.",
    "",
    "## How to use this report",
    "",
    "1. **Every finding carries a receipt.** The `quote` was re-verified verbatim against the named file before the finding was believed; findings whose quote could not be located are marked `partial` and deserve extra scrutiny.",
    "2. **Reviewers are personas, not one blob.** Each finding names the reviewer who raised it — treat the Security Engineer's items differently from the Maintainability Reviewer's.",
    "3. **Work critical → major → minor.** Security and bug categories first.",
    "4. **Fix prompts are context-rich and copy-paste ready.** They include surrounding code, long-term impact, and the reviewer's open questions. Paste one into any coding agent; if the questions matter, the agent should ask you before writing code.",
    "5. **Re-audit to track progress.** Run with `--update-ledger`; the ledger diffs findings across runs — regressions surface as drift.",
    "",
    "## Findings",
    "",
  ];
  for (const f of [...findings].sort((a, b) => order[a.severity] - order[b.severity])) {
    const reviewer = PERSONAS.find((p) => p.id === f.persona)?.name ?? f.persona;
    const ctx = extractContext(join(repoDir!, f.file), f.line);
    const questionsBlock: string[] = f.questions.length
      ? [
          `- **Questions for the developer:**`,
          ...f.questions.map((q) => `  - ${esc(q)}`),
        ]
      : [];
    const promptQuestionsBlock: string[] = f.questions.length
      ? [
          "Open questions from the reviewer — if any of these change the approach, ask the developer before writing code:",
          ...f.questions.map((q) => `- ${esc(q)}`),
          "",
        ]
      : [];
    md.push(
      `### [${f.severity.toUpperCase()}][${f.category}] ${esc(f.title)}`,
      "",
      `- **Reviewer:** ${reviewer}`,
      `- **Location:** \`${f.file}:${f.line}\`${f.verified ? "" : " · _quote-unverified (partial)_"}`,
      `- **Evidence:**`,
      "```",
      f.quote.slice(0, 200),
      "```",
      `- **Long-term impact if unresolved:** ${esc(f.impact) || "—"}`,
      ...questionsBlock,
      `- **Fix direction:** ${esc(f.suggestion) || "—"}`,
      "",
      `**Surrounding code (${f.file}, lines ${ctx.start}–${ctx.start + ctx.block.split("\n").length - 1}):**`,
      "```",
      ctx.block,
      "```",
      "",
      "**Fix prompt** (paste into your agent):",
      "```text",
      `You are fixing one reviewed issue in the repository at ${repoDir}.`,
      "",
      `File: ${f.file} (target line ${f.line}). Surrounding code:`,
      "",
      ctx.block,
      "",
      `Issue [${f.severity} / ${f.category}], raised by our ${reviewer} review:`,
      esc(f.title),
      "",
      f.impact ? `Long-term impact if unresolved: ${esc(f.impact)}` : "",
      `Fix direction: ${esc(f.suggestion) || "Use your judgment consistent with the issue."}`,
      "",
      ...promptQuestionsBlock,
      "Requirements:",
      "- Keep the diff minimal and focused on this issue only.",
      "- Match the file's existing style and conventions.",
      "- Do not add comments explaining the fix.",
      "- After your patch, state any assumptions you made in one short list.",
      "```",
      "",
    );
  }
  mkdirSync(dirname(resolvedPath), { recursive: true });
  writeFileSync(resolvedPath, md.filter((l) => l !== "").join("\n").replace(/\n{3,}/g, "\n\n"), "utf8");
  console.log(`\nReport written: ${resolvedPath}`);
}

process.exitCode = bySev("critical") > 0 ? 1 : 0;
