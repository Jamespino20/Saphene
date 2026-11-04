// Suppressions — project-owned, expiring exceptions for the review gate.
//
// A suppressed drift is reported, not hidden: it appears in the review as
// suppressed with its reason, and it stops suppressing after `expires`.
// File: <repo>/.saphene/suppressions.json
// [{ "claimId": "clm_...", "text": "substring", "reason": "...", "expires": "2026-12-31" }]

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LedgerEntry } from "./ledger.js";

export interface Suppression {
  claimId?: string;
  text?: string;
  reason?: string;
  expires?: string;
}

export function loadSuppressions(repoDir: string): Suppression[] {
  const path = join(repoDir, ".saphene", "suppressions.json");
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is Suppression => typeof s === "object" && s !== null,
    );
  } catch {
    return [];
  }
}

export function matchSuppression(
  entry: LedgerEntry,
  suppressions: Suppression[],
  now = new Date(),
): Suppression | null {
  for (const s of suppressions) {
    if (s.expires && new Date(s.expires) < now) continue;
    if (s.claimId && s.claimId === entry.claimId) return s;
    if (s.text && entry.text.toLowerCase().includes(s.text.toLowerCase())) return s;
  }
  return null;
}
