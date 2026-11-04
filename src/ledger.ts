// Claim ledger persistence + verdict diffing across runs.
// A status regression (matched -> unfound) is DRIFT: memory rotted against the disk.

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type { VerdictStatus } from "./schema.js";

export interface LedgerEntry {
  claimId: string;
  text: string;
  source: string;
  status: VerdictStatus;
  citation: string;
  verifiedAt: string;
  needsReview?: boolean;
  anchor?: string;
  location?: string;
}

export interface Ledger {
  version: 1;
  lastRunAt?: string;
  entries: Record<string, LedgerEntry>;
}

const RANK: Record<VerdictStatus, number> = { unverified: 0, unfound: 1, mismatch: 2, partial: 3, matched: 4 };
const BAD: ReadonlySet<VerdictStatus> = new Set(["unfound", "mismatch"]);

export function loadLedger(path: string): Ledger | null {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, "")) as Ledger;
    if (parsed?.version !== 1 || typeof parsed.entries !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLedger(path: string, ledger: Ledger): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(ledger, null, 2), "utf8");
}

export interface LedgerDiff {
  added: LedgerEntry[];
  resolved: Array<{ entry: LedgerEntry; from: VerdictStatus }>;
  drifted: Array<{ entry: LedgerEntry; from: VerdictStatus }>;
  relocated: Array<{ entry: LedgerEntry; fromLocation?: string }>;
  unchanged: number;
}

export function diffLedger(prev: Ledger | null, current: LedgerEntry[]): LedgerDiff {
  const diff: LedgerDiff = { added: [], resolved: [], drifted: [], relocated: [], unchanged: 0 };
  for (const entry of current) {
    const p = prev?.entries[entry.claimId];
    if (!p) {
      diff.added.push(entry);
    } else if (p.status === entry.status) {
      if (p.anchor && entry.anchor && p.anchor === entry.anchor && p.location !== entry.location) {
        diff.relocated.push({ entry, fromLocation: p.location });
      } else {
        diff.unchanged += 1;
      }
    } else if (
      RANK[entry.status] < RANK[p.status] ||
      (BAD.has(p.status) && BAD.has(entry.status))
    ) {
      diff.drifted.push({ entry, from: p.status });
    } else {
      diff.resolved.push({ entry, from: p.status });
    }
  }
  return diff;
}

const SKIP_DIRS = new Set(["node_modules", ".git", ".saphene", "dist", ".venv", "__pycache__"]);
const MAX_MEMORY_FILES = 50;
const MAX_MEMORY_FILE_BYTES = 200_000;

export interface MemoryScan {
  files: string[];
  truncated: boolean;
  skipped: number;
}

export function scanMemoryFilesWithDiagnostics(root: string): MemoryScan {
  const files: string[] = [];
  let truncated = false;
  let skipped = 0;
  const walk = (dir: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(dir, { withFileTypes: true }).map((e) => e.name);
    } catch {
      skipped += 1;
      return;
    }
    for (const name of entries.sort()) {
      const full = join(dir, name);
      let stat;
      try {
        stat = statSync(full);
      } catch {
        skipped += 1;
        continue;
      }
      if (stat.isDirectory()) {
        if (!SKIP_DIRS.has(name)) walk(full);
      } else if (name.toLowerCase().endsWith(".md") && stat.size <= MAX_MEMORY_FILE_BYTES) {
        if (files.length >= MAX_MEMORY_FILES) {
          truncated = true;
          continue;
        }
        files.push(full);
      }
    }
  };
  walk(root);
  return { files, truncated, skipped };
}

export function scanMemoryFiles(root: string): string[] {
  return scanMemoryFilesWithDiagnostics(root).files;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
