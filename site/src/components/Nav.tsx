import { useEffect, useState } from "react";

const LINKS = [
  { href: "#demo", label: "Demo" },
  { href: "#loop", label: "The Loop" },
  { href: "#who", label: "Who is this for?" },
  { href: "https://github.com/Jamespino20/Saphene", label: "GitHub" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between py-5 backdrop-blur-[10px] transition-colors ${
        scrolled ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <a href="#" className="font-mono text-[17px] font-bold tracking-wide text-ink">
        saphene<span className="text-accent">_</span>
      </a>
      <div className="flex items-center gap-6 text-sm">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} className="text-muted transition-colors hover:text-ink">
            {l.label}
          </a>
        ))}
        <a
          href="https://github.com/Jamespino20/Saphene"
          className="rounded-lg bg-accent px-3.5 py-1.5 font-semibold text-[#052e16] transition-colors hover:bg-accent-dim"
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}
