// Claim extraction. Primary path calls the model (OpenAI-compatible) for
// structured claims; heuristic line-splitting remains as the no-key fallback.

import type { Claim, ClaimCategory, ClaimLifecycle, ClaimPolarity, VerdictStatus } from "./schema.js";
import { chat, loadModelConfig, type ModelConfig } from "./model.js";
import { canonicalEntity, EMPTY_ALIASES, type AliasTable } from "./aliases.js";

const CATEGORIES: ClaimCategory[] = ["fact", "config", "numeric", "path", "behavior", "srs"];
const MAX_CLAIMS = 40;
const MAX_HEURISTIC_CLAIMS = 60;
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

const NEGATIVE_PATTERN = /\b(does not|do not|did not|doesn't|don't|didn't|cannot|can't|can not|never|not know|not aware|not understand|not implemented|no longer)\b/i;
const FACTUAL_PATTERN = /\b(is|are|was|were|uses?|used|supports?|includes?|provides?|requires?|stores?|runs?|runs on|depends on|configured|defines?|contains?|exposes?|returns?|creates?|writes?|reads?|verifies|verified|must|shall|retr(?:y|ies|ied)|sends?|generates?|calculates?|handles?|manages?|activates?)\b/i;

export function inferPolarity(text: string): ClaimPolarity {
  return NEGATIVE_PATTERN.test(text) ? "negative" : "positive";
}

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateEvidence(sentence: string, aliases: AliasTable): string[] {
  const ranked: Array<{ value: string; rank: number }> = [];
  const add = (value: string, rank: number) => {
    const clean = value.trim().replace(/^['"`]|['"`]$/g, "");
    if (clean.length >= 2 && clean.length <= 80) ranked.push({ value: canonicalEntity(clean, aliases), rank });
  };

  for (const match of sentence.matchAll(/`([^`]{2,80})`/g)) add(match[1], 0);
  for (const match of sentence.matchAll(/\b(?:[\w.-]+\/)+[\w.-]+\.[A-Za-z]{1,8}\b/g)) add(match[0], 0);
  for (const match of sentence.matchAll(/\b[\w.-]+\.(?:ts|tsx|js|jsx|json|prisma|sql|md|toml|ya?ml)\b/g)) add(match[0], 0);
  for (const match of sentence.matchAll(/"([^"]{3,60})"|'([^']{3,60})'/g)) add(match[1] ?? match[2], 1);
  for (const match of sentence.matchAll(/\b[A-Za-z_][A-Za-z0-9_]*_[A-Za-z0-9_]+\b/g)) add(match[0], 1);
  for (const match of sentence.matchAll(/\b[a-z]+(?:[A-Z][A-Za-z0-9]*)+\b/g)) add(match[0], 1);
  for (const match of sentence.matchAll(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g)) add(match[0], 2);
  for (const match of sentence.matchAll(/\b[A-Z]{2,}(?:-[A-Z0-9]+)?\b/g)) add(match[0], 2);

  const generic = new Set(["the", "this", "that", "with", "from", "into", " saphene"]);
  const seen = new Set<string>();
  return ranked
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.value)
    .filter((value) => {
      const key = value.toLowerCase();
      if (generic.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function proseParagraphs(content: string): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];
  let inFence = false;
  const flush = () => {
    if (current.length > 0) paragraphs.push(current.join(" "));
    current = [];
  };

  for (const rawLine of content.replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (/^(```|~~~)/.test(line)) {
      flush();
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (line === "") {
      flush();
      continue;
    }
    if (/^#{1,6}\s/.test(line) || /^\|/.test(line) || /^([-*_]\s*){3,}$/.test(line)) continue;
    if (/^<\/?[A-Za-z][^>]*>$/.test(line)) continue;
    current.push(line.replace(/^>\s?/, "").replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ""));
  }
  flush();
  return paragraphs;
}

function heuristicClaims(source: string, content: string, aliases: AliasTable): Claim[] {
  const claims: Claim[] = [];
  const seen = new Set<string>();
  for (const paragraph of proseParagraphs(content)) {
    const sentences = stripMarkdown(paragraph).match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
    for (const rawSentence of sentences) {
      const text = rawSentence.trim();
      const words = text.split(/\s+/).filter(Boolean);
      if (text.length < 35 || text.length > 260 || words.length < 6) continue;
      if (/^(npm|npx|git|cd|\$|https?:\/\/)/i.test(text)) continue;
      const evidence = candidateEvidence(rawSentence, aliases);
      if (evidence.length === 0 || !FACTUAL_PATTERN.test(text)) continue;
      const key = text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      claims.push({
        id: deterministicId(source, text),
        text,
        category: categoryFor(source),
        source,
        expectedEvidence: evidence,
        status: "unverified",
        evidence: [],
        polarity: inferPolarity(text),
      });
      if (claims.length >= MAX_HEURISTIC_CLAIMS) return claims;
    }
  }
  return claims;
}

export function extractClaims(source: string, content: string, aliases: AliasTable = EMPTY_ALIASES): Claim[] {
  const structured = parseClaimBlocks(source, content, aliases);
  if (structured.length > 0) return structured;
  return heuristicClaims(source, content, aliases);
}

