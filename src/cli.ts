// CLI entry point for Saphene.
// Commands: init, verify, bridge, memory, help, guide.
// Adapters: memory | paper | helm (default: memory).
// Flags: --memory-dir <path>, --repo <dir> (repeatable), --paper <file> (repeatable),
//        --no-model, --code-only, --out <file>, --exclude <pattern> (repeatable), --help

import { runAdapter } from "./verify.js";
import { loadLedger, saveLedger, diffLedger, scanMemoryFiles, sleep, type Ledger, type LedgerEntry } from "./ledger.js";
import { AUTO_WRITEBACK_CONFIDENCE, FLAG_FOR_HUMAN_CONFIDENCE, writeBackDecision } from "./standards.js";
import { drawProgress, endProgress } from "./progress.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { type TraceabilityRow } from "./schema.js";

const args = process.argv.slice(2);
const KNOWN_COMMANDS = ["init", "verify", "bridge", "memory", "help", "guide"] as const;
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
    usage: ["saphene init [--personal] [--memory-dir <path>]"],
    flags: [["--personal", "category folders (academia/work/creative/...) instead of the minimal template"], ["--memory-dir <path>", "where to scaffold (default ./memory)"]],
    examples: ["saphene init --memory-dir ./memory", "saphene init --personal --memory-dir ./agent-memory"],
    exits: [["0", "directory scaffolded"]],
    seeAlso: "memory, verify",
  },
  verify: {
    summary: "Verify one file's claims against repository evidence.",
    usage: ["saphene verify <file> [memory|paper|helm] [--no-model]"],
    flags: [["memory|paper|helm", "evidence adapter: workspace memory (default), docs+repo paper, reserved helm"], ["--no-model", "offline heuristic extraction — no API key, deterministic"]],
    examples: ["saphene verify README.md memory --no-model", "saphene verify claims.md paper --repo ./app"],
    exits: [["0", "all claims matched"], ["1", "any claim unfound or mismatch — human review"]],
    seeAlso: "bridge, memory",
  },
  bridge: {
    summary: "Verify claims in a file against one or more target repositories.",
    usage: ["saphene bridge <claims-file> [--repo <dir>] [--paper <file>] [--code-only] [--no-model] [--out <file>]"],
    flags: [["--repo <dir>", "repeatable: repository to search for evidence"], ["--paper <file>", "repeatable: document to search"], ["--code-only", "code files count as evidence; prose and claims files do not (prevents self-testimony)"], ["--no-model", "offline heuristic extraction"], ["--out <file>", ".json writes a ledger baseline; anything else writes a markdown matrix"]],
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
  memory: {
    summary: "Audit every .md in a memory directory, write the ledger, diff against the last run.",
    usage: ["saphene memory [--memory-dir <dir>] [--repo <dir>] [--paper <file>] [--no-model]"],
    flags: [["--memory-dir <dir>", "memory root (default ./memory)"], ["--repo <dir>", "repeatable: evidence target"], ["--no-model", "offline heuristics"]],
    examples: ["saphene memory --memory-dir ./memory --repo ./app --no-model"],
    exits: [["0", "no drift"], ["1", "drift detected, or any claim unfound/mismatch"]],
    seeAlso: "init, verify",
  },
};

