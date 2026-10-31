// CLI entry point for Saphene.
// Commands: init, verify, bridge.
// Adapters: memory | paper | helm (default: memory).
// Flags: --memory-dir <path|path>, --repo <dir> (repeatable), --paper <file> (repeatable),
//        --no-model, --out <file>

import { runAdapter } from "./verify.js";
import { loadLedger, saveLedger, diffLedger, scanMemoryFiles, sleep, type Ledger, type LedgerEntry } from "./ledger.js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const args = process.argv.slice(2);
const command = args.find((a) => a === "verify" || a === "init" || a === "bridge") ?? args[0];

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

function printSummary(claims: { id: string; text: string; category: string; srsClause?: string }[], verdicts: { claimId: string; status: string; citation: string }[]): {
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
    const srs = claim?.category === "srs" ? ` [srs ${claim.srsClause ?? "-"}]` : "";
    console.log(`  [${v.status}]${srs} ${claim?.text?.slice(0, 90)} — ${v.citation.slice(0, 140)}`);
  }
  return summary;
}

function usage(): number {
  console.error("Usage: tsx src/cli.ts init [--personal] [--memory-dir <path>]");
  console.error("       tsx src/cli.ts verify <file> [memory|paper|helm] [--no-model]");
  console.error("       tsx src/cli.ts bridge <memory-file> [--repo <dir>] [--paper <file>] [--no-model] [--out <file>]");
  console.error("       tsx src/cli.ts memory [--memory-dir <dir>] [--repo <dir>] [--paper <file>] [--no-model]");
  return 1;
}

async function main(): Promise<number> {
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
        "| Claim | SRS clause | Type | Verdict | Citation |",
        "| ----- | ---------- | ---- | ------- | -------- |",
        ...traceability.map(
          (r) => `| ${r.claimId} | ${r.srsClause} | ${r.requirementType} | ${r.status} | ${r.citation} |`,
        ),
      ].join("\n");
      console.log("\nTraceability matrix:\n" + matrix);

      const resolvedOut =
        outPath ??
        (memoryDir ? join(memoryDir, "verdicts", basename(file).replace(/\.[^.]+$/, "") + ".traceability.md") : undefined);
      if (resolvedOut) {
        writeFileSync(
          resolvedOut,
          `# Traceability — ${file}\n\nGenerated ${new Date().toISOString()}\n\n${matrix}\n`,
          "utf8",
        );
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
    let skipped = 0;
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const { claims, verdicts } = await runAdapter("memory", file, content, {
        useModel: !noModel,
        targets,
        includeSource: false,
      });
      const relFile = file;
      for (const v of verdicts) {
        const c = claims.find((x) => x.id === v.claimId);
        if (!c) continue;
        if (c.expectedEvidence.length === 0) {
          skipped += 1;
          continue;
        }
        entries.push({
          claimId: c.id,
          text: c.text,
          source: relFile,
          status: v.status,
          citation: v.citation,
          verifiedAt: new Date().toISOString(),
        });
      }
      if (!noModel) await sleep(2000);
    }

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
