import { motion } from "motion/react";
import { useEffect, useState } from "react";

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
          <p className="max-w-[620px] text-lg leading-relaxed text-muted">
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

function ProductPreview() {
  const rows = [
    ["#014", "Relational database stores application data", "matched", "schema.prisma:18"],
    ["#015", "Offline transactions synchronize with the server", "partial", "offline-store.ts:42"],
    ["#016", "Regional reports can be exported by health workers", "unfound", "no evidence located"],
    ["#017", "Two-factor authentication protects admin access", "mismatch", "auth/2fa.ts:86"],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl gem-glow-green">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-line bg-surface-2 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-amber" />
          <span className="font-mono text-xs font-semibold text-sage">saphene / verification-ledger</span>
        </div>
        <span className="font-mono text-[11px] text-muted">AUDIT RUN / 2026-11-02</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px]">
        {/* Claim Ledger Rows */}
        <div className="divide-y divide-line">
          {rows.map(([id, claim, status, receipt], index) => (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: index * 0.08 }}
              key={id}
              className="grid gap-3 px-5 py-4.5 sm:grid-cols-[56px_1fr_auto] sm:items-center hover:bg-surface-2/60 transition-colors"
            >
              <span className="font-mono text-xs font-bold text-sage">{id}</span>
              <div>
                <p className="text-sm font-medium text-ink">{claim}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  receipt: <span className="receipt-tag">{receipt}</span>
                </p>
              </div>
              <span
                className={`badge ${
                  status === "matched"
                    ? "badge-matched"
                    : status === "partial"
                    ? "badge-partial"
                    : status === "mismatch"
                    ? "badge-mismatch"
                    : "badge-unfound"
                }`}
              >
                {status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Integrity Stats */}
        <aside className="border-t border-line bg-surface-2/70 p-6 lg:border-l lg:border-t-0 flex flex-col justify-between">
          <div>
            <span className="mono-label text-muted text-[11px] block">Project Integrity</span>
            <div className="mt-5 space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">matched</span>
                <strong className="text-xl text-sage">01</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">partial</span>
                <strong className="text-xl text-amber">01</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">unfound</span>
                <strong className="text-xl text-bad">01</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">mismatch</span>
                <strong className="text-xl text-bronze">01</strong>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <span className="mono-label text-[10px] text-amber block">PR Gate Verdict</span>
            <span className="mt-1 font-mono text-xs text-bad font-bold block">BLOCKED: 2 FAILURES</span>
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
          <p className="max-w-[420px] text-base leading-relaxed text-muted">
            A continuous product view built around verifiable claims, strict verdicts,
            and the file receipts that make an audit defensible.
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
          <p className="mt-5 text-lg leading-relaxed text-muted">
            A generic project is enough to show the handoff: a coding agent makes a claim,
            the terminal searches the repo, and the ledger keeps the evidence.
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
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Saphene treats memory as a source of claims, never as proof. Every pass produces an artifact someone else can inspect.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(([number, title, text, command], index) => (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.09 }}
              whileHover={{ y: -6 }}
              key={number}
              className="facet-card p-6 flex flex-col justify-between"
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
      text: "The repository contains the expected implementation. Keep the receipt and move on.",
      badgeClass: "badge-matched",
      dotClass: "bg-sage",
    },
    {
      name: "partial",
      title: "Incomplete support",
      text: "Some evidence exists, but a TODO, missing branch, or unfinished behavior keeps the claim open.",
      badgeClass: "badge-partial",
      dotClass: "bg-amber",
    },
    {
      name: "mismatch",
      title: "Conflicting evidence",
      text: "The code says something different from the memory or requirement. Review before trusting either.",
      badgeClass: "badge-mismatch",
      dotClass: "bg-bronze",
    },
    {
      name: "unfound",
      title: "No evidence located",
      text: "The claim may be true elsewhere, but Saphene could not find a defensible trace in the target.",
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
          <p className="max-w-[420px] text-base leading-relaxed text-muted">
            Colors help you scan instantly. Labels, icons, and citations make the result accessible and defensible.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {verdicts.map((item) => (
            <div key={item.name} className="facet-card p-6 flex gap-5 items-start">
              <span className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ${item.dotClass}`} />
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-mono text-lg font-bold text-ink uppercase tracking-wide">{item.name}</h3>
                  <span className={`badge ${item.badgeClass}`}>verdict</span>
                </div>
                <p className="mt-1 font-semibold text-sm text-sage">{item.title}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted font-sans">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CapabilitiesSection() {
  const items = [
    "Memory modules and agent conversation logs",
    "SRS requirements, PDFs, and design docs",
    "Repository source code and Prisma/SQL schemas",
    "CLI commands, MCP server, and GitHub Actions",
    "Stable claim IDs and deterministic ledgers",
    "Reviewer-persona audits with AST receipts",
  ];

  return (
    <section id="capabilities" className="bg-bg py-24 border-b border-line">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <p className="mono-label text-green">Product Capabilities</p>
            </div>
            <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
              Built for surfaces where truth gets lost.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              From a capstone proposal to a production repository, Saphene follows the claim across every evidence surface that matters.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
              <div key={item} className="border-b border-line py-4 flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-amber">0{index + 1}</span>
                <span className="text-sm font-medium text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Studies / Proofs */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div id="case-study" className="facet-card p-8">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <p className="mono-label text-amber">Case study / Agapay</p>
            </div>
            <h3 className="mt-4 font-mono text-2xl font-bold text-ink">
              A rich project that needed a witness.
            </h3>
            <p className="mt-4 leading-relaxed text-muted text-sm font-sans">
              Agapay had ambitious requirements, detailed documentation, and a repository full of promises.
              It did not have Saphene. The case study shows what an evidence pass can reveal before a project ships.
            </p>
            <a href="#demo" className="mt-6 inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-amber hover:underline">
              <span>Run the Agapay demo</span>
              <span>↓</span>
            </a>
          </div>

          <div className="facet-card p-8">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <p className="mono-label text-sage">Proof of discipline</p>
            </div>
            <h3 className="mt-4 font-mono text-2xl font-bold text-ink">
              Still don't believe us?
            </h3>
            <p className="mt-4 leading-relaxed text-muted text-sm font-sans">
              We Saphene'd Saphene itself. Its docs, examples, workflows, and code are all claims that can be checked against the repository.
            </p>
            <a
              href="https://github.com/Jamespino20/Saphene"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-sage hover:underline"
            >
              <span>Inspect the repository</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function IntegrationSection() {
  return (
    <section id="integration" className="bg-surface py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <p className="mono-label text-green">Developer Integration</p>
            </div>
            <h2 className="mt-4 font-mono text-3xl sm:text-5xl font-bold tracking-tight text-ink">
              Meet developers where they already work.
            </h2>
            <p className="mt-5 max-w-[600px] text-lg leading-relaxed text-muted">
              Start with a CLI command. Bring the same engine into an agent through MCP.
              Gate the next pull request with a ledger diff.
            </p>

            <div className="mt-8 rounded-2xl border border-line-strong bg-bg p-6 font-mono text-xs sm:text-sm leading-8 shadow-xl">
              <p>
                <span className="text-amber">$</span>{" "}
                <span className="text-ink">npm run bridge -- claims.md --repo ./app</span>
              </p>
              <p className="text-muted">
                → <span className="text-sage font-bold">10 claims</span> / <span className="text-green">9 matched</span> / <span className="text-amber">1 partial</span>
              </p>
              <p className="mt-2">
                <span className="text-amber">$</span>{" "}
                <span className="text-ink">npm run review -- --claims claims.md</span>
              </p>
              <p className="text-sage font-semibold">
                → PR gate: evidence ledger is clean [PASS]
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2 p-8 shadow-xl">
            <span className="mono-label text-amber text-xs block">Development Roadmap</span>
            {[
              ["Now", "CLI, memory adapter, bridge, ledger, drift detection"],
              ["Next", "Paper adapter, MCP server, GitHub Action PR gate"],
              ["Direction", "Desktop workspace and live agent sidecar plugin"],
            ].map(([stage, text]) => (
              <div key={stage} className="border-b border-line py-5 last:border-0">
                <span className="font-mono text-xs font-bold text-sage uppercase">{stage}</span>
                <p className="mt-1.5 font-semibold text-sm text-ink">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
