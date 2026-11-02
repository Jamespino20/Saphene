import { useEffect, useMemo, useRef, useState } from "react";
import {
  DRIFT,
  LINE_CLASS,
  SAPHENE_SELF_SCRIPTS,
  SAPHENE_SELF_TABS,
  SCRIPTS,
  TABS,
  type Line,
  type LineKind,
} from "../data/scripts";

type AgapayTabId = "bridge" | "audit" | "memory";
type SapheneTabId = "selftest" | "readme" | "mcp";

/**
 * Agapay Case Study Terminal
 */
export function AgapayTerminalDemo() {
  const [tab, setTab] = useState<AgapayTabId>("bridge");
  const [shown, setShown] = useState<Line[]>([]);
  const [cmdText, setCmdText] = useState("");
  const [done, setDone] = useState(false);
  const [drifted, setDrifted] = useState(false);
  const runRef = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
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
      timers.push(window.setTimeout(() => revealNext(i + 1), 38));
    };

    let j = 0;
    const typeCmd = () => {
      if (run !== runRef.current) return;
      j = Math.min(full.length, j + 1);
      setCmdText(full.slice(0, j));
      if (j < full.length) timers.push(window.setTimeout(typeCmd, 18));
      else timers.push(window.setTimeout(() => revealNext(1), 140));
    };
    typeCmd();

    return () => timers.forEach(clearTimeout);
  }, [tab, reduced]);

  const injectDrift = () => {
    if (drifted) return;
    runRef.current += 1;
    setDrifted(true);
    setCmdText(SCRIPTS[tab][0][1]);
    setShown([...SCRIPTS[tab].slice(1), ...DRIFT]);
    setDone(true);
  };

  const onTabKey = (e: React.KeyboardEvent, idx: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (idx + dir + TABS.length) % TABS.length;
    tabRefs.current[next]?.focus();
    setTab(TABS[next].id as AgapayTabId);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Terminal Header & Tabs */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="text-amber font-semibold">Agapay Live Run</span>
          </div>

          <div
            role="tablist"
            aria-label="Agapay surfaces"
            className="flex gap-1"
          >
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`agapay-tab-${t.id}`}
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id as AgapayTabId)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  tab === t.id
                    ? "border-amber/50 bg-surface-2 text-amber font-bold shadow-sm"
                    : "border-transparent text-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Box */}
        <div
          ref={boxRef}
          className="relative overflow-hidden rounded-xl border border-line-strong bg-[#060a0f] shadow-xl text-left"
        >
          <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-line-strong" />
              <span className="h-2 w-2 rounded-full bg-line-strong" />
              <span className="h-2 w-2 rounded-full bg-line-strong" />
              <span className="ml-2 font-mono text-[10.5px] text-muted">
                agapay / target-repo
              </span>
            </div>
            <button
              onClick={injectDrift}
              className="font-mono text-[10px] text-amber hover:underline uppercase tracking-wider"
            >
              {drifted ? "Drift Triggered [x1]" : "Press 'D' / Inject Drift"}
            </button>
          </div>

          <div className="min-h-[260px] max-h-[260px] whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed overflow-y-auto">
            <span className="text-muted">$ </span>
            <span className="text-ink font-semibold">{cmdText}</span>
            {!done && (
              <span className="terminal-caret inline-block h-3.5 w-1 bg-amber align-middle ml-1" />
            )}
            {shown.map(([kind, text], i) => (
              <span key={i} className={`block ${LINE_CLASS[kind as LineKind]}`}>
                {text === "" ? "\u00A0" : text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>
          Citations: <strong className="text-sage">prisma/init.sql</strong>
        </span>
        <a
          href="https://github.com/Jamespino20/Agapay"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber hover:underline"
        >
          Inspect Agapay Repo &rarr;
        </a>
      </div>
    </div>
  );
}

/**
 * Saphene-ing Saphene Proof of Discipline Terminal
 */
export function SapheneSelfTerminalDemo() {
  const [tab, setTab] = useState<SapheneTabId>("selftest");
  const [shown, setShown] = useState<Line[]>([]);
  const [cmdText, setCmdText] = useState("");
  const [done, setDone] = useState(false);
  const runRef = useRef(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const run = ++runRef.current;
    const script = SAPHENE_SELF_SCRIPTS[tab];
    setShown([]);
    setCmdText("");
    setDone(false);

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
      timers.push(window.setTimeout(() => revealNext(i + 1), 38));
    };

    let j = 0;
    const typeCmd = () => {
      if (run !== runRef.current) return;
      j = Math.min(full.length, j + 1);
      setCmdText(full.slice(0, j));
      if (j < full.length) timers.push(window.setTimeout(typeCmd, 18));
      else timers.push(window.setTimeout(() => revealNext(1), 140));
    };
    typeCmd();

    return () => timers.forEach(clearTimeout);
  }, [tab, reduced]);

  const onTabKey = (e: React.KeyboardEvent, idx: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next =
      (idx + dir + SAPHENE_SELF_TABS.length) % SAPHENE_SELF_TABS.length;
    tabRefs.current[next]?.focus();
    setTab(SAPHENE_SELF_TABS[next].id as SapheneTabId);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Terminal Header & Tabs */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <span className="h-2 w-2 rounded-full bg-green" />
            <span className="text-sage font-semibold">Self-Audit Engine</span>
          </div>

          <div
            role="tablist"
            aria-label="Saphene surfaces"
            className="flex gap-1"
          >
            {SAPHENE_SELF_TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`saphene-tab-${t.id}`}
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id as SapheneTabId)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  tab === t.id
                    ? "border-emerald/50 bg-surface-2 text-sage font-bold shadow-sm"
                    : "border-transparent text-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Box */}
        <div className="relative overflow-hidden rounded-xl border border-line-strong bg-[#060a0f] shadow-xl text-left">
          <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-line-strong" />
              <span className="h-2 w-2 rounded-full bg-line-strong" />
              <span className="h-2 w-2 rounded-full bg-line-strong" />
              <span className="ml-2 font-mono text-[10.5px] text-muted">
                saphene / self-verification
              </span>
            </div>
            <span className="font-mono text-[10px] text-sage font-bold uppercase tracking-wider">
              7/7 Checks Passed
            </span>
          </div>

          <div className="min-h-[260px] max-h-[260px] whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed overflow-y-auto">
            <span className="text-muted">$ </span>
            <span className="text-ink font-semibold">{cmdText}</span>
            {!done && (
              <span className="terminal-caret inline-block h-3.5 w-1 bg-green align-middle ml-1" />
            )}
            {shown.map(([kind, text], i) => (
              <span key={i} className={`block ${LINE_CLASS[kind as LineKind]}`}>
                {text === "" ? "\u00A0" : text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>
          Verified Against:{" "}
          <strong className="text-green">Root Codebase AST</strong>
        </span>
        <a
          href="https://github.com/Jamespino20/Saphene"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sage hover:underline"
        >
          Inspect Saphene Repo &rarr;
        </a>
      </div>
    </div>
  );
}

export default AgapayTerminalDemo;
