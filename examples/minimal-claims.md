# Minimal Saphene claims

Use literal evidence hints: identifiers, file paths, table names, config keys,
or exact phrases. Do not paraphrase evidence.

- Saphene extracts structured claims from markdown.
  category: srs | srsClause: 1.1 | localId: SAPH-001 | requirementType: functional | priority: mandatory
  evidence: extractClaims, parseClaimBlocks

- Saphene verifies claims against repository evidence.
  category: srs | srsClause: 1.2 | localId: SAPH-002 | requirementType: functional | priority: mandatory
  evidence: verifyClaim, searchTargets

- Saphene does not use a teleportation transport.
  category: srs | srsClause: 1.3 | localId: SAPH-003 | requirementType: constraint | priority: optional
  polarity: negative
  evidence: teleportTransport

- A future claim can be checked against this plan instead of current code.
  category: srs | srsClause: 1.4 | localId: SAPH-004 | requirementType: functional | priority: recommended
  status: planned
  evidence: futureSapheneClaim
