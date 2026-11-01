// Saphene Audit — model-driven code + business-flow findings, wrapped in the
// claim-ledger discipline. The model proposes findings; every quote is
// re-verified by grep before the finding is believed; results are ledgered
// and diffed across runs so code rot becomes visible over time.

import { chat, loadModelConfig } from "./model.js";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { loadLedger, saveLedger, diffLedger, sleep, type LedgerEntry } from "./ledger.js";
import { grepLine } from "./verify.js";

const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql", ".prisma", ".php"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".venv", "__pycache__", ".idea", ".vscode", "design-system"]);
const MAX_FILE_BYTES = 24_000;
const MAX_FILE_CHARS = 8_000;

const SEVERITIES = ["critical", "major", "minor"] as const;
const CATEGORIES = ["bug", "security", "performance", "business-flow", "incomplete"] as const;

export interface Finding {
  id: string;
  title: string;
  severity: (typeof SEVERITIES)[number];
  category: (typeof CATEGORIES)[number];
  file: string;
  line: number;
  quote: string;
  suggestion: string;
  verified: boolean;
}

const args = process.argv.slice(2);
let repoDir: string | undefined;
let ledgerPath = ".saphene/audit.ledger.json";
let maxFiles = 12;
let updateLedger = false;
let focus = "all";

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--repo": repoDir = args[++i]; break;
    case "--ledger": ledgerPath = args[++i]; break;
    case "--max-files": maxFiles = parseInt(args[++i], 10) || maxFiles; break;
    case "--update-ledger": updateLedger = true; break;
    case "--focus": focus = args[++i] ?? focus; break;
  }
}

if (!repoDir || !existsSync(repoDir)) {
  console.error("Usage: npm run audit -- --repo <dir> [--focus code|flow|all] [--max-files N] [--ledger <path>] [--update-ledger]");
  process.exit(1);
}

const cfg = loadModelConfig();
if (!cfg) {
  console.error("[saphene] audit requires a model: set MODEL_* in .env");
  process.exit(2);
}

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

const AUDIT_SYSTEM =
  "You are a rigorous code and business-flow auditor for a real repository. " +
  "Find concrete, defensible issues: bugs, security holes, performance problems, " +
  "incomplete business flows (workflows that dead-end or skip steps), and faulty logic. " +
  "Do NOT report style nits. Every finding MUST include a quote that appears VERBATIM in the provided file " +
  "and a 1-based line number. " +
  'Respond with ONLY a JSON array: [{"title": string, "severity": "critical"|"major"|"minor", ' +
  '"category": "bug"|"security"|"performance"|"business-flow"|"incomplete", ' +
  '"line": number, "quote": string, "suggestion": string}]. No markdown fences.';

function stableId(file: string, title: string): string {
  let hash = 0;
  const input = `${file}::${title.toLowerCase()}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `fnd_${Math.abs(hash).toString(16)}`;
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
  for (const item of arr.slice(0, 8)) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const quote = typeof o.quote === "string" ? o.quote.trim() : "";
    const line = typeof o.line === "number" && Number.isFinite(o.line) ? Math.max(1, Math.floor(o.line)) : 1;
    if (title.length < 10 || quote.length < 4) continue;
    const severity = SEVERITIES.includes(o.severity as (typeof SEVERITIES)[number])
      ? (o.severity as (typeof SEVERITIES)[number])
      : "major";
    const category = CATEGORIES.includes(o.category as (typeof CATEGORIES)[number])
      ? (o.category as (typeof CATEGORIES)[number])
      : "bug";
    out.push({
      title,
      severity,
      category,
      file: relative(repoDir!, file) || file,
      line,
      quote,
      suggestion: typeof o.suggestion === "string" ? o.suggestion.trim() : "",
    });
  }
  return out;
}

const files = prioritize(listCodeFiles(repoDir!));
console.log(`Saphene audit — ${repoDir}`);
console.log(`Focus: ${focus} | Files in scope: ${files.length} | Model: ${cfg!.model}`);

const findings: Finding[] = [];
let checked = 0;

for (const file of files) {
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
            focus === "flow"
              ? `Audit this file for BUSINESS-FLOW issues only: dead-end workflows, missing steps, unenforced rules, incomplete handling. File: ${file}\n\n${content}`
              : `Audit this file for concrete bugs, security issues, performance problems, and incomplete business flows. File: ${file}\n\n${content}`,
        },
      ],
      2048,
    );
    for (const f of parseFindings(out, file)) {
      const hit = grepLine(file, f.quote);
      findings.push({ ...f, id: stableId(f.file, f.title), verified: hit !== null });
    }
    checked += 1;
  } catch (err) {
    console.warn(`[saphene] audit failed for ${file}: ${err instanceof Error ? err.message : err}`);
  }
  await sleep(1500);
}

const unverified = findings.filter((f) => !f.verified).length;
const bySev = (s: string) => findings.filter((f) => f.severity === s).length;

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

const order = { critical: 0, major: 1, minor: 2 } as const;
for (const f of [...findings].sort((a, b) => order[a.severity] - order[b.severity])) {
  const flag = f.verified ? "" : " (unverified quote)";
  console.log(`\n  [${f.severity.toUpperCase()}][${f.category}] ${f.title}${flag}`);
  console.log(`    ${f.file}:${f.line}`);
  console.log(`    > ${f.quote.slice(0, 140)}`);
  if (f.suggestion) console.log(`    fix: ${f.suggestion.slice(0, 140)}`);
}

if (diff.drifted.length > 0 || diff.resolved.length > 0) {
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

process.exitCode = bySev("critical") > 0 ? 1 : 0;
