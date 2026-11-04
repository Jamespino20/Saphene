// MCP server for Saphene. Exposes the claim engine as agent-callable tools
// over stdio so coding agents (OpenCode, Cursor, Cline) can verify memory
// against repos on demand instead of guessing.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runAdapter } from "./verify.js";
import { extractClaims } from "./extract.js";
import { checkConsistency } from "./consistency.js";
import { loadMechanicalProfile, runMechanicalProfile, type MechanicalProfile } from "./profile.js";
import { loadAliasTableFromFile, loadAliasTables, mergeAliasTables } from "./aliases.js";
import { loadLedger, saveLedger, diffLedger, scanMemoryFiles, scanMemoryFilesWithDiagnostics, sleep, type Ledger, type LedgerEntry } from "./ledger.js";
import { readFileSync, existsSync, realpathSync, statSync } from "node:fs";
import { delimiter, join, relative, resolve } from "node:path";

interface ToolVerdict {
  claimId: string;
  text: string;
  status: string;
  citation: string;
  confidence: number;
  reason: string;
  anchor?: string;
  location?: string;
  negation?: boolean;
}

async function summarize(
  file: string,
  content: string,
  repoDir: string,
  useModel: boolean,
  includeSource: boolean,
  codeOnly = false,
) {
  const { claims, verdicts, traceability } = await runAdapter("paper", file, content, {
    useModel,
    targets: repoDir ? [repoDir] : [],
    includeSource,
    codeOnly,
  });
  const verdictsOut: ToolVerdict[] = verdicts.map((v) => {
    const c = claims.find((x) => x.id === v.claimId);
    return {
      claimId: v.claimId,
      text: c?.text ?? "",
      status: v.status,
      citation: v.citation,
      confidence: v.confidence,
      reason: v.reason,
      anchor: v.anchor,
      location: v.location,
      negation: v.negation,
    };
  });
  const withHints = claims.filter((c) => c.expectedEvidence.length > 0).length;
  return {
    total: claims.length,
    withHints,
    noHintClaims: claims.length - withHints,
    hintCoverage: claims.length === 0 ? 0 : withHints / claims.length,
    matched: verdictsOut.filter((v) => v.status === "matched").length,
    partial: verdictsOut.filter((v) => v.status === "partial").length,
    mismatch: verdictsOut.filter((v) => v.status === "mismatch").length,
    unfound: verdictsOut.filter((v) => v.status === "unfound").length,
    unverified: verdictsOut.filter((v) => v.status === "unverified").length,
    verdicts: verdictsOut,
    traceability,
  };
}

function canonicalPath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
}

function workspaceRoots(): string[] {
  const configured = (process.env.SAPHENE_WORKSPACE ?? "")
    .split(delimiter)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...configured, process.cwd()].map((r) => canonicalPath(r)))];
}

function pathGuard(path: string, label: string): string | null {
  const resolved = canonicalPath(path);
  const ok = workspaceRoots().some((root) => {
    const rel = relative(root, resolved);
    return rel === "" || (!rel.startsWith("..") && !rel.startsWith("/") && !/^[A-Za-z]:/.test(rel));
  });
  return ok
    ? null
    : `${label} is outside the approved workspace root(s): ${workspaceRoots().join(", ")}. Set SAPHENE_WORKSPACE to the project root (or a path-delimited list) to approve it.`;
}

function guardAll(entries: Array<[string, string]>): string | null {
  for (const [path, label] of entries) {
    const err = pathGuard(path, label);
    if (err) return err;
  }
  return null;
}

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }] };
}

function expandMarkdownInputs(inputs: string[]): string[] {
  const files: string[] = [];
  for (const input of inputs) {
    if (!existsSync(input)) continue;
    if (statSync(input).isDirectory()) files.push(...scanMemoryFiles(input));
    else files.push(input);
  }
  return [...new Set(files)];
}

const server = new McpServer({ name: "saphene", version: "0.1.0" });

