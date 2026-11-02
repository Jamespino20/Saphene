import { useEffect, useState } from "react";

const SCENARIOS = [
  {
    label: "Capstone team",
    prompt: "Did we actually finish the SRS requirement?",
    answer: "I found a claim in the proposal, but the repository only supports part of it. Saphene recorded the gap instead of letting the memory pass as fact.",
    tag: "partial",
  },
  {
    label: "Solo developer",
    prompt: "The agent said the migration was complete. Is it?",
    answer: "The migration file exists and the table is referenced by the app. The receipt points to schema.sql:42 and migration/004_add_claims.sql:8.",
    tag: "matched",
  },
  {
    label: "Legacy maintainer",
    prompt: "Can I trust the README before changing this service?",
    answer: "Not yet. Two promises are unfound and one contradicts the current implementation. The ledger gives you the exact files to investigate first.",
    tag: "unfound",
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
    <section id="problem" className="border-b border-line bg-bg py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mono-label text-green">The problem</p>
            <h2 className="mt-4 max-w-[560px] font-mono text-4xl font-bold leading-tight tracking-[-.04em] sm:text-5xl">
              Memory moves faster than the repository.
            </h2>
          </div>
          <p className="max-w-[620px] text-lg leading-8 text-muted">
            Agents summarize decisions, teams write requirements, and projects accumulate confident statements. Then the code changes. Saphene turns that uncomfortable gap into a reviewable evidence trail.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-[250px_1fr]">
          <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
            {SCENARIOS.map((item, index) => (
              <button key={item.label} onClick={() => setActive(index)} className={`min-w-[180px] rounded-xl border p-4 text-left transition-colors lg:w-full ${active === index ? "border-deep bg-surface" : "border-line hover:bg-surface"}`}>
                <span className="mono-label text-muted">0{index + 1}</span>
                <span className="mt-3 block font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
            <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
              <span className="font-mono text-xs text-muted">agent-session / context-check</span>
              <span className="rounded-full bg-bg px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-green">{scenario.tag}</span>
            </div>
            <div className="space-y-5 font-mono text-sm leading-7">
              <p><span className="text-bronze">you</span> <span className="text-muted">›</span> {scenario.prompt}</p>
              <p className="rounded-lg border border-line bg-bg p-4"><span className="text-green">saphene</span> <span className="text-muted">›</span> {typed}<span className="terminal-caret ml-1 inline-block h-4 w-1 bg-amber align-middle" /></p>
            </div>
            <div className="mt-8 grid gap-3 text-xs text-muted sm:grid-cols-3">
              <span>claim captured <strong className="text-ink">yes</strong></span>
              <span>evidence searched <strong className="text-ink">repo + docs</strong></span>
              <span>receipt attached <strong className="text-ink">file:line</strong></span>
            </div>
          </div>
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
    <div className="overflow-hidden rounded-2xl border border-[#527b69] bg-[#193a32] text-white shadow-[0_30px_70px_-35px_rgba(25,58,50,.8)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-amber" /><span className="font-mono text-xs text-mint">saphene / verification-run</span></div>
        <span className="font-mono text-[10px] text-mint/60">AGAPAY / 2026-11-01</span>
      </div>
      <div className="grid lg:grid-cols-[1fr_230px]">
        <div className="divide-y divide-white/10">
          {rows.map(([id, claim, status, receipt]) => (
            <div key={id} className="grid gap-3 px-5 py-5 sm:grid-cols-[48px_1fr_auto] sm:items-center">
              <span className="font-mono text-xs text-mint/60">{id}</span>
              <div><p className="text-sm text-white/90">{claim}</p><p className="mt-1 font-mono text-[10px] text-mint/60">{receipt}</p></div>
              <span className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${status === "matched" ? "border-sage/50 text-sage" : status === "partial" ? "border-amber/60 text-amber" : status === "mismatch" ? "border-bronze/60 text-[#f2a787]" : "border-white/30 text-white/60"}`}>{status}</span>
            </div>
          ))}
        </div>
        <aside className="border-t border-white/10 bg-[#214d43] p-5 lg:border-l lg:border-t-0">
          <span className="mono-label text-mint/60">Project integrity</span>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div><strong className="block font-mono text-3xl text-sage">01</strong><span className="text-xs text-mint/70">matched / supported</span></div>
            <div><strong className="block font-mono text-3xl text-amber">01</strong><span className="text-xs text-mint/70">partial / incomplete</span></div>
            <div><strong className="block font-mono text-3xl text-white/70">01</strong><span className="text-xs text-mint/70">unfound / no evidence</span></div>
            <div><strong className="block font-mono text-3xl text-[#f2a787]">01</strong><span className="text-xs text-mint/70">mismatch / conflict</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function ProductSection() {
  return (
    <section id="product" className="bg-bg py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="mono-label text-green">Saphene / verification</p><h2 className="mt-4 font-mono text-4xl font-bold tracking-[-.04em] sm:text-5xl">The claim is not the answer.<br /><span className="text-green">The receipt is.</span></h2></div>
          <p className="max-w-[390px] text-muted">A product view built around claims, verdicts, and the evidence that makes a verdict defensible.</p>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

const STEPS = [
  ["01", "Extract", "Turn memory, docs, and requirements into structured claims.", "claim → evidence hints"],
  ["02", "Find evidence", "Search code, schemas, papers, and project files for receipts.", "grep → read → cite"],
  ["03", "Verify", "Classify support as matched, partial, mismatch, or unfound.", "evidence → verdict"],
  ["04", "Review", "Write the ledger, detect drift, and give the next action.", "verdict → change"],
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="border-y border-line bg-surface py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="max-w-[640px]"><p className="mono-label text-green">How it works</p><h2 className="mt-4 font-mono text-4xl font-bold tracking-[-.04em] sm:text-5xl">A continuous loop for project truth.</h2><p className="mt-5 text-lg leading-8 text-muted">Saphene treats memory as a source of claims, never as proof. Every pass produces an artifact someone else can inspect.</p></div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([number, title, text, command]) => <div key={number} className="relative overflow-hidden rounded-2xl border border-line bg-bg p-6"><div className="gemstone absolute -right-10 -top-10 h-28 w-28 opacity-70" /><span className="relative font-mono text-sm text-green">{number}</span><h3 className="relative mt-12 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{text}</p><code className="mt-6 block border-t border-line pt-4 text-[10px] text-bronze">{command}</code></div>)}
        </div>
      </div>
    </section>
  );
}

export function VerdictsSection() {
  const verdicts = [
    ["matched", "Supported by evidence", "The repository contains the expected implementation. Keep the receipt and move on.", "bg-sage"],
    ["partial", "Incomplete support", "Some evidence exists, but a TODO, missing branch, or unfinished behavior keeps the claim open.", "bg-amber"],
    ["mismatch", "Conflicting evidence", "The code says something different from the memory or requirement. Review before trusting either.", "bg-bronze"],
    ["unfound", "No evidence located", "The claim may be true elsewhere, but Saphene could not find a defensible trace in the target.", "bg-deep"],
  ];
  return <section id="verdicts" className="bg-bg py-24"><div className="mx-auto max-w-[1180px] px-6"><div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mono-label text-green">Verification verdicts</p><h2 className="mt-4 font-mono text-4xl font-bold tracking-[-.04em] sm:text-5xl">Four states. No hand-waving.</h2></div><p className="max-w-[400px] text-muted">Color helps you scan. Labels, icons, and citations make the result accessible and accountable.</p></div><div className="grid gap-4 md:grid-cols-2">{verdicts.map(([name, title, text, color]) => <div key={name} className="flex gap-5 rounded-2xl border border-line bg-surface p-6"><span className={`mt-1 h-4 w-4 shrink-0 rounded-full ${color}`} aria-hidden="true" /><div><h3 className="font-mono text-xl font-bold">{name}</h3><p className="mt-1 font-semibold text-deep">{title}</p><p className="mt-3 text-sm leading-6 text-muted">{text}</p></div></div>)}</div></div></section>;
}

export function CapabilitiesSection() {
  const items = ["Memory modules and markdown", "SRS, PDF, DOCX, and spreadsheets", "Repository code and SQL schemas", "CLI, MCP, and GitHub Actions", "Stable claim IDs and dated ledgers", "Reviewer-persona audits with receipts"];
  return <section id="capabilities" className="bg-deep py-24 text-white"><div className="mx-auto max-w-[1180px] px-6"><div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr]"><div><p className="mono-label text-mint">Product capabilities</p><h2 className="mt-4 font-mono text-4xl font-bold tracking-[-.04em] sm:text-5xl">Built for the surfaces where truth gets lost.</h2><p className="mt-5 text-lg leading-8 text-mint/80">From a capstone proposal to a production repository, Saphene follows the claim across the evidence surfaces that matter.</p></div><div className="grid gap-3 sm:grid-cols-2">{items.map((item, index) => <div key={item} className="border-b border-mint/20 py-4"><span className="mr-3 font-mono text-xs text-amber">0{index + 1}</span><span className="text-mint">{item}</span></div>)}</div></div><div className="mt-20 grid gap-5 md:grid-cols-2"><div id="case-study" className="rounded-2xl border border-mint/20 bg-[#214d43] p-7"><p className="mono-label text-amber">Case study / Agapay</p><h3 className="mt-5 font-mono text-2xl font-bold">A rich project that needed a witness.</h3><p className="mt-4 leading-7 text-mint/80">Agapay had ambitious requirements, detailed documentation, and a repository full of promises. It did not have Saphene. The case study shows what an evidence pass can reveal before a project ships.</p><a href="#demo" className="mt-7 inline-block text-sm font-semibold text-amber hover:underline">Run the Agapay demo ↓</a></div><div className="rounded-2xl border border-mint/20 bg-[#193a32] p-7"><p className="mono-label text-sage">Proof of discipline</p><h3 className="mt-5 font-mono text-2xl font-bold">Still don&apos;t believe us?</h3><p className="mt-4 leading-7 text-mint/80">We Saphene&apos;d Saphene itself. Its docs, examples, workflows, and code are all claims that can be checked against the repository.</p><a href="https://github.com/Jamespino20/Saphene" className="mt-7 inline-block text-sm font-semibold text-sage hover:underline">Inspect the repository ↗</a></div></div></div></section>;
}

export function IntegrationSection() {
  return <section id="integration" className="bg-bg py-24"><div className="mx-auto max-w-[1180px] px-6"><div className="grid gap-12 lg:grid-cols-[1fr_.85fr]"><div><p className="mono-label text-green">Developer integration</p><h2 className="mt-4 font-mono text-4xl font-bold tracking-[-.04em] sm:text-5xl">Meet developers where they already work.</h2><p className="mt-5 max-w-[600px] text-lg leading-8 text-muted">Start with a command. Bring the same engine into an agent through MCP. Gate the next pull request with a ledger diff.</p><div className="mt-8 rounded-2xl border border-line bg-[#193a32] p-5 font-mono text-sm leading-8 text-mint"><p><span className="text-amber">$</span> npm run bridge -- claims.md --repo ./app</p><p className="text-mint/60">→ 10 claims / 9 matched / 1 partial</p><p><span className="text-amber">$</span> npm run review -- --claims claims.md</p><p className="text-sage">→ PR gate: evidence ledger is clean</p></div></div><div className="rounded-2xl border border-line bg-surface p-7"><p className="mono-label text-green">Roadmap</p>{[["Now", "CLI, memory adapter, bridge, ledger, drift detection"], ["Next", "Paper adapter, MCP server, GitHub Action"], ["Direction", "Desktop workspace and coding-agent plugin"],].map(([stage, text]) => <div key={stage} className="border-b border-line py-5 last:border-0"><span className="font-mono text-xs text-bronze">{stage}</span><p className="mt-2 font-semibold">{text}</p></div>)}</div></div></div></section>;
}
