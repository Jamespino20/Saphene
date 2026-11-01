const WHO = [
  {
    title: "Solo dev with an AI coding agent",
    text: "You use Cursor, Cline, or OpenCode to build. Saphene keeps your README, docs, and specs honest — every claim verified against the repo on every push.",
  },
  {
    title: "Student team with a capstone repo",
    text: "Your project has a proposal, a README, and a dozen half-finished docs. Saphene turns them into verified claims so the defense panel sees evidence, not intentions.",
  },
  {
    title: "Team maintaining a legacy codebase",
    text: "The README lies. The docs drifted. Saphene re-verifies every claim on every push and surfaces the drift — matched, partial, or unfounded — before it ships.",
  },
];

export default function Who() {
  return (
    <section id="who" className="py-20 border-t border-line/50">
      <div className="max-w-[1020px] mx-auto px-7">
        <div className="text-center mb-16">
          <h2 className="font-mono text-[clamp(28px,5vw,40px)] font-bold tracking-tight">Who is this for?</h2>
          <p className="text-muted mt-4">Anyone whose memory outpaces their docs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHO.map((w) => (
            <div key={w.title} className="p-6 rounded-[12px] border border-line/50 bg-surface hover:border-accent/50 transition-all duration-300 hover:bg-surface/50">
              <h3 className="text-ink font-semibold text-lg mb-2">{w.title}</h3>
              <p className="text-muted text-sm">{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
