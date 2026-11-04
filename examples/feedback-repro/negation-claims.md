# Negation gate repro

- The project never edits packaging assets.
  category: srs | srsClause: 10.1 | localId: NEG-001 | requirementType: behavior | priority: mandatory
  polarity: negative
  evidence: packaging/

- The project never serves inbound traffic.
  category: srs | srsClause: 10.2 | localId: NEG-002 | requirementType: behavior | priority: mandatory
  polarity: negative
  evidence: https://pypi.org

- The runtime is not OS-held.
  category: srs | srsClause: 10.3 | localId: NEG-003 | requirementType: behavior | priority: mandatory
  polarity: negative
  evidence: os

- The project never sends receipt email.
  category: srs | srsClause: 10.4 | localId: NEG-004 | requirementType: behavior | priority: mandatory
  polarity: negative
  evidence: sendReceiptEmail, receipt email

- No provider key was configured.
  category: srs | srsClause: 10.8 | localId: NEG-008 | requirementType: behavior | priority: mandatory
  polarity: negative
  evidence: provider key, configured

- The checksum uses SHA-256.
  category: srs | srsClause: 10.5 | localId: NEG-005 | requirementType: functional | priority: mandatory
  evidence: SHA-256

- The project is legally compliant in all jurisdictions.
  category: srs | srsClause: 10.6 | localId: NEG-006 | requirementType: constraint | priority: optional
  evidence: legal compliance

- The published artifact checksum is 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef.
  category: srs | srsClause: 10.7 | localId: NEG-007 | requirementType: constraint | priority: optional
  evidence: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
