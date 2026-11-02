import { useEffect, useMemo, useRef, useState } from "react";
import { DRIFT, LINE_CLASS, SCRIPTS, TABS, type Line, type LineKind } from "../data/scripts";

type TabId = "bridge" | "audit" | "memory";

export default function TerminalDemo() {
  const [tab, setTab] = useState<TabId>("bridge");
  const [shown, setShown] = useState<Line[]>([]);
  const [cmdText, setCmdText] = useState("");
  const [done, setDone] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [drifted, setDrifted] = useState(false);
  const runRef = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const run = ++runRef.current;
    const script = SCRIPTS[tab];
    setShown([]);
    setCmdText("");
    setDone(false);
    setDrifted(false);

    if (reduced) {
      setCmdText(script[0][1]);
      setShown(script.slice(1));
      setDone(true);
      return;
    }

    const timers: number[] = [];
    const full = script[0][1];

    const revealNext = (i: number) => {
      if (run !== runRef.current) return;
      if (i >= script.length) {
        setDone(true);
        return;
      }
      setShown((prev) => [...prev, script[i]]);
      timers.push(window.setTimeout(() => revealNext(i + 1), 42));
    };

    let j = 0;
    const typeCmd = () => {
      if (run !== runRef.current) return;
      j = Math.min(full.length, j + 1);
      setCmdText(full.slice(0, j));
      if (j < full.length) timers.push(window.setTimeout(typeCmd, 22));
      else timers.push(window.setTimeout(() => revealNext(1), 160));
    };
    typeCmd();

    return () => timers.forEach(clearTimeout);
  }, [tab, reduced]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !("IntersectionObserver" in window)) {
      setScanned(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setScanned(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  const injectDrift = () => {
    if (drifted) return;
    runRef.current += 1;
    setDrifted(true);
    setCmdText(SCRIPTS[tab][0][1]);
    setShown([...SCRIPTS[tab].slice(1), ...DRIFT]);
    setDone(true);
    setScanned(false);
    requestAnimationFrame(() => setScanned(true));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key !== "d" && e.key !== "D") return;
      const box = boxRef.current;
      if (!box) return;
      const r = box.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) injectDrift();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onTabKey = (e: React.KeyboardEvent, idx: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (idx + dir + TABS.length) % TABS.length;
    tabRefs.current[next]?.focus();
    setTab(TABS[next].id);
  };

  return (
    <section id="demo" className="bg-bg py-24">
      <div className="mx-auto max-w-[1180px] px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-green">Live verification / Agapay</p>
          <h2 className="font-mono text-[clamp(22px,3.2vw,30px)] tracking-[-0.02em] font-bold text-ink">Watch it work</h2>
        </div>
        <a
          href="https://github.com/Jamespino20/Agapay"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-muted transition-colors hover:text-amber"
        >
          github.com/Jamespino20/Agapay ↗
        </a>
      </div>
      <p className="mb-6 max-w-[680px] text-base leading-relaxed text-muted font-sans">
        Real claims from the Agapay project, checked against its repository. It was an ambitious project that never
        had Saphene to verify its promises. No verdict without a citation. Switch tabs to compare claim verification, the
        audit panel, and memory drift watch.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["matched", "8", "bg-green", "text-sage"],
          ["partial", "2", "bg-amber", "text-amber"],
          ["unfound", "1", "bg-bad", "text-bad"],
        ].map(([label, count, dot, text]) => (
          <div key={label} className="rounded-xl border border-line bg-surface px-4 py-3 sm:px-5 shadow-sm">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              {label}
            </div>
            <div className={`mt-1 font-mono text-xl font-bold ${text}`}>{count}</div>
          </div>
        ))}
      </div>

      <div
        ref={boxRef}
        className={`relative overflow-hidden rounded-xl border border-line-strong bg-[#060a0f] shadow-2xl gem-glow-green ${
          scanned ? "term-scanned" : ""
        }`}
      >
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-[11px]">
          <span className="h-[10px] w-[10px] rounded-full bg-line-strong" />
          <span className="h-[10px] w-[10px] rounded-full bg-line-strong" />
          <span className="h-[10px] w-[10px] rounded-full bg-line-strong" />
          <div role="tablist" aria-label="Saphene surfaces" className="ml-3 flex gap-1">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="term-body"
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`rounded-lg border px-3 py-1 font-mono text-xs transition-colors ${
                  tab === t.id
                    ? "border-emerald/40 bg-surface text-sage font-semibold shadow-sm"
                    : "border-transparent text-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div
          id="term-body"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          aria-live="polite"
          className="min-h-[380px] whitespace-pre-wrap break-words p-5 font-mono text-[13.5px] leading-[1.75]"
        >
          <span className="text-muted">$ </span>
          <span className="text-ink">{cmdText}</span>
          {!done && <span className="caret" />}
          {shown.map(([kind, text], i) => (
            <span key={i} className={`block ${LINE_CLASS[kind as LineKind]}`}>
              {text === "" ? "\u00A0" : text}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3.5 text-[13.5px] text-muted">
        Output above is a faithful replay of real Saphene runs against{" "}
        <a className="text-accent hover:underline" href="https://github.com/Jamespino20/Agapay">
          the real Agapay repository
        </a>
        , compressed for the page. Press <kbd className="rounded border border-line px-1.5 font-mono text-xs">D</kbd> to
        inject drift.
      </p>
      </div>
    </section>
  );
}
