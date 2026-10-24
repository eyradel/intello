# Ghana Post Intelligence — Antigravity Master Build Prompt

You are continuing an existing React/Vite prototype called **Ghana Post Intelligence (GPI)**. Treat the files in this folder as the current product baseline. Preserve the visual identity, improve the codebase, and turn the prototype into a production-oriented intelligence dashboard.

## Mission
Build a Ghana-wide public sentiment, narrative, civic-needs and policy-response intelligence platform using lawful public/open sources. The experience should feel like an advanced national intelligence command center: cinematic, technical, responsive and information-dense without becoming visually noisy.

This is **not spyware**. Do not add private-message interception, device compromise, browser-history collection, credential harvesting, hacked datasets, hidden tracking, precise private-location collection, doxxing, or individual voter profiling. Do not implement personalized political-persuasion targeting. Recommendations should remain at the level of public-service, policy, communications transparency, verification and issue response.

## Immediate build goals
1. Refactor the current frontend into reusable modules while keeping the present command-center look.
2. Replace the abstract map with a real Ghana SVG/GeoJSON map containing all 16 regions.
3. Add selectable map layers:
   - National Pulse
   - Government Sentiment
   - Opposition Sentiment
   - Party Discussion Share
   - Civic Issues
   - Narrative Velocity
   - Source Density
   - Coordinated Activity Risk
4. Add region drill-down and prepare for district drill-down.
5. Build pages for:
   - Command Center
   - Regional Intelligence
   - Politicians / Public Figures
   - Parties
   - Issues
   - Narratives
   - Signal Feed
   - Evidence Explorer
   - Reports
   - System / Data Health
6. Convert mock data into a typed service layer so a real backend can replace it without rewriting UI components.
7. Add a backend scaffold using FastAPI and PostgreSQL/PostGIS.
8. Add WebSocket/SSE-ready live update architecture.
9. Create an evidence-first AI analysis layer with confidence, sample size, source diversity and time-window metadata.
10. Keep all demo values clearly labeled as synthetic until real data is connected.

## UX character
The interface should look closer to an elite cyber-intelligence console than a normal SaaS dashboard.

Visual language:
- near-black background
- transparent/glass graphite panels
- cyan/teal primary telemetry accents
- mint positive states
- amber caution states
- red critical states
- thin technical grid lines
- subtle scan lines/noise
- controlled glow, never excessive neon bloom
- square or slightly cut corners rather than pill-heavy consumer UI
- monospace for telemetry, modern grotesk/sans for headings
- animated target rings, waveform pulses and map ripples
- micro-interactions on hover and selection
- high information density with strong hierarchy

Avoid:
- generic admin template styling
- cartoon icons
- playful gradients
- excessive rounded cards
- giant empty sections
- random cyberpunk decoration with no information function

## Core command-center layout
Top bar:
- GPI mark / system name
- national sentiment index
- live ingestion rate
- source count
- last update
- system status
- global search

Left rail:
- navigation
- layer selector
- time-window selector

Center:
- real Ghana map
- region heatmap
- animated narrative ripples
- event markers
- selectable overlay legend

Right intelligence rail:
- selected region summary
- sentiment movement
- top issues
- emerging narrative
- source diversity
- anomaly warning
- AI civic-response recommendation

Bottom intelligence strip:
- live signal ticker
- issue spikes
- notable entity movement
- coordinated-activity alerts

## Political/public-figure intelligence
For each tracked public figure store and display:
- name
- role
- party/affiliation where publicly known
- national mention volume
- region mention distribution
- positive / neutral / negative conversation ratio
- sentiment trend
- top associated issues
- top narratives
- notable events
- confidence
- supporting source count

Do not calculate or expose individual voter-propensity scores.

## Issue intelligence
Initial issue taxonomy:
- Cost of Living
- Jobs / Unemployment
- Roads / Transport
- Electricity / Energy
- Water
- Healthcare
- Education
- Housing
- Sanitation
- Security / Crime
- Taxes
- Fuel
- Food Prices
- Corruption / Governance
- Agriculture
- Digital Services
- Local Infrastructure

