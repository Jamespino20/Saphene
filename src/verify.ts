import type { Claim, ClaimCategory, Evidence, TraceabilityRow, Verdict, VerdictStatus } from "./schema.js";
import { extractClaims, extractClaimsViaModel, getModelConfig } from "./extract.js";
import {
  canonicalEntity,
  distinctGroupFor,
  EMPTY_ALIASES,
  expandEvidence,
  loadAliasTables,
  type AliasTable,
} from "./aliases.js";
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

export interface AdapterOptions {
  useModel?: boolean;
  targets?: string[];
  includeSource?: boolean;
  excludeFiles?: string[];
  codeOnly?: boolean;
  aliasTable?: AliasTable;
  /** Explicit .env path (--env). Falls back to SAPHENE_MODEL_* env, ./.env, then source-adjacent .env. */
  modelEnvPath?: string;
}

export interface AdapterResult {
  claims: Claim[];
  verdicts: Verdict[];
  traceability: TraceabilityRow[];
  modelUsed: boolean;
  modelNote: string;
}

const SKIP_DIRS = new Set(["node_modules", ".git", ".saphene", "dist", ".venv", "__pycache__", ".idea", ".vscode"]);
const SKIP_FILES = new Set(["package-lock.json", "package.json", "tsconfig.json", "tsconfig.node.json"]);
const TEXT_EXTS = new Set([".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".json", ".php", ".sql", ".html", ".css", ".scss", ".csv", ".prisma", ".xml", ".env.example", ".htaccess", ".ps1", ".psm1", ".bat", ".cmd", ".sh", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".log"]);
// Extensionless project files that are always plain text.
const TEXT_BASENAMES = new Set(["license", "notice", "readme", "changelog", "authors", "contributors", "dockerfile", "makefile", "gemfile", "rakefile", "vagrantfile", "procfile"]);
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".py", ".rs", ".go", ".java", ".rb", ".php", ".cs", ".ps1", ".psm1", ".sh"]);
const MAX_FILE_BYTES = 512_000;
const MAX_FILES_PER_DIR_SCAN = 2000;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function lineIncludes(line: string, needle: string, caseInsensitive = false, wholeWord = false): boolean {
  if (!wholeWord) {
    return caseInsensitive ? line.toLowerCase().includes(needle.toLowerCase()) : line.includes(needle);
  }
  const flags = caseInsensitive ? "i" : "";
  return new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(needle)}(?=$|[^A-Za-z0-9_])`, flags).test(line);
}

export function grepLine(file: string, needle: string, caseInsensitive = false, wholeWord = false): string | null {
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lineIncludes(lines[i], needle, caseInsensitive, wholeWord)) {
      return `${file}:${i + 1}: ${lines[i].trim()}`;
    }
  }
  return null;
}

export function parseHit(hit: string): { location: string; anchor: string } {
  const match = hit.match(/^(.*):(\d+): (.*)$/s);
  if (!match) return { location: hit, anchor: hit };
  return { location: `${match[1]}:${match[2]}`, anchor: match[3].trim() };
}

function normalizedCompare(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

const NEGATIVE_STOP_TOKENS = new Set([
  "os", "icon", "icons", "packaging", "package", "http", "https", "www", "pypi", "github", "gitlab", "npm", "node", "js", "ts", "json", "md", "file", "files", "src", "app", "api", "web", "inbound", "server", "system",
]);

const ACTION_VERBS = new Set([
  "edit", "edits", "edited", "serve", "serves", "served", "listen", "listens", "bind", "binds", "host", "hosts", "run", "runs", "execute", "executes", "write", "writes", "create", "creates", "delete", "deletes", "remove", "removes", "update", "updates", "publish", "publishes", "upload", "uploads", "download", "downloads", "connect", "connects", "accept", "accepts", "receive", "receives", "handle", "handles", "route", "routes", "render", "renders", "generate", "generates", "store", "stores", "read", "reads", "send", "sends", "know", "knows", "saw", "see", "sees", "understand", "understands", "use", "uses", "support", "supports", "require", "requires", "contain", "contains",
]);

function stripEvidenceSyntax(value: string): string {
  return value.trim().replace(/^`+|`+$/g, "").replace(/^['"]|['"]$/g, "").trim();
}

export function evidenceVariants(needle: string): string[] {
  const base = stripEvidenceSyntax(needle);
  const variants = new Set<string>([base]);
  const slash = base.replace(/\\/g, "/");
  variants.add(slash);
  variants.add(slash.replace(/\//g, "\\"));
  if (slash.endsWith("/")) variants.add(slash.slice(0, -1));
  if (/sha[-\s]?256/i.test(base)) {
    variants.add("SHA-256");
    variants.add("SHA256");
    variants.add("sha256");
    variants.add("sha-256");
  }
  const compact = base.replace(/([A-Za-z])[-_](\d)/g, "$1$2");
  if (compact !== base) variants.add(compact);
  return [...variants].filter(Boolean);
}

function hintTokens(value: string): string[] {
  return stripEvidenceSyntax(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isStopToken(needle: string): boolean {
  const tokens = hintTokens(needle);
  return tokens.length === 1 && NEGATIVE_STOP_TOKENS.has(tokens[0]);
}

function isWeakHint(needle: string): boolean {
  const clean = stripEvidenceSyntax(needle);
  if (isStopToken(clean)) return true;
  if (/^https?:\/\//i.test(clean) || /^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(clean) && !/\s/.test(clean)) return true;
  if (clean.endsWith("/") || clean.endsWith("\\")) return true;
  const tokens = hintTokens(clean);
  if (tokens.length <= 1 && clean.length <= 3) return true;
  if (tokens.length === 1 && !/[_\-]/.test(clean) && !/[a-z][A-Z]/.test(clean)) return true;
  return false;
}

function hasActionVerb(text: string): boolean {
  return hintTokens(text).some((token) => ACTION_VERBS.has(token));
}

function anchorIsNegated(hit: string): boolean {
  const { anchor } = parseHit(hit);
  const text = ` ${anchor.toLowerCase()} `;
  return /\b(no|not|never|without|unavailable|disabled|fixture-only|mock|fake-backed|placeholder)\b/.test(text) ||
    /\bnot\s+(shown|deployed|configured|available|implemented|enabled|live)\b/.test(text) ||
    /\bno\s+(live|verified|provider|authorized|completed)\b/.test(text);
}

function stemWord(word: string): string {
  if (word.length <= 4) return word;
  return word.replace(/(ies|es|s|ed|ing)$/, (m) => (m === "ies" ? "y" : ""));
}

function isScreamingSnakeConstant(needle: string): boolean {
  return /^[A-Z][A-Z0-9_]{2,}$/.test(stripEvidenceSyntax(needle));
}

function hitStrength(needle: string, hit: string, claimText: string): "strong" | "weak" {
  const { anchor } = parseHit(hit);
  const weak = isWeakHint(needle);
  const action = hasActionVerb(anchor) || hasActionVerb(needle);
  // SCREAMING_SNAKE constants (O_EXCL, MAX_RETRIES): a bare flag reference is
  // never enough to invert a negated claim. It needs a claim-stem verb in the
  // anchor (stem-matched: overwrites ~= overwrite) or multi-token overlap.
  if (isScreamingSnakeConstant(needle)) {
    const claimStems = new Set(hintTokens(claimText).filter((t) => !NEGATIVE_STOP_TOKENS.has(t)).map(stemWord));
    const anchorStems = new Set(hintTokens(anchor).map(stemWord));
    const overlap = [...claimStems].filter((t) => anchorStems.has(t)).length;
    if (action && overlap >= 2) return "strong";
    return "weak";
  }
  if (!weak && action) return "strong";
  if (!weak && /\s/.test(stripEvidenceSyntax(needle))) return "strong";
  if (!weak && /[_./\\-]/.test(needle) && anchor.toLowerCase().includes(stripEvidenceSyntax(needle).toLowerCase())) return "strong";
  const claimTokens = hintTokens(claimText).filter((t) => !NEGATIVE_STOP_TOKENS.has(t));
  const anchorTokens = new Set(hintTokens(anchor));
  const corroborating = claimTokens.filter((t) => anchorTokens.has(t)).length;
  if (action && corroborating >= 2) return "strong";
  return "weak";
}

type OutOfScopeKind = "legal" | "history" | "external-sha";

function outOfScopeKind(claim: Claim): OutOfScopeKind | null {
  const text = `${claim.text} ${claim.expectedEvidence.join(" ")}`;
  if (/\b(legal|legally|copyright holder|patent|trademark|liability|liable|court|license terms|licensing terms)\b/i.test(text)) {
    return "legal";
  }
  if (
    /\b(external|upstream|vendor|published|release artifact)\b[^.]*\b(sha[-\s]?256|checksum)\b/i.test(text) ||
    /\b[a-f0-9]{64}\b/i.test(claim.text) ||
    /^https?:\/\//i.test(claim.text.trim())
  ) {
    return "external-sha";
  }
  if (/\b(historically|history|formerly|previously|originally|founded in|established in|was renamed|old name)\b/i.test(claim.text)) {
    return "history";
  }
  return null;
}

function outOfScopeVerdict(claim: Claim, kind: OutOfScopeKind, searched: string): Verdict {
  return {
    claimId: claim.id,
    status: "unverified",
    citation: `out-of-scope:${kind} — repository presence search cannot settle this claim (${searched})`,
    confidence: 0,
    reason: `out-of-scope:${kind} — label as out-of-scope, not unfound`,
    negation: (claim.polarity ?? "positive") === "negative" ? true : undefined,
  };
}

function isOwnClaimLine(hit: string, claimText: string): boolean {
  const { anchor } = parseHit(hit);
  const a = normalizedCompare(anchor);
  const c = normalizedCompare(claimText);
  return a === c || (c.length > 20 && a.includes(c)) || (a.length > 20 && c.includes(a));
}

function grepSourceExcludingClaim(file: string, needle: string, claimText: string, wholeWord: boolean): string | null {
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (!lineIncludes(lines[i], needle, true, wholeWord)) continue;
    const hit = `${file}:${i + 1}: ${lines[i].trim()}`;
    if (!isOwnClaimLine(hit, claimText)) return hit;
  }
  return null;
}

function isScannable(file: string, codeOnly: boolean): boolean {
  const ext = extname(file).toLowerCase();
  if (codeOnly) return CODE_EXTS.has(ext);
  if (TEXT_EXTS.has(ext)) return true;
  if (!ext) {
    const base = file.split(/[\\/]/).pop()?.toLowerCase() ?? "";
    if (TEXT_BASENAMES.has(base)) return true;
  }
  return false;
}

/** A hint that names a file rather than file contents (e.g. LICENSE, Dockerfile, deploy.ps1). */
function isFilenameHint(needle: string): boolean {
  const clean = stripEvidenceSyntax(needle);
  return clean.length >= 2 && !/\s/.test(clean) && (/[/\\]/.test(clean) || /\.[A-Za-z0-9]{1,5}$/.test(clean) || TEXT_BASENAMES.has(clean.toLowerCase()));
}

function findFileByName(dir: string, needle: string, budget: { count: number }): string | null {
  if (budget.count <= 0) return null;
  const want = stripEvidenceSyntax(needle).replace(/\\/g, "/").toLowerCase();
  const base = want.split("/").pop() ?? want;
  let entries: string[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }).map((e) => e.name);
  } catch {
    return null;
  }
  for (const name of entries) {
    if (budget.count <= 0) return null;
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      const hit = findFileByName(full, needle, budget);
      if (hit) return hit;
    } else if (stat.isFile() && name.toLowerCase() === base) {
      budget.count -= 1;
      return `${full}:1: <filename present>`;
    }
  }
  return null;
}

function pathInScope(path: string, scope?: string[]): boolean {
  if (!scope || scope.length === 0) return true;
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  return scope.some((fragment) => normalized.includes(fragment.replace(/\\/g, "/").toLowerCase()));
}

function searchDir(
  dir: string,
  needle: string,
  budget: { count: number },
  exclude: ReadonlySet<string>,
  codeOnly: boolean,
  wholeWord = false,
  scope?: string[],
): string | null {
  if (budget.count <= 0) return null;
  let entries: string[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }).map((e) => e.name);
  } catch {
    return null;
  }
  for (const name of entries) {
    if (budget.count <= 0) return null;
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      const hit = searchDir(full, needle, budget, exclude, codeOnly, wholeWord, scope);
      if (hit) return hit;
    } else if (
      stat.isFile() &&
      stat.size <= MAX_FILE_BYTES &&
      isScannable(name, codeOnly) &&
      !SKIP_FILES.has(name.toLowerCase()) &&
      !exclude.has(name.toLowerCase()) &&
      pathInScope(full, scope)
    ) {
      budget.count -= 1;
      const hit = grepLine(full, needle, true, wholeWord);
      if (hit) return hit;
    }
  }
  return null;
}

export function searchTargets(
  targets: string[],
  needle: string,
  exclude: ReadonlySet<string> = new Set(),
  codeOnly = false,
  wholeWord = false,
  scope?: string[],
): string | null {
  for (const target of targets) {
    if (!existsSync(target)) continue;
    const stat = statSync(target);
    if (stat.isDirectory()) {
      const hit = searchDir(target, needle, { count: MAX_FILES_PER_DIR_SCAN }, exclude, codeOnly, wholeWord, scope);
      if (hit) return hit;
    } else if (pathInScope(target, scope)) {
      const hit = grepLine(target, needle, true, wholeWord);
      if (hit) return hit;
    }
  }
  return null;
}

export function verifyClaim(claim: Claim, targets: string[] = [], options: AdapterOptions = {}): Verdict {
  const includeSource = options.includeSource ?? true;
  const exclude = new Set((options.excludeFiles ?? []).map((f) => f.toLowerCase()));
  const codeOnly = options.codeOnly ?? false;
  const aliases = options.aliasTable ?? EMPTY_ALIASES;
  const searchSpace = includeSource ? [claim.source, ...targets] : [...targets];
  const evidence: Evidence[] = [];
  const found: string[] = [];

  if (claim.lifecycle === "planned") {
    const planHit = grepLine(claim.source, claim.text.slice(0, Math.min(80, claim.text.length)), true);
    if (planHit) {
      const parts = parseHit(planHit);
      return {
        claimId: claim.id,
        status: "matched",
        citation: planHit,
        confidence: 0.9,
        reason: "planned claim verified against the source plan; implementation is not asserted yet",
        anchor: parts.anchor,
        location: parts.location,
      };
    }
    return {
      claimId: claim.id,
      status: "unfound",
      citation: `searched ${claim.source} for the planned claim text; no occurrence found`,
      confidence: 0.5,
      reason: "planned claim is not present in its source plan",
    };
  }

  if (claim.expectedEvidence.length === 0) {
    const kind = outOfScopeKind(claim);
    if (kind) return outOfScopeVerdict(claim, kind, "no evidence hints supplied");
    return {
      claimId: claim.id,
      status: "unfound",
      citation: "no evidence hints supplied; add evidence: <literal identifier, file path, table, or exact phrase>",
      confidence: 0,
      reason: "claim carries no expectedEvidence to check",
    };
  }

  const searchOne = (needle: string, includeClaimSource: boolean): { hit: string | null; fromSource: boolean } => {
    const wholeWord = Boolean(distinctGroupFor(needle, aliases)) || /^[A-Z0-9-]{2,}$/.test(needle);
    const variants = [...new Set(expandEvidence(needle, aliases).flatMap((v) => evidenceVariants(v)))];
    for (const variant of variants) {
      if (includeClaimSource && includeSource) {
        const sourceHit = grepSourceExcludingClaim(claim.source, variant, claim.text, wholeWord);
        if (sourceHit) return { hit: sourceHit, fromSource: true };
      }
      const targetHit = searchTargets(targets, variant, exclude, codeOnly, wholeWord, claim.scope);
      if (targetHit) return { hit: targetHit, fromSource: false };
    }
    // Filename hints (LICENSE, Dockerfile, deploy.ps1): the file's existence is the evidence.
    if (isFilenameHint(needle)) {
      for (const target of targets) {
        if (!existsSync(target)) continue;
        const stat = statSync(target);
        if (stat.isDirectory() && pathInScope(target, claim.scope)) {
          const hit = findFileByName(target, needle, { count: 200 });
          if (hit) return { hit, fromSource: false };
        }
      }
    }
    return { hit: null, fromSource: false };
  };

  if ((claim.polarity ?? "positive") === "negative") {
    const kind = outOfScopeKind(claim);
    const hits: Array<{ needle: string; hit: string; strength: "strong" | "weak"; negated: boolean }> = [];
    for (const needle of claim.expectedEvidence) {
      const { hit } = searchOne(needle, includeSource && targets.length === 0);
      if (hit) hits.push({ needle, hit, strength: hitStrength(needle, hit, claim.text), negated: anchorIsNegated(hit) });
    }
    if (kind) {
      return outOfScopeVerdict(claim, kind, `negative claim scoped to ${targets.join(", ") || claim.source}`);
    }
    const contradictions = hits.filter((h) => !h.negated);
    const supporting = hits.filter((h) => h.negated);
    const strongHits = contradictions.filter((h) => h.strength === "strong");
    if (strongHits.length >= 1 || contradictions.length >= 2) {
      const first = strongHits[0] ?? contradictions[0];
      const parts = parseHit(first.hit);
      return {
        claimId: claim.id,
        status: "mismatch",
        citation: first.hit,
        confidence: 0.9,
        reason: `negation:true — negative claim contradicted by ${strongHits.length >= 1 ? "strong verb-bearing" : "corroborated"} evidence for "${first.needle}" (${contradictions.length} contradiction hit(s), ${strongHits.length} strong, ${supporting.length} supporting)`,
        anchor: parts.anchor,
        location: parts.location,
        negation: true,
      };
    }
    if (supporting.length >= 1 && contradictions.length === 0) {
      const first = supporting[0];
      const parts = parseHit(first.hit);
      return {
        claimId: claim.id,
        status: "matched",
        citation: first.hit,
        confidence: 0.75,
        reason: `negation:true — negative claim supported by explicit negated evidence for "${first.needle}"`,
        anchor: parts.anchor,
        location: parts.location,
        negation: true,
      };
    }
    if (contradictions.length === 1) {
      const first = contradictions[0];
      const parts = parseHit(first.hit);
      return {
        claimId: claim.id,
        status: "partial",
        citation: first.hit,
        confidence: 0.5,
        reason: `negation:true — single weak/token evidence for "${first.needle}" is not enough to invert a negated claim; require a verb-bearing line or a second corroborating hint`,
        anchor: parts.anchor,
        location: parts.location,
        negation: true,
      };
    }
    if (supporting.length >= 1 && contradictions.length >= 1) {
      const first = supporting[0];
      const parts = parseHit(first.hit);
      return {
        claimId: claim.id,
        status: "partial",
        citation: first.hit,
        confidence: 0.5,
        reason: "negation:true — mixed negated and positive evidence; human review required",
        anchor: parts.anchor,
        location: parts.location,
        negation: true,
      };
    }
    const scopeText = claim.scope?.length ? ` scoped to ${claim.scope.join(", ")}` : "";
    return {
      claimId: claim.id,
      status: "matched",
      citation: `searched ${targets.join(", ") || claim.source}${scopeText} for ${claim.expectedEvidence.map((h) => `"${h}"`).join(", ")}; no occurrence found`,
      confidence: 0.75,
      reason: "negation:true — negative claim holds: forbidden evidence is absent from the scoped search space",
      negation: true,
    };
  }

  for (const needle of claim.expectedEvidence) {
    const { hit, fromSource } = searchOne(needle, true);
    if (hit) {
      const parts = parseHit(hit);
      found.push(needle);
      evidence.push({
        kind: fromSource ? "grep" : "read",
        location: parts.location,
        quote: hit,
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  let status: VerdictStatus;
  let confidence: number;
  let reason: string;
  let citation: string;

  if (found.length === claim.expectedEvidence.length) {
    status = "matched";
    citation = evidence[0]?.quote ?? "evidence located";
    confidence = evidence.some((e) => e.location.startsWith(claim.source)) ? 0.9 : 0.75;
    reason = `all ${found.length} evidence strings located`;
  } else if (found.length > 0) {
    status = "partial";
    citation = evidence[0]?.quote ?? "some evidence located";
    confidence = 0.5;
    reason = `${found.length}/${claim.expectedEvidence.length} evidence strings located`;
  } else {
    status = "unfound";
    citation = `searched ${searchSpace.join(", ")} for ${claim.expectedEvidence.map((h) => `"${h}"`).join(", ")}; no occurrence found`;
    confidence = 0.5;
    reason = "no expected evidence located in source or targets";
  }

  if (found.length === 0) {
    const kind = outOfScopeKind(claim);
    if (kind) return outOfScopeVerdict(claim, kind, `searched ${searchSpace.join(", ")}`);
  }

  const firstParts = evidence[0] ? parseHit(evidence[0].quote) : undefined;
  return {
    claimId: claim.id,
    status,
    citation,
    confidence,
    reason,
    anchor: firstParts?.anchor,
    location: firstParts?.location,
  };
}

export async function runAdapter(
  adapter: "memory" | "paper" | "helm",
  source: string,
  content: string,
  options: AdapterOptions = {},
): Promise<AdapterResult> {
  const targets = options.targets ?? [];
  const includeSource = options.includeSource ?? true;
  const aliasTable = options.aliasTable ?? loadAliasTables(source, targets);
  let claims = extractClaims(source, content, aliasTable);

  let modelUsed = false;
  let modelNote = "heuristic extraction (--no-model or model not requested)";
  if (options.useModel) {
    const cfg = getModelConfig(options.modelEnvPath, source);
    if (cfg) {
      try {
        claims = (await extractClaimsViaModel(source, content, cfg)).map((claim) => ({
          ...claim,
          expectedEvidence: claim.expectedEvidence.map((hint) => canonicalEntity(hint, aliasTable)),
        }));
        modelUsed = true;
        modelNote = `model extraction via ${cfg.model}`;
      } catch (err) {
        modelNote = `model extraction failed, heuristic fallback used: ${err instanceof Error ? err.message : err}`;
        console.warn(`[saphene] ${modelNote}`);
      }
    } else {
      modelNote = "no model config found (checked SAPHENE_MODEL_* env, explicit --env, ./.env, source-adjacent .env); heuristic extraction used";
      console.warn(`[saphene] ${modelNote}`);
    }
  }

  const verdicts = claims.map((c) =>
    verifyClaim(c, targets, {
      includeSource,
      excludeFiles: options.excludeFiles,
      codeOnly: options.codeOnly,
      aliasTable,
    }),
  );

  const byId = new Map(verdicts.map((v) => [v.claimId, v]));
  const traceability: TraceabilityRow[] = claims
    .filter((c) => c.category === "srs")
    .map((c) => {
      const v = byId.get(c.id);
      return {
        claimId: c.id,
        srsClause: c.srsClause ?? "-",
        localId: c.localId ?? "-",
        requirementType: c.requirementType ?? "-",
        status: v?.status ?? "unverified",
        citation: v?.citation ?? "-",
        anchor: v?.anchor,
      };
    });

  return { claims, verdicts, traceability, modelUsed, modelNote };
}
