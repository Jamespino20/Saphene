// CLI entry point for Saphene.
// Commands: init, verify, bridge, memory, help, guide.
// Adapters: memory | paper | helm (default: memory).
// Flags: --memory-dir <path>, --repo <dir> (repeatable), --paper <file> (repeatable),
//        --no-model, --code-only, --out <file>, --exclude <pattern> (repeatable), --help

import { runAdapter } from "./verify.js";
import { extractClaims } from "./extract.js";
import { loadLedger, saveLedger, diffLedger, scanMemoryFiles, scanMemoryFilesWithDiagnostics, sleep, type Ledger, type LedgerEntry } from "./ledger.js";
import { AUTO_WRITEBACK_CONFIDENCE, FLAG_FOR_HUMAN_CONFIDENCE, writeBackDecision } from "./standards.js";
import { drawProgress, endProgress } from "./progress.js";
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import { join, basename } from "node:path";
import { type TraceabilityRow } from "./schema.js";
import { checkConsistency } from "./consistency.js";
import { loadSuppressions, matchSuppression } from "./suppressions.js";
import { scanRepo } from "./scan.js";
import { ingestSarif } from "./ingest.js";
import { chat, loadModelConfig } from "./model.js";
import { loadMechanicalProfile, runMechanicalProfile } from "./profile.js";
import { loadAliasTableFromFile, loadAliasTables, mergeAliasTables } from "./aliases.js";

const args = process.argv.slice(2);
const KNOWN_COMMANDS = ["init", "verify", "bridge", "memory", "consistency", "profile", "doctor", "scan", "ingest", "review", "sweep", "help", "guide"] as const;
const firstPositional = args[0];
const command = (KNOWN_COMMANDS as readonly string[]).includes(firstPositional)
  ? firstPositional
  : (args.find((a) => a === "verify" || a === "init" || a === "bridge") ?? args[0]);

let memoryDir: string | undefined;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--memory-dir" && i + 1 < args.length) {
    memoryDir = args[++i];
  } else if (args[i].startsWith("--memory-dir=")) {
    memoryDir = args[i].split("=", 2)[1];
  }
}

const noModel = args.includes("--no-model");
const outIdx = args.indexOf("--out");
const outPath = outIdx !== -1 ? args[outIdx + 1] : undefined;
const envIdx = args.indexOf("--env");
const envPath = envIdx !== -1 ? args[envIdx + 1] : undefined;
const sarifIdx = args.indexOf("--sarif");
const sarifPath = sarifIdx !== -1 ? args[sarifIdx + 1] : undefined;

function collectFlagValues(flag: string): string[] {
  const values: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && i + 1 < args.length) values.push(args[++i]);
  }
  return values;
}

