import { useState } from "react";

const sections = [
  ["quickstart", "Quickstart"],
  ["walkthrough", "End-to-End Walkthrough"],
  ["concepts", "Core Concepts"],
  ["commands", "CLI Reference"],
  ["claims", "Claims Format"],
  ["ledger", "Ledger & Drift"],
  ["audit", "Audit Panel"],
  ["mcp", "MCP Setup"],
  ["model", "Model Setup"],
  ["actions", "GitHub Actions"],
  ["faq", "FAQ"],
];

const commands = [
  ["saphene init", "Scaffold a memory directory with starter claims."],
  ["saphene verify", "Verify one file against itself or a repository."],
  ["saphene bridge", "Verify a structured claims file against target repositories."],
  ["saphene memory", "Audit a memory directory and compare its ledger."],
  ["saphene consistency", "Check claims from multiple documents against each other."],
  ["saphene profile", "Run project-configured mechanical checks beside claim verification."],
  ["saphene audit", "Run the reviewer-persona code and business-flow panel."],
  ["saphene review", "Gate a PR against a committed evidence baseline."],
  ["saphene mcp", "Run the MCP server for coding agents."],
  ["saphene guide", "Full walkthrough for any command; --check verifies guide coverage."],
  ["saphene test", "Run the deterministic self-test suite."],
];

/**
 * Interactive Code snippet box with copy-to-clipboard functionality
 */
function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(children);
    } catch {
      // Clipboard access denied or unavailable (non-secure context, permissions). No-op.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={handleCopy}
          className="rounded-lg border border-line-strong bg-surface px-2.5 py-1 font-mono text-xs text-muted hover:border-sage hover:text-sage transition-all opacity-80 group-hover:opacity-100 shadow-sm"
          title="Copy code to clipboard"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl border border-line-strong bg-surface-2 p-5 font-mono text-xs sm:text-sm leading-relaxed text-muted shadow-lg">
        <code className="text-ink">{children}</code>
      </pre>
    </div>
  );
}

