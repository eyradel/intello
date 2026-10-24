# Ghana Post Intelligence (GPI) — Operations Platform v2.4

A nationwide public sentiment, civic needs, narrative propagation, and open-source intelligence (OSINT) command center for Ghana. Built with React, Vite, and MapLibre GL JS, featuring an advanced futuristic intelligence console aesthetic.

---

## 1. Project Overview

Ghana Post Intelligence (GPI) provides government analysts, public-policy teams, civil society researchers, and civic authorities with real-time, evidence-based situational awareness across Ghana's 16 administrative regions.

### Core Capabilities:
- **National & Regional Sentiment Surface**: Track public sentiment shifts across Ghana in real-time, calibrated from -100 (critical negative) to +100 (strong positive).
- **Authoritative 16-Region Geospatial Map**: Powered by MapLibre GL JS with authentic Ghana ADM1 administrative boundary GeoJSON polygons, interactive camera fly-to, hover telemetry HUDs, and dynamic choropleth recoloring.
- **Sentiment Ripple Engine**: Signature geospatial propagation engine that visualizes how emerging discussion narratives spread geographically over time along transit corridors (e.g., Greater Accra ➔ Eastern ➔ Ashanti ➔ Northern).
- **20+ Tactical Map Intelligence Overlays**: Switch between National Sentiment, Government Sentiment, Party Discussion Shares, 18 Civic Issues, Signal Density, and Coordinated Activity Risk.
- **Geospatial Heatmap Mode**: Real-time concentration of public grievances and signal density across Ghanaian metropolitan centers.
- **18 Tracked Public Policy & Needs Categories**: In-depth decomp of Cost of Living, Jobs, Roads, Electricity, Water, Healthcare, Education, Housing, Sanitation, Crime, Taxes, Fuel, Food Prices, Corruption, Agriculture, Digital Services, Local Infrastructure, and Environment.
- **Coordination Watch & Sybil Detection**: Probabilistic identification of coordinated inauthentic amplification, text copypasta syndicates, and automatic Organic Adjusted Sentiment calculation.
- **AI Civic Response Engine**: Evidence-backed, actionable public-service and policy delivery recommendations (root causes, measurable indicators, service timelines) strictly avoiding individualized voter profiling or political manipulation.
- **Verifiable Ground Evidence Repository**: End-to-end provenance traceability linking every analytic conclusion directly to public broadcasts, news media, and open civic forums.
- **Printable Intelligence Briefings**: Export-ready National Daily Briefs, Regional Deep Scan Profiles, Critical Issues Summaries, and Narrative Propagation Spread reports.
- **Global Command Palette (`Ctrl/Cmd + K`)**: Instant tactical search and execution shortcuts across regions, entities, issues, and system actions.

---

## 2. Statutory Mandate & Privacy Guardrails

Ghana Post Intelligence is strictly an **Open-Source Intelligence (OSINT) and Public Data Platform**, operating under strict legal and ethical principles:

1. **Lawful Public Sources Only**: Ingests exclusively lawful, publicly accessible information (verified broadcasts, accredited news portals, public social feeds, and institutional gazettes).
2. **No Surveillance or Covert Collection**: Never intercepts private messages, private phone/device data, browser history, location trackers, or hacked databases.
3. **No Individual Voter Profiling or Microtargeting**: Does not profile individual citizens, score personal political propensities, or generate psychological persuasion scripts.
4. **Civic & Public-Service Focus**: Recommendations focus strictly on public service restoration, infrastructure repair verification, supply chain transparency, and citizen communication.

---

## 3. Technology Architecture

