// Deterministic rule checks — Saphene's Semgrep-lite layer.
//
// No model call. A small set of high-confidence regex rules over code files.
// Findings carry standards refs and verbatim anchors, same receipt discipline
// as the audit panel — but reproducible offline, forever.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

export interface ScanRule {
  id: string;
  title: string;
  severity: "critical" | "major" | "minor";
  category: "security" | "bug" | "incomplete" | "performance";
  pattern: RegExp;
  standards: string[];
  exts?: string[];
}

export interface ScanFinding {
  id: string;
  ruleId: string;
  title: string;
  severity: ScanRule["severity"];
  category: ScanRule["category"];
  file: string;
  line: number;
  quote: string;
  standards: string[];
}

export const SCAN_RULES: ScanRule[] = [
  {
    id: "SAPH-SCAN-001",
    title: "eval() executes arbitrary code",
    severity: "critical",
    category: "security",
    pattern: /\beval\s*\(/,
    standards: ["ISO25010-Security", "ISO27002-A.8"],
  },
  {
    id: "SAPH-SCAN-002",
    title: "Hardcoded credential-like assignment",
    severity: "critical",
    category: "security",
    pattern: /(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["'][^"']{8,}["']/i,
    standards: ["SAPH-SEC-01", "ISO25010-Security", "ISO27002-A.8"],
  },
  {
    id: "SAPH-SCAN-003",
    title: "HTML injection sink (innerHTML / insertAdjacentHTML / document.write)",
    severity: "major",
    category: "security",
    pattern: /(\.innerHTML\s*=|insertAdjacentHTML\s*\(|document\.write\s*\()/,
    standards: ["ISO25010-Security"],
  },
  {
    id: "SAPH-SCAN-004",
    title: "Empty catch block swallows errors",
    severity: "major",
    category: "bug",
    pattern: /catch\s*(\([^)]*\))?\s*\{\s*\}/,
    standards: ["ISO25010-Reliability"],
  },
  {
    id: "SAPH-SCAN-005",
    title: "TODO/FIXME marker — code admits incompleteness",
    severity: "minor",
    category: "incomplete",
    pattern: /\b(TODO|FIXME|XXX|HACK)\b/,
    standards: ["SAPH-RC-02", "ISO25010-Maintainability"],
  },
  {
    id: "SAPH-SCAN-006",
    title: "Cleartext HTTP URL (non-localhost)",
    severity: "minor",
    category: "security",
    pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/,
    standards: ["ISO25010-Security"],
  },
  {
    id: "SAPH-SCAN-007",
    title: "Unbounded while(true) loop",
    severity: "major",
    category: "performance",
    pattern: /while\s*\(\s*true\s*\)/,
    standards: ["ISO25010-PerformanceEfficiency"],
  },
  {
    id: "SAPH-SCAN-008",
    title: "TypeScript any type erases the contract",
    severity: "minor",
    category: "incomplete",
    pattern: /:\s*any\b/,
    standards: ["ISO25010-Maintainability"],
    exts: [".ts", ".tsx"],
  },
];

const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".py", ".rs", ".go", ".java", ".rb", ".php", ".cs", ".sol"]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".saphene", "dist", "dist-cli", ".venv", "__pycache__"]);
const MAX_FILE_BYTES = 512_000;

function stableId(file: string, ruleId: string, line: number): string {
  let hash = 0;
  const input = `${file}::${ruleId}::${line}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `fnd_${Math.abs(hash).toString(16)}`;
}

function walk(dir: string, out: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir, { withFileTypes: true }).map((e) => e.name);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, out);
    } else if (stat.isFile() && stat.size <= MAX_FILE_BYTES && CODE_EXTS.has(extname(name).toLowerCase())) {
      out.push(full);
    }
  }
}

export function scanRepo(repoDir: string): { files: number; findings: ScanFinding[] } {
  const files: string[] = [];
  if (existsSync(repoDir) && statSync(repoDir).isDirectory()) walk(repoDir, files);
  const findings: ScanFinding[] = [];
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const rule of SCAN_RULES) {
        if (rule.exts && !rule.exts.includes(extname(file).toLowerCase())) continue;
        if (rule.pattern.test(line)) {
          findings.push({
            id: stableId(file, rule.id, idx + 1),
            ruleId: rule.id,
            title: rule.title,
            severity: rule.severity,
            category: rule.category,
            file,
            line: idx + 1,
            quote: line.trim(),
            standards: rule.standards,
          });
        }
      }
    });
  }
  return { files: files.length, findings };
}
