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
  { name: "bridge fixture matched (all matched)", command: "npx tsx src/cli.ts bridge examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --no-model", expect: 0 },
  { name: "bridge fixture unfound (unfound expected)", command: "npx tsx src/cli.ts bridge examples/fixtures/claims-unfound.md --repo examples/fixtures/repo --code-only --no-model", expect: 1 },
  { name: "review fixture baseline (no drift)", command: "npx tsx src/review.ts --claims examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --ledger examples/fixtures/baseline.ledger.json", expect: 0 },
  { name: "review missing baseline (fail closed)", command: "npx tsx src/review.ts --claims examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --ledger examples/fixtures/missing.ledger.json", expect: 2 },
  { name: "review corrupt baseline (fail closed)", command: "npx tsx src/review.ts --claims examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --ledger examples/fixtures/baseline-corrupt.json", expect: 2 },
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

console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exitCode = failed > 0 ? 1 : 0;
