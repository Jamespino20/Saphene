// Cross-document consistency pass.
//
// Repository verification asks "does evidence support this claim?" This pass
// asks the prior question PLFG exposed: "do the claims contradict each other?"
// It is deterministic and conservative. It reports potential contradictions
// for human review; it does not declare canon false on heuristic evidence.

import type { Claim } from "./schema.js";
import { canonicalEntity, type AliasTable } from "./aliases.js";

export interface ConsistencyClaimRef {
  claimId: string;
  text: string;
  source: string;
  citation: string;
}

export interface ConsistencyConflict {
  type: "negation" | "assignment" | "access" | "identity" | "duplicate-id";
  detail: string;
  a: ConsistencyClaimRef;
  b: ConsistencyClaimRef;
}

interface Assignment {
  claim: Claim;
  citation: string;
  subject: string;
  subjectKey: string;
  slot: string;
  value: string;
  valueKey: string;
  objectKey?: string;
}

const GENDER = new Set(["male", "female", "man", "woman", "boy", "girl"]);
const LIFE = new Set(["alive", "living", "dead", "deceased"]);
const ACCESS = new Set(["separated", "banned", "exiled", "suspended", "active", "member", "authorized"]);
const NEGATORS = /\b(does not|do not|did not|doesn't|don't|didn't|cannot|can't|can not|never|not|no)\b/gi;
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "to", "of", "in", "on", "for", "and", "or",
  "with", "by", "at", "from", "as", "it", "its", "this", "that", "these", "those", "has", "have", "had",
]);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSubject(value: string, aliases: AliasTable): { label: string; key: string } {
  const label = value.replace(/^(the|a|an)\s+/i, "").replace(/[.\s]+$/, "").trim();
  const canonical = canonicalEntity(label, aliases);
  return { label: canonical, key: normalize(canonical) };
}

function cleanValue(value: string): string {
  return value.replace(/\([^)]*\)/g, "").replace(/[.\s]+$/, "").trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter((w) => w.length > 1 && !STOPWORDS.has(w)));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function citationFor(source: string, content: string, text: string): string {
  const lines = content.split(/\r?\n/);
  const probe = text.slice(0, Math.min(60, text.length)).toLowerCase();
  const index = lines.findIndex((line) => line.toLowerCase().includes(probe));
  return index >= 0 ? `${source}:${index + 1}` : source;
}

