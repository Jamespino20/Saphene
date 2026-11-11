
export function RoadmapSection() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Core Verification Engine",
      status: "Shipped",
      statusClass: "badge-matched",
      items: ["Claim extraction from memory/docs/SRS", "Grep-driven evidence checks with file:line receipts", "Matched / partial / mismatch / unfound verdicts", "Claim ledger write-back (dated)"],
    },
    {
      phase: "Phase 2",
      title: "Agent Tooling & CI Gate",
      status: "In progress",
      statusClass: "badge-partial",
      items: ["MCP server tools (saphene_bridge, saphene_memory, saphene_verify)", "GitHub Actions drift gate", "Multi-persona audit panel (security, performance, flow, maintainability)"],
    },
    {
      phase: "Phase 3",
      title: "Cross-Repository Traceability",
      status: "Planned",
      statusClass: "badge-unfound",
      items: ["Multi-repo ledger roll-up", "Semantic synonym & alias expansion", "Requirements traceability matrix export"],
    },
    {
      phase: "Phase 4",
      title: "Review Dashboard",
      status: "Planned",
      statusClass: "badge-unfound",
      items: ["Signed-in review dashboard (local)", "Remediation prompts per verdict", "Receipt diff across commits"],
    },
    {
      phase: "Phase 5",
      title: "Research Sandbox",
      status: "Research",
      statusClass: "badge-partial",
      items: ["Bounded self-improvement loop (research-only, not demonstrated)", "Optional JEV advisor integration", "No claim of verified self-improvement gains"],
    },
  ];

  return (
    <section id="roadmap" className="relative bg-bg py-24 border-b border-line overflow-hidden">
      <div className="pointer-events-none absolute inset-0 forensic-grid-dense opacity-30" />
      <div className="relative mx-auto max-w-[1180px] px-6">
        <div className="mb-12 max-w-[720px]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            <p className="mono-label text-amber">Roadmap / Meta AI Hackathon entry</p>
          </div>
          <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            What exists. What is next.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted font-sans">
            Saphene is built in public for the Meta AI Hackathon. Nothing here claims more than what is verified in the repository and self-test suite.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phases.map((p, i) => (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07 }}
              className="facet-card p-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-sage font-bold tracking-wider">{p.phase}</span>
                <span className={`badge ${p.statusClass}`}>{p.status}</span>
              </div>
              <h3 className="mt-3 font-mono text-lg font-bold text-ink">{p.title}</h3>
              <ul className="mt-4 space-y-1.5">
                {p.items.map((it) => (
                  <li key={it} className="text-xs leading-relaxed text-muted flex gap-2">
                    <span className="text-amber">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Hackathon progress log */}
        <div className="mt-14 rounded-2xl border border-line-strong bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <p className="mono-label text-green">Progress log</p>
          </div>
          <div className="space-y-3 font-mono text-xs sm:text-sm">
            {[
              { ts: "2026-11-02", text: "Site: Meta hackathon header band + roadmap section added; terminal height clamped." },
              { ts: "2026-11-01", text: "Self-test: 7/7 deterministic checks passing against root codebase AST." },
              { ts: "2026-10-31", text: "Memory audit: 4 ledgered claims, 1 drift resolved via schemata.json update." },
              { ts: "2026-10-30", text: "v0.1.0 baseline: claim extraction + verify + ledger + drift detection shipped." },
            ].map((e) => (
              <div key={e.ts} className="flex gap-3 border-b border-line/50 pb-2 last:border-0">
                <span className="text-muted shrink-0">{e.ts}</span>
                <span className="text-ink/90">{e.text}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted font-sans">
            Publication of dates reflects public-source work, not earlier private scaffolding.
          </p>
        </div>
      </div>
    </section>
  );
}