Each issue should support:
- national pressure score
- regional pressure
- velocity
- sentiment
- source count
- source diversity
- evidence
- related entities
- related narratives
- 7d / 30d / 90d trend

## Narrative propagation
Implement a "Sentiment Ripple" or "Narrative Propagation" feature.
A narrative cluster should be able to show:
- first detected timestamp
- probable origin region/source group
- region-by-region spread
- velocity
- amplification risk
- organic/coordinated confidence
- related entities
- top phrases
- source diversity
- current trajectory

Animate propagation on the map as time-indexed expanding rings/lines.

## Civic Response Engine
Recommendations must be evidence-based and non-manipulative.
Good recommendation examples:
- verify reported service failure
- dispatch inspection to affected area
- publish service restoration timeline
- compare complaint clusters with operational records
- increase factual public information on a confusing policy
- monitor whether complaints fall after intervention

Do not output recommendations like "target undecided young voters in Region X" or exploit demographic fears/weaknesses.

Every recommendation object must contain:
- observation
- confidence
- evidence_count
- source_diversity
- affected_region(s)
- affected_issue(s)
- recommended_operational_action
- expected_measurable_indicator
- review_window
- caveats

## Technical architecture
Frontend:
- React
- Vite
- TypeScript migration preferred
- TanStack Query
- Zustand or lightweight equivalent for UI state
- MapLibre GL or SVG/GeoJSON for Ghana map
- ECharts/Recharts/D3 only where genuinely useful

Backend:
- Python 3.12+
- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL + PostGIS
- Redis
- Celery/RQ/Dramatiq or equivalent workers
- OpenSearch/Elasticsearch optional for large text search
- ClickHouse optional later for high-volume analytics

Storage:
- S3-compatible object storage for raw public-source snapshots/transcripts where licensing permits

Authentication:
- RBAC-ready
- analyst
- senior analyst
- administrator
- read-only executive

Observability:
- structured logs
- ingestion health
- queue depth
- model errors
- source failures
- stale-data warnings

## Data pipeline
Public/open source connectors -> raw capture -> deduplication -> normalization -> language identification -> Ghanaian code-switching normalization -> entity resolution -> issue classification -> sentiment/emotion -> coarse public-location inference -> narrative clustering -> coordinated-activity scoring -> confidence weighting -> aggregates -> API -> dashboard.

## AI rules
1. Never present social-media sentiment as representative polling unless it is actual polling data.
2. Label source type and sampling limitations.
3. Separate observation from inference.
4. Preserve original evidence links/IDs where lawful.
5. Return confidence and source diversity with generated conclusions.
6. Add human-review hooks for ambiguous Ghanaian slang, sarcasm and code-switching.
7. Model outputs must be versioned.

## Ghana language support
Design for:
- Ghanaian English
- Ghanaian Pidgin English
- Twi/Akan code-switching
- Ga
- Ewe
- Hausa
- Dagbani
- other languages as coverage grows

Language support must be measured, not assumed. Create evaluation sets and human review queues.

## Development sequence
Phase 1: strengthen existing frontend and real map.
Phase 2: backend + database + API mocks.
Phase 3: public data ingestion adapters.
Phase 4: NLP/sentiment/entity/issue pipeline.
Phase 5: narrative propagation and coordinated-activity detection.
Phase 6: evidence explorer, reports and alerting.
Phase 7: production security, monitoring, scaling and model evaluation.

## Coding requirements
- keep modules small and readable
- separate components, domain models, services and mock data
- no hard-coded business logic inside presentation components
- add `.env.example`
- add API client abstraction
- add tests for scoring/aggregation utilities
- add loading, empty, stale and error states
- ensure responsive behavior
- no fake claims that real data is live
- preserve accessibility for color-blind users through labels/patterns, not color alone

## First task after reading this file
Inspect the existing source tree. Preserve the current aesthetic, then refactor the frontend into a scalable structure and replace the placeholder Ghana visualization with a real interactive Ghana map. Do not rewrite everything unnecessarily; improve incrementally and keep the app runnable after every major change.
