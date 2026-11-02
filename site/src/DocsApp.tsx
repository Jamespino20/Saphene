const sections = [
  ["quickstart", "Quickstart"],
  ["concepts", "Concepts"],
  ["commands", "Commands"],
  ["claims", "Claims file format"],
  ["ledger", "Ledger and drift"],
  ["audit", "The audit panel"],
  ["mcp", "MCP setup"],
  ["actions", "GitHub Actions"],
  ["cycle", "The continuous loop"],
  ["faq", "FAQ"],
];

const commands = [
  ["npm run init", "Scaffold a memory directory with starter claims."],
  ["npm run verify", "Verify one file's claims against evidence."],
  ["npm run bridge", "Verify claims against external target repositories."],
  ["npm run memory", "Audit a memory directory and compare its ledger."],
  ["npm run audit", "Run the reviewer-persona code and business-flow panel."],
  ["npm run review", "Gate a PR against a committed evidence baseline."],
  ["npm run mcp", "Run the standard MCP server for coding agents."],
  ["npm test", "Run the deterministic 7-check self-test suite."],
];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-line-strong bg-surface-2 p-5 font-mono text-xs sm:text-sm leading-7 text-muted shadow-lg">
      <code className="text-ink">{children}</code>
    </pre>
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
          <div className="flex items-center gap-5 font-mono text-xs text-muted">
            <a className="hover:text-sage transition-colors" href="./index.html">← Back to Landing</a>
            <a className="hover:text-amber transition-colors" href="./index.html#demo">Live Demo</a>
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 font-semibold text-ink hover:border-amber hover:text-amber"
              href="https://github.com/Jamespino20/Saphene"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>GitHub</span>
              <span className="text-muted text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Documentation Grid */}
      <main className="mx-auto grid max-w-[1180px] gap-12 px-6 py-14 lg:grid-cols-[220px_1fr]">
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-2 border-l border-line pl-4 text-xs font-mono">
            <span className="mono-label text-[10px] text-amber block mb-3">Documentation Index</span>
            {sections.map(([id, label]) => (
              <a
                key={id}
                className="block text-muted hover:text-sage hover:translate-x-1 transition-all py-1"
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
          </section>

          <section id="concepts" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
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

          <section id="commands" className="space-y-4">
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

          <section id="claims" className="space-y-4">
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
          </section>

          <section id="ledger" className="space-y-4">
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

          <section id="audit" className="space-y-4">
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

          <section id="mcp" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <h2 className="font-mono text-2xl font-bold text-ink">MCP Server for Agents</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Exposes <code className="font-mono text-sage text-xs">saphene_bridge</code>, <code className="font-mono text-sage text-xs">saphene_memory</code>, and <code className="font-mono text-sage text-xs">saphene_verify</code> via Model Context Protocol so an agent can verify its claims before committing code.
            </p>
            <Code>{`npm run mcp`}</Code>
          </section>

          <section id="actions" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              <h2 className="font-mono text-2xl font-bold text-ink">GitHub Actions PR Gate</h2>
            </div>
            <p className="text-sm text-muted font-sans leading-relaxed">
              Drop Saphene into CI to fail PRs whenever a claim loses its verified receipt. Example workflows are available in <code className="font-mono text-amber text-xs">.github/workflows/verify.yml</code>.
            </p>
          </section>

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
