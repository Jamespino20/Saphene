// Saphene self-test. Runs the deterministic surface of the engine end-to-end
// and asserts expected exit codes. Model-dependent paths are excluded so the
// suite is stable without an API key.

import { spawnSync } from "node:child_process";

interface Check {
  name: string;
  command: string;
  expect: number;
}

const checks: Check[] = [
  { name: "typecheck", command: "npx tsc --noEmit", expect: 0 },
  { name: "bridge matriflow (heuristic, unfound expected)", command: "npx tsx src/cli.ts bridge examples/matriflow-claims.md --repo D:/Projects/matriflow --no-model", expect: 1 },
  { name: "bridge anvilos (heuristic, unfound expected)", command: "npx tsx src/cli.ts bridge examples/anvilos-claims.md --repo D:/Projects/AnvilOS --no-model", expect: 1 },
  { name: "bridge agapay code-only (all matched)", command: "npx tsx src/cli.ts bridge examples/agapay-claims.md --repo D:/Projects/Agapay --code-only --no-model", expect: 0 },
  { name: "review matriflow baseline (no drift)", command: "npx tsx src/review.ts --claims examples/matriflow-claims.md --repo D:/Projects/matriflow --ledger .saphene/matriflow.ledger.json", expect: 0 },
  { name: "verify README (heuristic, unfound expected)", command: "npx tsx src/cli.ts verify README.md memory --no-model", expect: 1 },
  { name: "drift harness (drift not separately detected)", command: "npx tsx src/drift-harness.ts README.md drifted-selftest.md saphene selftest drift line for regression coverage.", expect: 1 },
];

let failed = 0;
for (const check of checks) {
  const res = spawnSync(check.command, { shell: true, encoding: "utf8", timeout: 120_000 });
  const got = res.status;
  const pass = got === check.expect;
  if (!pass) failed += 1;
  console.log(`[${pass ? "PASS" : "FAIL"}] ${check.name} — exit ${got} (expected ${check.expect})`);
  if (!pass && res.stdout) console.log((res.stdout as string).split("\n").slice(0, 6).join("\n"));
}

const { unlinkSync, existsSync } = await import("node:fs");
if (existsSync("drifted-selftest.md")) unlinkSync("drifted-selftest.md");

console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exitCode = failed > 0 ? 1 : 0;
