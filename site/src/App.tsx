import Nav from "./components/Nav";
import Hero from "./components/Hero";
import {
  CapabilitiesSection,
  IntegrationSection,
  ProblemSection,
  ProductSection,
  VerdictsSection,
  WatchWorkSection,
  WorkflowSection,
} from "./components/Sections";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-emerald/30 selection:text-sage">
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <ProductSection />
        <WatchWorkSection />
        <WorkflowSection />
        <VerdictsSection />
        <CapabilitiesSection />
        <IntegrationSection />

        {/* Closing Evidentiary CTA Section */}
        <section className="relative overflow-hidden bg-surface py-28 border-t border-line">
          <div className="pointer-events-none absolute inset-0 forensic-grid opacity-40" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] rounded-full bg-emerald/10 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full bg-amber/10 blur-[130px]" />
          <div className="noise pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative mx-auto max-w-[840px] px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3.5 py-1 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <p className="mono-label text-sage text-[11px]">Make the next claim defensible</p>
            </div>
            
            <h2 className="font-mono text-4xl sm:text-6xl font-bold tracking-tight text-ink leading-[1.12]">
              Build with memory.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green via-sage to-amber">
                Ship with evidence.
              </span>
            </h2>
            
            <p className="mx-auto mt-6 max-w-[580px] text-lg leading-relaxed text-muted font-sans">
              Saphene is open-source, deterministic, and built to guard repositories against agent drift.
              Test it today against your existing project.
            </p>

            <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
              <a
                href="https://github.com/Jamespino20/Saphene"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green via-sage to-emerald px-7 py-4 font-mono text-sm font-bold text-[#061a11] shadow-lg shadow-emerald/20 transition-all hover:brightness-110 hover:shadow-emerald/30"
              >
                <span>View Saphene on GitHub</span>
                <span className="text-base">↗</span>
              </a>
              <a
                href="./docs.html"
                className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-7 py-4 font-mono text-sm font-semibold text-ink transition-colors hover:border-amber hover:text-amber hover:bg-surface-3"
              >
                <span>Read Documentation</span>
                <span className="text-muted text-xs">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-bg py-10">
        <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-6 px-6 text-xs text-muted sm:flex-row sm:items-center font-mono">
          <div className="flex items-center gap-2.5">
            <img src="./saphene.svg" alt="Saphene Logo" className="h-5 w-4 object-contain" />
            <span className="text-sage font-semibold tracking-wider">SAPHENE</span>
            <span className="text-line-strong">/</span>
            <span>CLARITY THROUGH EVIDENCE</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="./docs.html" className="hover:text-sage transition-colors">Documentation</a>
            <a href="https://github.com/Jamespino20/Saphene" target="_blank" rel="noopener noreferrer" className="hover:text-amber transition-colors">GitHub ↗</a>
            <span className="text-dim">v0.1.0 (Meta AI Hackathon)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
