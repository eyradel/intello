# UI / UX Specification

## Design tokens
Background: `#05080B`-like near-black
Panel: translucent charcoal/graphite
Primary telemetry: cyan/teal
Positive: mint/green
Caution: amber
Critical: red
Muted text: cool grey

Use CSS variables so the palette can evolve centrally.

## Typography
- Headings: geometric/grotesk sans
- Telemetry and numbers: monospace
- Use tabular numbers for metrics

## Grid
Desktop target:
- 72–84px left navigation rail
- flexible map/content canvas
- 320–380px intelligence rail
- 42–56px top command bar
- optional 44–72px signal strip at bottom

## Map behavior
Hover region:
- outline intensifies
- tooltip shows region, current score, movement, confidence

Select region:
- lock selection
- center/zoom subtly
- right rail switches context
- region label enters active state
- related ripple events remain visible

Layer switch:
- animate value transition
- update legend
- preserve selected region

## Region detail
Sections:
- headline pulse
- 24h / 7d / 30d movement
- top issues
- narrative spikes
- notable entities
- source composition
- AI civic response
- evidence preview

## Charts
Prefer compact, technical visualizations:
- sparklines
- horizon/area trends
- ranked bars
- radial confidence indicators sparingly
- timeline bands

Always include numeric labels/tooltips; never rely on color alone.

## Motion
- map ripple: 1.8–3.5 seconds, low opacity
- scan line: subtle, slow
- metric change: 180–300 ms
- panel transitions: 150–220 ms
- alert pulse only for truly elevated events

Respect reduced-motion preference.

## Empty/loading/error states
Every panel must support:
- loading skeleton
- no data
- stale data
- source outage
- low confidence
- permission restricted

## Synthetic data indicator
Until production data is connected, display a persistent but unobtrusive banner/badge:
`DEMO MODE — SYNTHETIC INTELLIGENCE DATA`