const STANDALONE_GUIDES: Record<string, CommandGuide> = {
  review: {
    summary: "PR gate: diff verdicts against a committed evidence baseline ledger.",
    usage: ["npx tsx src/review.ts --claims <file> --repo <dir> --ledger <path> [--code-only] [--update-ledger]"],
    flags: [["--claims <file>", "claims file to verify"], ["--repo <dir>", "repository under review"], ["--ledger <path>", "committed JSON baseline"], ["--code-only", "required when the claims file lives inside the repo (prevents self-testimony)"], ["--update-ledger", "overwrite the baseline with this run"]],
    examples: ["npx tsx src/review.ts --claims claims.md --repo ./ --code-only --ledger .saphene/baseline.json"],
    exits: [["0", "no drift"], ["1", "drift detected"]],
    seeAlso: "bridge",
  },
  audit: {
    summary: "Persona-panel code and business-flow audit; timestamped markdown report.",
    usage: ["npm run audit -- --repo <dir> [--focus all|security|performance|flow] [--max-files N|0] [--all] [--update-ledger]"],
    flags: [["--focus", "limit the panel (default all)"], ["--max-files", "cap files scanned (default 12; 0 = no cap)"], ["--all", "audit every eligible file, no cap"], ["--update-ledger", "persist findings to the audit ledger"]],
    examples: ["npm run audit -- --repo ./app --focus security --update-ledger", "npm run audit -- --repo ./app --all"],
    exits: [["0", "no critical findings"], ["1", "critical findings present"], ["2", "some files unchecked (provider errors) — not a clean bill"]],
    seeAlso: "review",
  },
  mcp: {
    summary: "Run the MCP stdio server for coding agents.",
    usage: ["npm run mcp", "npm run mcp -- --inspect"],
    flags: [["--inspect", "list registered tools and exit"]],
    examples: ["npm run mcp"],
    exits: [["0", "server started (runs until killed)"]],
    seeAlso: "bridge, memory",
  },
  drift: {
    summary: "Inject a drift into a file copy; report whether detection fires.",
    usage: ["npx tsx src/drift-harness.ts <good-file> <drifted-file> <drift-text>"],
    flags: [],
    examples: ["npx tsx src/drift-harness.ts README.md drifted.md 'extra claim line'"],
    exits: [["0", "drift detected"], ["1", "not separately detected"]],
    seeAlso: "review",
  },
  test: {
    summary: "7-check deterministic self-test suite. No model key needed.",
    usage: ["npm test"],
    flags: [],
    examples: ["npm test"],
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
  if (command === "init") {
    const template = args.includes("--personal") ? "personal" : "minimal";
    const dir = memoryDir ?? "./memory";
    const { scaffold } = await import("./init.js");
    scaffold(dir, template);
    return 0;
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
        args[i - 1] !== "--exclude",
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

    const { claims, verdicts, traceability } = await runAdapter("paper", file, content, {
      useModel: !noModel,
      targets,
      includeSource: false,
      excludeFiles: excludes,
      codeOnly,
    });

    const summary = printSummary(claims, verdicts);

  if (traceability.length > 0) {
    const matrix = [
      "| Claim | SRS clause | Local ID | Type | Verdict | Citation |",
      "| ----- | ---------- | -------- | ---- | ------- | -------- |",
      ...traceability.map(
        (r) => `| ${r.claimId} | ${r.srsClause} | ${r.localId} | ${r.requirementType} | ${r.status} | ${r.citation} |`,
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
    for (const t of targets) {
      if (!existsSync(t)) {
        console.error(`Target not found: ${t}`);
        return 1;
      }
    }
    const files = scanMemoryFiles(dir);
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
    console.log(
      `\n  vs previous run: ${diff.unchanged} unchanged, ${diff.added.length} added, ` +
        `${diff.resolved.length} resolved, ${diff.drifted.length} drifted`,
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

  if (command !== "verify" || !args.some((a) => !a.startsWith("--") && a !== "verify")) {
    return usage();
  }

  const positional = args.filter(
    (a, i) => !a.startsWith("--") && a !== "verify" && args[i - 1] !== "--memory-dir" && args[i - 1] !== "--out",
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

  const content = readFileSync(file, "utf8");
  console.log(`Memory dir: ${memoryDir ?? "<cwd>/memory"}`);
  const { claims, verdicts } = await runAdapter(adapter as "memory" | "paper" | "helm", file, content, {
    useModel: !noModel,
  });

  console.log(`Saphene verify (${adapter}) — ${file}`);
  const summary = printSummary(claims, verdicts);
  return summary.mismatch + summary.unfound > 0 ? 1 : 0;
}

process.exitCode = await main();
