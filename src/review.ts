// Saphene Review — ledger-diff PR gate.
// Verifies a claims file against a repo, diffs verdicts against the committed
// baseline ledger, and emits a markdown review. Drift (a PR that breaks
// previously-verified claims) fails the check.

import { runAdapter } from "./verify.js";
import { loadLedger, saveLedger, diffLedger, type Ledger } from "./ledger.js";
import { readFileSync, existsSync } from "node:fs";
import { basename } from "node:path";

const args = process.argv.slice(2);

let claimsFile: string | undefined;
let repoDir: string | undefined;
let ledgerPath: string | undefined;
let updateLedger = false;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--claims": claimsFile = args[++i]; break;
    case "--repo": repoDir = args[++i]; break;
    case "--ledger": ledgerPath = args[++i]; break;
    case "--update-ledger": updateLedger = true; break;
  }
}

if (!claimsFile || !repoDir || !ledgerPath) {
  console.error("Usage: tsx src/review.ts --claims <file> --repo <dir> --ledger <path> [--update-ledger]");
  process.exit(1);
}
if (!existsSync(claimsFile)) { console.error(`Claims file not found: ${claimsFile}`); process.exit(1); }
if (!existsSync(repoDir)) { console.error(`Repo not found: ${repoDir}`); process.exit(1); }

const prev: Ledger | null = loadLedger(ledgerPath);
const content = readFileSync(claimsFile, "utf8");

const { claims, verdicts } = await runAdapter("paper", claimsFile, content, {
  useModel: false,
  targets: [repoDir],
  includeSource: false,
});

const entries = claims
  .filter((c) => c.expectedEvidence.length > 0)
  .map((c) => {
    const v = verdicts.find((x) => x.claimId === c.id)!;
    return {
      claimId: c.id,
      text: c.text,
      source: claimsFile!,
      status: v.status,
      citation: v.citation,
      verifiedAt: new Date().toISOString(),
    };
  });

const diff = diffLedger(prev, entries);

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

const lines: string[] = [
  "## Saphene Review",
  "",
  `**${basename(claimsFile)}** vs \`${repoDir}\` — ${entries.length} claims: ` +
    `${entries.filter((e) => e.status === "matched").length} matched, ` +
    `${entries.filter((e) => e.status === "partial").length} partial, ` +
    `${entries.filter((e) => e.status === "unfound").length} unfound, ` +
    `${entries.filter((e) => e.status === "mismatch").length} mismatch`,
  "",
  diff.drifted.length > 0
    ? `### ⚠ Drift detected — this PR breaks ${diff.drifted.length} verified claim(s)`
    : "### ✔ No drift — all previously-verified claims still hold",
  "",
  "| Claim | Verdict | Δ vs base | Citation |",
  "| ----- | ------- | --------- | -------- |",
];

for (const e of entries) {
  const delta = driftFor(e.claimId)
    ? `\`${driftFor(e.claimId)!.from}\` → \`${e.status}\` ⚠`
    : addedIds.has(e.claimId)
      ? "new"
      : resolvedIds.has(e.claimId)
        ? `\`${diff.resolved.find((r) => r.entry.claimId === e.claimId)!.from}\` → \`${e.status}\``
        : "";
  lines.push(`| ${e.text.slice(0, 80)} | ${e.status} | ${delta} | ${e.citation.slice(0, 90)} |`);
}

if (diff.drifted.length > 0) {
  lines.push("", "Broken claims require either a code fix or an explicit memory update in the same PR.");
}

console.log(lines.join("\n"));
process.exitCode = diff.drifted.length > 0 ? 1 : 0;
