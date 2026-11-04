// Per-repo alias and entity-disambiguation tables.
//
// Saphene reads `.saphene/aliases.json` from a source document's directory
// and from each verification target before extraction/search. Example:
// {
//   "aliases": { "MES": ["Statesman"], "Renier": ["Ive Laster"] },
//   "distinct": [["Libby", "Libitina", "Rina"]]
// }
//
// Aliases expand a search in both directions. Distinct entries are different
// entities whose names must never be used as evidence for one another; they
// are searched as whole words only.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface AliasTable {
  aliases: Record<string, string[]>;
  distinct: string[][];
}

export const EMPTY_ALIASES: AliasTable = { aliases: {}, distinct: [] };

function cleanTable(raw: unknown): AliasTable {
  if (typeof raw !== "object" || raw === null) return EMPTY_ALIASES;
  const obj = raw as Record<string, unknown>;
  const aliases: Record<string, string[]> = {};
  if (typeof obj.aliases === "object" && obj.aliases !== null) {
    for (const [key, value] of Object.entries(obj.aliases as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        aliases[key] = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
      }
    }
  }
  const distinct = Array.isArray(obj.distinct)
    ? obj.distinct
        .filter((g): g is unknown[] => Array.isArray(g))
        .map((g) => g.filter((v): v is string => typeof v === "string" && v.trim().length > 0))
        .filter((g) => g.length > 1)
    : [];
  return { aliases, distinct };
}

export function loadAliasTableFromFile(path: string): AliasTable {
  if (!existsSync(path)) return EMPTY_ALIASES;
  try {
    return cleanTable(JSON.parse(readFileSync(path, "utf8")));
  } catch {
    return EMPTY_ALIASES;
  }
}

function candidatePaths(root: string): string[] {
  return [join(root, ".saphene", "aliases.json"), join(root, "saphene.aliases.json")];
}

export function mergeAliasTables(tables: AliasTable[]): AliasTable {
  const merged: AliasTable = { aliases: {}, distinct: [] };
  for (const table of tables) {
    for (const [key, values] of Object.entries(table.aliases)) {
      const existing = merged.aliases[key] ?? [];
      merged.aliases[key] = [...new Set([...existing, ...values])];
    }
    for (const group of table.distinct) {
      const key = group.map((x) => x.toLowerCase()).sort().join("\u0000");
      if (!merged.distinct.some((g) => g.map((x) => x.toLowerCase()).sort().join("\u0000") === key)) {
        merged.distinct.push(group);
      }
    }
  }
  return merged;
}

export function loadAliasTables(source: string, targets: string[] = []): AliasTable {
  const roots = [dirname(source), ...targets];
  const tables: AliasTable[] = [];
  for (const root of roots) {
    for (const path of candidatePaths(root)) tables.push(loadAliasTableFromFile(path));
  }
  return mergeAliasTables(tables);
}

function same(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export function expandEvidence(needle: string, table: AliasTable): string[] {
  if (distinctGroupFor(needle, table)) return [needle];
  const variants = new Set<string>([needle]);
  for (const [canonical, equivalents] of Object.entries(table.aliases)) {
    if (same(canonical, needle) || equivalents.some((v) => same(v, needle))) {
      variants.add(canonical);
      for (const equivalent of equivalents) variants.add(equivalent);
    }
  }
  return [...variants];
}

export function distinctGroupFor(needle: string, table: AliasTable): string[] | undefined {
  return table.distinct.find((group) => group.some((term) => same(term, needle)));
}

export function canonicalEntity(value: string, table: AliasTable): string {
  for (const [canonical, equivalents] of Object.entries(table.aliases)) {
    if (same(canonical, value) || equivalents.some((v) => same(v, value))) return canonical;
  }
  return value;
}
