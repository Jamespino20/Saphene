import { cp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

// Fail fast before touching existing artifacts: the site build must have run.
if (!existsSync("site/dist")) {
  console.error(
    "[saphene] site/dist not found — run the site build first: npm run build --prefix site",
  );
  process.exit(1);
}

await rm("dist", { recursive: true, force: true });
await cp("site/dist", "dist", { recursive: true });
console.log("[saphene] site/dist -> dist copied.");
