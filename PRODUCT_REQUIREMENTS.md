# Product Requirements — Ghana Post Intelligence

## 1. Product statement
Ghana Post Intelligence (GPI) is a public-source intelligence and civic-needs analytics platform for understanding how issues, public figures, parties, policies and narratives are being discussed across Ghana.

## 2. Primary users
- public-sector analysts
- media/research teams
- policy analysts
- public-affairs teams
- civil-society/NGO researchers
- authorized executive viewers

## 3. Core outcomes
The system should help an analyst answer:
- What is Ghana talking about now?
- Where are negative or positive shifts occurring?
- Which issues are driving those shifts?
- Which public figures/parties are associated with the conversation?
- Is the signal broad-based or concentrated in a few sources?
- Is a narrative spreading geographically?
- Does coordinated/amplified activity appear likely?
- What operational or policy response can be verified and measured?

## 4. Main modules
### Command Center
National map, pulse score, issue spikes, signal feed, trend cards, selected-region briefing.

### Regions
All 16 regions with time-window comparison and evidence drill-down. District-level view is a later extension when location confidence supports it.

### Entities
Politicians, officials, parties, ministries, institutions and other public entities.

### Issues
National and regional issue pressure, velocity, sentiment and evidence.

### Narratives
Clustered discussion themes with spread, timeline, top phrases, sources and confidence.

### Evidence Explorer
Filter by date, source type, region, issue, entity, sentiment and narrative. Preserve source provenance.

### Reports
Generate national, regional, issue and entity intelligence briefs with explicit methodology notes.

### System Health
Connector state, ingestion freshness, model versions, queue state, processing failures and data coverage.

## 5. Required filters
- date range
- region
- district when confidence is sufficient
- source type
- issue
- entity
- party mention
- sentiment band
- narrative cluster
- confidence threshold
- organic/coordinated activity indicator

## 6. Time windows
- live / last hour
- 24 hours
- 7 days
- 30 days
- 90 days
- custom

## 7. Scoring concepts
### Sentiment score
Normalized -100 to +100 aggregate, weighted by confidence and source diversity.

### Issue pressure
Composite of mention volume, negative intensity, velocity and cross-source diversity.

### Narrative velocity
Rate of cluster growth adjusted for duplicate content and suspicious amplification.

### Source diversity
Measures how many independent source families contribute to a signal.

### Confidence
Combines model certainty, sample size, source diversity, language confidence and location certainty.

## 8. Non-functional requirements
- no interface should imply more certainty than the data supports
- all derived scores need methodology tooltips
- stale data must be visibly marked
- public-source links should remain traceable
- map must remain useful on 1366x768 and larger screens
- mobile can be read-only/condensed initially
- system should support thousands of entities and millions of processed public observations later

## 9. MVP acceptance criteria
The MVP is acceptable when a user can:
1. open the national command center
2. click any of Ghana's 16 regions
3. see synthetic region sentiment and issue trends
4. switch map layers
5. inspect a public figure/entity
6. inspect issue pressure
7. open a narrative propagation view
8. open evidence items
9. generate a synthetic regional briefing
10. clearly see that demo data is synthetic
