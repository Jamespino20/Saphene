import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AgapayTerminalDemo, SapheneSelfTerminalDemo } from "./TerminalDemo";

const SCENARIOS = [
  {
    label: "Capstone team",
    prompt: "Did we actually finish the SRS requirement?",
    answer: "I found a claim in the proposal, but the repository only supports part of it. Saphene recorded the gap instead of letting the memory pass as fact.",
    tag: "partial",
    tagClass: "badge-partial",
  },
  {
    label: "Solo developer",
    prompt: "The agent said the migration was complete. Is it?",
    answer: "The migration file exists and the table is referenced by the app. The receipt points to schema.sql:42 and migration/004_add_claims.sql:8.",
    tag: "matched",
    tagClass: "badge-matched",
  },
  {
    label: "Legacy maintainer",
    prompt: "Can I trust the README before changing this service?",
    answer: "Not yet. Two promises are unfound and one contradicts the current implementation. The ledger gives you the exact files to investigate first.",
    tag: "unfound",
    tagClass: "badge-unfound",
  },
];

export function ProblemSection() {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const scenario = SCENARIOS[active];

  useEffect(() => {
    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setTyped(scenario.answer.slice(0, index));
      if (index >= scenario.answer.length) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [active, scenario.answer]);

  return (
    <section id="problem" className="relative border-b border-line bg-bg py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 forensic-grid opacity-50" />
      <div className="relative mx-auto max-w-[1180px] px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <p className="mono-label text-amber">The Problem / Agent Drift</p>
            </div>
            <h2 className="mt-4 max-w-[560px] font-mono text-3xl sm:text-5xl font-bold leading-tight tracking-tight text-ink">
              Memory moves faster than the repository.
            </h2>
          </div>
          <p className="max-w-[620px] text-base sm:text-lg leading-relaxed text-muted font-sans">
            Agents summarize decisions, teams write specifications, and projects accumulate confident statements.
            Then the code changes. Saphene turns that uncomfortable gap into a reviewable evidence trail.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Tab Selector */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 lg:block lg:space-y-2.5 lg:pb-0">
            {SCENARIOS.map((item, index) => (
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                key={item.label}
                onClick={() => setActive(index)}
                className={`min-w-[190px] rounded-xl border p-4 text-left transition-all lg:w-full ${
                  active === index
                    ? "border-emerald bg-surface-2 shadow-lg shadow-emerald/10 text-ink"
                    : "border-line bg-surface/60 text-muted hover:border-line-strong hover:bg-surface"
                }`}
              >
                <span className="mono-label text-[10px] text-muted block">CASE 0{index + 1}</span>
                <span className="mt-2 block font-mono text-sm font-semibold">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Typewriter Forensic Terminal Display */}
          <motion.div
            key={scenario.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-line-strong bg-surface p-6 sm:p-8 shadow-2xl gem-glow-green"
          >
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                <span className="font-mono text-xs text-muted">agent-session / context-check</span>
              </div>
              <span className={`badge ${scenario.tagClass}`}>{scenario.tag}</span>
            </div>

            <div className="space-y-4 font-mono text-sm leading-relaxed">
              <p className="text-muted">
                <span className="text-amber font-semibold">user</span> <span className="text-line-strong">›</span>{" "}
                <span className="text-ink">{scenario.prompt}</span>
              </p>
              <div className="rounded-xl border border-line bg-bg p-4.5 font-mono text-sm leading-relaxed">
                <span className="text-green font-semibold">saphene</span>{" "}
                <span className="text-line-strong">›</span>{" "}
                <span className="text-ink">{typed}</span>
                <span className="terminal-caret ml-1 inline-block h-4 w-1.5 bg-amber align-middle" />
              </div>
            </div>

            <div className="mt-7 grid gap-3 pt-5 border-t border-line text-xs font-mono text-muted sm:grid-cols-3">
              <div>
                <span>claim captured: </span>
                <strong className="text-green font-semibold">yes</strong>
              </div>
              <div>
                <span>evidence searched: </span>
                <strong className="text-ink font-semibold">repo + AST</strong>
              </div>
              <div>
                <span>receipt attached: </span>
                <strong className="text-amber font-semibold">file:line</strong>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * P0 Centerpiece: Interactive End-to-End Drift Lifecycle
 * Shows claim establishment, citation, simulated code commit, and immediate drift detection.
 */
function ProductPreview() {
  const [driftSimulated, setDriftSimulated] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl gem-glow-green">
      {/* Table Header & Simulation Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line bg-surface-2 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${driftSimulated ? "bg-bad animate-ping" : "bg-green"}`} />
          <div>
            <span className="font-mono text-xs font-bold text-sage block">
              saphene / verification-ledger
            </span>
            <span className="font-mono text-[11px] text-muted">
              {driftSimulated ? "DRIFT RUN #142 (POST-COMMIT)" : "BASELINE RUN #141 (ORIGINAL MEMORY)"}
            </span>
          </div>
        </div>

        {/* The "Aha!" Drift Simulator Button */}
        <button
          onClick={() => setDriftSimulated((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-bold transition-all shadow-md ${
            driftSimulated
              ? "bg-amber text-[#07100b] hover:bg-amber-light"
              : "bg-surface-3 border border-amber/40 text-amber hover:bg-amber/15 hover:border-amber"
          }`}
        >
          <span>{driftSimulated ? "↺ Reset Code to Matched Baseline" : "⚡ Simulate Code Drift (PR #142)"}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px]">
        {/* Claim Ledger Rows with Reactive Drift State */}
        <div className="divide-y divide-line font-mono">
          {/* Row 1: The Drift Subject */}
          <div className={`p-5 transition-colors ${driftSimulated ? "bg-bad/10" : "hover:bg-surface-2/60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-sage">#015</span>
                <span className="font-sans text-sm font-semibold text-ink">
                  Offline transactions synchronize automatically with the server
                </span>
              </div>
              <span className={`badge ${driftSimulated ? "badge-unfound" : "badge-matched"}`}>
                {driftSimulated ? "DRIFT DETECTED" : "matched"}
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted">
                <span>Original Memory Assertion:</span>
                <span className="text-ink bg-surface-2 px-2 py-0.5 rounded border border-line">
                  "agent-session-42: offline sync queue handled in store"
                </span>
              </div>

              {driftSimulated ? (
                <div className="rounded-lg border border-bad/40 bg-bad/15 p-3 text-bad font-mono text-xs leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>⚠ CITATION REMOVED IN COMMIT e7b81f9:</span>
                  </p>
                  <p className="mt-1 text-ink/90">
                    File <span className="underline">src/store/offline.ts:42</span> was deleted during refactor. No replacement handler found in AST.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted">
                  <span>Verified Citation:</span>
                  <span className="receipt-tag">src/store/offline.ts:42 → syncQueueHandler()</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Stable Matched Claim */}
          <div className="p-5 hover:bg-surface-2/60 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-sage">#014</span>
                <span className="font-sans text-sm font-semibold text-ink">
                  Relational database schema defines multi-tenant tenant_id isolation
                </span>
              </div>
              <span className="badge badge-matched">matched</span>
            </div>
            <div className="mt-2 text-xs text-muted">
              <span>Verified Citation: </span>
              <span className="receipt-tag">prisma/schema.prisma:18 → @@index([tenant_id])</span>
            </div>
          </div>

          {/* Row 3: Partial / TODO Claim */}
          <div className="p-5 hover:bg-surface-2/60 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-sage">#016</span>
                <span className="font-sans text-sm font-semibold text-ink">
                  Two-factor authentication protects privileged administrative actions
                </span>
              </div>
              <span className="badge badge-partial">partial</span>
            </div>
            <div className="mt-2 text-xs text-muted">
              <span>Verified Citation: </span>
              <span className="receipt-tag">auth/2fa.ts:86 → TODO: enforce verifyToken()</span>
            </div>
          </div>

          {/* Row 4: Unfound Promise */}
          <div className="p-5 hover:bg-surface-2/60 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-sage">#017</span>
                <span className="font-sans text-sm font-semibold text-ink">
                  Regional export endpoint compiles compliance PDF reports
                </span>
              </div>
              <span className="badge badge-unfound">unfound</span>
            </div>
            <div className="mt-2 text-xs text-muted">
              <span>Verified Citation: </span>
              <span className="text-muted/70 italic">no matching route, controller, or binary located in repository</span>
            </div>
          </div>
        </div>

        {/* Sidebar Integrity Stats with Reactive PR Gate Result */}
        <aside className="border-t border-line bg-surface-2/70 p-6 lg:border-l lg:border-t-0 flex flex-col justify-between">
          <div>
            <span className="mono-label text-muted text-[11px] block">Project Integrity Ledger</span>
            <div className="mt-5 space-y-4 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">matched</span>
                <strong className="text-lg text-sage">{driftSimulated ? "01" : "02"}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">partial</span>
                <strong className="text-lg text-amber">01</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">unfound / drift</span>
                <strong className={`text-lg ${driftSimulated ? "text-bad font-black" : "text-bad"}`}>
                  {driftSimulated ? "02 (REGRESSION)" : "01"}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-line">
            <span className="mono-label text-[10px] text-amber block">CI / PR Gate Status</span>
            {driftSimulated ? (
              <div className="mt-2 rounded-lg border border-bad/40 bg-bad/15 p-2.5 text-center">
                <span className="font-mono text-xs font-bold text-bad block">✕ BLOCKED: DRIFT</span>
                <span className="text-[10px] text-muted block mt-0.5 font-mono">Claim #015 regressed</span>
              </div>
            ) : (
              <div className="mt-2 rounded-lg border border-green/40 bg-green/10 p-2.5 text-center">
                <span className="font-mono text-xs font-bold text-green block">✓ GATE PASSED</span>
                <span className="text-[10px] text-muted block mt-0.5 font-mono">Ledger verified baseline</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function ProductSection() {
  return (
    <section id="product" className="relative bg-bg py-24 border-b border-line">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <p className="mono-label text-green">Saphene / Verification</p>
            </div>
            <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
              The claim is not the answer.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green to-amber">
                The receipt is.
              </span>
            </h2>
          </div>
          <p className="max-w-[460px] text-base leading-relaxed text-muted font-sans">
            A verification table that doesn't ask visitors to trust an LLM conclusion.
            Interact with the demonstration below to see how Saphene catches knowledge drift in real time.
          </p>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

const AGENT_LINES = [
  ["cmd", "$ saphene verify claims.md --repo ./example-app"],
  ["dim", "Saphene / verification run"],
  ["dim", "Reading agent memory: 12 claims found"],
  ["ok", "  [matched] database uses PostgreSQL"],
  ["dim", "    receipt: prisma/schema.prisma:18"],
  ["warn", "  [partial] offline transactions synchronize"],
  ["dim", "    receipt: src/store/offline.ts:42"],
  ["bad", "  [unfound] exports regional reports"],
  ["dim", "    no evidence located in ./example-app"],
  ["info", "Ledger written: .saphene/ledger.json"],
] as const;

function AgentTerminal() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setVisible((value) => Math.min(value + 1, AGENT_LINES.length)),
      420,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface-2 font-mono text-xs shadow-2xl gem-glow-amber">
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green" />
          <span>terminal / example-app</span>
        </span>
        <span className="text-[10px] uppercase tracking-wider text-amber font-semibold">live execution</span>
      </div>
      <div className="min-h-[270px] space-y-1.5 p-5 leading-6 bg-[#060a0f]">
        {AGENT_LINES.slice(0, visible).map(([kind, line]) => (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            key={line}
            className={
              kind === "cmd"
                ? "text-ink font-semibold"
                : kind === "ok"
                ? "text-sage"
                : kind === "warn"
                ? "text-amber"
                : kind === "bad"
                ? "text-bad"
                : kind === "info"
                ? "text-green"
                : "text-muted"
            }
          >
            {line}
          </motion.div>
        ))}
        {visible < AGENT_LINES.length && (
          <span className="terminal-caret inline-block h-4 w-1.5 bg-amber align-middle" />
        )}
      </div>
    </div>
  );
}

export function WatchWorkSection() {
  return (
    <section id="watch-work" className="border-b border-line bg-surface py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-12 max-w-[700px]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            <p className="mono-label text-amber">Watch it work / agent session</p>
          </div>
          <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            The agent remembers. Saphene checks.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted font-sans">
            Saphene does not replace coding agents. It acts as an independent verification referee:
            the agent asserts a memory, the terminal searches the repository AST, and the ledger keeps the evidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-line bg-bg p-6 sm:p-7 shadow-xl"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 border border-line-strong font-mono text-sm font-bold text-sage">
                AI
              </div>
              <div>
                <p className="font-semibold text-ink">Coding Agent</p>
                <p className="font-mono text-[11px] text-muted">context window / claim assertion</p>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <p className="text-muted">
                <span className="font-mono text-amber font-semibold">agent:</span> "I remember that the app persists user data in PostgreSQL and supports offline transactions."
              </p>
              <div className="rounded-xl border border-line-strong bg-surface-2 p-4">
                <p className="font-mono text-xs text-sage font-semibold mb-1">saphene review verdict:</p>
                <p className="text-ink">
                  "I'll verify both claims against the repository. Memory is a lead, not evidence."
                </p>
              </div>
              <p className="text-xs font-mono text-muted">
                The terminal has started a run. Results will be attached to the claim ledger with file and line receipts.
              </p>
            </div>
          </motion.div>

          <AgentTerminal />
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  ["01", "Extract", "Turn memory, docs, and requirements into structured claims.", "claim → evidence hints"],
  ["02", "Find Evidence", "Search code, schemas, papers, and project files for receipts.", "grep → read → cite"],
  ["03", "Verify", "Classify support as matched, partial, mismatch, or unfound.", "evidence → verdict"],
  ["04", "Review", "Write the ledger, detect drift, and surface the next action.", "verdict → diff"],
  ["05", "CI Gate", "Run the check on every push and block claims that regress.", "push → audit → pass"],
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="relative border-b border-line bg-bg py-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 forensic-grid-dense opacity-40" />
      <div className="relative mx-auto max-w-[1180px] px-6">
        <div className="max-w-[640px]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <p className="mono-label text-green">How it works</p>
          </div>
          <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            A continuous loop for project truth.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted font-sans">
            Saphene treats memory as a source of claims, never as proof. Every pass produces an artifact someone else can inspect, closing the loop whenever code updates.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(([number, title, text, command]) => (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -6, borderColor: "text-amber" }}
              key={number}
              className="facet-card p-6 flex flex-col justify-between hover:border-amber/50 transition-border"
            >
              <div>
                <span className="font-mono text-sm font-bold text-sage">{number}</span>
                <h3 className="mt-8 font-mono text-lg font-bold text-ink">{title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-muted font-sans">{text}</p>
              </div>
              <code className="mt-6 block border-t border-line pt-3 font-mono text-[10px] text-amber">
                {command}
              </code>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VerdictsSection() {
  const verdicts = [
    {
      name: "matched",
      title: "Supported by evidence",
      text: "The repository contains the exact implementation. Keep the receipt and move on.",
      example: "schema.prisma:18 @@index([tenant_id]) matched schema statement.",
      badgeClass: "badge-matched",
      dotClass: "bg-sage",
    },
    {
      name: "partial",
      title: "Incomplete support",
      text: "Some evidence exists, but a TODO, missing branch, or unfinished behavior keeps the claim open.",
      example: "auth/2fa.ts:86 found, but contains 'TODO: enforce token validation'.",
      badgeClass: "badge-partial",
      dotClass: "bg-amber",
    },
    {
      name: "mismatch",
      title: "Conflicting evidence",
      text: "The code directly contradicts the claim. Review before trusting either.",
      example: "Claim states PostgreSQL, but code imports mysql2 driver and config.",
      badgeClass: "badge-mismatch",
      dotClass: "bg-bronze",
    },
    {
      name: "unfound",
      title: "No evidence located",
      text: "The claim may be true in theory, but Saphene found zero defensible traces in the repository. Distinct from mismatch.",
      example: "Regional PDF export claim has no corresponding route, file, or controller.",
      badgeClass: "badge-unfound",
      dotClass: "bg-bad",
    },
  ];

  return (
    <section id="verdicts" className="bg-surface py-24 border-b border-line">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <p className="mono-label text-amber">Verification verdicts</p>
            </div>
            <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
              Four states. No hand-waving.
            </h2>
          </div>
          <p className="max-w-[420px] text-base leading-relaxed text-muted font-sans">
            Colors help you scan instantly. Notice that <strong className="text-bad">unfound</strong> (no trace in repo) is fundamentally distinct from <strong className="text-bronze">mismatch</strong> (direct code contradiction).
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {verdicts.map((item) => (
            <div key={item.name} className="facet-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${item.dotClass}`} />
                  <h3 className="font-mono text-lg font-bold text-ink uppercase tracking-wide">{item.name}</h3>
                  <span className={`badge ${item.badgeClass}`}>verdict</span>
                </div>
                <p className="mt-2 font-semibold text-sm text-sage">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">{item.text}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-line font-mono text-xs text-muted">
                <span className="text-amber">Example:</span> <span className="text-ink/80">{item.example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CapabilitiesSection() {
  const surfaces = [
    {
      title: "Stale README Promises",
      desc: "Detect documentation that claims features exist when the code has deleted or changed them.",
    },
    {
      title: "Outdated Architecture Records",
      desc: "Verify ADRs and system design specs against the actual Prisma, SQL, and directory layouts.",
    },
    {
      title: "AI Agent Hallucinations",
      desc: "Intercept coding agent context assertions before false memories get baked into pull requests.",
    },
    {
      title: "SRS & Requirement Compliance",
      desc: "Track requirements traceability matrices automatically during capstones and software audits.",
    },
  ];

  return (
    <section id="capabilities" className="bg-bg py-24 border-b border-line">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="max-w-[720px] mb-14">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <p className="mono-label text-green">Concrete Applications</p>
          </div>
          <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            Built for surfaces where truth gets lost.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted font-sans">
            Whenever a statement is made about software outside of its test suite, drift begins.
            Saphene anchors claims back to reality across these four primary surfaces:
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {surfaces.map((item, index) => (
            <div key={item.title} className="facet-card p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-amber">0{index + 1}</span>
                <h3 className="mt-4 font-mono text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-muted font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Case Studies Arena with Parallel Live Terminals */}
        <div id="demo" className="mt-14 grid gap-8">
          {/* Card 1: Agapay Case Study with Live Terminal */}
          <div id="case-study" className="facet-card p-6 sm:p-8 flex flex-col justify-between gem-glow-amber">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                <p className="mono-label text-amber">Case study / Agapay</p>
              </div>
              <h3 className="mt-3 font-mono text-xl sm:text-2xl font-bold text-ink">
                A rich project that needed a witness.
              </h3>
              <p className="mt-3 mb-6 leading-relaxed text-muted text-xs sm:text-sm font-sans">
                Agapay had ambitious specifications, detailed documentation, and a repository full of promises.
                It did not have Saphene. Test the terminal below to see what an evidence pass reveals against its repository.
              </p>
            </div>

            <div className="pt-4 border-t border-line">
              <AgapayTerminalDemo />
            </div>
          </div>

          {/* Card 2: Saphene Proof of Discipline with Self-Audit Terminal */}
          <div className="facet-card p-6 sm:p-8 flex flex-col justify-between gem-glow-green">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                <p className="mono-label text-sage">Proof of discipline</p>
              </div>
              <h3 className="mt-3 font-mono text-xl sm:text-2xl font-bold text-ink">
                Still don't believe us?
              </h3>
              <p className="mt-3 mb-6 leading-relaxed text-muted text-xs sm:text-sm font-sans">
                We Saphene'd Saphene itself. Its documentation, architectural specs, and test harness are verified deterministically by our own test suite. Test the terminal below to see our self-verifying engine in action.
              </p>
            </div>

            <div className="pt-4 border-t border-line">
              <SapheneSelfTerminalDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * P1: Elevated Technical Integrations
 * Highlights CLI, MCP Server, and GitHub Actions by name with interactive tabs.
 */
export function IntegrationSection() {
  const [tab, setTab] = useState<"mcp" | "cli" | "actions">("mcp");

  return (
    <section id="integration" className="bg-surface py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-12 max-w-[720px]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <p className="mono-label text-green">Developer Integrations</p>
          </div>
          <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            Meet developers where they already work.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted font-sans">
            Saphene isn't another dashboard. It integrates into your toolchain as a local CLI, an autonomous agent MCP server, and a GitHub Actions pull-request gate.
          </p>
        </div>

        {/* Integration Surface Selector */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {[
            { id: "mcp", label: "Model Context Protocol (MCP)", badge: "For Agents" },
            { id: "actions", label: "GitHub Actions PR Gate", badge: "For CI/CD" },
            { id: "cli", label: "Local CLI Engine", badge: "For Developers" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as "mcp" | "cli" | "actions")}
              className={`rounded-xl border px-4.5 py-3 font-mono text-xs font-semibold flex items-center gap-3 transition-all ${
                tab === item.id
                  ? "border-emerald bg-surface-2 text-sage shadow-md"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              <span>{item.label}</span>
              <span className="badge badge-matched text-[9.5px] py-0.5">{item.badge}</span>
            </button>
          ))}
        </div>

        {/* Integration Code Panes */}
        <div className="rounded-2xl border border-line-strong bg-bg p-6 sm:p-8 font-mono text-xs sm:text-sm shadow-2xl">
          {tab === "mcp" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-sage font-bold">mcp_config.json / coding agent tool loop</span>
                <span className="text-muted text-xs">Exposes: saphene_ledger, saphene_memory, saphene_verify</span>
              </div>
              <pre className="text-ink leading-relaxed overflow-x-auto">
{`{
  "mcpServers": {
    "saphene": {
      "command": "node",
      "args": ["./dist/mcp.js"],
      "env": { "SAPHENE_WORKSPACE": "." }
    }
  }
}`}
              </pre>
              <p className="text-muted text-xs font-sans pt-2 border-t border-line">
                Allows Claude, Cursor, Windsurf, or custom agent scripts to verify claims against the codebase before committing code.
              </p>
            </div>
          )}

          {tab === "actions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-amber font-bold">.github/workflows/saphene.yml / pull request gate</span>
                <span className="text-muted text-xs">Fails PR when claims regress</span>
              </div>
              <pre className="text-ink leading-relaxed overflow-x-auto">
{`name: Saphene Evidence Gate
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npx saphene review --claims claims.md --fail-on-drift`}
              </pre>
              <p className="text-muted text-xs font-sans pt-2 border-t border-line">
                Blocks the merge if any previously verified claim loses its code receipt during a pull request.
              </p>
            </div>
          )}

          {tab === "cli" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-green font-bold">Terminal CLI / local-first execution</span>
                <span className="text-muted text-xs">Zero API keys required in --no-model mode: deterministic, offline verification using AST analysis only</span>
              </div>
              <pre className="text-ink leading-relaxed overflow-x-auto">
{`# Initialize memory ledger
$ npx saphene init --memory-dir ./memory

# Verify claims against repository AST and evidence
$ npx saphene bridge -- examples/agapay-claims.md --repo ./app
→ 10 claims | 9 matched | 1 partial | 0 drift [PASS]

# Audit panel personas (security, performance, flow)
$ npx saphene audit --repo ./app --focus security`}
              </pre>
              <p className="text-muted text-xs font-sans pt-2 border-t border-line">
                100% deterministic, offline execution for fast local validation in pre-commit hooks.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function RoadmapSection() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Core Verification Engine",
      status: "Shipped",
      statusClass: "badge-matched",
      items: ["Claim extraction from memory/docs/SRS", "Grep-driven evidence checks with file:line receipts", "Matched / partial / mismatch / unfound verdicts", "Claim ledger write-back (dated)"],
    },
    {
      phase: "Phase 2",
      title: "Agent Tooling & CI Gate",
      status: "In progress",
      statusClass: "badge-partial",
      items: ["MCP server tools (saphene_bridge, saphene_memory, saphene_verify)", "GitHub Actions drift gate", "Multi-persona audit panel (security, performance, flow, maintainability)"],
    },
    {
      phase: "Phase 3",
      title: "Cross-Repository Traceability",
      status: "Planned",
      statusClass: "badge-unfound",
      items: ["Multi-repo ledger roll-up", "Semantic synonym & alias expansion", "Requirements traceability matrix export"],
    },
    {
      phase: "Phase 4",
      title: "Review Dashboard",
      status: "Planned",
      statusClass: "badge-unfound",
      items: ["Signed-in review dashboard (local)", "Remediation prompts per verdict", "Receipt diff across commits"],
    },
    {
      phase: "Phase 5",
      title: "Research Sandbox",
      status: "Research",
      statusClass: "badge-partial",
      items: ["Bounded self-improvement loop (research-only, not demonstrated)", "Optional JEV advisor integration", "No claim of verified self-improvement gains"],
    },
  ];

  return (
    <section id="roadmap" className="relative bg-bg py-24 border-b border-line overflow-hidden">
      <div className="pointer-events-none absolute inset-0 forensic-grid-dense opacity-30" />
      <div className="relative mx-auto max-w-[1180px] px-6">
        <div className="mb-12 max-w-[720px]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            <p className="mono-label text-amber">Roadmap / Meta AI Hackathon entry</p>
          </div>
          <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            What exists. What is next.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted font-sans">
            Saphene is built in public for the Meta AI Hackathon. Nothing here claims more than what is verified in the repository and self-test suite.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phases.map((p, i) => (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07 }}
              className="facet-card p-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-sage font-bold tracking-wider">{p.phase}</span>
                <span className={`badge ${p.statusClass}`}>{p.status}</span>
              </div>
              <h3 className="mt-3 font-mono text-lg font-bold text-ink">{p.title}</h3>
              <ul className="mt-4 space-y-1.5">
                {p.items.map((it) => (
                  <li key={it} className="text-xs leading-relaxed text-muted flex gap-2">
                    <span className="text-amber">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Hackathon progress log */}
        <div className="mt-14 rounded-2xl border border-line-strong bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <p className="mono-label text-green">Progress log</p>
          </div>
          <div className="space-y-3 font-mono text-xs sm:text-sm">
            {[
              { ts: "2026-11-02", text: "Site: Meta hackathon header band + roadmap section added; terminal height clamped." },
              { ts: "2026-11-01", text: "Self-test: 7/7 deterministic checks passing against root codebase AST." },
              { ts: "2026-10-31", text: "Memory audit: 4 ledgered claims, 1 drift resolved via schemata.json update." },
              { ts: "2026-10-30", text: "v0.1.0 baseline: claim extraction + verify + ledger + drift detection shipped." },
            ].map((e) => (
              <div key={e.ts} className="flex gap-3 border-b border-line/50 pb-2 last:border-0">
                <span className="text-muted shrink-0">{e.ts}</span>
                <span className="text-ink/90">{e.text}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted font-sans">
            Publication of dates reflects public-source work, not earlier private scaffolding.
          </p>
        </div>
      </div>
    </section>
  );
}
