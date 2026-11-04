import { motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Evidence Ledger", href: "#product" },
  { label: "Live Terminal", href: "#demo" },
  { label: "Continuous Loop", href: "#workflow" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Docs", href: "./docs.html", external: false },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  const onScroll = () => setScrolled(window.scrollY > 12);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-bg/85 backdrop-blur-md border-b border-line shadow-lg shadow-black/40" : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Meta AI Hackathon header band */}
      <div className="w-full border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            <span className="mono-label text-[9px] sm:text-[10px] text-amber tracking-wider">
              Meta AI Hackathon 2026 · Saphene entry · In development
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 mono-label text-[10px] text-muted">
            <span>Track: Agentic Infrastructure</span>
            <span className="text-line-strong">/</span>
            <span>Mode: Deterministic · No API key</span>
          </div>
        </div>
      </div>
      <div className={`max-w-[1180px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between ${scrolled ? "py-3.5" : "py-4"}`}>
        {/* Brand & Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-surface border border-line-strong p-1 flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="./saphene.svg" alt="Saphene" className="h-full w-full object-contain" />
          </div>
          <span className="font-mono text-base font-bold tracking-tight text-ink group-hover:text-sage transition-colors">
            saphene<span className="text-amber">_</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-mono text-xs text-muted hover:text-sage transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* GitHub / Action Button + mobile hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/Jamespino20/Saphene"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-2.5 sm:px-3.5 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:border-amber hover:text-amber hover:bg-surface-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 1.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            <span className="hidden sm:inline">GitHub</span>
            <span className="text-muted text-[10px] hidden sm:inline">↗</span>
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-line-strong bg-surface text-ink"
          >
            <span className="relative block h-3.5 w-4">
              <span className={`absolute left-0 top-0 h-0.5 w-full bg-current transition-all ${open ? "top-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[6px] h-0.5 w-full bg-current transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[12px] h-0.5 w-full bg-current transition-all ${open ? "top-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-line bg-bg/95 backdrop-blur-md">
          <div className="mx-auto max-w-[1180px] px-4 py-3 flex flex-col">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-mono text-sm text-muted hover:text-sage hover:bg-surface-2 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-green via-sage to-amber"
      />
    </nav>
  );
}
