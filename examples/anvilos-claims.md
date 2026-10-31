# AnvilOS SRS Claims (paper-to-repo test)

Sources: D:\University\Systems Integration\README.md (repo spec) and
SIA_Capstone_Proposals_FinalContent.md (capstone proposal). Target:
github.com/Jamespino20/AnvilOS.

- AnvilOS implements RFC-compliant TOTP two-factor authentication with a drift window.
  category: srs | srsClause: 9.1 | requirementType: security | priority: mandatory
  evidence: totp, SHA1, drift

- Role-based access control distinguishes SUPERADMIN, ADMIN, and STAFF roles.
  category: srs | srsClause: 9.2 | requirementType: security | priority: mandatory
  evidence: SUPERADMIN, STAFF, access.ts

- The Prisma schema defines 14 models including NotificationRead and RateLimit.
  category: srs | srsClause: 6.1 | requirementType: functional | priority: mandatory
  evidence: NotificationRead, RateLimit, EmailToken

- Login is rate-limited to 5 attempts per 15 minutes with database-backed limits.
  category: srs | srsClause: 9.3 | requirementType: security | priority: mandatory
  evidence: rate-limit, RateLimit

- The POS terminal cart pane is draggable between 280px and 550px.
  category: srs | srsClause: 4.1 | requirementType: functional | priority: recommended
  evidence: 280, 550

- Payments support cash, credit with due date, and cheque with bank details.
  category: srs | srsClause: 4.2 | requirementType: functional | priority: mandatory
  evidence: cheque, credit

- A daily sales report cron endpoint exists under the API.
  category: srs | srsClause: 8.1 | requirementType: operational | priority: recommended
  evidence: daily-sales, cron

- AnvilOS is built with Vue.js and Django.
  category: srs | srsClause: 3.1 | requirementType: constraint | priority: mandatory
  evidence: Vue, django

- AnvilOS uses PostgreSQL hosted on NeonDB.
  category: srs | srsClause: 3.2 | requirementType: operational | priority: mandatory
  evidence: postgresql, Neon

- AnvilOS began as HardwareHub, a Java Swing and MySQL desktop application.
  category: fact | requirementType: operational | priority: optional
  evidence: Java Swing, HardwareHub
