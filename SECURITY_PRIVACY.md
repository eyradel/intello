# Security, Privacy and Governance

## Data boundary
Allowed design target:
- lawful public/open information
- licensed public data feeds
- public news/media content consistent with usage rights
- public official statements
- aggregate survey/poll data when licensed/available

Excluded:
- private messages
- account credentials
- device compromise
- malware/spyware
- hidden tracking
- hacked/leaked private datasets
- precise private location
- doxxing or personal-address enrichment
- individual voter persuasion profiles

## Access control
Implement RBAC and audit logging for:
- evidence export
- report generation
- admin settings
- connector management
- model configuration

## Auditability
Record:
- model version
- ingestion timestamp
- source provenance
- transformation history
- report generation timestamp
- analyst overrides

## Retention
Create configurable retention policies by source and licensing basis. Raw text retention should be minimized when not required.

## Security controls
- secrets only in secret manager/environment
- TLS in transit
- encrypted database/storage where available
- least-privilege service accounts
- CSRF/CORS configured narrowly
- rate limiting
- audit logs
- dependency scanning
- backups and restore tests

## Analyst safeguards
- flag low-confidence regions/issues
- make sampling limitations visible
- allow human correction of entity resolution and language interpretation
- preserve original evidence context
- no automatic punitive decisions based only on sentiment analytics
