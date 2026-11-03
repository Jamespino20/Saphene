# Audit Personalities

Each file defines one reviewer persona for `npm run audit`. The audit panel
loads every `*.md` in this directory at startup; missing or malformed files
fall back to the built-in panel so audits never break.

## Format

```md
# Persona Name          <- display name (first `# ` line)
id: security            <- stable id used in ledgers and reports
focus: a, b, c          <- what this reviewer hunts (becomes the brief)
standards: SAPH-SEC-01  <- standard refs attached to every finding (optional)
                        <- blank line, then free-form guidance appended to the brief
Extended reviewer instructions in plain prose.
```

Add a file to add a reviewer. Remove a file to drop one (the built-ins return).
Keep `id` stable — ledgers key findings by persona id, and renaming one
orphans its history.
