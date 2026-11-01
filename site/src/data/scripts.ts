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

export const LINE_CLASS: Record<LineKind, string> = {
  cmd: "text-ink",
  dim: "text-muted",
  ok: "text-accent",
  warn: "text-warn",
  bad: "text-bad",
  info: "text-info",
};
