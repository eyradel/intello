# Build Roadmap

## Milestone 0 — Existing prototype
Status: present in this folder.
Frontend-only with synthetic data.

## Milestone 1 — Production-grade frontend foundation
- TypeScript migration
- proper routing
- reusable design system
- real 16-region Ghana map
- layer switching
- responsive command-center layout
- standardized synthetic-data API service
- error/loading/stale states

## Milestone 2 — Backend scaffold
- FastAPI service
- Postgres/PostGIS
- Redis
- SQL migrations
- seeded regions/entities/issues
- API contract from API_SPEC.md
- Docker Compose

## Milestone 3 — Evidence ingestion
- 1–2 lawful public source adapters first
- deduplication
- content normalization
- provenance
- evidence explorer
- source health dashboard

## Milestone 4 — NLP intelligence
- language ID
- entity resolution
- issue classifier
- sentiment target detection
- Ghanaian English/Pidgin test set
- confidence scoring

## Milestone 5 — Narratives and ripple engine
- embedding/clustering
- region spread timeline
- narrative velocity
- interactive ripple animation
- coordinated-activity likelihood

## Milestone 6 — AI briefs and civic response
- national brief
- region brief
- issue brief
- confidence/evidence metadata
- response recommendation schema
- analyst review workflow

## Milestone 7 — Production hardening
- auth/RBAC
- audit trail
- data retention policy
- observability
- load testing
- backups
- model monitoring
- security review

## Antigravity execution rule
Complete milestones incrementally. Do not attempt all backend/data connectors in one rewrite. Keep the frontend runnable and commit each stable milestone separately.
