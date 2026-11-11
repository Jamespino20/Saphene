// Saphene self-test. Runs the deterministic surface of the engine end-to-end
// and asserts expected exit codes. Model-dependent paths are excluded so the
// suite is stable without an API key.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const q = (p: string) => `"${p}"`;

interface Check {
  name: string;
  command?: string;
  expect?: number;
  run?: () => { pass: boolean; detail?: string };
}

function relocationCheck(): { pass: boolean; detail?: string } {
  const dir = mkdtempSync(join(tmpdir(), "saphene-reloc-"));
  try {
    mkdirSync(join(dir, "repo", "src"), { recursive: true });
    writeFileSync(
      join(dir, "claims.md"),
      "- The sync queue retries failed pushes automatically.\n" +
        "  category: srs | srsClause: 6.1 | localId: RELOC-001 | requirementType: functional | priority: mandatory\n" +
        "  evidence: retrySyncQueue\n",
      "utf8",
    );
    const fnBody = "export function retrySyncQueue(queue: string[]) {\n  return queue.filter((item) => item !== undefined);\n}\n";
    writeFileSync(join(dir, "repo", "src", "alpha.ts"), fnBody, "utf8");
    let res = spawnSync(
      `npx tsx src/cli.ts bridge ${q(join(dir, "claims.md"))} --repo ${q(join(dir, "repo"))} --code-only --no-model --out ${q(join(dir, "baseline.json"))}`,
      { shell: true, encoding: "utf8", timeout: 120_000, cwd: ROOT },
    );
    if (res.status !== 0) return { pass: false, detail: `baseline run exited ${res.status}` };
    writeFileSync(join(dir, "repo", "src", "beta.ts"), fnBody, "utf8");
    writeFileSync(join(dir, "repo", "src", "alpha.ts"), "// retry logic moved to beta.ts\n", "utf8");
    res = spawnSync(
      `npx tsx src/review.ts --claims ${q(join(dir, "claims.md"))} --repo ${q(join(dir, "repo"))} --code-only --ledger ${q(join(dir, "baseline.json"))}`,
      { shell: true, encoding: "utf8", timeout: 120_000, cwd: ROOT },
    );
    const out = String(res.stdout ?? "");
    const pass = res.status === 0 && /relocated/i.test(out);
    return {
      pass,
      detail: pass ? "same claim ID, new file, receipt followed" : `exit ${res.status}, relocated marker ${/relocated/i.test(out) ? "found" : "missing"}`,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const checks: Check[] = [
  { name: "typecheck", command: "npx tsc --noEmit", expect: 0 },
  { name: "bridge fixture matched (all matched)", command: "npx tsx src/cli.ts bridge examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --no-model", expect: 0 },
  { name: "bridge fixture unfound (unfound expected)", command: "npx tsx src/cli.ts bridge examples/fixtures/claims-unfound.md --repo examples/fixtures/repo --code-only --no-model", expect: 1 },
  { name: "review fixture baseline (no drift)", command: "npx tsx src/review.ts --claims examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --ledger examples/fixtures/baseline.ledger.json", expect: 0 },
  { name: "review missing baseline (fail closed)", command: "npx tsx src/review.ts --claims examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --ledger examples/fixtures/missing.ledger.json", expect: 2 },
  { name: "review corrupt baseline (fail closed)", command: "npx tsx src/review.ts --claims examples/fixtures/claims-matched.md --repo examples/fixtures/repo --code-only --ledger examples/fixtures/baseline-corrupt.json", expect: 2 },
  { name: "relocation keeps receipt, no drift (same claim ID, moved code)", run: relocationCheck },
];

let failed = 0;
for (const check of checks) {
  if (check.run) {
    try {
      const r = check.run();
      if (!r.pass) failed += 1;
      console.log(`[${r.pass ? "PASS" : "FAIL"}] ${check.name}${r.detail ? ` — ${r.detail}` : ""}`);
    } catch (err) {
      failed += 1;
      console.log(`[FAIL] ${check.name} — threw: ${err instanceof Error ? err.message : String(err)}`);
    }
    continue;
  }
  const res = spawnSync(check.command!, { shell: true, encoding: "utf8", timeout: 120_000 });
  const got = res.status;
  const pass = got === check.expect;
  if (!pass) failed += 1;
  console.log(`[${pass ? "PASS" : "FAIL"}] ${check.name} — exit ${got} (expected ${check.expect})`);
  if (!pass && res.stdout) console.log((res.stdout as string).split("\n").slice(0, 6).join("\n"));
}

console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exitCode = failed > 0 ? 1 : 0;
