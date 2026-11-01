const STEPS = [
  { n: "01", title: "Extract claims", text: "Source files become structured claims each with expected evidence hints." },
  { n: "02", title: "Verify claims", text: "Grep-loop checks expected evidence against the repo. Verdict: matched / partial / unfound / mismatch." },
  { n: "03", title: "Ledger writes back", text: "Verdicts are written back to the repo as a dated claim ledger every change traceable." },
  { n: "04", title: "Detect drift", text: "Re-verify on every push. Claims that flip from matched to unfound are flagged as drift before they reach production." },
];

export default function Loop() {
  return (
    <section id="loop" className="py-20 border-t border-line/50">
      <div className="max-w-[1020px] mx-auto px-7">
        <div className="text-center mb-16">
          <h2 className="font-mono text-[clamp(28px,5vw,40px)] font-bold tracking-tight">How the loop works</h2>
          <p className="mt-4 text-muted">Extract - verify - ledger - re-verify. Every change is compared to the last.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="p-6 rounded-[12px] border border-line/50 bg-surface hover:border-accent/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-accent font-bold text-lg">{s.n}</span>
                <span className="text-sm font-mono text-muted">/ 04</span>
              </div>
              <h3 className="text-ink font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-muted text-xs">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
