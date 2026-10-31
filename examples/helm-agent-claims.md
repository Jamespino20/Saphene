# helm-agent SRS Claims (memory-as-paper correlation test)

Source: D:\AI\Knowledge\Memory\academia\03-SIA-HELM-Capstone.md (hackathon
build record, 2026-10-27 entries). Target: github.com/Jamespino20/helm-agent
(public submission repo).

- The agent is an Express REST server with a default port of 4000.
  category: srs | srsClause: 2.1 | requirementType: operational | priority: mandatory
  evidence: express, PORT, 4000

- The agent writes Return/Damage/Adjustment RMA transactions into the HELM schema via API.
  category: srs | srsClause: 1.1 | requirementType: functional | priority: mandatory
  evidence: RMA, Return, Damage, Adjustment

- A Meta Model API client authenticates with a bearer key.
  category: srs | srsClause: 3.1 | requirementType: interface | priority: mandatory
  evidence: META_MODEL_API_KEY, meta-api

- A SAM 3.1 client handles damage photo analysis.
  category: srs | srsClause: 3.2 | requirementType: interface | priority: mandatory
  evidence: SAM_API_KEY, sam.ts, SAM 3.1

- A Muse Spark reasoner produces RMA eligibility decisions.
  category: srs | srsClause: 3.3 | requirementType: functional | priority: mandatory
  evidence: Muse Spark, reasoning

- A Llama-based drafter writes buyer messages.
  category: srs | srsClause: 3.4 | requirementType: functional | priority: recommended
  evidence: Llama, drafter

- A credit memo generator produces PDF memos.
  category: srs | srsClause: 3.5 | requirementType: functional | priority: recommended
  evidence: jspdf, memo

- The repo carries a stripped Prisma schema covering Product, Supplier, Buyer, Transaction, TransactionItem, and User.
  category: srs | srsClause: 4.1 | requirementType: constraint | priority: mandatory
  evidence: prisma, TransactionItem

- The demo intake flow starts from receipt number 1001.
  category: srs | srsClause: 5.1 | requirementType: functional | priority: recommended
  evidence: 1001, receiptNumber

- All agent-to-HELM authentication uses the AGENT_API_SECRET shared secret.
  category: srs | srsClause: 9.1 | requirementType: security | priority: mandatory
  evidence: AGENT_API_SECRET
