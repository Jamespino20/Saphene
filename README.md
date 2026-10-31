# Saphene

Saphene: Clarity Through Evidence. A claim-ledger engine that verifies
workspace memory against paper and repository evidence.

## Scaffold (this is day-0, Oct 28)

```
src/schema.ts      Claim / Verdict / Evidence types (+ SRS traceability fields)
src/model.ts       OpenAI-compatible client (retry/backoff + fallback chain)
src/extract.ts     Claim extraction (model-backed, heuristic fallback)
src/verify.ts      Evidence loop + verdict engine (+ target search)
src/cli.ts         init / verify / bridge CLI entry point
src/init.ts        Memory directory scaffolding (minimal or --personal template)
src/drift-harness.ts  Inject a drift, re-verify, report detection
claims.example.json  Example claim (AnvilOS README clone URL drift)
examples/matriflow-claims.md  SRS claim file verified against the matriflow repo
```

## Run

```bash
# install
npm install

# create a memory directory (minimal, or --personal for category folders)
npm run init -- --memory-dir ./memory

# typecheck
npm run typecheck

# verify a file against itself (heuristic extraction, no model needed)
npm run verify -- examples/matriflow-claims.md memory --no-model

# bridge: verify SRS claims in a memory file against a repo or paper
npm run bridge -- examples/matriflow-claims.md --repo D:\Projects\matriflow

# audit against implementation code only (specs cannot testify for themselves)
npm run bridge -- examples/agapay-claims.md --repo D:\Projects\Agapay --code-only

# PR review gate: diff verdicts against a committed baseline ledger
npm run review -- --claims examples/matriflow-claims.md --repo D:\Projects\matriflow --ledger .saphene/matriflow.ledger.json

# drift-injection harness
npm run drift -- README.md drifted.md "AnvilOS README clones from github.com/jbespino0920/AnvilOS"
```

## Model configuration

Saphene reads `.env` (gitignored) for the extraction model. Any
OpenAI-compatible endpoint works:

```
MODEL_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
MODEL_API_KEY=<key>
MODEL_NAME=gemini-3.1-flash-lite
MODEL_FALLBACK=gemini-flash-latest
```

Without `.env` the engine falls back to heuristic extraction; pass
`--no-model` to force it. Model calls retry with backoff and fall through
to `MODEL_FALLBACK` on repeated failure.

## Where this fits the plan

- **Oct 28 (done):** scaffold, schema + SRS traceability fields, `init` / `--memory-dir`, model config
- **Oct 29 (done):** model client (retry/backoff + fallback), model-backed extraction, evidence loop, bridge CLI
- **Oct 30:** verified-at dates, proposed patches, MCP server, GitHub Action, drift-injection eval v1

## Notes

- `extract.ts` uses the model when `.env` is present and falls back to a heuristic parser (structured claim blocks first, long-line splitting second). `verify.ts` greps the source in memory mode and external targets in bridge mode; `unfound` stays distinct from `mismatch`.
- Optimize for precision: show the evidence, keep `unfound` distinct from `mismatch`, and flag conflicts for a human instead of auto-overwriting memory.
