// SARIF ingestion — scanner output becomes ledgered Saphene evidence.
//
// Slither, Semgrep, Snyk, CodeQL and Saphene's own bridge all speak SARIF.
// This turns their results into ledger entries with anchors, so external
// findings join the same drift tracking as claims.

import { readFileSync } from "node:fs";
import type { LedgerEntry } from "./ledger.js";

function stableId(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `fnd_${Math.abs(hash).toString(16)}`;
}

export function ingestSarif(sarifPath: string): { tool: string; entries: LedgerEntry[] } {
  const raw = readFileSync(sarifPath, "utf8").replace(/^\uFEFF/, "");
  const doc = JSON.parse(raw) as {
    runs?: Array<{
      tool?: { driver?: { name?: string } };
      results?: Array<{
        ruleId?: string;
        level?: string;
        message?: { text?: string };
        locations?: Array<{
          physicalLocation?: {
            artifactLocation?: { uri?: string };
            region?: { startLine?: number };
          };
        }>;
      }>;
    }>;
  };
  const entries: LedgerEntry[] = [];
  let tool = "unknown";
  for (const run of doc.runs ?? []) {
    tool = run.tool?.driver?.name ?? tool;
    for (const result of run.results ?? []) {
      const loc = result.locations?.[0]?.physicalLocation;
      const uri = loc?.artifactLocation?.uri ?? "unknown";
      const line = loc?.region?.startLine ?? 1;
      const message = result.message?.text ?? result.ruleId ?? "scanner finding";
      entries.push({
        claimId: stableId(`${uri}:${line}:${result.ruleId}:${message}`),
        text: `[${tool}/${result.ruleId ?? "rule"}] ${message}`,
        source: uri,
        status: result.level === "none" ? "partial" : "matched",
        citation: `${uri}:${line}: ${message}`,
        anchor: message,
        location: `${uri}:${line}`,
        verifiedAt: new Date().toISOString(),
      });
    }
  }
  return { tool, entries };
}
