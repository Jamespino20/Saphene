import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TerminalDemo from "./components/TerminalDemo";
import {
  CapabilitiesSection,
  IntegrationSection,
  ProblemSection,
  ProductSection,
  VerdictsSection,
  WorkflowSection,
} from "./components/Sections";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Nav />
      <Hero />
      <ProblemSection />
      <ProductSection />
      <TerminalDemo />
      <WorkflowSection />
      <VerdictsSection />
      <CapabilitiesSection />
      <IntegrationSection />
      <section className="relative overflow-hidden bg-surface py-24">
        <div className="noise pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-[820px] px-6 text-center">
          <p className="mono-label text-green">Make the next claim defensible</p>
          <h2 className="mt-5 font-mono text-4xl font-bold tracking-[-.05em] sm:text-6xl">Build with memory.<br /><span className="text-green">Ship with evidence.</span></h2>
          <p className="mx-auto mt-6 max-w-[560px] text-lg leading-8 text-muted">Saphene is open source and ready to run against the project you are already building.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="https://github.com/Jamespino20/Saphene" className="rounded-full bg-deep px-6 py-3 font-semibold text-white transition-colors hover:bg-teal">View Saphene on GitHub ↗</a>
            <a href="/docs.html" className="rounded-full border border-line-strong px-6 py-3 font-semibold text-deep transition-colors hover:bg-bg">Read the docs</a>
          </div>
        </div>
      </section>
      <footer className="border-t border-line bg-bg py-10">
        <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-5 px-6 text-sm text-muted sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-mono text-xs text-green"><img src="/saphene.svg" alt="" className="h-6 w-5 object-contain" /> SAPHENE / CLARITY THROUGH EVIDENCE</div>
          <div className="flex gap-5"><a href="/docs.html" className="hover:text-deep">Docs</a><a href="https://github.com/Jamespino20/Saphene" className="hover:text-deep">GitHub ↗</a></div>
        </div>
      </footer>
    </div>
  );
}
