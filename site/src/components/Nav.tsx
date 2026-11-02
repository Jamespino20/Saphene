import { useEffect, useState } from "react";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#workflow", label: "How it works" },
  { href: "#case-study", label: "Case study" },
  { href: "./docs.html", label: "Docs" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors ${scrolled ? "border-line bg-bg/90 backdrop-blur-md" : "border-transparent"}`}>
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
        <a href="#" className="flex items-center gap-2 font-mono text-lg font-bold tracking-[.08em]">
          <img src="./saphene.svg" alt="" className="logo-mark h-8 w-6 object-contain" />
          SAPHENE<span className="text-amber">_</span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-muted md:flex">
          {LINKS.map((link) => <a key={link.href} href={link.href} className="transition-colors hover:text-deep">{link.label}</a>)}
          <a href="https://github.com/Jamespino20/Saphene" className="rounded-full bg-deep px-4 py-2 font-semibold text-white transition-colors hover:bg-teal">GitHub ↗</a>
        </div>
        <a href="https://github.com/Jamespino20/Saphene" className="rounded-full bg-deep px-4 py-2 text-sm font-semibold text-white md:hidden">GitHub</a>
      </div>
    </nav>
  );
}
