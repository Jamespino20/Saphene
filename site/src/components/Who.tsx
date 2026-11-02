import { memo } from "react";

const WHO = [
  {
    id: "who-solo-dev",
    title: "Solo dev with an AI coding agent",
    text: "You use Cursor, Cline, or OpenCode to build. Saphene keeps your README, docs, and specs honest - every claim verified against the repo on every push.",
  },
  {
    id: "who-student-team",
    title: "Student team with a capstone repo",
    text: "Your project has a proposal, a README, and a dozen half-finished docs. Saphene turns them into verified claims so the defense panel sees evidence, not intentions.",
  },
  {
    id: "who-legacy-maintainer",
    title: "Team maintaining a legacy codebase",
    text: "The README lies. The docs drifted. Saphene re-verifies every claim on every push and surfaces the drift - matched, partial, or unfound - before it ships.",
  },
  {
    id: "who-enterprise",
    title: "Enterprise engineering organization",
    text: "Security and compliance require an audit trail for every AI-assisted change. Saphene's reviewer personas and ledger give you defensible evidence for SOC2 and internal audits.",
  },
];

export const Who = memo(function Who() {
  return (
    <section id="who" className="border-t border-line/50 py-20">
      <div className="mx-auto max-w-[1020px] px-7">
        <div className="mb-16 text-center">
          <h2 className="font-mono text-[clamp(28px,5vw,40px)] font-bold tracking-tight">Who is this for?</h2>
          <p className="mt-4 text-muted">Anyone whose memory outpaces their docs.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {WHO.map((w) => (
            <div key={w.id} className="rounded-[12px] border border-line/50 bg-surface p-6 transition-all duration-300 hover:border-accent/50 hover:bg-surface/50">
              <h3 className="mb-2 text-lg font-semibold text-ink">{w.title}</h3>
              <p className="text-sm text-muted">{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Who;
