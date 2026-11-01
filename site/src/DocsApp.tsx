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
  ["npm run init", "Scaffold a memory directory."],
  ["npm run verify", "Verify one file's claims."],
  ["npm run bridge", "Verify claims against external repositories."],
  ["npm run memory", "Audit a memory directory and compare its ledger."],
  ["npm run audit", "Run the reviewer-persona code and business-flow panel."],
  ["npm run review", "Gate a PR against a committed baseline."],
  ["npm run mcp", "Run the MCP server for coding agents."],
  ["npm test", "Run the deterministic self-test suite."],
];

function Code({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-xl border border-line bg-[#080b10] p-5 font-mono text-sm leading-7 text-muted">{children}</pre>;
}

export default function DocsApp() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <nav className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
          <a href="./index.html" className="font-mono text-lg font-bold tracking-wide">
            saphene<span className="text-accent">_</span>
          </a>
          <div className="flex items-center gap-5 text-sm text-muted">
            <a className="hover:text-ink" href="./index.html">Home</a>
            <a className="hover:text-ink" href="./index.html#demo">Demo</a>
            <a className="hover:text-ink" href="https://github.com/Jamespino20/Saphene">GitHub</a>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-[1180px] gap-12 px-6 py-14 lg:grid-cols-[210px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-3 border-l border-line pl-5 text-sm text-muted">
            {sections.map(([id, label]) => <a key={id} className="block transition-colors hover:text-accent" href={`#${id}`}>{label}</a>)}
          </div>
        </aside>

        <article className="max-w-[800px] space-y-14">
          <header>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent">Saphene documentation</p>
            <h1 className="font-mono text-[clamp(34px,6vw,58px)] font-bold tracking-tight">Evidence over memory.</h1>
            <p className="mt-5 max-w-[680px] text-lg leading-8 text-muted">
              Saphene turns claims from README files, specs, and agent memory into verifiable evidence. Every verdict points back to the repository.
            </p>
          </header>

          <section id="quickstart">
            <h2>Quickstart</h2>
            <Code>{`git clone https://github.com/Jamespino20/Saphene.git
cd Saphene
npm install
npm run init -- --memory-dir ./memory
npm run bridge -- examples/agapay-claims.md --repo D:/Projects/Agapay
npm test`}</Code>
            <p>No model key is required. The deterministic parser and grep verification still work with <code>--no-model</code>.</p>
          </section>

          <section id="concepts">
            <h2>Concepts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Claim", "A testable statement with literal evidence strings."],
                ["Verdict", "matched, partial, unfound, or mismatch - always with a citation."],
                ["Ledger", "Persistent verdicts stored in .saphene/ledger.json."],
                ["Drift", "A regression where something previously matched stops being true."],
              ].map(([title, text]) => <div key={title} className="rounded-xl border border-line bg-surface p-5"><h3>{title}</h3><p>{text}</p></div>)}
            </div>
          </section>

          <section id="commands">
            <h2>Commands</h2>
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {commands.map(([command, text]) => <div key={command} className="grid gap-2 bg-surface p-4 sm:grid-cols-[190px_1fr]"><code className="text-accent">{command}</code><span>{text}</span></div>)}
            </div>
          </section>

          <section id="claims">
            <h2>Claims file format</h2>
            <p>Evidence should be literal and specific: identifiers, table names, function names, or exact phrases that can be found in the target repository.</p>
            <Code>{`- Multi-tenant isolation uses a schema-per-tenant strategy.
  category: srs | srsClause: 6.1 | requirementType: security
  evidence: tenant_id, schema, Prisma proxy`}</Code>
          </section>

          <section id="ledger">
            <h2>Ledger and drift</h2>
            <p>Claim IDs are deterministic hashes of their source and text. Each run records the status, evidence citation, and timestamp; the next run compares it to the previous ledger.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {["matched", "partial", "unfound"].map((status) => <div key={status} className="rounded-xl border border-line bg-surface p-4 font-mono text-sm"><span className={`mr-2 inline-block h-2 w-2 rounded-full ${status === "matched" ? "bg-accent" : status === "partial" ? "bg-warn" : "bg-bad"}`} />{status}</div>)}
            </div>
          </section>

          <section id="audit">
            <h2>The audit panel</h2>
            <p>Run focused reviewer personas over the codebase. Findings include severity, category, a quote verified against the repository, impact, and a fix direction.</p>
            <Code>{`npm run audit -- --repo D:/Projects/Agapay --update-ledger
npm run audit -- --repo D:/Projects/Agapay --focus security`}</Code>
          </section>

          <section id="mcp">
            <h2>MCP setup</h2>
            <p>The MCP server exposes <code>saphene_bridge</code>, <code>saphene_memory</code>, and <code>saphene_verify</code> so an agent can verify its own claims without leaving its tool loop.</p>
            <Code>{`npm run mcp`}</Code>
          </section>

          <section id="actions">
            <h2>GitHub Actions</h2>
            <p>Clone the target repository, run the bridge or review command, and fail the workflow when a required claim regresses. The repository includes example workflows under <code>.github/workflows</code>.</p>
          </section>

          <section id="cycle">
            <h2>The continuous loop</h2>
            <div className="grid gap-3 sm:grid-cols-4">
              {["Extract", "Verify", "Ledger", "Re-verify"].map((step, index) => <div key={step} className="rounded-xl border border-line bg-surface p-4"><div className="font-mono text-xs text-accent">0{index + 1}</div><h3 className="mt-5">{step}</h3></div>)}
            </div>
          </section>

          <section id="faq">
            <h2>FAQ</h2>
            <h3>Does Saphene replace my coding agent?</h3>
            <p>No. It checks the claims your agent, docs, and specs make against what the repository can actually prove.</p>
            <h3>Why Agapay?</h3>
            <p>Agapay was a failed but comprehensively rich project: exactly the kind of repository where promises, documentation, and implementation can drift apart. It is the case study Saphene was built to expose.</p>
          </section>
        </article>
      </main>
    </div>
  );
}
