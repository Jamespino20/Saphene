# Saphene

**Clarity Through Evidence.** CI for what your coding agent remembers.

Saphene turns workspace memory and spec documents into a claim ledger, verifies every claim against real code with grep-verified `file:line` receipts, audits code and business flows with a panel of reviewer personas, and blocks drift — a documented claim that stops being true fails CI and blocks the PR. It runs as GitHub Actions, speaks MCP (VS Code Copilot agent mode, Cursor, Cline, OpenCode), and works on free-tier model APIs with an offline heuristic fallback.

**Demo film (1:55):** https://youtu.be/t-gLcqjEDbw — conflicting AI audits, real VS Code / OpenCode / GitHub Actions runs, and a fully offline `--no-model` proof.

```
matched ✔   partial ~   unfound ✗   — every verdict carries a receipt
```

## How it works

1. **Claims in.** Your docs, notes, and SRS requirements become structured claims (model-backed extraction, or a simple hand-written format).
2. **Evidence out.** A deterministic grep loop locates (or fails to locate) each claim's expected evidence in the target repo. Anything the model proposes must quote the file verbatim, and the quote is re-verified before it's believed.
3. **Ledger.** Verdicts persist with stable IDs. The next run diffs against the last: `resolved / new / regressed`. A previously-verified claim that stops holding is **drift**.
4. **Enforce.** The GitHub Action fails on drift; the PR gate comments the delta on every pull request; the audit panel files persona-tagged findings with copy-paste fix prompts.

## Commands

| Command | What it does |
| --- | --- |
| `saphene init` | Scaffold a memory directory (`--personal` for category folders, `--memory-dir <path>`) |
| `saphene bridge` | Verify claims in a file against one or more repos (`--repo`, `--code-only`, `--exclude`, `--env`, `--sarif`) |
| `saphene memory` | Audit every `.md` in a memory directory; ledger + drift diff (`--env` for model config) |
| `saphene sweep` | Whole-repo verify loop + one aggregate ledger (`--repo`, `--out`) |
| `saphene consistency` | Check claims from multiple documents against each other for contradictions |
| `saphene profile --config profile.json` | Config-driven mechanical checks beside claim verification (length, term budgets, quotes, n-grams) |
| `saphene audit` | Persona-panel code & business-flow audit; timestamped markdown report with fix prompts (`--report`, `--out-dir`) |
| `saphene review` | PR gate: diff verdicts against a committed baseline ledger |
| `saphene mcp` | Run the MCP server (`saphene_bridge`, `saphene_memory`, `saphene_verify`, `saphene_review`, `saphene_consistency`, `saphene_profile`) |
| `saphene drift` | Inject a drift into a file copy; report detection |
| `saphene test` | Deterministic self-test suite, no model key needed |

## Claims format

Evidence hints are literal strings Saphene can grep for — identifiers, paths,
table names, config keys, or exact phrases. Never paraphrases.

```markdown
- The system calculates delivery dates from the last menstrual period.
  category: srs | srsClause: 5.3.2 | localId: REQ-014 | requirementType: functional | priority: mandatory
  evidence: calculateEDC, lmp_date

- Renier does not know the first experiment was voluntary.
  category: srs | srsClause: 7.1 | localId: PLFG-K-001 | requirementType: behavior | priority: mandatory
  polarity: negative | scope: 02-CHARACTERS.md, 07-Creative.md
  evidence: Renier, voluntary
```

Optional metadata: `polarity: negative` (absence becomes `matched`; strong
verb-bearing evidence or two corroborating hints become `mismatch`; a single
weak noun/path token becomes `partial`), `status: planned|written|locked`
(planned claims verify against the plan document), and `scope:` path fragments.
Per-repo entity rules live in `.saphene/aliases.json`; see
`examples/aliases.example.json` and `examples/minimal-claims.md`.

## Choosing a mode

| Goal | Use |
| --- | --- |
| One file against other lines in itself | `verify <file> memory` |
| One file/README against a repo | `verify <file> paper --repo <dir>` or MCP `saphene_verify` paper mode |
| Structured SRS/claims file against a repo | `bridge` / `saphene_bridge` |
| Whole memory directory + persistent ledger | `memory` / `saphene_memory` (`<memory-dir>/.saphene/ledger.json`) |
| Documents against each other | `consistency` / `saphene_consistency` |
| Style mechanics (fiction/docs) | `profile` / `saphene_profile` |

`useModel: true` lets the configured model infer claims and hints from freeform
prose. `useModel: false` is deterministic: structured claim blocks win, and
factual prose with inferable identifiers is extracted without tables or code
fences. Without hints, a claim is unfound with an explicit “add evidence” citation.

## Quickstart

```bash
git clone https://github.com/Jamespino20/Saphene.git
cd Saphene && npm install

# source-clone entry point (packaged installs expose the `saphene` bin directly)
npx tsx saphene bridge examples/agapay-claims.md --repo D:/Projects/your-repo --code-only

# audit code + business flows with the reviewer panel
npx tsx saphene audit --repo D:/Projects/your-repo --update-ledger

# confirm your install
npx tsx saphene test
```

Model configuration is one `.env` (any OpenAI-compatible endpoint). This
deployment uses Meta Model API (`https://api.meta.ai/v1`) as primary with a
Google fallback — see https://dev.meta.ai/docs :

