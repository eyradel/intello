# API Specification — v1 Draft

Base: `/api/v1`

## National
`GET /national/summary?window=7d`
Returns pulse, confidence, top issues, top narratives, freshness and source coverage.

`GET /national/trend?metric=public_sentiment&window=30d`

## Regions
`GET /regions`

`GET /regions/{region_id}?window=7d`

`GET /regions/{region_id}/trend?metric=public_sentiment&window=30d`

`GET /regions/{region_id}/issues?window=7d`

`GET /regions/{region_id}/narratives?window=7d`

## Entities
`GET /entities?type=person&q=`

`GET /entities/{entity_id}?window=30d`

`GET /entities/{entity_id}/trend`

`GET /entities/{entity_id}/issues`

`GET /entities/{entity_id}/regions`

## Issues
`GET /issues?window=7d`

`GET /issues/{issue_key}?window=30d`

`GET /issues/{issue_key}/regions`

`GET /issues/{issue_key}/evidence`

## Narratives
`GET /narratives?window=24h&sort=velocity`

`GET /narratives/{narrative_id}`

`GET /narratives/{narrative_id}/timeline`

`GET /narratives/{narrative_id}/regions`

`GET /narratives/{narrative_id}/evidence`

## Signals
`GET /signals?since=<iso>&limit=100`

## Evidence
`GET /evidence?q=&region=&issue=&entity=&source_type=&from=&to=`

## Recommendations
`GET /recommendations?scope_type=region&scope_id=&window=7d`

`POST /analysis/scenario`
Only for service/policy-response analysis. Input may describe an operational intervention; response should estimate measurable indicators and caveats, not voter persuasion.

## Reports
`POST /reports/regional-brief`

`POST /reports/national-brief`

## System
`GET /system/health`

`GET /system/coverage`

`GET /system/models`

## Standard response metadata
Every analytics endpoint should include where relevant:
```json
{
  "data": {},
  "meta": {
    "window": "7d",
    "generated_at": "ISO-8601",
    "freshness": "current",
    "sample_size": 0,
    "source_count": 0,
    "source_diversity": 0.0,
    "confidence": 0.0,
    "synthetic": true
  }
}
```

## Error contract
```json
{
  "error": {
    "code": "GPI_ERROR_CODE",
    "message": "Human-readable description",
    "request_id": "..."
  }
}
```
