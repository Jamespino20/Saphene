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
        <div className="max-w-[1180px] mx-auto px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            <span className="mono-label text-[10px] text-amber tracking-wider">
              Meta AI Hackathon 2026 · Saphene entry · In development
            </span>
          </div>
          <div className="flex items-center gap-3 mono-label text-[10px] text-muted">
            <span>Track: Agentic Infrastructure</span>
            <span className="text-line-strong">/</span>
            <span>Mode: Deterministic · No API key</span>
          </div>
        </div>
      </div>
      <div className={`max-w-[1180px] w-full mx-auto px-6 flex items-center justify-between ${scrolled ? "py-3.5" : "py-4"}`}>
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

        {/* GitHub / Action Button */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Jamespino20/Saphene"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3.5 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:border-amber hover:text-amber hover:bg-surface-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.19-1.63 3.4 3.4 0 0 0-.3-1.845 3.3 3.3 0 0 0-1-3c-1 2-4 4-6 5s-3 3-4 5-0 0-0-0z" />
            </svg>
            <span>GitHub</span>
            <span className="text-muted text-[10px]">↗</span>
          </a>
        </div>
      </div>
    </nav>
  );
}