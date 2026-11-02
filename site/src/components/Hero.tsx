import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.75], [1, 0.95]);
  const gemY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const gemRotate = useTransform(scrollYProgress, [0, 1], [0, 35]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden forensic-grid pt-28 pb-20"
    >
      {/* Background ambient lighting — strictly Green & Amber */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-emerald/15 blur-[160px]" />
        <div className="absolute bottom-10 right-1/4 w-[480px] h-[360px] rounded-full bg-amber/15 blur-[150px]" />
        <div className="absolute top-1/3 left-1/6 w-[340px] h-[280px] rounded-full bg-sage/12 blur-[140px]" />
        <div className="noise pointer-events-none absolute inset-0 opacity-40" />
      </div>

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-[1140px] w-full mx-auto px-6"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-12">
          {/* Left Column: Headline and Positioning */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-2.5 mb-6"
            >
              <span className="badge badge-matched">v0.1.0</span>
              <span className="mono-label px-3 py-1 rounded-full bg-surface-2 border border-line text-sage text-[11px]">
                Evidence-Ledger Engine
              </span>
              <span className="mono-label px-3 py-1 rounded-full bg-amber/10 border border-amber/35 text-amber text-[11px]">
                Meta AI Hackathon
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-mono text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.08]"
            >
              CI for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green via-sage to-amber">
                AI Agent Memory.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-[560px] text-lg leading-relaxed text-muted font-sans"
            >
              Coding agents hallucinate past decisions. Documentation drifts silently.
              Saphene extracts claims from agent memory and specifications, audits code
              against hard evidence, and attaches verifiable file receipts in CI, PRs, and over MCP.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green via-sage to-emerald px-6 py-3.5 font-mono text-sm font-bold text-[#061a11] shadow-lg shadow-emerald/20 transition-all hover:brightness-110 hover:shadow-emerald/35"
              >
                <span>Inspect The Ledger</span>
                <span className="text-base">→</span>
              </a>
              <a
                href="https://github.com/Jamespino20/Saphene"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface/80 backdrop-blur-sm px-6 py-3.5 font-mono text-sm font-semibold text-ink transition-colors hover:border-amber hover:text-amber hover:bg-surface-2"
              >
                <span>GitHub Repository</span>
                <span className="text-muted">↗</span>
              </a>
            </motion.div>

            {/* Quick Metrics Bar in Green and Amber */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 grid grid-cols-3 gap-6 pt-6 border-t border-line/80 w-full max-w-[520px]"
            >
              <div>
                <p className="font-mono text-xs text-muted">Ledger Verdicts</p>
                <p className="mt-1 font-mono text-lg font-bold text-sage">4 Personas</p>
              </div>
              <div>
                <p className="font-mono text-xs text-muted">Protocol</p>
                <p className="mt-1 font-mono text-lg font-bold text-green">CLI + MCP</p>
              </div>
              <div>
                <p className="font-mono text-xs text-muted">Drift Guard</p>
                <p className="mt-1 font-mono text-lg font-bold text-amber">Zero-Trust</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Faceted Gem / Forensic Evidence Prism */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Evidentiary Prism Backdrop */}
            <motion.div
              style={{ y: gemY, rotate: gemRotate }}
              className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center"
            >
              {/* Outer Facet Radar Rings (Green & Amber) */}
              <div className="absolute inset-0 rounded-full border border-line-strong/60 border-dashed animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-6 rounded-3xl border border-emerald/30 rotate-12 transition-transform duration-700 hover:rotate-45" />
              <div className="absolute inset-12 rounded-3xl border border-amber/30 -rotate-6" />

              {/* The Gem Logo SVG with Green & Amber Glow */}
              <div className="relative z-10 p-8 rounded-3xl bg-surface/90 backdrop-blur-md border border-line-strong shadow-2xl gem-glow-green">
                <img
                  src="./saphene.svg"
                  alt="Saphene Faceted Crystal Gem"
                  className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-[0_12px_28px_rgba(75,131,104,0.35)]"
                />
              </div>

              {/* Floating Forensic Callout Badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="absolute -top-4 -left-4 z-20 rounded-lg border border-sage/50 bg-surface-2/95 px-3.5 py-2 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
                  <span className="font-mono text-xs font-semibold text-sage">CLAIM #014 VERIFIED</span>
                </div>
                <p className="font-mono text-[11px] text-muted mt-0.5">schema.prisma:18 [MATCHED]</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="absolute -bottom-4 -right-4 z-20 rounded-lg border border-amber/50 bg-surface-2/95 px-3.5 py-2 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber" />
                  <span className="font-mono text-xs font-semibold text-amber">DRIFT DETECTED</span>
                </div>
                <p className="font-mono text-[11px] text-muted mt-0.5">agent-memory vs auth/2fa.ts</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
