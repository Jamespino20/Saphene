// Saphene standards registry — Saphene's own heuristic standard alongside
// the external standards it audits against (ISO/IEC 25010 product quality,
// ISO/IEC 27002 security controls, ISO/IEC 26514 user-information design).
// Findings and verdicts carry standard refs so every receipt is traceable
// to a named control, not just a reviewer's opinion.

export interface StandardControl {
  id: string;
  standard: "SAPH" | "ISO25010" | "ISO27002" | "ISO26514";
  title: string;
  guidance: string;
}

// Confidence thresholds (resolved from specs/srs-traceability.md §7, 2026-11-03):
// heuristics are coarse (matched 0.75–0.9, partial/unfound 0.5), so the
// auto-write-back bar sits at matched-typical and the human-flag bar sits
// strictly below anything heuristics emit — only fine-grained model
// verdicts can fall under it.
export const AUTO_WRITEBACK_CONFIDENCE = 0.75;
export const FLAG_FOR_HUMAN_CONFIDENCE = 0.5;

export function writeBackDecision(confidence: number): "auto" | "review" | "flag" {
  if (confidence >= AUTO_WRITEBACK_CONFIDENCE) return "auto";
  if (confidence >= FLAG_FOR_HUMAN_CONFIDENCE) return "review";
  return "flag";
}

// Saphene's own heuristic standard: what the deterministic engine enforces
// or checks without any model call.
export const SAPHENE_STANDARD: StandardControl[] = [
  { id: "SAPH-ID-01", standard: "SAPH", title: "Deterministic claim identity", guidance: "Every claim carries a stable id (clm_<hash(source::text)>); the same source and text always produce the same id across runs." },
  { id: "SAPH-EV-01", standard: "SAPH", title: "Literal evidence hints only", guidance: "expectedEvidence must be literal identifiers, paths, or exact phrases — never paraphrases. The grep loop matches text, not meaning." },
  { id: "SAPH-EV-02", standard: "SAPH", title: "No self-testimony", guidance: "A claims file must never count as evidence for its own claims. Evidence searches exclude the source document (--code-only for code claims)." },
  { id: "SAPH-RC-01", standard: "SAPH", title: "Every verdict carries a receipt", guidance: "matched/partial verdicts cite file:line with a verbatim quote; unfound verdicts cite the exact search that failed." },
  { id: "SAPH-RC-02", standard: "SAPH", title: "Partial means the code admits it", guidance: "partial is reserved for cases where evidence exists but is incomplete — TODO markers, missing branches, unfinished behavior." },
  { id: "SAPH-DR-01", standard: "SAPH", title: "Regression is drift", guidance: "A claim that flips from a passing rank (matched/partial) to unfound/mismatch against a committed baseline is drift and fails the gate." },
  { id: "SAPH-SEC-01", standard: "SAPH", title: "No secrets in evidence", guidance: "Quotes attached to verdicts must never contain API keys, tokens, or credentials. Redact before ledgering." },
  { id: "SAPH-CF-01", standard: "SAPH", title: "Coarse confidence, honest bands", guidance: "Heuristic verdicts use fixed bands (matched 0.75–0.9, partial/unfound 0.5). Fine-grained doubt belongs to model verdicts, which alone may fall below the flag-for-human bar." },
  { id: "SAPH-DOC-01", standard: "SAPH", title: "Every command is documented", guidance: "Each CLI command ships a help entry and a guide. The guide command self-checks this coverage (see ISO 26514 draft)." },
  { id: "SAPH-ID-02", standard: "SAPH", title: "Dual claim identification", guidance: "SRS claims carry both the 29148 clause (srsClause) and a project-local id (localId). Either one locates the claim; together they survive renumbering." },
];

// ISO/IEC 25010 product-quality anchors used to tag findings. Saphene does
// not certify 25010 compliance; it maps each finding to the characteristic
// the finding threatens, so teams can roll findings up per characteristic.
export const ISO25010_CHARACTERISTICS = [
  { id: "ISO25010-FunctionalSuitability", title: "Functional suitability" },
  { id: "ISO25010-Reliability", title: "Reliability" },
  { id: "ISO25010-PerformanceEfficiency", title: "Performance efficiency" },
  { id: "ISO25010-Usability", title: "Usability" },
  { id: "ISO25010-Security", title: "Security" },
  { id: "ISO25010-Compatibility", title: "Compatibility" },
  { id: "ISO25010-Maintainability", title: "Maintainability" },
  { id: "ISO25010-Portability", title: "Portability" },
] as const;

// Deterministic persona+category → standard refs. The model proposes the
// finding; the registry assigns the traceability. No model call needed.
export function standardsFor(personaId: string, category: string): string[] {
  const refs = new Set<string>();
  if (personaId === "security" || category === "security") {
    refs.add("SAPH-SEC-01");
    refs.add("ISO25010-Security");
    refs.add("ISO27002-A.8");
  }
  if (personaId === "performance" || category === "performance") {
    refs.add("ISO25010-PerformanceEfficiency");
  }
  if (personaId === "flow" || category === "business-flow") {
    refs.add("ISO25010-FunctionalSuitability");
    refs.add("ISO25010-Reliability");
  }
  if (personaId === "quality") {
    refs.add("ISO25010-Maintainability");
  }
  if (category === "bug") {
    refs.add("ISO25010-FunctionalSuitability");
    refs.add("ISO25010-Reliability");
  }
  if (category === "incomplete") {
    refs.add("SAPH-RC-02");
    refs.add("ISO25010-Maintainability");
  }
  // Every receipt-backed finding demonstrates the receipts discipline.
  refs.add("SAPH-RC-01");
  return [...refs];
}
