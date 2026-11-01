# Saphene

**Clarity Through Evidence.** CI for what your coding agent remembers.

Saphene turns workspace memory and spec documents into a claim ledger, verifies every claim against real code with grep-verified `file:line` receipts, audits code and business flows with a panel of reviewer personas, and blocks drift — a documented claim that stops being true fails CI and blocks the PR. It runs as GitHub Actions, speaks MCP (VS Code Copilot agent mode, Cursor, Cline, OpenCode), and works on free-tier model APIs with an offline heuristic fallback.

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
| `npm run init` | Scaffold a memory directory (`--personal` for category folders, `--memory-dir <path>`) |
| `npm run bridge` | Verify claims in a file against one or more repos (`--repo`, `--code-only`, `--exclude`) |
| `npm run memory` | Audit every `.md` in a memory directory; ledger + drift diff |
| `npm run audit` | Persona-panel code & business-flow audit; timestamped markdown report with fix prompts (`--report`, `--out-dir`) |
| `npm run review` | PR gate: diff verdicts against a committed baseline ledger |
| `npm run mcp` | Run the MCP stdio server (`saphene_bridge`, `saphene_memory`, `saphene_verify`) |
| `npm run drift` | Inject a drift into a file copy; report detection |
| `npm test` | 7-check selftest, no model key needed |

## Quickstart

```bash
git clone https://github.com/Jamespino20/Saphene.git
cd Saphene && npm install

# verify a claims file against a repo (no API key needed)
npm run bridge -- examples/agapay-claims.md --repo D:/Projects/your-repo --code-only

# audit code + business flows with the reviewer panel
npm run audit -- --repo D:/Projects/your-repo --update-ledger

# confirm your install
npm test
```

Model configuration is one `.env` (any OpenAI-compatible endpoint):

```
MODEL_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
MODEL_API_KEY=your-key
MODEL_NAME=gemini-3.5-flash
MODEL_FALLBACK=gemini-3.1-flash-lite
```

## Receipts over vibes

Every verdict ships the evidence that produced it — and the receipts are allowed to be unflattering. From the real audit of a dormant failed project (Agapay, multi-tenant microfinance SaaS):

- README-as-evidence verified itself 10/10 — a spec can testify for itself, so `--code-only` scopes evidence to implementation
- whole-repo mode matched design-mockup noise ("0.4" inside SVG path data, "vouch" matched an issue proposing to *delete* the feature)
- `--code-only` found the schema actually kept its promises: `CompassionActionType`, `GuaranteeStatus`, KYC enums all real
- the audit panel returned 47 findings (13 critical) — including an unauthenticated 2FA-disable path and authorization that checks a role exists but never its value
- and one `partial` receipt matched a TODO comment saying the feature *isn't implemented yet* — shown as-is, so a human catches it in two seconds

Saphene audits itself too: before shipping, the panel found an unrestricted-filesystem path in its own MCP server. The report from that run is committed at `audits/`.

## MCP setup

```json
{
  "mcp": {
    "saphene": {
      "type": "local",
      "command": ["npx", "tsx", "<path-to-Saphene>/src/mcp.ts"],
      "enabled": true
    }
  }
}
```

## GitHub Actions

Two workflows ship in `.github/workflows/`: `saphene.yml` (push CI — clones target repos, verifies claims, posts verdict tables, fails on drift) and `saphene-review.yml` (pull_request — posts the ledger-delta review comment on every PR). Add `schedule: [{cron: "0 3 * * *"}]` for a nightly audit; the ledger diff means you only hear about what changed.

## Documentation

Full documentation lives at the **[docs site](https://jamespino20.github.io/Saphene/)** — claims format, ledger semantics, MCP setup, the continuous audit loop, and use cases.

## License

MIT — see [LICENSE](LICENSE).
