# API-free local collection

Run `npm run collect:once` for one collection, or `npm run collect` for repeated collection every 15 minutes. `GHANA_POLL_MS` can change the interval, with a five-minute minimum. Stop with Ctrl+C. No external AI or paid data API is called by this collector. Public RSS feeds are HTTP resources; internal `/api/v1` routes serve the local application.

Run `npm run dev`, open the Regions view, and read the Collected news section. Its local JSON endpoint is `/api/v1/coverage/regions`. The Vite middleware is a development service; the static production build alone does not host collection endpoints. The existing directory/comparison dashboard remains explicitly labeled demo data.

Collection has a three-feed concurrency limit, ten-second request deadline, two-MiB response limit, per-feed cooldown and exponential failure backoff. Results are saved atomically under `.ghana-state/snapshot.json`, excluded from Git, retained for seven days and capped at 2,000 articles on successful updates. Failed/empty runs retain prior evidence and expose staleness. The standalone collector runs only while its process is running. Concurrent collector processes should use separate GHANA_STATE_DIR locations.

Summaries cover all 16 regional slots, with explicit sparse/no-coverage states, unknown dates, unmatched geography, source links and timestamps. Geography is a local word-boundary gazetteer heuristic; a mention is not proof of an event location. Constituency mapping is explicitly unavailable until a verified, versioned constituency gazetteer is supplied. Summaries extract headlines, not verified facts or causal conclusions.

The live smoke test on 24 October 2026 returned 125 feed items, 122 unique titles and 102 retained articles. Five Google News feed queries returned items; five configured publisher feeds returned no usable items. Those queries are not five independent publishers. Feed URLs, RSS-only parsing, publisher coverage and local-language coverage need further work. This cannot claim comprehensive national coverage.

Local sentiment, entity resolution, narratives and coordination are unvalidated heuristics; repeated reporting is not proof of coordinated activity. This prototype is not certified or assessed for national-security operations. Remaining production requirements include authentication, access controls, audit logs, a dedicated backend, robust RSS/Atom parsing, source permission review, validated administrative data, independent corroboration and analyst review. No login/paywall/anti-bot bypass is provided.

Validation: `npm run test:coverage` and `npm run build`.


## Collector revision: 24 October 2026

The collector now uses validated XML parsing for RSS, Atom and RDF rather than item regexes. Responses have a 12-second deadline and a two-MiB decoded body limit. Redirects are bounded to four hops and require configured HTTPS hosts. Robots policy is checked and cached; denied or unavailable permissions prevent collection. Per-host requests are serialized with crawl delays. Source failures have explicit codes, persisted backoff and Retry-After support. Conditional ETag/Last-Modified requests reduce repeat transfers. Concurrent refresh calls share a single collection run.

Articles preserve publisher attribution, feed identity, canonical URLs, publication-date quality and multi-feed provenance. Tracking parameters are removed, exact title duplicates within a publication day are merged, and evidence is reconciled across runs. This does not establish that two differently worded reports concern the same event, or that publishers are independent. Google query relevance uses explicit country context/place hints; domestic publisher context is accepted. This heuristic can still miss or include stories incorrectly.

Google News feed requests were disallowed by the retrieved robots policy and are now disabled. Older Citi, Graphic, GhanaWeb and Peace FM feed URLs returned 404. MyJoyOnline responded successfully after redirect handling; 3News was added using a verified feed endpoint. The final bounded collection returned 50 current articles from 3News; another publisher was in cooldown. This source set is still too narrow to claim nationwide completeness.

The development server now polls every 15 minutes while running; the standalone collector remains available. Use one collector process per state directory. Cross-process locking is not implemented. Feed health and conditional-request metadata survive restarts. No paid data or AI API is used.

Validation: 18 tests pass via `npm test`; the production build passes. Tests cover RSS/Atom/RDF, malformed feeds, dates, URL normalization, relevance, duplicates, source restrictions, redirects, oversized responses, robots denial, deadlines, rate limits, persistence and concurrent refreshes.
