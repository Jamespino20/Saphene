# Fixture claims — matched

- The fixture service exposes a health check endpoint.
  category: srs | srsClause: 1.1 | localId: FIX-001 | requirementType: operational | priority: mandatory
  evidence: healthCheck

- Fixture sessions use JWT tokens scoped by tenant_id.
  category: srs | srsClause: 1.2 | localId: FIX-002 | requirementType: security | priority: mandatory
  evidence: jwt, tenant_id