function assignmentsFor(claim: Claim, citation: string, aliases: AliasTable): Assignment[] {
  const text = claim.text.replace(/\s+/g, " ").trim();
  const out: Assignment[] = [];
  const push = (subjectRaw: string, slot: string, valueRaw: string, objectRaw?: string) => {
    const subject = cleanSubject(subjectRaw, aliases);
    const value = cleanValue(valueRaw);
    if (!subject.key || !value) return;
    out.push({
      claim,
      citation,
      subject: subject.label,
      subjectKey: subject.key,
      slot,
      value,
      valueKey: normalize(canonicalEntity(value, aliases)),
      objectKey: objectRaw ? normalize(canonicalEntity(cleanValue(objectRaw), aliases)) : undefined,
    });
  };

  const access = text.match(/^(.+?)\s+(cannot|can't|can not|can|could|may)\s+(re-enter|enter|join|access|use)\s+(.+)$/i);
  if (access) {
    const denied = /cannot|can't|can not/i.test(access[2]);
    push(access[1], `access:${normalize(access[3])}`, denied ? "denied" : "allowed", access[4]);
  }

  const separated = text.match(/^(.+?)\s+(?:is\s+)?(separated|banned|exiled|suspended)\s+from\s+(.+)$/i);
  if (separated) push(separated[1], "access-state", separated[2], separated[3]);

  const generic = text.match(/^(.+?)\s+(?:is|was|are|were)\s+(.+)$/i);
  if (generic) {
    const value = cleanValue(generic[2]);
    const valueKey = normalize(value);
    let slot = "property";
    if (GENDER.has(valueKey)) slot = "gender";
    else if (LIFE.has(valueKey)) slot = "life";
    else if (ACCESS.has(valueKey)) slot = "access-state";
    else if (/^[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+$/.test(value)) slot = "identity";
    push(generic[1], slot, value);
  }

  return out;
}

function ref(claim: Claim, citation: string): ConsistencyClaimRef {
  return { claimId: claim.id, text: claim.text, source: claim.source, citation };
}

export function checkConsistency(
  documents: Array<{ source: string; content: string; claims: Claim[] }>,
  aliases: AliasTable,
): ConsistencyConflict[] {
  const claims = documents.flatMap((doc) =>
    doc.claims.map((claim) => ({ claim, citation: citationFor(doc.source, doc.content, claim.text) })),
  );
  const conflicts: ConsistencyConflict[] = [];
  const seen = new Set<string>();
  const add = (type: ConsistencyConflict["type"], detail: string, a: typeof claims[number], b: typeof claims[number]) => {
    const key = [type, [a.claim.id, b.claim.id].sort().join(":"), normalize(detail)].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push({ type, detail, a: ref(a.claim, a.citation), b: ref(b.claim, b.citation) });
  };

  for (let i = 0; i < claims.length; i++) {
    for (let j = i + 1; j < claims.length; j++) {
      const a = claims[i];
      const b = claims[j];
      if (a.claim.source === b.claim.source) continue;

      const sameLocal = a.claim.localId && a.claim.localId === b.claim.localId;
      const sameSrs =
        !a.claim.localId && !b.claim.localId && a.claim.srsClause && a.claim.srsClause === b.claim.srsClause;
      if ((sameLocal || sameSrs) && normalize(a.claim.text) !== normalize(b.claim.text)) {
        add(
          "duplicate-id",
          `shared identifier ${a.claim.localId ?? a.claim.srsClause} is attached to different claim text`,
          a,
          b,
        );
      }

      const aNegative = (a.claim.polarity ?? "positive") === "negative";
      const bNegative = (b.claim.polarity ?? "positive") === "negative";
      if (aNegative !== bNegative) {
        const coreA = tokens(a.claim.text.replace(NEGATORS, " "));
        const coreB = tokens(b.claim.text.replace(NEGATORS, " "));
        if (jaccard(coreA, coreB) >= 0.65) {
          add("negation", "one claim negates a proposition the other asserts", a, b);
        }
      }
    }
  }

  const assignments = claims.flatMap(({ claim, citation }) => assignmentsFor(claim, citation, aliases));
  for (let i = 0; i < assignments.length; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const a = assignments[i];
      const b = assignments[j];
      if (a.claim.source === b.claim.source || a.subjectKey !== b.subjectKey) continue;
      const pairA = { claim: a.claim, citation: a.citation };
      const pairB = { claim: b.claim, citation: b.citation };

      if (a.slot === b.slot && a.valueKey !== b.valueKey) {
        add("assignment", `${a.subject} is assigned incompatible ${a.slot} values: "${a.value}" vs "${b.value}"`, pairA, pairB);
      }

      const separated = [a, b].find((x) => x.slot === "access-state" && ["separated", "banned", "exiled", "suspended"].includes(x.valueKey));
      const allowed = [a, b].find((x) => x.slot.startsWith("access:") && x.valueKey === "allowed");
      if (separated && allowed && separated.objectKey && allowed.objectKey && separated.objectKey === allowed.objectKey) {
        add(
          "access",
          `${separated.subject} is ${separated.value} from ${separated.objectKey}, but another claim allows access to the same object`,
          pairA,
          pairB,
        );
      }
    }
  }

  const genderByEntity = new Map<string, Assignment>();
  for (const assignment of assignments) {
    if (assignment.slot === "gender") genderByEntity.set(assignment.subjectKey, assignment);
  }
  for (const assignment of assignments) {
    if (assignment.slot !== "identity") continue;
    const entityGender = genderByEntity.get(assignment.valueKey);
    const subjectGender = genderByEntity.get(assignment.subjectKey);
    if (entityGender && subjectGender && entityGender.valueKey !== subjectGender.valueKey) {
      add(
        "identity",
        `${assignment.subject} is identified as ${assignment.value}, but the two claims assign incompatible gender values`,
        { claim: assignment.claim, citation: assignment.citation },
        { claim: subjectGender.claim, citation: subjectGender.citation },
      );
    }
  }

  return conflicts;
}