interface ClaimBlock {
  text: string;
  category?: string;
  srsClause?: string;
  localId?: string;
  requirementType?: string;
  priority?: string;
  polarity?: ClaimPolarity;
  lifecycle?: ClaimLifecycle;
  scope?: string[];
  evidence: string[];
}

function parseClaimBlocks(source: string, content: string, aliases: AliasTable = EMPTY_ALIASES): Claim[] {
  const lines = content.split(/\r?\n/);
  const blocks: ClaimBlock[] = [];
  let current: ClaimBlock | null = null;
  let inFence = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (line.startsWith("- ") && line.length > 15) {
      if (current) blocks.push(current);
      current = { text: line.slice(2).trim(), evidence: [] };
      continue;
    }
    if (!current) continue;
    if (/^(category|evidence|srsclause|localid|local-id|local_id|requirementtype|priority|polarity|lifecycle|status|scope):/i.test(line)) {
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
        else if (key === "polarity" && (value === "positive" || value === "negative")) current.polarity = value;
        else if ((key === "lifecycle" || key === "status") && ["planned", "written", "locked"].includes(value)) {
          current.lifecycle = value as ClaimLifecycle;
        } else if (key === "scope") {
          current.scope = value
            .split(",")
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
            .filter((s) => s.length > 0);
        } else if (key === "evidence") {
          current.evidence = value
            .split(",")
            .map((s) => canonicalEntity(s.trim().replace(/^['"]|['"]$/g, ""), aliases))
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
      polarity: b.polarity ?? inferPolarity(b.text),
      lifecycle: b.lifecycle,
      scope: b.scope,
      source,
      expectedEvidence: b.evidence,
      status: "unverified" as VerdictStatus,
      evidence: [],
    }));
}

const EXTRACT_SYSTEM =
  "You extract verifiable, atomic claims from project documents for an evidence-checking engine. " +
  "A claim is a single testable statement (a fact, configuration detail, number, path, behavior, or requirement). Return at most 25 claims. " +
  "For each claim, provide expectedEvidence: 1-3 short literal strings that would appear in a codebase or document if the claim is true " +
  "(identifiers, table names, function names, config keys, exact phrases — NOT paraphrases). " +
  'Respond with ONLY a JSON array: [{"text": string, "category": "fact"|"config"|"numeric"|"path"|"behavior"|"srs", ' +
  '"expectedEvidence": string[], "srsClause"?: string, "localId"?: string, "requirementType"?: string, "priority"?: string, ' +
  '"polarity"?: "positive"|"negative", "lifecycle"?: "planned"|"written"|"locked", "scope"?: string[]}]. ' +
  "Mark a claim negative when it asserts absence, ignorance, or non-implementation. Mark future, not-yet-written claims planned. " +
  "Do not use double-quote characters inside any string value; paraphrase quoted phrases without quotes. No markdown fences, no commentary.";

function salvageJsonObjects(text: string): unknown[] {
  const out: unknown[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          out.push(JSON.parse(text.slice(start, i + 1)));
        } catch {
          // Skip malformed object; later objects may still be valid.
        }
        start = -1;
      }
    }
  }
  return out;
}

function parseJsonArray(raw: string): unknown[] {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model output contains no JSON array");
  }
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed)) throw new Error("Model output is not an array");
    return parsed;
  } catch {
    const salvaged = salvageJsonObjects(text.slice(start, end + 1));
    if (salvaged.length > 0) return salvaged;
    throw new Error("Model output contains no parseable JSON claims");
  }
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
    polarity:
      obj.polarity === "positive" || obj.polarity === "negative"
        ? obj.polarity
        : inferPolarity(text),
    lifecycle:
      obj.lifecycle === "planned" || obj.lifecycle === "written" || obj.lifecycle === "locked"
        ? obj.lifecycle
        : obj.status === "planned" || obj.status === "written" || obj.status === "locked"
          ? obj.status
          : undefined,
    scope: Array.isArray(obj.scope)
      ? obj.scope.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      : undefined,
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
  let lastParseError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const strict = attempt === 2
      ? " Previous response was invalid JSON. Return ONLY a valid JSON array. Escape every quote inside strings. No markdown fences, no commentary."
      : "";
    const { content: out, model } = await chat(
      cfg,
      [
        { role: "system", content: EXTRACT_SYSTEM + strict },
        { role: "user", content: `Source file: ${source}\n\n${clipped}` },
      ],
      8192,
    );
    try {
      const claims = parseJsonArray(out)
        .slice(0, MAX_CLAIMS)
        .map((c) => normalizeClaim(c, source))
        .filter((c): c is Claim => c !== null);
      if (claims.length === 0) throw new Error(`Model ${model} returned no usable claims`);
      return claims;
    } catch (err) {
      lastParseError = err;
    }
  }
  throw lastParseError instanceof Error ? lastParseError : new Error(String(lastParseError));
}

export function getModelConfig(envPath?: string, source?: string): ModelConfig | null {
  return loadModelConfig(envPath, source);
}
