# ISO/IEC 26514 Working Draft — Saphene Interpretation

**Standard:** ISO/IEC 26514 (systems/software information for users — design & development of user documentation)
**Status:** drafting · 2026-11-03 · in scope per specs/srs-traceability.md §7
**Purpose:** Turn 26514's documentation-design principles into checks Saphene can run against itself and other CLI tools. A tool whose own help is incomplete cannot credibly audit documentation drift elsewhere.

> Scope note: this is Saphene's working interpretation for heuristic checks, not a certification claim. Clause numbers below are Saphene drafting labels (`SAPH-26514-*`), mapped to 26514 themes.

---

## Check 1 — Command coverage (SAPH-26514-01, theme: completeness)

Every user-invokable command MUST have:
- a one-line help entry (`saphene help`),
- a long-form guide (`saphene guide <command>`),
- at least one runnable example,
- a documented exit code.

**Automated:** `saphene guide --check` verifies all three artifacts exist for every command and fails the run if any are missing. This is the dogfood check — Saphene audits its own user information first.

## Check 2 — Error messages state the fix (SAPH-26514-02, theme: task orientation)

Every error MUST name the recovery action, not just the failure:
- bad: `Target not found: ./app`
- good: `Target not found: ./app (check the path, or run init first)`

**Automated:** heuristic scan — error strings should contain a verb phrase (`run`, `check`, `use`, `see`). Advisory only; model review judges tone.

## Check 3 — Examples are runnable (SAPH-26514-03, theme: accuracy)

Every example in help/guides MUST be copy-paste runnable against the current build. Stale flags in examples are documentation drift — the exact class of defect Saphene exists to catch.

**Automated:** `saphene guide <command>` examples are extracted and smoke-parsed (flags exist, argument counts match). Full execution is left to CI.

## Check 4 — No unexplained jargon modes (SAPH-26514-04, theme: minimalism)

Modes that change behavior (`--no-model`, `--code-only`) MUST be explained where they appear — one clause minimum. A flag the user cannot reason about is an undocumented control.

## Mapping to Saphene controls

| Draft check | Saphene control | Enforced by |
|---|---|---|
| SAPH-26514-01 coverage | SAPH-DOC-01 | `guide --check` |
| SAPH-26514-02 fix-stating errors | (advisory) | audit Business-Flow Analyst brief |
| SAPH-26514-03 runnable examples | (advisory) | CI smoke |
| SAPH-26514-04 explained modes | (advisory) | guide text review |

Advisory checks ride in persona briefs so the model reviewer can apply judgment; only coverage (Check 1) is a hard automated gate.
