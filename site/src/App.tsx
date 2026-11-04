import Nav from "./components/Nav";
import Hero from "./components/Hero";
import {
  CapabilitiesSection,
  DemoVideoSection,
  IntegrationSection,
  ProblemSection,
  ProductSection,
  ReceiptTicker,
  RoadmapSection,
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
        <ReceiptTicker />
        <DemoVideoSection />
        <ProblemSection />
        <ProductSection />
        <WatchWorkSection />
        <WorkflowSection />
        <RoadmapSection />
        <VerdictsSection />
        <CapabilitiesSection />
        <IntegrationSection />

        {/* Closing Evidentiary CTA Section */}
        <section className="relative overflow-hidden bg-surface py-28 border-t border-line">
          <div className="pointer-events-none absolute inset-0 forensic-grid opacity-40" />
          <div className="animate-floaty pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] rounded-full bg-emerald/10 blur-[140px]" />
          <div className="animate-floaty-slow pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full bg-amber/10 blur-[130px]" />
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 1.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
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
            <a href="https://github.com/Jamespino20/Saphene" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-amber transition-colors"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 1.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>GitHub ↗</a>
            <span className="text-dim">v0.1.0 (Meta AI Hackathon)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
