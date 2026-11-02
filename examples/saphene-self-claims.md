# Saphene SRS Claims (self-target)

- Saphene has a deterministic claim extraction engine.
  category: srs | srsClause: 1.1 | requirementType: functional | priority: mandatory
  evidence: src/extract.ts

- Saphene verifies claims against repository code evidence.
  category: srs | srsClause: 1.2 | requirementType: functional | priority: mandatory
  evidence: src/verify.ts

- Saphene writes dated verdicts back to a claim ledger.
  category: srs | srsClause: 1.3 | requirementType: functional | priority: mandatory
  evidence: src/ledger.ts

- Saphene detects drift between runs.
  category: srs | srsClause: 1.4 | requirementType: functional | priority: mandatory
  evidence: src/drift-harness.ts

- Saphene exposes an MCP server for coding agents.
  category: srs | srsClause: 2.1 | requirementType: interface | priority: mandatory
  evidence: src/mcp.ts

- Saphene runs deterministic self-tests without an API key.
  category: srs | srsClause: 3.1 | requirementType: operational | priority: mandatory
  evidence: src/selftest.ts

- Saphene includes a multi-persona reviewer audit panel.
  category: srs | srsClause: 4.1 | requirementType: functional | priority: recommended
  evidence: src/audit.ts

- Saphene ships a local-first CLI engine with --no-model mode.
  category: srs | srsClause: 5.1 | requirementType: operational | priority: mandatory
  evidence: package.json
