export type LineKind = "cmd" | "dim" | "ok" | "warn" | "bad" | "info";
export type Line = [LineKind, string];

export const SCRIPTS: Record<string, Line[]> = {
  bridge: [
    ["cmd", "npm run bridge -- examples/agapay-claims.md --repo ./targets/Agapay --code-only"],
    ["dim", "Saphene bridge - examples/agapay-claims.md"],
    ["dim", "Targets: ./targets/Agapay"],
    ["dim", ""],
    ["dim", "  10 claims | 9 matched | 1 partial | 0 mismatch | 0 unfound"],
    ["ok", "  [matched] [srs 4.3] A Compassion Policy suspends penalties and grants grace periods"],
    ["dim", "           - prisma/init.sql:86: CREATE TYPE \"CompassionActionType\" AS ENUM (...)"],
    ["ok", "  [matched] [srs 4.2] Members vouch with a 25% guarantor liability share"],
    ["dim", "           - prisma/init.sql:68: CREATE TYPE \"GuaranteeStatus\" AS ENUM (...)"],
    ["warn", "  [partial] [srs 9.1] Sessions are JWT-based and scoped to tenant_id"],
    ["dim", "           - src/app/api/loans/apply/route.ts:51: TODO: implement a JWT extractor"],
    ["dim", ""],
    ["dim", "Traceability matrix: 10 rows -> audits/agapay-20261101-1544.md"],
    ["dim", "  partial = evidence found, but the code itself admits the feature is incomplete."],
  ],
  audit: [
    ["cmd", "npm run audit -- --repo ./targets/Agapay --update-ledger"],
    ["dim", "Saphene audit - ./targets/Agapay"],
    ["dim", "Panel: Security Engineer - Performance Engineer - Business-Flow Analyst - Maintainability Reviewer"],
    ["dim", "Focus: all | Files: 10 | Model: heuristic | Concurrency: 3"],
    ["dim", ""],
    ["bad", "  [CRITICAL][security] Unauthenticated user can disable 2FA"],
    ["dim", "    reviewer: Security Engineer - src/actions/2fa.ts:86"],
    ["dim", "    > await tx.twoFactorAuth.update({"],
    ["warn", "  [MAJOR][performance] Synchronous blocking I/O in async MCP tool"],
    ["dim", "    reviewer: Performance Engineer - src/mcp.ts:87"],
    ["warn", "  [MAJOR][business-flow] Missing error handling for ledger corruption"],
    ["dim", "    reviewer: Business-Flow Analyst - src/ledger.ts:38"],
    ["ok", "Report written: audits/agapay-20261101-1544.md  (fix prompts included)"],
  ],
  memory: [
    ["cmd", "npm run memory -- --memory-dir ./memory --repo ./targets/Agapay"],
    ["dim", "Saphene memory - ./memory"],
    ["dim", "Modules: 3 | Targets: ./targets/Agapay"],
    ["dim", "Previous run: 2026-10-31T03:06:21.300Z"],
    ["dim", ""],
    ["dim", "  4 ledgered claims | 3 matched | 1 partial | 0 unfound | 0 mismatch"],
    ["bad", ""],
    ["bad", "  DRIFT DETECTED (1):"],
    ["dim", "    [matched -> unfound] A Compassion Policy suspends penalty accumulation"],
    ["dim", "      now: searched ./targets/Agapay for \"CompassionActionType\" - no longer found"],
    ["dim", ""],
    ["dim", "  vs previous run: 3 unchanged, 0 added, 0 resolved, 1 drifted"],
    ["dim", "Ledger saved: memory/.saphene/ledger.json"],
    ["info", "The project was rich in promises. The ledger shows what the repository actually kept."],
  ],
};

export const DRIFT: Line[] = [
  ["dim", ""],
  ["bad", "  DRIFT INJECTED - rerunning bridge against the drifted tree..."],
  ["bad", "  [matched -> unfound] A Compassion Policy suspends penalties and grants grace periods"],
  ["dim", "      searched ./targets/Agapay for \"CompassionActionType\""],
  ["warn", "  exit code 1 - the PR gate blocks this merge and records the change."],
];

export const TABS: Array<{ id: "bridge" | "audit" | "memory"; label: string }> = [
  { id: "bridge", label: "Verify claims" },
  { id: "audit", label: "Audit code" },
  { id: "memory", label: "Watch memory" },
];

export const SAPHENE_SELF_SCRIPTS: Record<string, Line[]> = {
  selftest: [
    ["cmd", "npm test"],
    ["dim", "> saphene@0.1.0 test"],
    ["dim", "> tsx src/selftest.ts"],
    ["dim", ""],
    ["ok", "  [PASS] typecheck — exit 0 (expected 0)"],
    ["ok", "  [PASS] bridge matriflow (heuristic, unfound expected) — exit 1 (expected 1)"],
    ["ok", "  [PASS] bridge anvilos (heuristic, unfound expected) — exit 1 (expected 1)"],
    ["ok", "  [PASS] bridge agapay code-only (all matched) — exit 0 (expected 0)"],
    ["ok", "  [PASS] review matriflow baseline (no drift) — exit 0 (expected 0)"],
    ["ok", "  [PASS] verify README (heuristic, unfound expected) — exit 1 (expected 1)"],
    ["ok", "  [PASS] drift harness (drift detected) — exit 1 (expected 1)"],
    ["dim", ""],
    ["ok", "7/7 checks passed — deterministic verification engine is verified."],
  ],
  readme: [
    ["cmd", "npm run verify -- README.md --repo ."],
    ["dim", "Saphene self-verification run: README.md against current codebase"],
    ["dim", "Reading claims from README.md: 6 claims extracted"],
    ["dim", ""],
    ["ok", "  [matched] Claim-ledger engine verifies workspace memory against code AST"],
    ["dim", "    receipt: src/schema.ts:18, src/verify.ts:25"],
    ["ok", "  [matched] Model Context Protocol server for AI coding agents"],
    ["dim", "    receipt: src/mcp.ts:42, package.json:25"],
    ["ok", "  [matched] Deterministic claim hash IDs line up across runs"],
    ["dim", "    receipt: src/extract.ts:32"],
    ["ok", "  [matched] Multi-persona reviewer panel generates forensic audits"],
    ["dim", "    receipt: src/audit.ts:28"],
    ["dim", ""],
    ["info", "Ledger updated: .saphene/ledger.json (0 drift, 100% supported)"],
  ],
  mcp: [
    ["cmd", "npm run mcp -- --inspect"],
    ["dim", "Starting Saphene MCP Server (v0.1.0)..."],
    ["dim", "Registering tools with Model Context Protocol SDK:"],
    ["ok", "  + tool: saphene_bridge  (verify claim files against repos)"],
    ["ok", "  + tool: saphene_memory  (audit memory directories for drift)"],
    ["ok", "  + tool: saphene_verify  (single file claim verification)"],
    ["dim", ""],
    ["ok", "Ready for Claude, Cursor, Windsurf, or custom agent connections over stdio."],
  ],
};

export const SAPHENE_SELF_TABS: Array<{ id: "selftest" | "readme" | "mcp"; label: string }> = [
  { id: "selftest", label: "Self-test (7/7)" },
  { id: "readme", label: "Verify README" },
  { id: "mcp", label: "Inspect MCP" },
];

export const LINE_CLASS: Record<LineKind, string> = {
  cmd: "text-ink font-semibold",
  dim: "text-muted",
  ok: "text-sage",
  warn: "text-amber",
  bad: "text-bad",
  info: "text-green font-semibold",
};
