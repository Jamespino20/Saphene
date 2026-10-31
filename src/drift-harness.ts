// Drift-injection harness.
// Takes a "good" memory file, injects a deliberate drift (changes a fact),
// runs verify, and reports whether the drift was detected.
// Usage: tsx src/drift-harness.ts <good-file> <drifted-file> <drift-text>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { runAdapter } from "./verify.js";

const [, , goodFile, driftedFile, driftText] = process.argv;

if (!goodFile || !driftedFile || !driftText) {
  console.error(
    "Usage: tsx src/drift-harness.ts <good-file> <drifted-file> <drift-text>",
  );
  process.exit(1);
}

if (!existsSync(goodFile)) {
  console.error(`Good file not found: ${goodFile}`);
  process.exit(1);
}

const goodContent = readFileSync(goodFile, "utf8");

// Inject drift: append the drift text as a new claim-like line.
const driftedContent = goodContent.endsWith("\n")
  ? goodContent + driftText + "\n"
  : goodContent + "\n" + driftText + "\n";
writeFileSync(driftedFile, driftedContent);

const { claims, verdicts } = await runAdapter("memory", driftedFile, driftedContent, { useModel: false });

console.log(`Drift harness: ${driftedFile}`);
console.log(`  claims extracted: ${claims.length}`);
console.log(
  `  verdicts: ${verdicts.filter((v) => v.status === "matched").length} matched, ` +
    `${verdicts.filter((v) => v.status === "mismatch").length} mismatch, ` +
    `${verdicts.filter((v) => v.status === "unfound").length} unfound`,
);

const driftVerdict = verdicts.find((v) =>
  v.citation.includes(driftText.slice(0, 20)),
);
if (driftVerdict) {
  console.log(`  drift verdict: ${driftVerdict.status} — ${driftVerdict.reason}`);
  process.exit(driftVerdict.status === "unfound" || driftVerdict.status === "mismatch" ? 0 : 1);
} else {
  console.log("  drift verdict: not separately detected (claim merged)");
  process.exit(1);
}