```
MODEL_BASE_URL=https://api.meta.ai/v1
MODEL_API_KEY=your-meta-key
MODEL_NAME=muse-spark-1.3-contributor
MODEL_FALLBACK_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
MODEL_FALLBACK_API_KEY=your-google-key
MODEL_FALLBACK_MODEL=gemini-3.5-flash
```

## Receipts over vibes

Every verdict ships the evidence that produced it — and the receipts are allowed to be unflattering. From the real audit of a dormant failed project (Agapay, multi-tenant microfinance SaaS):

- README-as-evidence verified itself 10/10 — a spec can testify for itself, so `--code-only` scopes evidence to implementation
- whole-repo mode matched design-mockup noise ("0.4" inside SVG path data, "vouch" matched an issue proposing to *delete* the feature)
- `--code-only` found the schema actually kept its promises: `CompassionActionType`, `GuaranteeStatus`, KYC enums all real
- the audit panel returned 47 findings (13 critical) — including an unauthenticated 2FA-disable path and authorization that checks a role exists but never its value
- and one `partial` receipt matched a TODO comment saying the feature *isn't implemented yet* — shown as-is, so a human catches it in two seconds

Saphene audits itself too: before shipping, the panel found an unrestricted-filesystem path in its own MCP server. The report from that run is committed at `audits/`.

## FAQ

**Why is everything unfound?** Add literal `evidence:` hints, pass the target
repo, and check whether prose was excluded by `--code-only`. A no-hint claim is
unfound by design, with a citation telling you to add evidence.

**Where is the ledger?** Memory audits always write
`<memory-dir>/.saphene/ledger.json`, including a zero-claim ledger. Bridge writes
a JSON baseline when `--out` ends in `.json`.

**What changes with `useModel`?** Extraction only: model mode can infer claims
and hints from freeform prose; heuristic mode is deterministic. Verdicts still
come from evidence search.

**What does negative `matched` mean?** Forbidden evidence was absent inside the
declared `scope:`. Strong verb-bearing evidence, or two corroborating hints,
becomes `mismatch`; one weak noun/path token becomes `partial` instead of
inverting the claim.

**Why isn't a moved line drift?** Ledger entries store the verbatim anchor quote
beside the line hint. Same anchor at a new line is relocated; drift is a verdict
regression.

**Does Saphene ship style rules?** No. Mechanical profiles are project-owned
JSON (`examples/profile.example.json`); Saphene ships no built-in taste.

**Is Saphene a SonarQube, Semgrep, or Snyk replacement?** No. Those are mature
static-analysis and vulnerability platforms. Saphene sits above them: it verifies
whether requirements, documentation, specifications, and agent memory still match
the code. A scanner can flag known bad patterns; Saphene checks whether a claim
about the system still has evidence.

**Can Saphene replace SAST, SCA, or a security audit?** No. Saphene is not a
substitute for SAST, dependency/SCA scanning, container/IaC scanning, penetration
testing, or qualified security review. The audit panel surfaces review candidates
with receipts; scanner-grade dataflow, taint analysis, and vulnerability
intelligence are out of scope.

**Does `matched` mean true?** It means expected evidence was located in the
searched scope. It does not prove runtime behavior, correctness, security,
performance, or compliance. Open the receipt — a matched TODO or stale comment
can still mislead.

**Does `unfound` mean false?** No. It means the expected evidence was not located
in the searched files. Different names, generated code, runtime wiring, or
paraphrased hints can all produce false unfounds.

**Are ISO references certification?** No. Standards mappings organize review and
traceability; they are not certification, accreditation, or proof that a
repository complies with ISO/IEC 25010, ISO/IEC 27002, ISO/IEC/IEEE 29148,
ISO/IEC 26514, or any other standard.

**Are consistency results definitive?** No. Cross-document checks report
potential contradictions for human review. Aliases, chronology, paraphrase, and
intentional unreliable narration can create false candidates.

**What are `--no-model` limits?** Deterministic and offline, but literal. It can
miss paraphrase, inferred behavior, generated code, and indirect evidence.

**Can Saphene guarantee no drift or no vulnerabilities?** No. Saphene reduces
the risk of confident statements outliving their evidence. It does not guarantee
secure, correct, compliant, or production-ready software.

## MCP setup

```json
{
  "mcp": {
    "saphene": {
      "type": "local",
      "command": ["saphene", "mcp"],
      "enabled": true
    }
  }
}
```

In a source clone without a linked bin, use
`["npx", "tsx", "<path-to-Saphene>/saphene.ts", "mcp"]` instead.

## GitHub Actions

Two workflows ship in `.github/workflows/`: `saphene.yml` (push CI — clones target repos, verifies claims, posts verdict tables, fails on drift) and `saphene-review.yml` (pull_request — posts the ledger-delta review comment on every PR). Add `schedule: [{cron: "0 3 * * *"}]` for a nightly audit; the ledger diff means you only hear about what changed.

## Documentation

Full documentation lives at the **[docs site](https://jamespino20.github.io/Saphene/)** — claims format, ledger semantics, MCP setup, the continuous audit loop, and use cases.

## License

MIT — see [LICENSE](LICENSE).
