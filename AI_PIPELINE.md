# AI / NLP Pipeline Specification

## Goals
Convert lawful public-source content into structured, auditable intelligence signals while preserving uncertainty.

## Stages
1. ingestion
2. canonical text extraction
3. duplicate / near-duplicate detection
4. language identification
5. code-switch segmentation
6. normalization
7. named-entity extraction
8. entity resolution against aliases
9. issue classification
10. sentiment classification
11. emotion tagging
12. coarse geographic attribution
13. narrative embedding / clustering
14. coordinated-amplification features
15. confidence fusion
16. time-bucket aggregation
17. summarization/recommendation generation

## Sentiment output
Per observation:
- score -1.0 to +1.0
- label negative | neutral | positive | mixed
- confidence 0–1
- target entity/issue when possible

Important: sentiment must be target-aware. A post can praise one entity while criticizing another.

## Ghanaian code-switching
Create a normalization/evaluation layer for local expressions and mixed-language posts. Maintain a reviewed phrase lexicon but do not rely on lexicon scoring alone.

## Narrative clustering
Use embeddings + temporal similarity + entity/issue overlap. Prevent syndicated/reposted content from creating fake cluster size.

## Coordinated-activity score
Signals may include:
- unusually high text similarity
- synchronized posting windows
- repeated URLs/hashtags
- abnormal account-age distribution where public metadata exists
- repetitive cross-platform phrase reuse

Never label something definitively as a bot operation from one feature alone. Use "coordination likelihood" with confidence and evidence.

## Location
Use only coarse/publicly inferable location signals. Store separate location confidence. Do not infer precise residential location.

## Aggregation principles
- confidence weighting
- duplicate suppression
- source-family diversity weighting
- rate-limit dominant sources from drowning out all others
- disclose sample size
- do not transform noisy social listening into fake polling percentages

## Recommendation generation prompt contract
Inputs:
- structured observations
- issue/region aggregate
- trend delta
- confidence
- evidence count
- source diversity
- data limitations

Outputs:
- observation
- likely operational/public-service problem
- verification step
- non-partisan response option
- measurable indicator
- review period
- caveats

No individual political targeting or personalized persuasion.
