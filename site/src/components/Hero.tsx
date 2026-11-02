import { motion } from "motion/react";

function Gemstone() {
  return (
    <div className="relative mx-auto h-[430px] w-[390px] max-w-full [animation:float_7s_ease-in-out_infinite]">
      <div className="gemstone absolute inset-[42px] rotate-[-9deg] opacity-80" />
      <div className="absolute inset-[76px] rotate-[13deg] border border-mint/50 [clip-path:polygon(50%_0,100%_26%,82%_100%,18%_100%,0_26%)]" />
      <div className="absolute left-[31%] top-[29%] h-28 w-28 rotate-45 border border-sage/60 bg-deep/80 shadow-2xl" />
      <div className="absolute left-[39%] top-[37%] h-16 w-16 rotate-45 border border-amber/80 bg-green/70" />
      <div className="absolute left-[46%] top-[44%] h-5 w-5 rotate-45 bg-mint shadow-[0_0_30px_rgba(214,227,184,.8)]" />
      <svg className="absolute inset-0 h-full w-full text-mint/50" viewBox="0 0 390 430" fill="none" aria-hidden="true">
        <path d="M195 18 347 106v176l-152 88L43 282V106L195 18Z" stroke="currentColor" />
        <path d="m43 106 152 88 152-88M195 194v176M101 139l94 55 94-55" stroke="currentColor" strokeDasharray="3 9" />
      </svg>
      <span className="absolute bottom-8 left-4 rounded-full border border-mint/50 bg-deep px-3 py-1 font-mono text-[10px] uppercase tracking-[.18em] text-mint">evidence graph / 014</span>
    </div>
  );
}

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-deep text-white">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="noise pointer-events-none absolute inset-0 mix-blend-soft-light" />
      <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-24">
        <div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mono-label mb-7 text-mint">Evidence-driven memory verification</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="max-w-[680px] font-mono text-[clamp(42px,6.6vw,78px)] font-bold leading-[.98] tracking-[-.06em]">
            Make your AI&apos;s memory <em className="not-italic text-sage">answer to evidence.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }} className="mt-7 max-w-[610px] text-lg leading-8 text-mint/90">
            Saphene checks retained claims against your project documents and code, exposing what is supported, incomplete, contradicted, or still unverified.
          </motion.p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#product" className="rounded-full bg-amber px-5 py-3 font-semibold text-ink transition-transform hover:-translate-y-0.5">Explore the workflow ↓</a>
            <a href="https://github.com/Jamespino20/Saphene" className="rounded-full border border-mint/50 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/10">View on GitHub ↗</a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-mint/70">
            <span>CLI + MCP</span><span>offline-first</span><span>file:line receipts</span><span>open source</span>
          </div>
        </div>
        <Gemstone />
      </div>
      <div className="relative border-t border-mint/20 bg-[#214d43]/70">
        <div className="mx-auto flex max-w-[1180px] flex-wrap gap-5 px-6 py-4 font-mono text-xs text-mint/80">
          <span>01 / claims extracted</span><span>→</span><span>02 / evidence located</span><span>→</span><span>03 / verdict recorded</span><span>→</span><span>04 / drift re-checked</span>
        </div>
      </div>
    </header>
  );
}
