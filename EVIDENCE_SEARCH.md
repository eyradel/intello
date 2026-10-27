# Public-source evidence search

The Evidence Trace screen now searches actual collected reports through `/api/v1/evidence/search`. It is a public-source search workspace, not an implementation of classified XKeyscore internals or an internet interception system.

The in-memory inverted index covers up to 2,000 retained records. Query processing supports AND keywords, quoted phrases and minus exclusions. BM25-style ranking uses term frequency, document length normalization and inverse document frequency; headlines receive additional weight. Relevance is not a source credibility score.

Filters include source, region mention, issue, reference public figure, record type and publication dates. Dates use GMT; the ending day is inclusive. Unknown publication dates are omitted when date filters are active. Region and figure assignments remain heuristic. A seven-day collection cap limits historical queries even if older dates are selected.

The interface includes a daily publication timeline, evidence detail, source pivots, public-figure co-mentions, pagination and JSON exports of the current result page. Aggregate timelines and co-mentions cover all matched indexed records. Co-mentions do not establish contact, causation, coordination or relationships. Full-name pivots may return fewer results than alias matching.

Every indexed record has a SHA-256 fingerprint of its URL, headline, excerpt and timestamp. It is not a publisher signature and does not authenticate the report. Each search response has a receipt ID and query hash; these are not a durable or protected audit trail. Exports describe their scope explicitly.

No private communication, traffic interception, personal browsing-history collection, IP/email tracking or access-control bypass was added. Search does not expand the collection sources. Browser-local social imports are not uploaded to this index. Vercel's collection cache remains ephemeral.

Before multi-user operational deployment, authenticated access, enforced authorization, protected audit storage and durable evidence retention still need implementation. Search receipts must not be presented as substitutes for those controls.

Validation: `npm test` and `npm run build`.