function printSummary(claims: { id: string; text: string; category: string; srsClause?: string; localId?: string }[], verdicts: { claimId: string; status: string; citation: string }[]): {
  total: number; matched: number; partial: number; mismatch: number; unfound: number;
} {
  const summary = {
    total: claims.length,
    matched: verdicts.filter((v) => v.status === "matched").length,
    partial: verdicts.filter((v) => v.status === "partial").length,
    mismatch: verdicts.filter((v) => v.status === "mismatch").length,
    unfound: verdicts.filter((v) => v.status === "unfound").length,
  };
  console.log(
    `  ${summary.total} claims | ${summary.matched} matched | ${summary.partial} partial | ` +
      `${summary.mismatch} mismatch | ${summary.unfound} unfound`,
  );
  console.log("  note: matched = literal evidence hit located in scope; it is not behavioral proof. Open the receipt.");
  for (const v of verdicts) {
    const claim = claims.find((c) => c.id === v.claimId);
    const srs =
      claim?.category === "srs"
        ? ` [srs ${claim.srsClause ?? "-"}${claim.localId ? `#${claim.localId}` : ""}]`
        : "";
    console.log(`  [${v.status}]${srs} ${claim?.text?.slice(0, 90)} — ${v.citation.slice(0, 140)}`);
  }
  return summary;
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function didYouMean(input: string): string | null {
  let best: string | null = null;
  let bestDist = 3;
  for (const cmd of KNOWN_COMMANDS) {
    const d = levenshtein(input, cmd);
    if (d < bestDist && d > 0) {
      bestDist = d;
      best = cmd;
    }
  }
  return best;
}

interface CommandGuide {
  summary: string;
  usage: string[];
  flags: Array<[string, string]>;
  examples: string[];
  exits: Array<[string, string]>;
  seeAlso: string;
}

const GUIDES: Record<string, CommandGuide> = {
  init: {
    summary: "Scaffold a memory directory with starter claims.",
    usage: ["saphene init [--personal] [--memory-dir <path>]", "saphene init --ci"],
    flags: [["--personal", "category folders (academia/work/creative/...) instead of the minimal template"], ["--memory-dir <path>", "where to scaffold (default ./memory)"], ["--ci", "scaffold a Saphene review workflow + baselines/claims dirs in the current repo"]],
    examples: ["saphene init --memory-dir ./memory", "saphene init --personal --memory-dir ./agent-memory"],
    exits: [["0", "directory scaffolded"]],
    seeAlso: "memory, verify",
  },
  verify: {
    summary: "Verify one file against itself (memory) or a repository (paper).",
    usage: ["saphene verify <file> [memory|paper|helm] [--repo <dir>] [--paper <file>] [--no-model]"],
    flags: [["memory|paper|helm", "memory = other lines in the same file are evidence; paper = repo/docs are evidence and the source never testifies for itself"], ["--repo <dir>", "paper-mode evidence repository"], ["--paper <file>", "paper-mode evidence document"], ["--code-only", "only code files count as evidence in paper mode"], ["--no-model", "offline heuristic extraction — no API key, deterministic"], ["--env <file>", "model .env path (default: SAPHENE_MODEL_* env, ./.env, source-adjacent .env)"]],
    examples: ["saphene verify README.md memory --no-model", "saphene verify README.md paper --repo ./app --no-model"],
    exits: [["0", "all claims matched"], ["1", "any claim unfound or mismatch — human review"]],
    seeAlso: "bridge (structured claims file), memory (whole directory), claims (hint syntax)",
  },
  bridge: {
    summary: "Verify a structured claims/SRS file against one or more target repositories.",
    usage: ["saphene bridge <claims-file> [--repo <dir>] [--paper <file>] [--code-only] [--no-model] [--env <file>] [--out <file>]"],
    flags: [["--repo <dir>", "repeatable: repository to search for evidence"], ["--paper <file>", "repeatable: document to search"], ["--code-only", "code files count as evidence; prose and claims files do not (prevents self-testimony)"], ["--no-model", "offline heuristic extraction"], ["--env <file>", "model .env path (default: SAPHENE_MODEL_* env, ./.env, source-adjacent .env)"], ["--out <file>", ".json writes a ledger baseline; anything else writes a markdown matrix"], ["--sarif <file>", "write SARIF 2.1.0 results for unfound/mismatch/partial verdicts"]],
    examples: ["saphene bridge claims.md --repo ./app --code-only --no-model", "saphene bridge claims.md --repo ./app --out .saphene/baseline.json"],
    exits: [["0", "all claims matched"], ["1", "any claim unfound or mismatch — human review"]],
    seeAlso: "verify, review",
  },
  help: {
    summary: "Show the command list, or help for one command.",
    usage: ["saphene help [command]", "saphene --help"],
    flags: [],
    examples: ["saphene help", "saphene help bridge"],
    exits: [["0", "n/a (help prints to stderr, exit 1 by convention)"]],
    seeAlso: "guide",
  },
  guide: {
    summary: "Show a detailed walkthrough for a command, or verify guide coverage.",
    usage: ["saphene guide <command>", "saphene guide --check"],
    flags: [["--check", "verify every command has a guide (SAPH-26514-01 coverage gate)"]],
    examples: ["saphene guide bridge", "saphene guide --check"],
    exits: [["0", "guide shown / coverage complete"], ["1", "unknown command / coverage missing"]],
    seeAlso: "help",
  },
  scan: {
    summary: "Run deterministic rule checks over code (no model, offline).",
    usage: ["saphene scan [--repo <dir>] [--sarif <file>]"],
    flags: [["--repo <dir>", "repository to scan (default .)"], ["--sarif <file>", "write findings as SARIF 2.1.0"]],
    examples: ["saphene scan --repo ./app", "saphene scan --repo ./app --sarif findings.sarif"],
    exits: [["0", "no critical findings"], ["1", "critical findings present"]],
    seeAlso: "audit, bridge",
  },
  ingest: {
    summary: "Import a SARIF report (Slither, Semgrep, Snyk, CodeQL) into a Saphene ledger.",
    usage: ["saphene ingest <report.sarif> [--out <ledger.json>]"],
    flags: [["--out <file>", "ledger to write (default .saphene/ingested.ledger.json)"]],
    examples: ["saphene ingest slither.sarif", "saphene ingest semgrep.sarif --out .saphene/scanner.ledger.json"],
    exits: [["0", "report ingested"]],
    seeAlso: "scan, review",
  },
  review: {
    summary: "PR gate: diff verdicts against a committed evidence baseline ledger. Fails closed without one.",
    usage: ["saphene review --claims <file> --repo <dir> --ledger <path> [--code-only] [--update-ledger] [--env <file>]"],
    flags: [["--claims <file>", "claims file to verify"], ["--repo <dir>", "repository under review"], ["--ledger <path>", "committed JSON baseline (missing/corrupt = exit 2, fail closed)"], ["--code-only", "required when the claims file lives inside the repo (prevents self-testimony)"], ["--update-ledger", "explicitly create/overwrite the baseline"], ["--env <file>", "model .env path (default: SAPHENE_MODEL_* env, ./.env, source-adjacent .env)"]],
    examples: ["saphene review --claims claims.md --repo ./ --code-only --ledger baselines/claims.ledger.json"],
    exits: [["0", "no drift"], ["1", "active drift (suppressions excluded)"], ["2", "missing/corrupt baseline — fail closed"]],
    seeAlso: "bridge, sweep",
  },
  sweep: {
    summary: "Whole-repo verify loop: verify every .md in a repo against the repo and write one aggregate ledger.",
    usage: ["saphene sweep [--repo <dir>] [--out <ledger.json>] [--code-only | --include-prose] [--no-model] [--env <file>]"],
    flags: [["--repo <dir>", "repository to sweep (default .)"], ["--out <file>", "aggregate ledger to write (default ./.saphene/sweep.ledger.json)"], ["--code-only", "code files count as evidence (default on for sweep)"], ["--include-prose", "also count docs as evidence"], ["--no-model", "offline heuristic extraction"], ["--env <file>", "model .env path (default: SAPHENE_MODEL_* env, ./.env, source-adjacent .env)"]],
    examples: ["saphene sweep --repo ./app --out .saphene/sweep.ledger.json"],
    exits: [["0", "no unfound/mismatch"], ["1", "unfound or mismatch present"]],
    seeAlso: "bridge, memory, review",
  },
  doctor: {
    summary: "Check runtime, model configuration, workspace, and ledger health.",
    usage: ["saphene doctor [--call] [--env <file>]"],
    flags: [["--call", "make one cheap model completion to prove the configured endpoint answers"]],
    examples: ["saphene doctor", "saphene doctor --call"],
    exits: [["0", "environment healthy (model optional)"], ["2", "runtime too old, or --call failed"]],
    seeAlso: "help, guide",
  },
  memory: {
    summary: "Audit every .md in a memory directory, write <memory-dir>/.saphene/ledger.json, and diff against the last run.",
    usage: ["saphene memory [--memory-dir <dir>] [--repo <dir>] [--paper <file>] [--no-model] [--env <file>]"],
    flags: [["--memory-dir <dir>", "memory root (default ./memory)"], ["--repo <dir>", "repeatable: evidence target"], ["--code-only", "only code files count as evidence"], ["--no-model", "offline heuristics; structured blocks win, otherwise factual prose with inferable identifiers becomes claims"], ["--env <file>", "model .env path (default: SAPHENE_MODEL_* env, ./.env, source-adjacent .env)"]],
    examples: ["saphene memory --memory-dir ./memory --repo ./app --no-model"],
    exits: [["0", "no drift"], ["1", "drift detected, or any claim unfound/mismatch"]],
    seeAlso: "init, verify, consistency (docs against each other)",
  },
  consistency: {
    summary: "Check claims from multiple documents against each other for contradictions.",
    usage: ["saphene consistency <files-or-dirs...> [--aliases <file>]"],
    flags: [["--aliases <file>", "JSON alias/distinct-entity table; .saphene/aliases.json is also auto-loaded"]],
    examples: ["saphene consistency docs/brief.md docs/characters.md", "saphene consistency ./story-bible --aliases .saphene/aliases.json"],
    exits: [["0", "no potential contradictions found"], ["1", "potential contradictions require human review"]],
    seeAlso: "bridge, claims",
  },
  profile: {
    summary: "Run deterministic mechanical checks from a project-owned JSON profile.",
    usage: ["saphene profile <files-or-dirs...> --config <profile.json>"],
    flags: [["--config <file>", "JSON profile: wordBand, termBudgets, quoteBalance, maxParagraphWords, crossFileNgram"]],
    examples: ["saphene profile ./docs --config .saphene/profile.json"],
    exits: [["0", "no mechanical violations"], ["1", "violations found"]],
    seeAlso: "consistency, verify",
  },
};

const STANDALONE_GUIDES: Record<string, CommandGuide> = {
  claims: {
    summary: "Evidence-hint syntax and the minimal structured claims format.",
    usage: ["- Claim text.", "  category: srs | srsClause: 4.2 | localId: REQ-014 | requirementType: functional | priority: mandatory", "  evidence: literalIdentifier, path/to/file.ts, Exact Phrase"],
    flags: [["evidence:", "comma-separated literal identifiers, paths, table names, or exact phrases — never paraphrases"], ["polarity: negative", "assert absence/ignorance; strong/corroborated forbidden evidence becomes mismatch, one weak token becomes partial, absence becomes matched"], ["status: planned", "future claim verified against the plan/source document, not current implementation"], ["scope: a.md, b.md", "limit evidence search to paths containing these fragments"]],
    examples: ["saphene bridge examples/minimal-claims.md --repo . --code-only --no-model", "saphene guide bridge"],
    exits: [["0", "n/a"], ["1", "n/a"]],
    seeAlso: "bridge, verify, consistency",
  },
  audit: {
    summary: "Persona-panel code and business-flow audit; timestamped markdown report.",
    usage: ["saphene audit --repo <dir> [--focus all|security|performance|flow] [--max-files N|0] [--all] [--update-ledger]"],
    flags: [["--focus", "limit the panel (default all)"], ["--max-files", "cap files scanned (default 12; 0 = no cap)"], ["--all", "audit every eligible file, no cap"], ["--update-ledger", "persist findings to the audit ledger"]],
    examples: ["saphene audit --repo ./app --focus security --update-ledger", "saphene audit --repo ./app --all"],
    exits: [["0", "no critical findings"], ["1", "critical findings present"], ["2", "some files unchecked (provider errors) — not a clean bill"]],
    seeAlso: "review",
  },
  mcp: {
    summary: "Run the MCP stdio server for coding agents.",
    usage: ["saphene mcp", "saphene mcp --inspect"],
    flags: [["--inspect", "list registered tools and exit"]],
    examples: ["saphene mcp"],
    exits: [["0", "server started (runs until killed)"]],
    seeAlso: "bridge, memory",
  },
  drift: {
    summary: "Inject a drift into a file copy; report whether detection fires.",
    usage: ["saphene drift <good-file> <drifted-file> <drift-text>"],
    flags: [],
    examples: ["saphene drift README.md drifted.md 'extra claim line'"],
    exits: [["0", "drift detected"], ["1", "not separately detected"]],
    seeAlso: "review",
  },
  test: {
    summary: "7-check deterministic self-test suite. No model key needed.",
    usage: ["saphene test"],
    flags: [],
    examples: ["saphene test"],
    exits: [["0", "7/7 checks passed"], ["1", "one or more checks failed"]],
    seeAlso: "verify, bridge",
  },
};

const ALL_GUIDES: Record<string, CommandGuide> = { ...GUIDES, ...STANDALONE_GUIDES };

function printHelp(topic?: string): number {
  if (topic && ALL_GUIDES[topic]) return printGuide(topic);
  if (topic) {
    console.error(`No help for '${topic}'.`);
    const sug = didYouMean(topic);
    if (sug) console.error(`Did you mean '${sug}'?`);
    return 1;
  }
  console.error("Saphene — Clarity Through Evidence. CI for what your coding agent remembers.");
  console.error("");
  console.error("Usage: saphene <command> [options]");
  console.error("");
  console.error("Commands:");
  for (const [name, g] of Object.entries(GUIDES)) {
    console.error(`  ${name.padEnd(8)} ${g.summary}`);
  }
  console.error("");
  console.error("Standalone tools (run directly):");
  for (const [name, g] of Object.entries(STANDALONE_GUIDES)) {
    console.error(`  ${name.padEnd(8)} ${g.summary}`);
  }
  console.error("");
  console.error("Common flags: --no-model (offline heuristics) · --code-only (code evidence only) · --out <file>");
  console.error("Run 'saphene guide <command>' for a full walkthrough. Run 'saphene guide --check' to verify guide coverage.");
  console.error("");
  console.error("Exit codes: 0 pass · 1 drift/unfound (human review) · 2 engine error");
  return 1;
}

function printGuide(topic: string): number {
  const g = ALL_GUIDES[topic];
  if (!g) {
    console.error(`Unknown command '${topic}'.`);
    const sug = didYouMean(topic);
    if (sug) console.error(`Did you mean '${sug}'?`);
    console.error(`Run 'saphene help' for the command list.`);
    return 1;
  }
  console.error(`Saphene ${topic} — ${g.summary}`);
  console.error("");
  for (const u of g.usage) console.error(`  ${u}`);
  if (g.flags.length) {
    console.error("");
    console.error("Flags:");
    for (const [flag, desc] of g.flags) console.error(`  ${flag.padEnd(22)} ${desc}`);
  }
  console.error("");
  console.error("Examples:");
  for (const e of g.examples) console.error(`  $ ${e}`);
  console.error("");
  console.error("Exit codes:");
  for (const [code, desc] of g.exits) console.error(`  ${code.padEnd(4)} ${desc}`);
  console.error("");
  console.error(`See also: ${g.seeAlso}`);
  return 1;
}

function usage(): number {
  return printHelp();
}

async function main(): Promise<number> {
  if (!command) return printHelp();
  if (args.includes("--help") || args.includes("-h")) {
    const topic = args.find((a) => !a.startsWith("-") && a !== command && ALL_GUIDES[a]);
    return printHelp(topic);
  }
  if (command === "help") {
    const topic = args.find((a) => !a.startsWith("--") && a !== "help");
    return printHelp(topic);
  }
  if (command === "guide") {
    if (args.includes("--check")) {
      const required = [...KNOWN_COMMANDS, ...Object.keys(STANDALONE_GUIDES)];
      const missing = required.filter((c) => !ALL_GUIDES[c]?.examples?.length);
      if (missing.length > 0) {
        console.error(`Guide coverage missing (SAPH-26514-01 ✗): ${missing.join(", ")}`);
        return 1;
      }
      console.log(`Guide coverage: ${required.length}/${required.length} commands documented (SAPH-26514-01 ✓)`);
      return 0;
    }
    const topic = args.find((a) => !a.startsWith("--") && a !== "guide");
    if (!topic) return printHelp();
    return printGuide(topic);
  }
  if (!(KNOWN_COMMANDS as readonly string[]).includes(command)) {
    console.error(`Unknown command '${command}'.`);
    const sug = didYouMean(command);
    if (sug) console.error(`Did you mean '${sug}'? (run 'saphene guide ${sug}')`);
    console.error(`Run 'saphene help' for the command list.`);
    return 1;
  }
  if (command === "scan") {
    const repoIdx = args.indexOf("--repo");
    const repo = repoIdx !== -1 ? args[repoIdx + 1] : (args.find((a) => !a.startsWith("--") && a !== "scan") ?? ".");
    if (!existsSync(repo)) {
      console.error(`Repository not found: ${repo} (check the path)`);
      return 1;
    }
    const { files, findings } = scanRepo(repo);
    const bySev = (s: string) => findings.filter((f) => f.severity === s).length;
    console.log(`Saphene scan — ${repo}`);
    console.log(`Files scanned: ${files} | Rules: deterministic, no model`);
    console.log(`${findings.length} findings | critical ${bySev("critical")} · major ${bySev("major")} · minor ${bySev("minor")}`);
    const order = { critical: 0, major: 1, minor: 2 } as const;
    for (const f of [...findings].sort((a, b) => order[a.severity] - order[b.severity])) {
      console.log(`  [${f.severity.toUpperCase()}][${f.ruleId}] ${f.title}`);
      console.log(`    ${f.file}:${f.line}: ${f.quote.slice(0, 120)}`);
      console.log(`    standards: ${f.standards.join(", ")}`);
    }
    if (sarifPath) {
      const sarif = {
        version: "2.1.0",
        $schema: "https://json.schemastore.org/sarif-2.1.0.json",
        runs: [
          {
            tool: { driver: { name: "Saphene Scan", version: "0.1.0" } },
            results: findings.map((f) => ({
              ruleId: f.ruleId,
              level: f.severity === "critical" ? "error" : f.severity === "major" ? "warning" : "note",
              message: { text: `${f.title} — ${f.quote}` },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: f.file.replace(/\\/g, "/") },
                    region: { startLine: f.line },
                  },
                },
              ],
            })),
          },
        ],
      };
      writeFileSync(sarifPath, JSON.stringify(sarif, null, 2), "utf8");
      console.log(`SARIF written to ${sarifPath}`);
    }
    return bySev("critical") > 0 ? 1 : 0;
  }
  if (command === "ingest") {
    const file = args.find((a) => !a.startsWith("--") && a !== "ingest" && args[args.indexOf(a) - 1] !== "--out" && args[args.indexOf(a) - 1] !== "--sarif");
    if (!file || !existsSync(file)) {
      console.error("Usage: saphene ingest <report.sarif> [--out <ledger.json>]");
      return 1;
    }
    const { tool, entries } = ingestSarif(file);
    const out = outPath ?? ".saphene/ingested.ledger.json";
    saveLedger(out, {
      version: 1,
      lastRunAt: new Date().toISOString(),
      entries: Object.fromEntries(entries.map((e) => [e.claimId, e])),
    });
    console.log(`Saphene ingest — ${file}`);
    console.log(`Tool: ${tool} | Findings ingested: ${entries.length}`);
    console.log(`Ledger written: ${out}`);
    return 0;
  }
  if (command === "doctor") {
    let failures = 0;
    const nodeMajor = Number(process.versions.node.split(".")[0]);
    console.log(`node ${process.versions.node} ${nodeMajor >= 20 ? "✓" : "✗ (need >= 20)"}`);
    if (nodeMajor < 20) failures++;
    console.log(`workspace ${process.cwd()}`);
    const guideMissing = [...KNOWN_COMMANDS, ...Object.keys(STANDALONE_GUIDES)].filter((c) => !ALL_GUIDES[c]?.examples?.length);
    console.log(`guide coverage ${guideMissing.length === 0 ? "✓ complete" : `✗ missing ${guideMissing.join(", ")}`}`);
    if (guideMissing.length > 0) failures++;
    const cfg = loadModelConfig(envPath);
    if (cfg) {
      console.log(`model ${cfg.model} @ ${cfg.baseUrl}${cfg.fallbackBaseUrl ? " (+ provider fallback)" : ""}`);
      if (args.includes("--call")) {
        try {
          const started = Date.now();
          const r = await chat(cfg, [{ role: "user", content: "Reply with the single word: ok" }], 512);
          console.log(`model call ✓ ${r.model} answered in ${Date.now() - started}ms`);
        } catch (err) {
          console.log(`model call ✗ ${err instanceof Error ? err.message.slice(0, 200) : err}`);
          failures++;
        }
      } else {
        console.log("model call — skipped (pass --call to prove the endpoint answers)");
      }
    } else {
      console.log("model — not configured (heuristic/--no-model mode remains available)");
    }
    const ledgerCandidates = ["baselines/matriflow.ledger.json", "baselines/anvilos.ledger.json", "examples/fixtures/baseline.ledger.json"];
    for (const p of ledgerCandidates) {
      if (!existsSync(p)) continue;
      console.log(`ledger ${p} ${loadLedger(p) ? "✓ valid" : "✗ corrupt/invalid"}`);
      if (!loadLedger(p)) failures++;
    }
    console.log(failures === 0 ? "doctor: healthy" : `doctor: ${failures} problem(s)`);
    return failures === 0 ? 0 : 2;
  }
  if (command === "init") {
    if (args.includes("--ci")) {
      const workflow = [
        "name: Saphene Review",
        "",
        "on:",
        "  pull_request:",
        "",
        "permissions:",
        "  contents: read",
        "  pull-requests: write",
        "",
        "jobs:",
        "  review:",
        "    runs-on: ubuntu-latest",
        "    timeout-minutes: 20",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: actions/setup-node@v4",
        "        with:",
        "          node-version: 22",
        "          cache: npm",
        "      - run: npm ci",
        "      - shell: bash",
        "        run: |",
        "          set -o pipefail",
        "          npx saphene review --claims claims/claims.md --repo . --code-only --ledger baselines/claims.ledger.json | tee review.md",
        "",
      ].join("\n");
      mkdirSync(join(process.cwd(), ".github", "workflows"), { recursive: true });
      mkdirSync(join(process.cwd(), "baselines"), { recursive: true });
      mkdirSync(join(process.cwd(), "claims"), { recursive: true });
      writeFileSync(join(process.cwd(), ".github", "workflows", "saphene-review.yml"), workflow, "utf8");
      console.log("CI scaffold written: .github/workflows/saphene-review.yml");
      console.log("Next: add claims/claims.md, then create the baseline explicitly:");
      console.log("  npx saphene review --claims claims/claims.md --repo . --code-only --ledger baselines/claims.ledger.json --update-ledger");
      console.log("Commit claims, workflow, and baselines together.");
      return 0;
    }
    const template = args.includes("--personal") ? "personal" : "minimal";
    const dir = memoryDir ?? "./memory";
    const { scaffold } = await import("./init.js");
    scaffold(dir, template);
    return 0;
  }

  if (command === "consistency" || command === "profile") {
    const flagWithValue = new Set(["--aliases", "--config"]);
    const positional = args.filter(
      (a, i) => !a.startsWith("--") && a !== command && !flagWithValue.has(args[i - 1]),
    );
    const expandInputs = (inputs: string[]): string[] => {
      const files: string[] = [];
      for (const input of inputs) {
        if (!existsSync(input)) continue;
        if (statSync(input).isDirectory()) files.push(...scanMemoryFiles(input));
        else files.push(input);
      }
      return [...new Set(files)];
    };
    const files = expandInputs(positional);
    if (files.length === 0) {
      console.error(`Usage: saphene ${command} <files-or-dirs...>`);
      return 1;
    }

    if (command === "consistency") {
      const aliasesIdx = args.indexOf("--aliases");
      const explicit = aliasesIdx !== -1 ? loadAliasTableFromFile(args[aliasesIdx + 1]) : undefined;
      const aliases = mergeAliasTables([
        loadAliasTables(files[0], positional),
        ...(explicit ? [explicit] : []),
      ]);
      const documents = files.map((file) => {
        const content = readFileSync(file, "utf8");
        return { source: file, content, claims: extractClaims(file, content, aliases) };
      });
      const totalClaims = documents.reduce((sum, d) => sum + d.claims.length, 0);
      const conflicts = checkConsistency(documents, aliases);
      console.log(`Saphene consistency — ${documents.length} documents | ${totalClaims} claims`);
      if (conflicts.length === 0) {
        console.log("  no potential cross-document contradictions found");
        return 0;
      }
      console.log(`  ${conflicts.length} potential contradiction(s) — human review required`);
      for (const conflict of conflicts) {
        console.log(`\n  [${conflict.type}] ${conflict.detail}`);
        console.log(`    A ${conflict.a.citation}: ${conflict.a.text.slice(0, 120)}`);
        console.log(`    B ${conflict.b.citation}: ${conflict.b.text.slice(0, 120)}`);
      }
      return 1;
    }

    const configIdx = args.indexOf("--config");
    let profile;
    try {
      profile = configIdx !== -1 ? loadMechanicalProfile(args[configIdx + 1]) : undefined;
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      return 1;
    }
    if (!profile) {
      console.error("Usage: saphene profile <files-or-dirs...> --config <profile.json>");
      console.error('Example profile: { "wordBand": [5000, 5423], "termBudgets": { "said": 7 }, "quoteBalance": true, "maxParagraphWords": 120, "crossFileNgram": 6 }');
      return 1;
    }
    const documents = files.map((file) => ({ file, content: readFileSync(file, "utf8") }));
    const violations = runMechanicalProfile(documents, profile);
    console.log(`Saphene profile — ${documents.length} files | ${violations.length} violation(s)`);
    for (const violation of violations.slice(0, 100)) {
      console.log(`  [${violation.rule}] ${violation.file}: ${violation.detail}`);
    }
    if (violations.length > 100) console.log(`  ... ${violations.length - 100} more`);
    return violations.length > 0 ? 1 : 0;
  }

  if (command === "bridge") {
    const positional = args.filter(
      (a, i) =>
        !a.startsWith("--") &&
        a !== "bridge" &&
        args[i - 1] !== "--repo" &&
        args[i - 1] !== "--paper" &&
        args[i - 1] !== "--out" &&
        args[i - 1] !== "--memory-dir" &&
        args[i - 1] !== "--exclude" &&
        args[i - 1] !== "--env" &&
        args[i - 1] !== "--sarif",
    );
    const file = positional[0];
    if (!file || !existsSync(file)) {
      console.error("Usage: npm run bridge -- <memory-file> [--repo <dir>] [--paper <file>] [--no-model] [--out <file>]");
      return 1;
    }

    const targets = [...collectFlagValues("--repo"), ...collectFlagValues("--paper")];
    const excludes = collectFlagValues("--exclude");
    const codeOnly = args.includes("--code-only");
    for (const t of targets) {
      if (!existsSync(t)) {
        console.error(`Target not found: ${t}`);
        return 1;
      }
    }

    const content = readFileSync(file, "utf8");
    console.log(`Saphene bridge — ${file}`);
    console.log(`Targets: ${targets.length ? targets.join(", ") : "(none)"}`);

    const { claims, verdicts, traceability, modelUsed, modelNote } = await runAdapter("paper", file, content, {
      useModel: !noModel,
      targets,
      includeSource: false,
      excludeFiles: excludes,
      codeOnly,
      modelEnvPath: envPath,
    });
    console.log(`  model: ${modelUsed ? "on" : "off"} (${modelNote})`);

    const summary = printSummary(claims, verdicts);

    if (sarifPath) {
      const levelFor = (s: string) => (s === "unfound" || s === "mismatch" ? "error" : "warning");
      const sarif = {
        version: "2.1.0",
        $schema: "https://json.schemastore.org/sarif-2.1.0.json",
        runs: [
          {
            tool: {
              driver: {
                name: "Saphene",
                version: "0.1.0",
                informationUri: "https://github.com/Jamespino20/Saphene",
                rules: [
                  { id: "saphene/unfound", name: "ClaimUnfound", shortDescription: { text: "Claim evidence not located" } },
                  { id: "saphene/mismatch", name: "ClaimMismatch", shortDescription: { text: "Evidence contradicts the claim" } },
                  { id: "saphene/partial", name: "ClaimPartial", shortDescription: { text: "Claim only partially supported" } },
                ],
              },
            },
            results: verdicts
              .filter((v) => v.status === "unfound" || v.status === "mismatch" || v.status === "partial")
              .map((v) => {
                const claim = claims.find((c) => c.id === v.claimId);
                const loc = v.location ?? "";
                const lineMatch = loc.match(/:(\d+)$/);
                const uri = lineMatch ? loc.slice(0, -lineMatch[0].length) : loc;
                return {
                  ruleId: `saphene/${v.status}`,
                  level: levelFor(v.status),
                  message: { text: `${claim?.text ?? v.claimId} — ${v.reason}` },
                  locations: [
                    {
                      physicalLocation: {
                        artifactLocation: { uri: uri.replace(/\\/g, "/") },
                        region: { startLine: lineMatch ? Number(lineMatch[1]) : 1 },
                      },
                    },
                  ],
                };
              }),
          },
        ],
      };
      writeFileSync(sarifPath, JSON.stringify(sarif, null, 2), "utf8");
      console.log(`SARIF written to ${sarifPath}`);
    }

  if (traceability.length > 0) {
    const matrix = [
      "| Claim | SRS clause | Local ID | Type | Verdict | Anchor | Citation |",
      "| ----- | ---------- | -------- | ---- | ------- | ------ | -------- |",
      ...traceability.map(
        (r) => `| ${r.claimId} | ${r.srsClause} | ${r.localId} | ${r.requirementType} | ${r.status} | ${(r.anchor ?? "-").slice(0, 80)} | ${r.citation} |`,
      ),
    ].join("\n");
      console.log("\nTraceability matrix:\n" + matrix);

      const resolvedOut =
        outPath ??
        (memoryDir ? join(memoryDir, "verdicts", basename(file).replace(/\.[^.]+$/, "") + ".traceability.md") : undefined);
      if (resolvedOut) {
        if (resolvedOut.endsWith(".json")) {
          const ledger = {
            version: 1 as const,
            lastRunAt: new Date().toISOString(),
            entries: Object.fromEntries(
              claims
                .filter((c) => c.expectedEvidence.length > 0)
                .map((c) => {
                  const v = verdicts.find((x) => x.claimId === c.id)!;
                  const decision = writeBackDecision(v.confidence);
                  return [
                    c.id,
                    {
                      claimId: c.id,
                      text: c.text,
                      source: file,
                      status: v.status,
                      citation: v.citation,
                      anchor: v.anchor,
                      location: v.location,
                      verifiedAt: new Date().toISOString(),
                      ...(decision === "review" ? { needsReview: true as const } : {}),
                    },
                  ];
                }),
            ),
          };
          saveLedger(resolvedOut, ledger);
        } else {
          writeFileSync(
            resolvedOut,
            `# Traceability — ${file}\n\nGenerated ${new Date().toISOString()}\n\n${matrix}\n`,
            "utf8",
          );
        }
        console.log(`\nTraceability written to ${resolvedOut}`);
      }
    }

    return summary.mismatch + summary.unfound > 0 ? 1 : 0;
  }

  if (command === "memory") {
    const dir = memoryDir ?? "./memory";
    if (!existsSync(dir)) {
      console.error(`Memory directory not found: ${dir} (run init first)`);
      return 1;
    }
    const targets = [...collectFlagValues("--repo"), ...collectFlagValues("--paper")];
    const codeOnly = args.includes("--code-only");
    for (const t of targets) {
      if (!existsSync(t)) {
        console.error(`Target not found: ${t}`);
        return 1;
      }
    }
    const scan = scanMemoryFilesWithDiagnostics(dir);
    const files = scan.files;
    if (scan.truncated || scan.skipped > 0) {
      console.error(
        `Warning: memory scan ${scan.truncated ? "hit the 50-file cap" : ""}${scan.truncated && scan.skipped > 0 ? " and " : ""}${scan.skipped > 0 ? `skipped ${scan.skipped} unreadable item(s)` : ""}; results may be incomplete.`,
      );
    }
    if (files.length === 0) {
      console.error(`No .md files found in ${dir}`);
      return 1;
    }

    const ledgerPath = join(dir, ".saphene", "ledger.json");
    const prev = loadLedger(ledgerPath);
    console.log(`Saphene memory — ${dir}`);
    console.log(`Modules: ${files.length} | Targets: ${targets.length ? targets.join(", ") : "(none)"}`);
    if (prev) console.log(`Previous run: ${prev.lastRunAt ?? "unknown"}`);

    const entries: LedgerEntry[] = [];
    const flagged: string[] = [];
    let skipped = 0;
    let done = 0;
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const { claims, verdicts } = await runAdapter("memory", file, content, {
        useModel: !noModel,
        targets,
        includeSource: false,
        codeOnly,
        modelEnvPath: envPath,
      });
      done += 1;
      drawProgress(done, files.length, basename(file));
      const relFile = file;
      for (const v of verdicts) {
        const c = claims.find((x) => x.id === v.claimId);
        if (!c) continue;
        if (c.expectedEvidence.length === 0) {
          skipped += 1;
          continue;
        }
        const decision = writeBackDecision(v.confidence);
        if (decision === "flag") {
          flagged.push(`[${c.id}] ${c.text.slice(0, 90)} (confidence ${v.confidence})`);
          continue;
        }
        entries.push({
          claimId: c.id,
          text: c.text,
          source: relFile,
          status: v.status,
          citation: v.citation,
          anchor: v.anchor,
          location: v.location,
          verifiedAt: new Date().toISOString(),
          ...(decision === "review" ? { needsReview: true as const } : {}),
        });
      }
      if (!noModel) await sleep(2000);
    }
    endProgress();

    const ledger: Ledger = {
      version: 1,
      lastRunAt: new Date().toISOString(),
      entries: Object.fromEntries(entries.map((e) => [e.claimId, e])),
    };
    const diff = diffLedger(prev, entries);

    const byStatus = (s: string) => entries.filter((e) => e.status === s).length;
    console.log(
      `  ${entries.length} ledgered claims | ${byStatus("matched")} matched | ${byStatus("partial")} partial | ` +
        `${byStatus("unfound")} unfound | ${byStatus("mismatch")} mismatch` +
        (skipped > 0 ? ` | ${skipped} unledgered (no evidence hints)` : ""),
    );

    if (diff.drifted.length > 0) {
      console.log(`\n  DRIFT DETECTED (${diff.drifted.length}):`);
      for (const d of diff.drifted) {
        console.log(`    [${d.from} -> ${d.entry.status}] ${d.entry.text.slice(0, 90)}`);
        console.log(`      now: ${d.entry.citation.slice(0, 140)}`);
      }
    }
    if (diff.resolved.length > 0) {
      console.log(`\n  RESOLVED (${diff.resolved.length}):`);
      for (const r of diff.resolved) {
        console.log(`    [${r.from} -> ${r.entry.status}] ${r.entry.text.slice(0, 90)}`);
      }
    }
    if (diff.relocated.length > 0) {
      console.log(`\n  RELOCATED (${diff.relocated.length} anchors unchanged; line hints moved):`);
      for (const r of diff.relocated) {
        console.log(`    ${r.entry.text.slice(0, 90)}`);
        console.log(`      ${r.fromLocation ?? "unknown"} -> ${r.entry.location ?? "unknown"}`);
      }
    }
    console.log(
      `\n  vs previous run: ${diff.unchanged} unchanged, ${diff.added.length} added, ` +
        `${diff.resolved.length} resolved, ${diff.drifted.length} drifted, ${diff.relocated.length} relocated`,
    );
    if (flagged.length > 0) {
      console.log(
        `\n  FLAG FOR HUMAN (${flagged.length} below ${FLAG_FOR_HUMAN_CONFIDENCE} confidence, not written back):`,
      );
      for (const f of flagged) console.log(`    ${f}`);
    }
    console.log(
      `\n  write-back: auto >= ${AUTO_WRITEBACK_CONFIDENCE}, review-flagged in between, human-flagged below ${FLAG_FOR_HUMAN_CONFIDENCE}`,
    );

    saveLedger(ledgerPath, ledger);
    console.log(`Ledger saved: ${ledgerPath}`);

    return diff.drifted.length > 0 || byStatus("unfound") + byStatus("mismatch") > 0 ? 1 : 0;
  }

  if (command === "review") {
    const flagValue = (flag: string): string | undefined => {
      const i = args.indexOf(flag);
      return i !== -1 ? args[i + 1] : undefined;
    };
    const claimsFile = flagValue("--claims");
    const repoDir = flagValue("--repo");
    const ledgerPath = flagValue("--ledger");
    const updateLedger = args.includes("--update-ledger");
    const reviewCodeOnly = args.includes("--code-only");
    if (!claimsFile || !repoDir || !ledgerPath) {
      console.error("Usage: saphene review --claims <file> --repo <dir> --ledger <path> [--code-only] [--update-ledger] [--env <file>]");
      return 1;
    }
    if (!existsSync(claimsFile)) { console.error(`Claims file not found: ${claimsFile} (check the path)`); return 1; }
    if (!existsSync(repoDir)) { console.error(`Repo not found: ${repoDir} (check the path)`); return 1; }

    const ledgerExists = existsSync(ledgerPath);
    const prev: Ledger | null = loadLedger(ledgerPath);
    if (ledgerExists && !prev) {
      console.error(`Baseline ledger is corrupt or invalid: ${ledgerPath}`);
      console.error("Failing closed: repair or replace the baseline; do not let a corrupt baseline pass as 'no drift'.");
      return 2;
    }
    if (!ledgerExists && !updateLedger) {
      console.error(`Baseline ledger not found: ${ledgerPath}`);
      console.error("Failing closed: a PR gate must compare against a committed baseline. Create one explicitly with --update-ledger, then commit it.");
      return 2;
    }
    const content = readFileSync(claimsFile, "utf8");

    const { claims, verdicts, modelUsed, modelNote } = await runAdapter("paper", claimsFile, content, {
      useModel: !noModel,
      targets: [repoDir],
      includeSource: false,
      codeOnly: reviewCodeOnly,
      modelEnvPath: envPath,
    });
    console.log(`  model: ${modelUsed ? "on" : "off"} (${modelNote})`);

    const entries: LedgerEntry[] = claims
      .filter((c) => c.expectedEvidence.length > 0)
      .map((c) => {
        const v = verdicts.find((x) => x.claimId === c.id)!;
        return {
          claimId: c.id,
          text: c.text,
          source: claimsFile,
          status: v.status,
          citation: v.citation,
          anchor: v.anchor,
          location: v.location,
          verifiedAt: new Date().toISOString(),
        };
      });

    const diff = diffLedger(prev, entries);
    const suppressions = loadSuppressions(repoDir);
    const suppressedDrift = diff.drifted.filter((d) => matchSuppression(d.entry, suppressions));
    const activeDrift = diff.drifted.filter((d) => !matchSuppression(d.entry, suppressions));

    if (updateLedger) {
      const ledger: Ledger = {
        version: 1,
        lastRunAt: new Date().toISOString(),
        entries: Object.fromEntries(entries.map((e) => [e.claimId, e])),
      };
      saveLedger(ledgerPath, ledger);
    }

    const driftFor = (id: string) => diff.drifted.find((d) => d.entry.claimId === id);
    const addedIds = new Set(diff.added.map((a) => a.claimId));
    const resolvedIds = new Set(diff.resolved.map((r) => r.entry.claimId));
    const relocatedIds = new Set(diff.relocated.map((r) => r.entry.claimId));

    const lines: string[] = [
      "## Saphene Review",
      "",
      `**${basename(claimsFile)}** vs \`${repoDir}\` — ${entries.length} claims: ` +
        `${entries.filter((e) => e.status === "matched").length} matched, ` +
        `${entries.filter((e) => e.status === "partial").length} partial, ` +
        `${entries.filter((e) => e.status === "unfound").length} unfound, ` +
        `${entries.filter((e) => e.status === "mismatch").length} mismatch`,
      "",
      activeDrift.length > 0
        ? `### ⚠ Drift detected — this PR breaks ${activeDrift.length} verified claim(s)`
        : suppressedDrift.length > 0
          ? `### ✔ No active drift — ${suppressedDrift.length} drifted claim(s) suppressed (see below)`
          : "### ✔ No drift — all previously-verified claims still hold",
      "",
      "| Claim | Verdict | Δ vs base | ID | Anchor | Citation |",
      "| ----- | ------- | --------- | -- | ------ | -------- |",
    ];

    const localIdByClaim = new Map(claims.map((c) => [c.id, c.localId ?? c.srsClause ?? "-"]));
    for (const e of entries) {
      const delta = driftFor(e.claimId)
        ? `\`${driftFor(e.claimId)!.from}\` → \`${e.status}\` ⚠`
        : addedIds.has(e.claimId)
          ? "new"
          : resolvedIds.has(e.claimId)
            ? `\`${diff.resolved.find((r) => r.entry.claimId === e.claimId)!.from}\` → \`${e.status}\``
            : relocatedIds.has(e.claimId)
              ? "relocated (same anchor)"
              : "";
      lines.push(`| ${e.text.slice(0, 80)} | ${e.status} | ${delta} | ${localIdByClaim.get(e.claimId) ?? "-"} | ${(e.anchor ?? "-").slice(0, 70)} | ${e.citation.slice(0, 90)} |`);
    }

    if (activeDrift.length > 0) {
      lines.push("", "Broken claims require either a code fix or an explicit memory update in the same PR.");
    }
    if (suppressedDrift.length > 0) {
      lines.push("", `Suppressed drift (${suppressedDrift.length}, .saphene/suppressions.json):`);
      for (const d of suppressedDrift) {
        const s = matchSuppression(d.entry, suppressions);
        lines.push(`- ${d.entry.text.slice(0, 80)} — ${s?.reason ?? "suppressed"}${s?.expires ? ` (expires ${s.expires})` : ""}`);
      }
    }

    console.log(lines.join("\n"));
    return activeDrift.length > 0 ? 1 : 0;
  }

  if (command === "sweep") {
    const sweepRepoIdx = args.indexOf("--repo");
    let sweepRepo = sweepRepoIdx !== -1 ? args[sweepRepoIdx + 1] : undefined;
    if (!sweepRepo) {
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (!a.startsWith("--") && a !== "sweep" && !["--out", "--env"].includes(args[i - 1])) {
          sweepRepo = a;
          break;
        }
      }
      sweepRepo ??= ".";
    }
    if (!existsSync(sweepRepo)) {
      console.error(`Repository not found: ${sweepRepo} (check the path)`);
      return 1;
    }
    const sweepCodeOnly = !args.includes("--include-prose");
    const sweepOut = outPath ?? join(process.cwd(), ".saphene", "sweep.ledger.json");
    const sweepFiles = scanMemoryFiles(sweepRepo);
    if (sweepFiles.length === 0) {
      console.error(`No .md files found in ${sweepRepo}`);
      return 1;
    }
    console.log(`Saphene sweep — ${sweepRepo}`);
    console.log(`Documents: ${sweepFiles.length} | Evidence: ${sweepCodeOnly ? "code only" : "code + prose"}`);

    const entries: LedgerEntry[] = [];
    let skipped = 0;
    let done = 0;
    for (const file of sweepFiles) {
      const content = readFileSync(file, "utf8");
      const { claims, verdicts } = await runAdapter("paper", file, content, {
        useModel: !noModel,
        targets: [sweepRepo],
        includeSource: false,
        codeOnly: sweepCodeOnly,
        modelEnvPath: envPath,
      });
      done += 1;
      drawProgress(done, sweepFiles.length, basename(file));
      for (const v of verdicts) {
        const c = claims.find((x) => x.id === v.claimId);
        if (!c || c.expectedEvidence.length === 0) {
          skipped += 1;
          continue;
        }
        entries.push({
          claimId: c.id,
          text: c.text,
          source: file,
          status: v.status,
          citation: v.citation,
          anchor: v.anchor,
          location: v.location,
          verifiedAt: new Date().toISOString(),
        });
      }
      if (!noModel) await sleep(2000);
    }
    endProgress();

    const sweepLedger: Ledger = {
      version: 1,
      lastRunAt: new Date().toISOString(),
      entries: Object.fromEntries(entries.map((e) => [e.claimId, e])),
    };
    saveLedger(sweepOut, sweepLedger);
    const byStatus = (s: string) => entries.filter((e) => e.status === s).length;
    console.log(
      `  ${entries.length} ledgered claims | ${byStatus("matched")} matched | ${byStatus("partial")} partial | ` +
        `${byStatus("unfound")} unfound | ${byStatus("mismatch")} mismatch` +
        (skipped > 0 ? ` | ${skipped} unledgered (no evidence hints)` : ""),
    );
    console.log(`Ledger saved: ${sweepOut}`);
    return byStatus("unfound") + byStatus("mismatch") > 0 ? 1 : 0;
  }

  if (command !== "verify" || !args.some((a) => !a.startsWith("--") && a !== "verify")) {
    return usage();
  }

  const positional = args.filter(
    (a, i) =>
      !a.startsWith("--") &&
      a !== "verify" &&
      !["--memory-dir", "--out", "--repo", "--paper", "--env", "--sarif"].includes(args[i - 1]),
  );
  const [file, adapter = "memory"] = positional;

  if (!file || !existsSync(file)) {
    console.error(`Source file not found: ${file ?? "(missing)"}`);
    return 1;
  }

  if (!["memory", "paper", "helm"].includes(adapter)) {
    console.error(`Unknown adapter: ${adapter}`);
    return 1;
  }

  const targets = [...collectFlagValues("--repo"), ...collectFlagValues("--paper")];
  for (const target of targets) {
    if (!existsSync(target)) {
      console.error(`Target not found: ${target}`);
      return 1;
    }
  }
  if (adapter === "paper" && targets.length === 0) {
    console.error("Paper mode requires --repo <dir> or --paper <file> (use bridge for a structured claims file, or memory to verify within the file).");
    return 1;
  }

  const content = readFileSync(file, "utf8");
  console.log(`Memory dir: ${memoryDir ?? "<cwd>/memory"}`);
  const { claims, verdicts, modelUsed, modelNote } = await runAdapter(adapter as "memory" | "paper" | "helm", file, content, {
    useModel: !noModel,
    targets,
    includeSource: adapter === "memory",
    codeOnly: args.includes("--code-only"),
    modelEnvPath: envPath,
  });
  console.log(`  model: ${modelUsed ? "on" : "off"} (${modelNote})`);

  console.log(`Saphene verify (${adapter}) — ${file}`);
  const summary = printSummary(claims, verdicts);
  return summary.mismatch + summary.unfound > 0 ? 1 : 0;
}

process.exitCode = await main();
