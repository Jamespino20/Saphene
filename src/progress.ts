// Single-line live progress bar (no deps). TTY gets an overwriting bar;
// piped/CI output gets milestone lines instead of \r spam.

const BAR_WIDTH = 22;

export function drawProgress(done: number, total: number, label: string): void {
  if (!process.stdout.isTTY) {
    if (done === 1 || done === total || done % 10 === 0) {
      process.stdout.write(`  [${done}/${total}] ${label}\n`);
    }
    return;
  }
  const filled = Math.round((done / Math.max(total, 1)) * BAR_WIDTH);
  const bar = "█".repeat(filled) + "░".repeat(Math.max(0, BAR_WIDTH - filled));
  const line = `  [${bar}] ${done}/${total} ${label}`.slice(0, 110).padEnd(110);
  process.stdout.write("\r" + line);
}

export function endProgress(): void {
  if (process.stdout.isTTY) process.stdout.write("\n");
}
