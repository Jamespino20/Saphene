#!/usr/bin/env tsx

// Source-tree entry point. In a clone, this lets you run:
//   npx tsx saphene bridge claims.md --repo ./app --code-only --no-model
// Packaged installs should prefer the compiled `saphene` bin.

const entries: Record<string, string> = {
  review: "./src/review.ts",
  audit: "./src/audit.ts",
  mcp: "./src/mcp.ts",
  drift: "./src/drift-harness.ts",
  test: "./src/selftest.ts",
};

const command = process.argv[2];
const entry = command ? entries[command] : undefined;

if (entry) {
  process.argv = [process.argv[0], entry, ...process.argv.slice(3)];
  await import(entry);
} else {
  await import("./src/cli.ts");
}
