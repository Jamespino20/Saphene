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

export type ClaimPolarity = "positive" | "negative";
export type ClaimLifecycle = "planned" | "written" | "locked";

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
  localId?: string;
  requirementType?: string;
  priority?: string;
  polarity?: ClaimPolarity;
  lifecycle?: ClaimLifecycle;
  scope?: string[];
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
  anchor?: string;
  location?: string;
  negation?: boolean;
}

export interface TraceabilityRow {
  claimId: string;
  srsClause: string;
  localId: string;
  requirementType: string;
  status: VerdictStatus;
  citation: string;
  anchor?: string;
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
