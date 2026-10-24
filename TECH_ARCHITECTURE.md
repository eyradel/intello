# Technical Architecture

## Monorepo target
```
/apps
  /web          React/Vite frontend
  /api          FastAPI service
  /worker       background processing
/packages
  /types        shared schemas/contracts
  /ui           reusable UI components
  /config       shared config
/docs
/infra
```

## Frontend layers
```
src/
  app/
  components/
  features/
    map/
    regions/
    entities/
    issues/
    narratives/
    signals/
    reports/
  services/
  hooks/
  stores/
  types/
  utils/
  data/mock/
```

## Backend domain services
- ingestion
- observations
- entities
- regions
- issues
- narratives
- sentiment
- coordination
- evidence
- reports
- recommendations
- system-health

## Event flow
1. Connector creates raw_source_event.
2. Worker deduplicates and normalizes.
3. NLP pipeline creates observation.
4. Entity/issue/location models enrich observation.
5. Narrative clustering assigns narrative_cluster_id.
6. Aggregator updates regional/entity/issue time buckets.
7. API serves aggregate views.
8. Live gateway publishes material changes to clients.

## Suggested infrastructure
- Postgres/PostGIS: canonical metadata, entities, regions, observations and aggregates
- Redis: caching, queues, ephemeral stream state
- Object storage: raw artifacts if lawful/licensed
- OpenSearch: evidence search when scale requires it
- ClickHouse: optional event analytics at high volume

## Data freshness classes
- live: < 5 min
- current: < 30 min
- delayed: < 6 h
- stale: >= 6 h

UI must expose freshness.

## Deployment
Start with Docker Compose:
- web
- api
- worker
- postgres
- redis

Later move to managed containers/Kubernetes only if scale justifies it.

## Environment variables
Create `.env.example` including:
- DATABASE_URL
- REDIS_URL
- OBJECT_STORAGE_ENDPOINT
- OBJECT_STORAGE_BUCKET
- OBJECT_STORAGE_KEY
- OBJECT_STORAGE_SECRET
- API_BASE_URL
- MAP_STYLE_URL
- JWT_SECRET
- MODEL_PROVIDER keys only when required

Never commit secrets.
