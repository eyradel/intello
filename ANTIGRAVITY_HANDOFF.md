# Antigravity Handoff Brief

## Product
**Ghana Post Intelligence (GPI)**

A Ghana-wide public sentiment, narrative, civic-needs and policy-response intelligence platform with a cinematic advanced-tech interface.

## Product principle
The system is an OSINT/public-data intelligence platform, not spyware. Analyze public, lawful sources at aggregate level. Never add covert collection of private messages, private devices, precise private location, passwords, browser history, or hacked datasets. Do not build individualized political-persuasion targeting.

## UI direction
Keep the existing aesthetic: near-black command center, translucent glass panels, fine cyan grid, electric mint signal color, limited amber/red alert states, monospaced telemetry, animated scan/ripple effects, subtle noise and geometric targeting motifs. Avoid generic SaaS cards, bright gradients, rounded consumer UI, or cartoon styling.

## Next implementation priorities

### 1. Real map
Use authoritative Ghana region boundaries. Region hover/click should support heatmap coloring, ripple origins, labels, and district drill-down. Add layers for Public Pulse, Party Discussion, Issues, Narrative Velocity and Source Density.

### 2. API contract
Suggested routes:
- `GET /api/v1/national/summary`
- `GET /api/v1/regions`
- `GET /api/v1/regions/:id`
- `GET /api/v1/regions/:id/issues`
- `GET /api/v1/signals?since=`
- `GET /api/v1/narratives`
- `GET /api/v1/entities`
- `GET /api/v1/evidence?cluster_id=`
- `POST /api/v1/analysis/scenario` (policy/service response simulation, not voter persuasion)

### 3. Data model
Core aggregated objects should carry:
`id, source_type, source_url, captured_at, published_at, language, region_id, district_id?, entity_ids[], party_mentions[], issue_tags[], sentiment_score, emotion_tags[], stance?, confidence, narrative_cluster_id, coordinated_activity_score, public_source=true`.

### 4. Intelligence pipeline
Public source -> normalize -> language detect -> entity resolution -> topic/issue classification -> sentiment/emotion -> coarse geolocation -> narrative clustering -> anomaly detection -> aggregation -> confidence weighting -> dashboard.

### 5. Evidence-first AI
Every generated assessment must return a confidence score, supporting source count, source diversity, sample window, and evidence links. Separate observation from inference. Never imply representative polling unless the data really is a representative poll.

### 6. Ghana language layer
Build and evaluate code-switching support for Ghanaian English/Pidgin plus major Ghanaian languages. Add a human-review workflow for sarcasm, slang and political nicknames.

### 7. Guardrails
- No private-source collection.
- No doxxing or identity enrichment.
- No individual voter profiles.
- No recommendations aimed at exploiting a demographic's vulnerabilities to change political beliefs.
- Prefer aggregated civic/service recommendations: verify issue, dispatch service inspection, publish response timeline, monitor outcome.

## Current state
The prototype is frontend-only. All numbers are synthetic. `src/data/mockData.js` is the swap point for API integration.
