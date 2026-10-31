// Memory directory scaffolding.
// Minimal default scaffold; optional --personal template mirrors Knowledge categories.

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

type Template = "minimal" | "personal";

const MINIMAL_FILES: Record<string, string> = {
  "srs/.gitkeep": "",
  "evidence/.gitkeep": "",
  "verdicts/.gitkeep": "",
  "README.md": "# Memory\n\nProject memory directory for Memory-CI claims.\n\n- srs/ - requirement claims aligned to ISO/IEC/IEEE 29148\n- evidence/ - extracted evidence snippets\n- verdicts/ - write-back traceability notes\n\nAdd claim files as JSON or markdown; run:\n\n  npm run verify -- <file> [memory|paper|helm]\n",
};

const PERSONAL_FILES: Record<string, string> = {
  ...MINIMAL_FILES,
  "00-INDEX.md": "# Memory Index\n\nTopic directory for project memory. Lazy-load only the categories you need.\n\n## Category map\n\n| Category | Folder | Modules |\n| -------- | ------ | ------- |\n| Academia | academia/ | capstone, proposals, runway |\n| Work | work/ | business, job lane |\n| Creative | creative/ | novels, writing |\n| Faith | faith/ | spiritual context |\n| People | people/ | personal contacts |\n| Meta | meta/ | lessons, ops |\n\n## Related\n\n- [[calendar/2026.md]]\n",
  "academia/.gitkeep": "",
  "work/.gitkeep": "",
  "creative/.gitkeep": "",
  "faith/.gitkeep": "",
  "people/.gitkeep": "",
  "meta/.gitkeep": "",
  "calendar/.gitkeep": "",
  "calendar/recurring.md": "# Recurring Dates\n\nHard dates kept across years. Year-specific events live in 2026.md.\n\n## Birthdays\n\n| Date | Person |\n| ---- | ------ |\n| | |\n\nPortal -> 00-INDEX.md · calendar/2026.md\n",
  "calendar/2026.md": "# 2026 — Year Events\n\nYear-specific only. Recurring dates live in recurring.md.\n\n| Date | Event | Topic -> | Status |\n| ---- | ----- | ------- | ------ |\n| | | | |\n\nPortal -> 00-INDEX.md · recurring.md\n",
};

export function scaffold(targetDir: string, template: Template): void {
  if (existsSync(targetDir)) {
    const files = new Set(Object.keys(template === "personal" ? PERSONAL_FILES : MINIMAL_FILES));
    const existing = [...files].filter((f) => existsSync(join(targetDir, f)));
    if (existing.length > 0) {
      console.error("Memory directory already initialized at " + targetDir);
      console.error("Existing: " + existing.join(", "));
      process.exit(1);
    }
  }

  const files = template === "personal" ? PERSONAL_FILES : MINIMAL_FILES;
  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = join(targetDir, relPath);
    mkdirSync(join(targetDir, relPath.split("/").slice(0, -1).join("/")), { recursive: true });
    writeFileSync(fullPath, content, "utf8");
  }

  console.log("Memory directory initialized at " + targetDir);
  console.log("Template: " + template);
  console.log("Files: " + Object.keys(files).join(", "));
}

const args = process.argv.slice(2);
let memoryDir: string | undefined;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--memory-dir" && i + 1 < args.length) {
    memoryDir = args[++i];
  } else if (args[i].startsWith("--memory-dir=")) {
    memoryDir = args[i].split("=", 2)[1];
  }
}
const resolvedMemoryDir = memoryDir ?? join(process.cwd(), "memory");
const template = args.includes("--personal") ? "personal" : "minimal";

if (import.meta.main) {
  scaffold(resolvedMemoryDir, template);
}
