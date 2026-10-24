# Database Schema — Draft

## regions
- id UUID / stable code
- name
- slug
- iso_or_internal_code
- geometry MultiPolygon
- centroid Point
- created_at

## districts
- id
- region_id
- name
- geometry
- centroid

## entities
- id
- entity_type: person | party | institution | ministry | organization
- canonical_name
- slug
- role
- affiliation
- active
- metadata_json
- created_at
- updated_at

## entity_aliases
- id
- entity_id
- alias
- language
- alias_type

## sources
- id
- source_type
- source_name
- domain_or_platform
- public_access_basis
- reliability_metadata_json
- enabled

## raw_items
- id
- source_id
- external_id
- source_url
- published_at
- captured_at
- author_public_id nullable
- raw_text
- language_hint
- content_hash
- raw_metadata_json

## observations
- id
- raw_item_id
- language
- normalized_text
- region_id nullable
- district_id nullable
- location_confidence
- sentiment_score float
- sentiment_label
- sentiment_confidence
- emotion_tags jsonb
- issue_tags jsonb
- entity_ids jsonb or join table
- party_mentions jsonb
- stance nullable
- narrative_cluster_id nullable
- coordinated_activity_score nullable
- overall_confidence
- model_version
- created_at

## narratives
- id
- title
- summary
- first_detected_at
- last_detected_at
- origin_region_id nullable
- velocity_score
- amplification_score
- organic_confidence
- top_phrases jsonb
- status

## narrative_region_timeline
- narrative_id
- region_id
- bucket_time
- mention_count
- sentiment_score
- velocity
- confidence

## issue_aggregates
- issue_key
- region_id nullable
- bucket_time
- mention_count
- sentiment_score
- pressure_score
- velocity_score
- source_diversity
- confidence

## entity_aggregates
- entity_id
- region_id nullable
- bucket_time
- mention_count
- sentiment_score
- positive_share
- neutral_share
- negative_share
- confidence

## regional_aggregates
- region_id
- bucket_time
- public_sentiment
- government_discussion_sentiment
- opposition_discussion_sentiment
- source_count
- source_diversity
- confidence

## recommendations
- id
- scope_type
- scope_id
- observation
- confidence
- evidence_count
- source_diversity
- issue_keys jsonb
- recommended_operational_action
- measurable_indicator
- review_window
- caveats
- model_version
- created_at

## evidence_links
- id
- recommendation_id nullable
- narrative_id nullable
- observation_id
- relevance_score

## model_runs
- id
- model_name
- model_version
- task
- started_at
- completed_at
- status
- metrics_json