```text
ghana-post-intelligence/
├── public/
│   ├── geodata/
│   │   ├── ghana-country.geojson       # Authoritative Ghana ADM0 boundary
│   │   └── ghana-regions.geojson       # Authoritative 16 ADM1 regional polygons
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── CommandPalette.jsx      # Global Ctrl+K tactical command palette
│   │   │   ├── NotificationsDrawer.jsx # Severity-classified alert log drawer
│   │   │   └── MiniChart.jsx           # SVG sparkline & trendline visualizer
│   │   └── map/
│   │       ├── GhanaIntelligenceMap.jsx# Centerpiece MapLibre GL geospatial map
│   │       ├── MapLayerSwitcher.jsx    # Floating 20-layer selector
│   │       ├── MapLegend.jsx           # Sentiment & pressure scale HUD
│   │       ├── MapTooltip.jsx          # Dynamic region telemetry HUD on hover
│   │       └── SentimentRippleControls.jsx # Ripple animation controls & slider
│   ├── features/
│   │   ├── command/
│   │   │   └── CommandCenter.jsx       # Primary operations console
│   │   ├── regions/
│   │   │   ├── RegionsModule.jsx       # 16-region directory
│   │   │   ├── RegionDeepScan.jsx      # Deep regional drill-down profile
│   │   │   └── RegionComparison.jsx    # Side-by-side regional comparison engine
│   │   ├── politicians/
│   │   │   ├── PoliticiansModule.jsx   # Public figures directory
│   │   │   └── PoliticianProfile.jsx   # Public figure deep analytics
│   │   ├── parties/
│   │   │   └── PartiesModule.jsx       # Comparative party discussion intelligence
│   │   ├── issues/
│   │   │   └── IssuesModule.jsx        # 18 tracked civic issues & pressure map
│   │   ├── narratives/
│   │   │   └── NarrativesModule.jsx    # Clustered narratives & ripple propagation
│   │   ├── signals/
│   │   │   └── SignalsModule.jsx       # Live signal intercept stream
│   │   ├── evidence/
│   │   │   └── EvidenceExplorer.jsx    # Traceable evidence records table
│   │   ├── coordination/
│   │   │   └── CoordinationWatch.jsx   # Inauthentic behavior & bot analysis
│   │   ├── reports/
│   │   │   └── ReportsModule.jsx       # Structured, printable intelligence briefs
│   │   ├── system/
│   │   │   └── SystemModule.jsx        # Subsystem telemetry & PostGIS schema
│   │   └── settings/
│   │       └── SettingsModule.jsx      # Environment configuration & guardrails
│   ├── data/
│   │   ├── regions.js                  # 16 regions dataset with centroids & issues
│   │   ├── issues.js                   # 18 issues with national & regional pressures
│   │   ├── politicians.js              # Tracked public figures & topic links
│   │   ├── parties.js                  # Comparative party discussion metrics
│   │   ├── narratives.js               # Multi-stage geographic propagation arcs
│   │   ├── signals.js                  # Real-time intercept feed records
│   │   ├── evidence.js                 # Verifiable open quotes & transcripts
│   │   ├── coordination.js             # Copypasta clusters & organic factors
│   │   ├── events.js                   # Timeline of public events & sentiment deltas
│   │   └── mockData.js                 # Compatibility export layer
│   ├── services/
│   │   ├── intelligenceService.js      # Repository abstraction (Mock <-> FastAPI)
│   │   └── simulationEngine.js         # Controlled live-ticking telemetry engine
│   ├── App.jsx                         # Root application orchestration
│   ├── main.jsx                        # React root entry
│   └── styles.css                      # Cyberpunk HUD command center design system
```

---

## 4. Installation & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Quickstart
```bash
# Clone and enter workspace
cd ghana-post-intelligence

# Install dependencies
npm install

# Run Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 5. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Data Mode: 'mock' (simulated live ticker) or 'api' (production backend)
VITE_DATA_MODE=mock

# Base URL for FastAPI REST API endpoints
VITE_API_BASE_URL=http://localhost:8000/api/v1

# MapLibre tile provider URL template (defaults to Carto Dark Matter, no key required)
VITE_MAP_STYLE_URL=https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png

# Optional Mapbox token if using Mapbox vector styles
VITE_MAPBOX_TOKEN=
```

---

## 6. Real Map & GeoJSON Implementation

The application uses **MapLibre GL JS** with authoritative boundary datasets:
- **National Outline**: Stored in `public/geodata/ghana-country.geojson`
- **16 Administrative Regions**: Stored in `public/geodata/ghana-regions.geojson`
- **Normalization Utility**: `normalizeRegionName()` maps GeoJSON feature properties (e.g. `Greater Accra Region`) to application IDs (`greater-accra`), enabling real-time color updates across all layers.

---

## 7. Backend Integration Architecture

The frontend is architected with a repository pattern (`src/services/intelligenceService.js`). Switching `VITE_DATA_MODE=api` directs requests to FastAPI endpoints:
- `GET /api/v1/national/summary?window=24h`
- `GET /api/v1/regions`
- `GET /api/v1/regions/{id}`
- `GET /api/v1/issues`
- `GET /api/v1/narratives`
- `GET /api/v1/entities`
- `GET /api/v1/signals`
- `GET /api/v1/evidence`
- `GET /api/v1/coordination`
- `GET /api/v1/events`

A production PostGIS SQL schema scaffold is provided in `src/features/system/SystemModule.jsx`.

---

## 8. License & Attribution

- Administrative boundary data courtesy of geoBoundaries / GADM / Humanitarian Data Exchange (ODbL).
- Map tiles © OpenStreetMap contributors, © CARTO.
- Built for sovereign civic intelligence and transparent public-service delivery in Ghana.


## intello: run the full local application

Install dependencies with `npm ci`. For development use `npm run dev` at http://localhost:5174. For a built local preview run `npm run build` followed by `npm start`. Both modes register the local collection endpoints and poll accessible public feeds every 15 minutes while running.

The `dist` directory alone is a static frontend. GitHub Pages or another static-only host cannot execute `/api/v1` endpoints. A deployed application needs a Node runtime or a separately deployed backend with matching reverse-proxy routes. `npm start` serves a local Vite preview; it is not a hardened internet-facing production server.

Local `.env` files, dependencies, build output and collected evidence under `.ghana-state` are excluded from Git. The system includes demonstration analytics; operational validation and protected access/audit controls remain unfinished. Run `npm test` for collector and coverage regression tests.
