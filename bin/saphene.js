#!/usr/bin/env node

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist-cli");
const cliPath = join(dist, "cli.js");

if (!existsSync(cliPath)) {
  console.error("[saphene] CLI build not found. Run: npm run build:cli");
  process.exit(2);
}

const entries = {
  review: "review.js",
  audit: "audit.js",
  mcp: "mcp.js",
  drift: "drift-harness.js",
  test: "selftest.js",
};

const command = process.argv[2];
const entry = command ? entries[command] : undefined;

if (entry) {
  const entryPath = join(dist, entry);
  process.argv = [process.argv[0], entryPath, ...process.argv.slice(3)];
  await import(pathToFileURL(entryPath).href);
} else {
  await import(pathToFileURL(cliPath).href);
}
