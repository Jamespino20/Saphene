// Claim extraction. Primary path calls the model (OpenAI-compatible) for
// structured claims; heuristic line-splitting remains as the no-key fallback.

import type { Claim, ClaimCategory, VerdictStatus } from "./schema.js";
import { chat, loadModelConfig, type ModelConfig } from "./model.js";

const CATEGORIES: ClaimCategory[] = ["fact", "config", "numeric", "path", "behavior", "srs"];
const MAX_CLAIMS = 40;
const MAX_SOURCE_CHARS = 15_000;

const SOURCE_HINT: Record<string, ClaimCategory> = {
  ".md": "fact",
  ".json": "config",
  ".ts": "config",
  ".js": "config",
  ".prisma": "config",
  ".sql": "numeric",
};

function categoryFor(path: string): ClaimCategory {
  const ext = path.slice(path.lastIndexOf("."));
  return SOURCE_HINT[ext] ?? "fact";
}

export function deterministicId(source: string, text: string): string {
  const input = `${source}::${text}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `clm_${Math.abs(hash).toString(16)}`;
}

export function extractClaims(source: string, content: string): Claim[] {
  const structured = parseClaimBlocks(source, content);
  if (structured.length > 0) return structured;

  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 40);
  const claims: Claim[] = [];
  for (const line of lines) {
    const text = line.trim();
    claims.push({
      id: deterministicId(source, text),
      text,
      category: categoryFor(source),
      source,
      expectedEvidence: [],
      status: "unverified",
      evidence: [],
    });
  }
  return claims;
}

interface ClaimBlock {
  text: string;
  category?: string;
  srsClause?: string;
  localId?: string;
  requirementType?: string;
  priority?: string;
  evidence: string[];
}

function parseClaimBlocks(source: string, content: string): Claim[] {
  const lines = content.split(/\r?\n/);
  const blocks: ClaimBlock[] = [];
  let current: ClaimBlock | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("- ") && line.length > 15) {
      if (current) blocks.push(current);
      current = { text: line.slice(2).trim(), evidence: [] };
      continue;
    }
    if (!current) continue;
    if (/^(category|evidence):/i.test(line)) {
      for (const part of line.split("|")) {
        const kv = part.split(/:(.*)/, 2);
        if (kv.length < 2) continue;
        const key = kv[0].trim().toLowerCase();
        const value = kv[1].trim();
        if (key === "category") current.category = value;
        else if (key === "srsclause") current.srsClause = value;
        else if (key === "localid" || key === "local-id" || key === "local_id") current.localId = value;
        else if (key === "requirementtype") current.requirementType = value;
        else if (key === "priority") current.priority = value;
        else if (key === "evidence") {
          current.evidence = value
            .split(",")
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
            .filter((s) => s.length > 0);
        }
      }
    }
  }
  if (current) blocks.push(current);

  return blocks
    .filter((b) => b.evidence.length > 0)
    .map((b) => ({
      id: deterministicId(source, b.text),
      text: b.text,
      category: CATEGORIES.includes(b.category as ClaimCategory) ? (b.category as ClaimCategory) : "fact",
      srsClause: b.srsClause,
      localId: b.localId,
      requirementType: b.requirementType,
      priority: b.priority,
      source,
      expectedEvidence: b.evidence,
      status: "unverified" as VerdictStatus,
      evidence: [],
    }));
}

const EXTRACT_SYSTEM =
  "You extract verifiable, atomic claims from project documents for an evidence-checking engine. " +
  "A claim is a single testable statement (a fact, configuration detail, number, path, behavior, or requirement). " +
  "For each claim, provide expectedEvidence: 1-3 short literal strings that would appear in a codebase or document if the claim is true " +
  "(identifiers, table names, function names, config keys, exact phrases — NOT paraphrases). " +
  'Respond with ONLY a JSON array: [{"text": string, "category": "fact"|"config"|"numeric"|"path"|"behavior"|"srs", ' +
  '"expectedEvidence": string[], "srsClause"?: string, "localId"?: string, "requirementType"?: string, "priority"?: string}]. ' +
  "No markdown fences, no commentary.";

function parseJsonArray(raw: string): unknown[] {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model output contains no JSON array");
  }
  const parsed = JSON.parse(text.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error("Model output is not an array");
  return parsed;
}

function normalizeClaim(raw: unknown, source: string): Claim | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  const text = typeof obj.text === "string" ? obj.text.trim() : "";
  if (text.length < 8) return null;
  const category = CATEGORIES.includes(obj.category as ClaimCategory)
    ? (obj.category as ClaimCategory)
    : "fact";
  const expectedEvidence = Array.isArray(obj.expectedEvidence)
    ? obj.expectedEvidence.filter((e): e is string => typeof e === "string" && e.trim().length > 0)
    : [];
  return {
    id: deterministicId(source, text),
    text,
    category,
    srsClause: typeof obj.srsClause === "string" ? obj.srsClause : undefined,
    localId: typeof obj.localId === "string" ? obj.localId : undefined,
    requirementType: typeof obj.requirementType === "string" ? obj.requirementType : undefined,
    priority: typeof obj.priority === "string" ? obj.priority : undefined,
    source,
    expectedEvidence,
    status: "unverified" as VerdictStatus,
    evidence: [],
  };
}

export async function extractClaimsViaModel(
  source: string,
  content: string,
  cfg: ModelConfig,
): Promise<Claim[]> {
  const clipped =
    content.length > MAX_SOURCE_CHARS ? content.slice(0, MAX_SOURCE_CHARS) + "\n...[truncated]" : content;
  const { content: out, model } = await chat(
    cfg,
    [
      { role: "system", content: EXTRACT_SYSTEM },
      { role: "user", content: `Source file: ${source}\n\n${clipped}` },
    ],
    4096,
  );
  const claims = parseJsonArray(out)
    .slice(0, MAX_CLAIMS)
    .map((c) => normalizeClaim(c, source))
    .filter((c): c is Claim => c !== null);
  if (claims.length === 0) throw new Error(`Model ${model} returned no usable claims`);
  return claims;
}

export function getModelConfig(): ModelConfig | null {
  return loadModelConfig();
}
