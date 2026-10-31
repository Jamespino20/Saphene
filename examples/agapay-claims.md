# Agapay SRS Claims (failed-project audit)

Source: Agapay README.md (self-describing spec). Target:
github.com/Jamespino20/Agapay — multi-tenant microfinance SaaS, dormant
since May 2026. Question Saphene answers: which promises did the code
actually keep?

- Multi-tenant isolation uses a schema-per-tenant strategy enforced by a custom Prisma proxy.
  category: srs | srsClause: 6.1 | requirementType: security | priority: mandatory
  evidence: proxy.ts, tenant_id, schema

- Trust score is a weighted formula: payment reliability 40%, business health 20%, peer rating 20%, guarantor vouching 20%.
  category: srs | srsClause: 4.1 | requirementType: functional | priority: mandatory
  evidence: 0.4, 0.2, trust

- User sessions are JWT-based and scoped to a specific tenant_id at the middleware level.
  category: srs | srsClause: 9.1 | requirementType: security | priority: mandatory
  evidence: jwt, tenant_id

- A Compassion Policy suspends penalty accumulation and grants grace periods during crises.
  category: srs | srsClause: 4.3 | requirementType: functional | priority: recommended
  evidence: compassion, grace

- Members vouch for one another with a 25% guarantor liability share.
  category: srs | srsClause: 4.2 | requirementType: functional | priority: mandatory
  evidence: vouch, 25

- The trust score spans 1.0 to 5.0 and unlocks an Elite Tier with higher limits.
  category: srs | srsClause: 4.1 | requirementType: functional | priority: recommended
  evidence: elite, trust

- Loan products carry 3% to 5% interest rates with penalty caps at 20%.
  category: srs | srsClause: 4.4 | requirementType: functional | priority: mandatory
  evidence: penalty, interest

- The admin dashboard (Agapay Tanaw) and member app (Agapay Pintig) exist as distinct role surfaces.
  category: srs | srsClause: 3.1 | requirementType: interface | priority: mandatory
  evidence: Tanaw, Pintig

- Row-Level Security prevents cross-tenant data leaks.
  category: srs | srsClause: 6.2 | requirementType: security | priority: mandatory
  evidence: RLS, row-level

- Member onboarding includes multi-layer KYC.
  category: srs | srsClause: 2.1 | requirementType: functional | priority: recommended
  evidence: KYC, kyc