server.registerTool(
  "saphene_bridge",
  {
    title: "Saphene Bridge",
    description:
      "Use for a structured claims/SRS file against a repository. Claims follow '- claim text' plus metadata lines such as 'evidence: literalIdentifier, path/to/file.ts'. Returns verdicts with anchor quotes and file:line locations. useModel=true lets the configured model infer claims/hints from freeform prose; false is deterministic and expects structured blocks or inferable identifiers.",
    inputSchema: {
      claimsFile: z.string().describe("Path to the claims file"),
      repoDir: z.string().describe("Path to the repository to verify against"),
      useModel: z.boolean().optional().describe("Use the configured .env model for extraction (default false)"),
      codeOnly: z.boolean().optional().describe("Only code files count as evidence; prevents a claims file or README from testifying for itself"),
    },
  },
  async ({ claimsFile, repoDir, useModel, codeOnly }) => {
    const guard = guardAll([[claimsFile, "claimsFile"], [repoDir, "repoDir"]]);
    if (guard) return errorResult(guard);
    if (!existsSync(claimsFile) || !existsSync(repoDir)) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "claimsFile or repoDir not found" }) }] };
    }
    const content = readFileSync(claimsFile, "utf8");
    const result = await summarize(claimsFile, content, repoDir, useModel ?? false, false, codeOnly ?? false);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  "saphene_memory",
  {
    title: "Saphene Memory",
    description:
      "Use for a whole memory directory against a repository. Always persists <memoryDir>/.saphene/ledger.json (including a zero-claim ledger) and diffs against the previous run. Status regressions (matched -> unfound) are DRIFT; same-anchor line moves are relocated, not drift. useModel=true infers claims from wiki prose with the configured model; false uses structured blocks plus deterministic factual-prose extraction.",
    inputSchema: {
      memoryDir: z.string().describe("Path to the memory directory containing .md modules"),
      repoDir: z.string().describe("Path to the repository to verify against"),
      useModel: z.boolean().optional().describe("Use the configured .env model for extraction (default false)"),
      codeOnly: z.boolean().optional().describe("Only code files count as evidence"),
    },
  },
  async ({ memoryDir, repoDir, useModel, codeOnly }) => {
    const guard = guardAll([[memoryDir, "memoryDir"], [repoDir, "repoDir"]]);
    if (guard) return errorResult(guard);
    if (!existsSync(memoryDir) || !existsSync(repoDir)) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "memoryDir or repoDir not found" }) }] };
    }
    const scan = scanMemoryFilesWithDiagnostics(memoryDir);
    const files = scan.files;
    const ledgerPath = join(memoryDir, ".saphene", "ledger.json");
    const prev = loadLedger(ledgerPath);
    const entries: LedgerEntry[] = [];
    let extractedClaims = 0;
    let noHintClaims = 0;
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const { claims, verdicts } = await runAdapter("memory", file, content, {
        useModel: useModel ?? false,
        targets: [repoDir],
        includeSource: false,
        codeOnly: codeOnly ?? false,
      });
      extractedClaims += claims.length;
      noHintClaims += claims.filter((c) => c.expectedEvidence.length === 0).length;
      for (const v of verdicts) {
        const c = claims.find((x) => x.id === v.claimId);
        if (!c || c.expectedEvidence.length === 0) continue;
        entries.push({
          claimId: c.id,
          text: c.text,
          source: file,
          status: v.status,
          citation: v.citation,
          anchor: v.anchor,
          location: v.location,
          verifiedAt: new Date().toISOString(),
        });
      }
      if (useModel) await sleep(2000);
    }
    const ledger: Ledger = {
      version: 1,
      lastRunAt: new Date().toISOString(),
      entries: Object.fromEntries(entries.map((e) => [e.claimId, e])),
    };
    const diff = diffLedger(prev, entries);
    saveLedger(ledgerPath, ledger);
    const result = {
      modules: files.length,
      scanTruncated: scan.truncated,
      scanSkipped: scan.skipped,
      extractedClaims,
      noHintClaims,
      total: entries.length,
      ledgerPath,
      ledgerWritten: true,
      warning:
        entries.length === 0
          ? "0 ledgered claims: no claim carried evidence hints. Add structured evidence metadata, enable useModel, or rely on factual prose with literal identifiers."
          : undefined,
      matched: entries.filter((e) => e.status === "matched").length,
      partial: entries.filter((e) => e.status === "partial").length,
      unfound: entries.filter((e) => e.status === "unfound").length,
      mismatch: entries.filter((e) => e.status === "mismatch").length,
      drift: diff.drifted.map((d) => ({ from: d.from, to: d.entry.status, text: d.entry.text, citation: d.entry.citation })),
      relocated: diff.relocated.map((d) => ({ fromLocation: d.fromLocation, toLocation: d.entry.location, text: d.entry.text })),
      added: diff.added.length,
      resolved: diff.resolved.length,
      unchanged: diff.unchanged,
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  "saphene_verify",
  {
    title: "Saphene Verify",
    description:
      "Use for one file. memory mode searches other lines in the same file (the claim's own line never counts); paper mode searches repoDir and requires it. For a structured SRS/claims file use saphene_bridge; for a directory use saphene_memory; for documents against each other use saphene_consistency.",
    inputSchema: {
      file: z.string().describe("Path to the source file"),
      mode: z.enum(["memory", "paper"]).optional().describe("memory = verify against the file itself; paper = verify against repoDir (default memory)"),
      repoDir: z.string().optional().describe("Repository path (required for paper mode)"),
      useModel: z.boolean().optional().describe("Use the configured .env model for extraction (default false)"),
      codeOnly: z.boolean().optional().describe("Only code files count as evidence in paper mode"),
    },
  },
  async ({ file, mode, repoDir, useModel, codeOnly }) => {
    const guard = guardAll([[file, "file"], ...(repoDir ? [[repoDir, "repoDir"] as [string, string]] : [])]);
    if (guard) return errorResult(guard);
    if (!existsSync(file)) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "file not found" }) }] };
    }
    const resolvedMode = mode ?? "memory";
    if (resolvedMode === "paper" && (!repoDir || !existsSync(repoDir))) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "paper mode requires an existing repoDir" }) }] };
    }
    const content = readFileSync(file, "utf8");
    const result = await summarize(
      file,
      content,
      repoDir ?? "",
      useModel ?? false,
      resolvedMode === "memory",
      codeOnly ?? false,
    );
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  "saphene_consistency",
  {
    title: "Saphene Consistency",
    description:
      "Check claims extracted from multiple markdown documents against each other for potential contradictions (negations, incompatible assignments, access conflicts, duplicate IDs). Deterministic; reports candidates for human review, not canon verdicts.",
    inputSchema: {
      files: z.array(z.string()).describe("Markdown files or directories containing markdown files"),
      aliasesFile: z.string().optional().describe("Optional .saphene/aliases.json alias/distinct-entity table"),
    },
  },
  async ({ files, aliasesFile }) => {
    const guard = guardAll([
      ...files.map((f) => [f, "files"] as [string, string]),
      ...(aliasesFile ? [[aliasesFile, "aliasesFile"] as [string, string]] : []),
    ]);
    if (guard) return errorResult(guard);
    const expanded = expandMarkdownInputs(files);
    if (expanded.length === 0) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "no markdown files found" }) }] };
    }
    const aliases = mergeAliasTables([
      loadAliasTables(expanded[0], files),
      ...(aliasesFile ? [loadAliasTableFromFile(aliasesFile)] : []),
    ]);
    const documents = expanded.map((file) => {
      const content = readFileSync(file, "utf8");
      return { source: file, content, claims: extractClaims(file, content, aliases) };
    });
    const conflicts = checkConsistency(documents, aliases);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              documents: documents.length,
              claims: documents.reduce((sum, d) => sum + d.claims.length, 0),
              conflicts,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "saphene_profile",
  {
    title: "Saphene Mechanical Profile",
    description:
      "Run deterministic mechanical checks beside claim verification from a project-owned profile: word band, repeated-term budgets, quote balance, paragraph word ceiling, and cross-file repeated n-grams. Saphene ships no built-in style preset.",
    inputSchema: {
      files: z.array(z.string()).describe("Files or directories to scan"),
      configPath: z.string().optional().describe("Path to a JSON MechanicalProfile config"),
      profile: z
        .object({
          wordBand: z.tuple([z.number(), z.number()]).optional(),
          termBudgets: z.record(z.string(), z.number()).optional(),
          quoteBalance: z.boolean().optional(),
          maxParagraphWords: z.number().optional(),
          crossFileNgram: z.number().optional(),
        })
        .optional()
        .describe("Inline MechanicalProfile (alternative to configPath)"),
    },
  },
  async ({ files, configPath, profile: inlineProfile }) => {
    const guard = guardAll([
      ...files.map((f) => [f, "files"] as [string, string]),
      ...(configPath ? [[configPath, "configPath"] as [string, string]] : []),
    ]);
    if (guard) return errorResult(guard);
    const expanded = expandMarkdownInputs(files);
    if (expanded.length === 0) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "no files found" }) }] };
    }
    if (!configPath && !inlineProfile) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: "provide configPath or an inline profile; Saphene ships no built-in style preset" }),
          },
        ],
      };
    }
    const profile: MechanicalProfile = configPath ? loadMechanicalProfile(configPath) : inlineProfile!;
    const documents = expanded.map((file) => ({ file, content: readFileSync(file, "utf8") }));
    const violations = runMechanicalProfile(documents, profile);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ files: documents.length, profile: configPath ? "config" : "inline", violations }, null, 2),
        },
      ],
    };
  },
);

await server.connect(new StdioServerTransport());
