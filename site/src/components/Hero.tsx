import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.75], [1, 0.96]);
  const gemY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const gemRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden forensic-grid pt-24 sm:pt-28 pb-16 sm:pb-20"
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
        className="relative z-10 max-w-[1160px] w-full mx-auto px-5 sm:px-6"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-12">
          {/* Left Column: Headline and Positioning */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-2 mb-5"
            >
              <span className="badge badge-matched">v0.1.0</span>
              <span className="mono-label px-3 py-1 rounded-full bg-surface-2 border border-line text-sage text-[10.5px]">
                Verification Engine
              </span>
              <span className="mono-label px-3 py-1 rounded-full bg-amber/10 border border-amber/35 text-amber text-[10.5px]">
                Meta AI Hackathon
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-mono text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.08]"
            >
              CI for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green via-sage to-amber">
                AI Agent Memory.
              </span>
            </motion.h1>

            {/* Clear, refined proposition copy */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-5 max-w-[580px] text-base sm:text-lg leading-relaxed text-ink/90 font-sans font-medium"
            >
              Saphene continuously verifies AI agent memories against the actual documentation and code behind your project.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-2 max-w-[580px] text-sm sm:text-base leading-relaxed text-muted font-sans"
            >
              Coding agents hallucinate past decisions. Documentation drifts silently. Saphene turns retained knowledge into testable claims, audits code with file:line receipts, and blocks regressions in CI and over MCP.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-7 flex flex-wrap items-center gap-3 w-full sm:w-auto"
            >
              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-green via-sage to-emerald px-6 py-3.5 font-mono text-sm font-bold text-[#061a11] shadow-lg shadow-emerald/20 transition-all hover:brightness-110 hover:shadow-emerald/35"
              >
                <span>Inspect Drift Demo</span>
                <span className="text-base">→</span>
              </a>
              <a
                href="https://github.com/Jamespino20/Saphene"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl border border-line-strong bg-surface/80 backdrop-blur-sm px-6 py-3.5 font-mono text-sm font-semibold text-ink transition-colors hover:border-amber hover:text-amber hover:bg-surface-2"
              >
                <span>GitHub Repository</span>
                <span className="text-muted">↗</span>
              </a>
            </motion.div>

            {/* 3 Core Value Pillars */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-line/80 w-full"
            >
              <div className="rounded-xl border border-line bg-surface/60 p-3.5">
                <span className="mono-label text-[10px] text-sage font-bold block mb-1">01 / LOCAL-FIRST</span>
                <p className="text-xs text-ink font-semibold">Deterministic & Offline</p>
                <p className="text-[11px] text-muted mt-1">Runs grep & AST checks without requiring a proprietary API key.</p>
              </div>
              <div className="rounded-xl border border-line bg-surface/60 p-3.5">
                <span className="mono-label text-[10px] text-green font-bold block mb-1">02 / TRACEABLE</span>
                <p className="text-xs text-ink font-semibold">File & Line Receipts</p>
                <p className="text-[11px] text-muted mt-1">Every verdict attaches exact citations. No ungrounded claims.</p>
              </div>
              <div className="rounded-xl border border-line bg-surface/60 p-3.5">
                <span className="mono-label text-[10px] text-amber font-bold block mb-1">03 / CONTINUOUS</span>
                <p className="text-xs text-ink font-semibold">Ledger & Drift PR Gate</p>
                <p className="text-[11px] text-muted mt-1">Tracks regressions across commits, GitHub Actions, and MCP.</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Faceted Gem / Forensic Evidence Prism */}
          <div className="relative flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
            {/* Evidentiary Prism Backdrop */}
            <motion.div
              style={{ y: gemY, rotate: gemRotate }}
              className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center"
            >
              {/* Outer Facet Radar Rings (Green & Amber) */}
              <div className="absolute inset-0 rounded-full border border-line-strong/60 border-dashed animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-5 rounded-3xl border border-emerald/30 rotate-12 transition-transform duration-700 hover:rotate-45" />
              <div className="absolute inset-10 rounded-3xl border border-amber/30 -rotate-6" />

              {/* The Gem Logo SVG with Green & Amber Glow */}
              <div className="relative z-10 p-7 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-md border border-line-strong shadow-2xl gem-glow-green">
                <img
                  src="./saphene.svg"
                  alt="Saphene Faceted Crystal Gem"
                  className="w-40 h-40 sm:w-56 sm:h-56 object-contain drop-shadow-[0_12px_28px_rgba(75,131,104,0.35)]"
                />
              </div>

              {/* Floating Forensic Callout Badges */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="absolute -top-3 -left-2 sm:-top-4 sm:-left-4 z-20 rounded-lg border border-sage/50 bg-surface-2/95 px-3 py-1.5 sm:px-3.5 sm:py-2 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
                  <span className="font-mono text-[11px] sm:text-xs font-semibold text-sage">CLAIM #014 VERIFIED</span>
                </div>
                <p className="font-mono text-[10px] sm:text-[11px] text-muted mt-0.5">schema.prisma:18 [MATCHED]</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-4 z-20 rounded-lg border border-amber/50 bg-surface-2/95 px-3 py-1.5 sm:px-3.5 sm:py-2 backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber" />
                  <span className="font-mono text-[11px] sm:text-xs font-semibold text-amber">DRIFT DETECTED</span>
                </div>
                <p className="font-mono text-[10px] sm:text-[11px] text-muted mt-0.5">agent-memory vs auth/2fa.ts</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
