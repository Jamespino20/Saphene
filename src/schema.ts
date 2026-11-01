export type ClaimCategory =
  | "fact"
  | "config"
  | "numeric"
  | "path"
  | "behavior"
  | "srs";

export type VerdictStatus =
  | "matched"
  | "partial"
  | "mismatch"
  | "unfound"
  | "unverified";

export interface Evidence {
  kind: "grep" | "read" | "check" | "model";
  location: string;
  quote: string;
  fetchedAt: string;
}

export interface Claim {
  id: string;
  text: string;
  category: ClaimCategory;
  source: string;
  expectedEvidence: string[];
  status: VerdictStatus;
  evidence: Evidence[];
  verifiedAt?: string;
  srsClause?: string;
  requirementType?: string;
  priority?: string;
}


export interface AdapterResult {
  adapter: "memory" | "paper" | "helm";
  source: string;
  claims: Claim[];
  verdicts: Verdict[];
}

export interface Verdict {
  claimId: string;
  status: VerdictStatus;
  citation: string;
  confidence: number;
  reason: string;
}

export interface TraceabilityRow {
  claimId: string;
  srsClause: string;
  requirementType: string;
  status: VerdictStatus;
  citation: string;
}

export interface SessionSummary {
  summary: {
    total: number;
    matched: number;
    partial: number;
    mismatch: number;
    unfound: number;
  };
}

export interface AdapterResult {
  adapter: "memory" | "paper" | "helm";
  source: string;
  claims: Claim[];
  verdicts: Verdict[];
}

export interface AdapterResult {
  adapter: "memory" | "paper" | "helm";
  source: string;
  claims: Claim[];
  verdicts: Verdict[];
}

export interface AdapterResult {
  adapter: "memory" | "paper" | "helm";
  source: string;
  claims: Claim[];
  verdicts: Verdict[];
}
