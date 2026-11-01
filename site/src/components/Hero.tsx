import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const CHIPS = [
  { label: "matched", dot: "bg-accent", cls: "text-accent" },
  { label: "partial", dot: "bg-warn", cls: "text-warn" },
  { label: "unfound", dot: "bg-bad", cls: "text-bad" },
];

function LedgerMotif() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 320 320"
      className="pointer-events-none absolute -top-6 right-0 hidden h-[340px] w-[340px] lg:block"
      initial="hidden"
      animate="show"
    >
      <motion.g
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } }}
        stroke="currentColor"
        className="text-[#39485f]"
        strokeWidth="1"
        fill="none"
      >
        <motion.path variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } }} transition={{ duration: 1.1, ease: EASE }} d="M160 40 L260 96 L260 208 L160 264 L60 208 L60 96 Z" />
        <motion.path variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } }} transition={{ duration: 0.8, ease: EASE }} d="M160 40 L160 152 M60 96 L160 152 M260 96 L160 152 M60 208 L160 152 M260 208 L160 152 M160 264 L160 152" />
        <motion.path variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } }} transition={{ duration: 0.9, ease: EASE }} d="M160 152 L160 264" />
      </motion.g>
      {[160, 40, 260, 96, 60, 96, 60, 208, 260, 208, 160, 264].map((cx, i) => (
        <motion.circle key={i} cx={cx} cy={i % 2 === 0 ? 40 : i % 4 === 1 ? 96 : i % 4 === 2 ? 208 : 264} r="3" className="fill-[#4a5b74]" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + i * 0.08, duration: 0.4, ease: EASE }} />
      ))}
      <motion.circle cx={160} cy={152} r="5.5" className="fill-accent" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: [0.3, 1.25, 1] }} transition={{ delay: 1.5, duration: 0.9, ease: EASE }} />
      <motion.circle cx={160} cy={152} r="14" fill="none" strokeWidth="1" className="stroke-accent" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 0.5, 0.12], scale: [0.5, 1.35, 1.5] }} transition={{ delay: 1.7, duration: 1.6, ease: EASE, repeat: Infinity, repeatDelay: 2.6 }} />
    </motion.svg>
  );
}

export default function Hero() {
  return (
    <header className="relative pt-16 pb-10">
      <div className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_90%_70%_at_40%_20%,black_0%,transparent_70%)]" />
      <LedgerMotif />

      <div className="relative">
        <motion.div className="mb-6 flex flex-wrap gap-2.5" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
          {CHIPS.map((c) => (
            <motion.span key={c.label} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.4, ease: EASE }} className={`inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1 font-mono text-[12.5px] ${c.cls}`}>
              <span className={`h-[7px] w-[7px] rounded-full ${c.dot}`} />
              {c.label}
            </motion.span>
          ))}
          {["every verdict carries a file:line receipt", "free & open source · runs offline"].map((t) => (
            <motion.span key={t} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.4, ease: EASE }} className="inline-flex items-center rounded-full border border-line px-3.5 py-1 font-mono text-[12.5px] text-muted">
              {t}
            </motion.span>
          ))}
        </motion.div>

        <motion.h1 className="font-mono text-[clamp(32px,5.6vw,54px)] leading-[1.08] tracking-[-0.03em] font-bold" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}>
          <motion.span className="block" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: EASE }}>
            CI for what your
          </motion.span>
          <motion.span className="block" variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: EASE }}>
            agent <em className="text-accent not-italic">remembers</em>.
          </motion.span>
        </motion.h1>

        <motion.p className="mt-5 mb-8 max-w-[680px] text-[17.5px] text-muted" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}>
          Coding agents forget. Docs drift. Specs testify for themselves. Saphene turns memory and specs into a claim ledger, audits code with a panel of reviewer personas, and blocks the drift: in CI, in PRs, and over MCP. No coding agent? It still guards your README, ADRs, and specs against the code.
        </motion.p>

        <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}>
          <a href="#demo" className="rounded-[9px] bg-accent px-5 py-[11px] text-[14.5px] font-semibold text-[#052e16] transition-transform hover:-translate-y-px hover:bg-accent-dim">See it work</a>
          <a href="https://github.com/Jamespino20/Saphene" className="rounded-[9px] border border-line-strong px-5 py-[11px] text-[14.5px] font-semibold text-ink transition-transform hover:-translate-y-px hover:bg-accent-dim">GitHub</a>
        </motion.div>
      </div>
    </header>
  );
}
