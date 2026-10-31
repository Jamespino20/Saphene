# MatriFlow SRS Claims (bridge test)

These claims were derived from MatriFlow.pdf (CTINFMGL paper) and verified by
hand against github.com/Jamespino20/matriflow on 2026-10-28.

- The system implements TOTP two-factor authentication with backup tokens and enforced setup.
  category: srs | srsClause: 9.1 | requirementType: security | priority: mandatory
  evidence: google_2fa_secret, backup_tokens, TOTP, enforce2FA

- Expected delivery date is calculated from LMP using Naegele's rule.
  category: srs | srsClause: 5.3.2 | requirementType: functional | priority: mandatory
  evidence: calculateEDC, Naegele, lmp_date, estimated_due_date

- The system supports GoTyme as a payment method.
  category: srs | srsClause: 5.1 | requirementType: functional | priority: recommended
  evidence: GoTyme

- The system performs automatic nightly database backups.
  category: srs | srsClause: 6.2 | requirementType: operational | priority: mandatory
  evidence: nightly, backup schedule, mysqldump

- Role-based access control distinguishes admin, doctor, secretary, and patient roles.
  category: srs | srsClause: 9.2 | requirementType: security | priority: mandatory
  evidence: require_role, RoleLayout, 'admin', 'doctor', 'secretary', 'patient'
