import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Who from "./components/Who";
import Loop from "./components/Loop";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans">
      <Nav />
      <Hero />
      <Who />
      <Loop />
      <footer className="mt-20 border-t border-line/40 py-12 text-muted text-sm">
        <div className="max-w-[1020px] mx-auto px-7 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-xs text-accent/80">
            Saphene - Clarity Through Evidence
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="https://github.com/Jamespino20/Saphene" className="hover:text-accent transition-colors">
              GitHub repo
            </a>
            <span className="text-[#2a3a50]">|</span>
            <a href="#demo" className="hover:text-accent transition-colors">
              Live demo
            </a>
            <span className="text-[#2a3a50]">|</span>
            <a href="#docs" className="hover:text-accent transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