export default function DocsApp() {
  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-emerald/30 selection:text-sage">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-md py-4">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6">
          <a href="./index.html" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-surface border border-line-strong p-1 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src="./saphene.svg" alt="Saphene" className="h-full w-full object-contain" />
            </div>
            <span className="font-mono text-base font-bold tracking-tight text-ink group-hover:text-sage transition-colors">
              saphene<span className="text-amber">_</span>
            </span>
          </a>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 font-mono text-[11px] sm:text-xs text-muted">
            <a className="hover:text-sage transition-colors" href="./index.html">← Back to Landing</a>
            <a className="hover:text-amber transition-colors" href="./index.html#demo">Live Demo</a>
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2.5 sm:px-3 py-1.5 font-semibold text-ink hover:border-amber hover:text-amber"
              href="https://github.com/Jamespino20/Saphene"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 1.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              <span>GitHub</span>
              <span className="text-muted text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Documentation Grid */}
      <main className="mx-auto grid max-w-[1180px] gap-12 px-6 py-14 lg:grid-cols-[230px_1fr]">
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-2.5 border-l border-line pl-4 text-xs font-mono">
            <span className="mono-label text-[10px] text-amber block mb-3">Documentation Index</span>
            {sections.map(([id, label]) => (
              <a
                key={id}
                className="block text-muted hover:text-sage hover:translate-x-1 transition-all py-1 font-medium"
                href={`#${id}`}
              >
                {label}
              </a>
            ))}
          </div>
        </aside>

        {/* Documentation Content */}
        <article className="max-w-[820px] space-y-16">
          <header className="border-b border-line pb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-3 py-1 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <p className="mono-label text-sage text-[10px]">Technical Documentation / v0.1.0</p>
            </div>
            <h1 className="font-mono text-4xl sm:text-6xl font-bold tracking-tight text-ink">
              Evidence over memory.
            </h1>
            <p className="mt-5 max-w-[680px] text-lg leading-relaxed text-muted font-sans">
              Saphene converts claims made in README files, architectural specs, and AI agent memory
              into verifiable citations backed by code. Every verdict points directly back to a file and line.
            </p>
          </header>

          {/* Quickstart */}
          <section id="quickstart" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <h2 className="font-mono text-2xl font-bold text-ink">Quickstart</h2>
            </div>
            <Code>{`git clone https://github.com/Jamespino20/Saphene.git
cd Saphene
npm install
npm run init -- --memory-dir ./memory
npm run bridge -- examples/agapay-claims.md --repo D:/Projects/Agapay
npm test`}</Code>
            <p className="text-sm text-muted font-sans leading-relaxed">
              No proprietary API key required. The deterministic parser, AST scanner, and regex-evidence verification operate entirely offline with <code className="font-mono text-sage text-xs">--no-model</code>.
            </p>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Watch the 1:55 product film: <a className="font-mono text-xs text-amber hover:underline" href="https://youtu.be/t-gLcqjEDbw" target="_blank" rel="noopener noreferrer">youtu.be/t-gLcqjEDbw</a>
            </p>
          </section>

          {/* Reviewer Recommended: Complete End-to-End Walkthrough */}
          <section id="walkthrough" className="space-y-6 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <h2 className="font-mono text-2xl font-bold text-ink">Complete End-to-End Walkthrough</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Here is the complete lifecycle of how Saphene catches drift between an agent's memory and actual repository code:
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div className="facet-card p-5">
                <span className="text-sage font-bold block mb-1">STEP 1: A memory claim is asserted</span>
                <p className="text-muted font-sans text-xs">
                  A coding agent states: "The user database uses a schema-per-tenant strategy with tenant_id indices."
                </p>
              </div>

              <div className="facet-card p-5">
                <span className="text-sage font-bold block mb-1">STEP 2: Saphene imports and hashes the claim</span>
                <p className="text-muted font-sans text-xs">
                  Saphene assigns a deterministic ID <code className="text-amber">clm_9a4f21</code> and identifies expected evidence hints: <code className="text-sage">tenant_id, schema, prisma</code>.
                </p>
              </div>

              <div className="facet-card p-5">
                <span className="text-sage font-bold block mb-1">STEP 3: Repository AST and files are scanned</span>
                <p className="text-muted font-sans text-xs">
                  The bridge scanner parses <code className="text-ink">prisma/schema.prisma</code> and identifies the exact line matching the claim.
                </p>
              </div>

              <div className="facet-card p-5">
                <span className="text-sage font-bold block mb-1">STEP 4: A verified receipt and verdict are generated</span>
                <p className="text-muted font-sans text-xs">
                  Verdict: <span className="badge badge-matched">MATCHED</span>. Receipt: <code className="receipt-tag">prisma/schema.prisma:18 @@index([tenant_id])</code>. Recorded to <code className="text-ink">.saphene/ledger.json</code>.
                </p>
              </div>

              <div className="facet-card p-5 border-amber/40 bg-amber/5">
                <span className="text-amber font-bold block mb-1">STEP 5: A subsequent code change introduces drift</span>
                <p className="text-muted font-sans text-xs">
                  A developer deletes the index or removes tenant isolation in PR #142 to simplify a migration.
                </p>
              </div>

              <div className="facet-card p-5 border-bad/40 bg-bad/10">
                <span className="text-bad font-bold block mb-1">STEP 6: The next verification run catches the regression</span>
                <p className="text-muted font-sans text-xs">
                  Running <code className="text-bad">npm run review</code> detects that claim <code className="text-amber">clm_9a4f21</code> lost its citation receipt in commit <code className="text-ink">e7b81f9</code>. Status flips to <span className="badge badge-unfound">UNFOUND / DRIFT</span> and the GitHub Actions PR gate fails with exit code 1.
                </p>
              </div>
            </div>
          </section>

          {/* Concepts */}
          <section id="concepts" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <h2 className="font-mono text-2xl font-bold text-ink">Core Concepts</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Claim", "An atomic, testable statement paired with expected literal evidence strings."],
                ["Verdict", "One of 4 verified states: matched, partial, unfound, or mismatch."],
                ["Ledger", "Persistent claims & receipts saved deterministically to .saphene/ledger.json."],
                ["Drift", "An evidentiary regression where previously validated claims stop passing."],
              ].map(([title, text]) => (
                <div key={title} className="facet-card p-5">
                  <h3 className="font-mono text-base font-bold text-sage">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted font-sans">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Commands */}
          <section id="commands" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <h2 className="font-mono text-2xl font-bold text-ink">CLI Command Reference</h2>
            </div>
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line-strong bg-surface">
              {commands.map(([command, text]) => (
                <div key={command} className="grid gap-2 p-4 sm:grid-cols-[200px_1fr] sm:items-center">
                  <code className="font-mono text-xs font-semibold text-sage">{command}</code>
                  <span className="text-xs text-muted font-sans">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Claims format */}
          <section id="claims" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <h2 className="font-mono text-2xl font-bold text-ink">Claims File Format</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Evidence hints must be literal identifiers, table names, function names, or exact phrases:
            </p>
            <Code>{`- Multi-tenant isolation uses a schema-per-tenant strategy.
  category: srs | srsClause: 6.1 | requirementType: security
  evidence: tenant_id, schema, Prisma proxy`}</Code>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Negative claims use <code className="font-mono text-sage text-xs">polarity: negative</code> — absence becomes <span className="badge badge-matched">matched</span>,
              strong verb-bearing evidence or two corroborating hints become <span className="badge badge-mismatch">mismatch</span>, and a single weak noun/path token becomes <span className="badge badge-partial">partial</span>. Future claims use <code className="font-mono text-sage text-xs">status: planned</code> and
              verify against the plan document. Add <code className="font-mono text-sage text-xs">scope:</code> path fragments to limit a search,
              and keep entity aliases/distinct names in <code className="font-mono text-sage text-xs">.saphene/aliases.json</code>.
            </p>
          </section>

          {/* Ledger & Drift */}
          <section id="ledger" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <h2 className="font-mono text-2xl font-bold text-ink">Ledger & Drift Detection</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Claim IDs are deterministic SHA hashes of their source document and statement text. Runs compare the current AST receipt against the prior ledger baseline.
            </p>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["matched", "Supported by code", "badge-matched", "bg-sage"],
                ["partial", "Incomplete TODO", "badge-partial", "bg-amber"],
                ["mismatch", "Conflicting AST", "badge-mismatch", "bg-bronze"],
                ["unfound", "No evidence located", "badge-unfound", "bg-bad"],
              ].map(([status, label, badge, dot]) => (
                <div key={status} className="facet-card p-4 font-mono text-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <span className={`badge ${badge}`}>{status}</span>
                  </div>
                  <span className="text-[11px] text-muted">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Audit panel */}
          <section id="audit" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <h2 className="font-mono text-2xl font-bold text-ink">The Audit Panel</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Run focused reviewer personas (Security Engineer, Performance Engineer, Business-Flow Analyst, Maintainability Reviewer) across the repository:
            </p>
            <Code>{`npm run audit -- --repo D:/Projects/Agapay --update-ledger
npm run audit -- --repo D:/Projects/Agapay --focus security`}</Code>
          </section>

          {/* MCP */}
          <section id="mcp" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <h2 className="font-mono text-2xl font-bold text-ink">MCP Server for Agents</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Exposes <code className="font-mono text-sage text-xs">saphene_bridge</code>, <code className="font-mono text-sage text-xs">saphene_memory</code>, <code className="font-mono text-sage text-xs">saphene_verify</code>, <code className="font-mono text-sage text-xs">saphene_consistency</code>, and <code className="font-mono text-sage text-xs">saphene_profile</code> via Model Context Protocol so an agent can verify its claims before committing code.
            </p>
            <Code>{`npm run mcp`}</Code>
          </section>

          {/* Model configuration */}
          <section id="model" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <h2 className="font-mono text-2xl font-bold text-ink">Model Configuration</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Saphene speaks to <em>any</em> OpenAI-compatible <code className="font-mono text-sage text-xs">chat/completions</code> endpoint.
              Name a primary provider and an optional fallback provider — different vendors, same contract.
              If the primary fails after retries, requests cross over automatically. Meta sits first here only because this build is a Meta deliverable:
            </p>
            <Code>{`# Primary provider (any OpenAI-compatible endpoint)
MODEL_BASE_URL=<primary base URL>
MODEL_API_KEY=<primary key>
MODEL_NAME=<primary model>

# Fallback provider (optional, any OpenAI-compatible endpoint)
MODEL_FALLBACK_BASE_URL=<fallback base URL>
MODEL_FALLBACK_API_KEY=<fallback key>
MODEL_FALLBACK_MODEL=<fallback model>`}</Code>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Worked example — this deployment (Meta primary, Google fallback):
            </p>
            <Code>{`MODEL_BASE_URL=https://api.meta.ai/v1
MODEL_NAME=muse-spark-1.3-contributor
MODEL_FALLBACK_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
MODEL_FALLBACK_MODEL=gemini-3.5-flash`}</Code>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Any vendor serving <code className="font-mono text-sage text-xs">{"POST {base}/chat/completions"}</code> with Bearer auth
              and <code className="font-mono text-sage text-xs">{"{choices[0].message.content}"}</code> plugs straight in — no adapter.
              Standard and Contributor tiers are just model names (<code className="font-mono text-sage text-xs">muse-spark-1.3</code> vs <code className="font-mono text-sage text-xs">muse-spark-1.3-contributor</code>).
              Every model path is optional: <code className="font-mono text-amber text-xs">--no-model</code> runs fully offline and deterministically.
              Endpoint reference: <span className="font-mono text-xs text-sage">dev.meta.ai/docs</span>.
            </p>
          </section>

          {/* GitHub Actions */}
          <section id="actions" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <h2 className="font-mono text-2xl font-bold text-ink">GitHub Actions PR Gate</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Drop Saphene into CI to fail PRs whenever a claim loses its verified receipt. Example workflows are available in <code className="font-mono text-amber text-xs">.github/workflows/verify.yml</code>.
            </p>
          </section>

          {/* FAQ */}
          <section id="faq" className="space-y-6 pt-4 border-t border-line">
            <h2 className="font-mono text-2xl font-bold text-ink">Frequently Asked Questions</h2>
            <div className="space-y-5">
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Does Saphene replace my coding agent?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No. Saphene is the external validation referee: it verifies what your agent, specifications, and docs claim against what the codebase can actually prove.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Why is Agapay used as the primary case study?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Agapay was an ambitious fintech project with extensive documentation and requirements, but suffered from silent feature drift. It represents the exact class of software Saphene is designed to defend.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Which models does Saphene use?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Any OpenAI-compatible provider — this deployment runs Meta Muse Spark (<code className="font-mono text-sage text-xs">muse-spark-1.3-contributor</code>) as primary
                  with Google Gemini as the automatic fallback. Model calls are optional throughout —
                  pass <code className="font-mono text-amber text-xs">--no-model</code> for fully offline, deterministic verification.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">How do I run Saphene without calling source files?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Packaged installs expose a real <code className="font-mono text-sage text-xs">saphene</code> bin: <code className="font-mono text-sage text-xs">saphene bridge claims.md --repo ./app</code>.
                  In a source clone, use <code className="font-mono text-sage text-xs">npx tsx saphene bridge ...</code> — no <code className="font-mono text-xs">src/cli.ts</code> paths and no npm-script relay.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Why did everything come back unfound?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Usually one of three things: the claim has no literal evidence hints, the target repo was not passed, or prose/testimony was excluded.
                  Add <code className="font-mono text-sage text-xs">evidence: identifier, path/to/file.ts, Exact Phrase</code>, pass <code className="font-mono text-sage text-xs">--repo</code>,
                  and use <code className="font-mono text-amber text-xs">--code-only</code> when only implementation should count.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Which command should I use?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  One file against itself: <code className="font-mono text-sage text-xs">verify memory</code>. One file against a repo: <code className="font-mono text-sage text-xs">verify paper --repo</code>.
                  Structured claims/SRS file: <code className="font-mono text-sage text-xs">bridge</code>. Whole memory directory: <code className="font-mono text-sage text-xs">memory</code>.
                  Documents against each other: <code className="font-mono text-sage text-xs">consistency</code>.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Where does the ledger live?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Memory audits always write <code className="font-mono text-sage text-xs">&lt;memory-dir&gt;/.saphene/ledger.json</code>, even when zero claims are ledgered.
                  Bridge writes a JSON baseline when <code className="font-mono text-sage text-xs">--out</code> ends in <code className="font-mono text-xs">.json</code>; review diffs against that baseline.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">What does <code className="font-mono text-sage text-xs">useModel</code> actually change?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Extraction only. With a model, Saphene can infer claims and evidence hints from freeform prose. Without one, structured claim blocks win and deterministic prose extraction runs.
                  Verdicts still come from the evidence search either way.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">What does a negative <span className="badge badge-matched">matched</span> mean?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  The forbidden evidence was absent inside the declared scope. It is scoped absence, not universal proof.
                  Strong verb-bearing evidence, or two corroborating hints, becomes <span className="badge badge-mismatch">mismatch</span>;
                  one weak noun/path token becomes <span className="badge badge-partial">partial</span> instead of inverting the claim.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Why didn't a moved line count as drift?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Ledgers store the verbatim anchor quote beside the file:line location. If the same anchor moves to a new line,
                  Saphene reports it as relocated. Drift is reserved for verdict regressions.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Does Saphene ship style rules?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No built-in taste. The mechanical profile is project-owned JSON: length bands, repeated-term budgets,
                  quote balance, paragraph ceilings, and cross-file n-grams only run when your config asks for them.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Is Saphene a SonarQube, Semgrep, or Snyk replacement?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No. Those tools are mature static-analysis and vulnerability platforms. Saphene sits above them:
                  it verifies whether requirements, documentation, specifications, and agent memory still match the code.
                  Semgrep can tell you code matches known bad patterns; Saphene tells you whether the claim about the code still has evidence.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Can Saphene replace SAST, SCA, or a security audit?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No. Saphene is not a substitute for SAST, dependency/SCA scanning, container or IaC scanning, penetration testing,
                  or a qualified security review. Its audit panel can surface review candidates with receipts, but scanner-grade
                  dataflow, taint analysis, and vulnerability intelligence are out of scope.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">How accurate are Saphene verdicts?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  Heuristic verdicts are literal evidence checks: strong for identifiers, paths, table names, and exact phrases;
                  weak for paraphrase and semantics. Model-backed extraction and audit findings can contain false positives or miss issues.
                  Treat every verdict as a receipt to inspect, not as proof beyond the cited evidence.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Does <span className="badge badge-matched">matched</span> mean a claim is true?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  It means the expected evidence was located in the searched scope. It does not prove runtime behavior, correctness,
                  security, performance, or compliance. A matched TODO, comment, mock, or stale document can still mislead — open the receipt.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Does <span className="badge badge-unfound">unfound</span> mean a claim is false?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No. It means Saphene did not locate the expected evidence in the searched files. The implementation may use different names,
                  live outside the target scope, be generated at runtime, or be described with paraphrased evidence hints.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Are Saphene's ISO references a compliance certification?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No. Saphene maps findings and controls to standards such as ISO/IEC 25010, ISO/IEC 27002 themes, ISO/IEC/IEEE 29148,
                  and its ISO/IEC 26514 working interpretation for traceability. That mapping supports review organization;
                  it is not certification, accreditation, or a claim that a repository complies with any standard.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Are cross-document consistency results definitive?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No. Consistency checks are deterministic candidate finders for negations, incompatible assignments, access conflicts,
                  identity conflicts, and duplicate IDs. They require human review; literary language, aliases, chronology,
                  and intentional unreliable narration can all create false candidates.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">What are the limits of <code className="font-mono text-amber text-xs">--no-model</code>?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  It is deterministic and offline, but literal. It will miss paraphrases, inferred behavior, generated code,
                  and evidence hidden behind indirection. Use model extraction when you need broader claim discovery,
                  and deterministic mode when reproducibility matters more than recall.
                </p>
              </div>
              <div className="facet-card p-6">
                <h3 className="font-mono text-base font-semibold text-ink">Can Saphene guarantee no drift or no vulnerabilities?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted font-sans">
                  No tool can honestly guarantee that. Saphene reduces a specific risk: confident statements outliving their evidence.
                  It does not guarantee secure, correct, compliant, or production-ready software.
                </p>
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Docs Footer */}
      <footer className="border-t border-line bg-bg py-8 mt-20">
        <div className="mx-auto flex max-w-[1180px] justify-between items-center px-6 text-xs text-muted font-mono">
          <span>SAPHENE DOCUMENTATION / CLARITY THROUGH EVIDENCE</span>
          <a href="./index.html" className="text-sage hover:underline">Return to Landing Page →</a>
        </div>
      </footer>
    </div>
  );
}
