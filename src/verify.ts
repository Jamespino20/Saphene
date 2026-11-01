import type { ClaimCategory, VerdictStatus } from "../schema";
import { extractClaims, extractClaimsViaModel, getModelConfig } from "./extract.js";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { grepLine } from "./verify.js";

export interface AdapterOptions {
  useModel?: boolean;
  targets?: string[];
}

export interface VerifyOptions {
  includeSource?: boolean;
}

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".venv", "__pycache__", ".idea", ".vscode"]);
const TEXT_EXTS = new Set([".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".json", ".php", ".sql", ".html", ".css", ".scss", ".csv", ".prisma", ".xml", ".env.example", ".htaccess"]);
const MAX_FILE_BYTES = 512_000;
const MAX_FILES_PER_DIR_SCAN = 2000;

function grepLine(file: string, needle: string, caseInsensitive = false): string | null {
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const hay = caseInsensitive ? lines[i].toLowerCase() : lines[i];
    const pin = caseInsensitive ? needle.toLowerCase() : needle;
    if (hay.includes(pin)) {
      return `${file}:${i + 1}: ${lines[i].trim()}`;
    }
  }
  return null;
}

function isScannable(file: string, codeOnly: boolean): boolean {
  const ext = extname(file).toLowerCase();
  return codeOnly ? CODE_EXTS.has(ext) : TEXT_EXTS.has(ext);
}

function searchDir(dir: string, needle: string, budget: { count: number }, exclude: ReadonlySet<string>, codeOnly: boolean): string | null {
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
      const hit = searchDir(full, needle, budget, exclude, codeOnly);
      if (hit) return hit;
    } else if (
      stat.isFile() &&
      stat.size <= MAX_FILE_BYTES &&
      isScannable(name, codeOnly) &&
      !SKIP_FILES.has(name.toLowerCase()) &&
      !exclude.has(name.toLowerCase())
    ) {
      budget.count -= 1;
      const hit = grepLine(full, needle, true);
      if (hit) return hit;
    }
  }
  return null;
}

export function searchTargets(targets: string[], needle: string, exclude: ReadonlySet<string> = new Set(), codeOnly = false): string | null {
  for (const target of targets) {
    if (!existsSync(target)) continue;
    const stat = statSync(target);
    if (stat.isDirectory()) {
      const hit = searchDir(target, needle, { count: MAX_FILES_PER_DIR_SCAN }, exclude, codeOnly);
      if (hit) return hit;
    } else {
      const hit = grepLine(target, needle, true);
      if (hit) return hit;
    }
  }
  return null;
}

export function verifyClaim(claim: Claim, targets: string[] = [], options: VerifyOptions = {}): Verdict {
  const includeSource = options.includeSource ?? true;
  const exclude = new Set((options.excludeFiles ?? []).map((f) => f.toLowerCase()));
  const codeOnly = options.codeOnly ?? false;
  const searchSpace = includeSource ? [claim.source, ...targets] : [...targets];
  const evidence: Evidence[] = [];
  const found: string[] = [];

  for (const needle of claim.expectedEvidence) {
    const sourceHit = includeSource ? grepLine(claim.source, needle) : null;
    const hit = sourceHit ?? searchTargets(targets, needle, exclude, codeOnly);
    if (hit) {
      found.push(needle);
      evidence.push({
        kind: sourceHit ? "grep" : "read",
        location: hit.split(":").slice(0, 2).join(":"),
        quote: hit,
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  let status: VerdictStatus;
  let confidence: number;
  let reason: string;
  let citation: string;

  if (claim.expectedEvidence.length === 0) {
    status = "unfound";
    citation = "no evidence hints available";
    confidence = 0;
    reason = "claim carries no expectedEvidence to check";
  } else if (found.length === claim.expectedEvidence.length) {
    status = "matched";
    citation = evidence[0]?.quote ?? "evidence located";
    confidence = evidence.some((e) => e.location === claim.source) ? 0.9 : 0.75;
    reason = `all ${found.length} evidence strings located`;
  } else if (found.length > 0) {
    status = "partial";
    citation = evidence[0]?.quote ?? "some evidence located";
    confidence = 0.5;
    reason = `${found.length}/${claim.expectedEvidence.length} evidence strings located`;
  } else {
    status = "unfound";
    citation = `searched ${searchSpace.join(", ")} for "${claim.expectedEvidence[0]}"`;
    confidence = 0.5;
    reason = "no expected evidence located in source or targets";
  }

  return { claimId: claim.id, status, citation, confidence, reason };
}

export async function runAdapter(
  adapter: "memory" | "paper" | "helm",
  source: string,
  content: string,
  options: AdapterOptions = {},
): Promise<{ claims: Claim[]; verdicts: Verdict[]; traceability: TraceabilityRow[] }> {
  const targets = options.targets ?? [];
  const includeSource = options.includeSource ?? true;
  let claims = extractClaims(source, content);

  if (options.useModel) {
    const cfg = getModelConfig();
    if (cfg) {
      try {
        claims = await extractClaimsViaModel(source, content, cfg);
      } catch (err) {
        console.warn(`[saphene] model extraction failed, falling back to heuristic: ${err instanceof Error ? err.message : err}`);
      }
    } else {
      console.warn("[saphene] no .env model config, using heuristic extraction");
    }
  }

  const verdicts = claims.map((c) => verifyClaim(c, targets, { includeSource, excludeFiles: options.excludeFiles, codeOnly: options.codeOnly }));

  const byId = new Map(verdicts.map((v) => [v.claimId, v]));
  const traceability: TraceabilityRow[] = claims
    .filter((c) => c.category === "srs")
    .map((c) => {
      const v = byId.get(c.id);
      return {
        claimId: c.id,
        srsClause: c.srsClause ?? "-",
        requirementType: c.requirementType ?? "-",
        status: v?.status ?? "unverified",
        citation: v?.citation ?? "-",
      };
    });

  return { claims, verdicts, traceability };
}
