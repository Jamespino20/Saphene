// MCP server for Saphene. Exposes the claim engine as agent-callable tools
// over stdio so coding agents (OpenCode, Cursor, Cline) can verify memory
// against repos on demand instead of guessing.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runAdapter } from "./verify.js";
import { loadLedger, saveLedger, diffLedger, scanMemoryFiles, sleep, type Ledger, type LedgerEntry } from "./ledger.js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

interface ToolVerdict {
  claimId: string;
  text: string;
  status: string;
  citation: string;
}

async function summarize(file: string, content: string, repoDir: string, useModel: boolean, includeSource: boolean) {
  const { claims, verdicts, traceability } = await runAdapter("paper", file, content, {
    useModel,
    targets: [repoDir],
    includeSource,
  });
  const verdictsOut: ToolVerdict[] = verdicts.map((v) => {
    const c = claims.find((x) => x.id === v.claimId);
    return { claimId: v.claimId, text: c?.text ?? "", status: v.status, citation: v.citation };
  });
  return {
    total: claims.length,
    matched: verdictsOut.filter((v) => v.status === "matched").length,
    partial: verdictsOut.filter((v) => v.status === "partial").length,
    mismatch: verdictsOut.filter((v) => v.status === "mismatch").length,
    unfound: verdictsOut.filter((v) => v.status === "unfound").length,
    verdicts: verdictsOut,
    traceability,
  };
}

const server = new McpServer({ name: "saphene", version: "0.1.0" });

server.registerTool(
  "saphene_bridge",
  {
    title: "Saphene Bridge",
    description:
      "Verify SRS claims in a markdown/JSON file against a repository. Claims follow the structured block format (- claim text / evidence: hints). Returns per-claim verdicts with file:line citations.",
    inputSchema: {
      claimsFile: z.string().describe("Path to the claims file"),
      repoDir: z.string().describe("Path to the repository to verify against"),
      useModel: z.boolean().optional().describe("Use the configured .env model for extraction (default false)"),
    },
  },
  async ({ claimsFile, repoDir, useModel }) => {
    if (!existsSync(claimsFile) || !existsSync(repoDir)) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "claimsFile or repoDir not found" }) }] };
    }
    const content = readFileSync(claimsFile, "utf8");
    const result = await summarize(claimsFile, content, repoDir, useModel ?? false, false);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.registerTool(
  "saphene_memory",
  {
    title: "Saphene Memory",
    description:
      "Audit every markdown module in a memory directory against a repository, persist a claim ledger (.saphene/ledger.json), and diff against the previous run. Status regressions (matched -> unfound) are reported as DRIFT.",
    inputSchema: {
      memoryDir: z.string().describe("Path to the memory directory containing .md modules"),
      repoDir: z.string().describe("Path to the repository to verify against"),
      useModel: z.boolean().optional().describe("Use the configured .env model for extraction (default false)"),
    },
  },
  async ({ memoryDir, repoDir, useModel }) => {
    if (!existsSync(memoryDir) || !existsSync(repoDir)) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "memoryDir or repoDir not found" }) }] };
    }
    const files = scanMemoryFiles(memoryDir);
    const ledgerPath = join(memoryDir, ".saphene", "ledger.json");
    const prev = loadLedger(ledgerPath);
    const entries: LedgerEntry[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const { claims, verdicts } = await runAdapter("memory", file, content, {
        useModel: useModel ?? false,
        targets: [repoDir],
        includeSource: false,
      });
      for (const v of verdicts) {
        const c = claims.find((x) => x.id === v.claimId);
        if (!c || c.expectedEvidence.length === 0) continue;
        entries.push({
          claimId: c.id,
          text: c.text,
          source: file,
          status: v.status,
          citation: v.citation,
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
      total: entries.length,
      matched: entries.filter((e) => e.status === "matched").length,
      partial: entries.filter((e) => e.status === "partial").length,
      unfound: entries.filter((e) => e.status === "unfound").length,
      drift: diff.drifted.map((d) => ({ from: d.from, to: d.entry.status, text: d.entry.text, citation: d.entry.citation })),
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
      "Verify a single file's claims against itself (memory mode) or against a repository (paper mode) and return verdicts with citations.",
    inputSchema: {
      file: z.string().describe("Path to the source file"),
      mode: z.enum(["memory", "paper"]).optional().describe("memory = verify against the file itself; paper = verify against repoDir (default memory)"),
      repoDir: z.string().optional().describe("Repository path (required for paper mode)"),
      useModel: z.boolean().optional().describe("Use the configured .env model for extraction (default false)"),
    },
  },
  async ({ file, mode, repoDir, useModel }) => {
    if (!existsSync(file)) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "file not found" }) }] };
    }
    const resolvedMode = mode ?? "memory";
    if (resolvedMode === "paper" && (!repoDir || !existsSync(repoDir))) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "paper mode requires an existing repoDir" }) }] };
    }
    const content = readFileSync(file, "utf8");
    const result = await summarize(file, content, repoDir ?? "", useModel ?? false, resolvedMode === "memory");
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

await server.connect(new StdioServerTransport());
