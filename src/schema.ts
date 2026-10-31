// Claim-ledger schema for Memory-CI.
// Every claim is extracted from a source (memory file, paper, HELM fact),
// then verified against evidence and assigned a verdict.

export type ClaimCategory =
  | "fact"
  | "config"
  | "numeric"
  | "path"
  | "behavior"
  | "srs";                // ISO/IEC/IEEE 29148-aligned requirement

export type VerdictStatus =
  | "matched"
  | "partial"
  | "mismatch"
  | "unfound"
  | "unverified";

export interface Evidence {
  kind: "grep" | "read" | "check" | "model";
  location: string;       // file path, line range, URL, or check name
  quote: string;          // verbatim snippet supporting the claim
  fetchedAt: string;      // ISO timestamp
}

export interface Claim {
  id: string;             // stable, deterministic id (hash of source + text)
  text: string;           // the claim as written
  category: ClaimCategory;
  srsClause?: string;     // ISO/IEC/IEEE 29148 section reference
  requirementType?: string; // functional | performance | safety | security | interface | operational | constraint | quality
  priority?: string;      // mandatory | recommended | optional
  source: string;         // which memory file / paper / system the claim lives in
  expectedEvidence: string[]; // hints for where to look
  status: VerdictStatus;
  evidence: Evidence[];
  verifiedAt?: string;    // ISO timestamp of last successful verify
}

export interface TraceabilityRow {
  claimId: string;
  srsClause: string;
  requirementType: string;
  status: VerdictStatus;
  citation: string;
}

export interface Verdict {
  claimId: string;
  status: VerdictStatus;
  citation: string;       // human-readable evidence pointer
  confidence: number;     // 0..1
  reason: string;
}

export interface AdapterResult {
  adapter: "memory" | "paper" | "helm";
  source: string;
  claims: Claim[];
  verdicts: Verdict[];
  summary: {
    total: number;
    matched: number;
    partial: number;
    mismatch: number;
    unfound: number;
  };
}
