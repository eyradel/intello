# Data-source notes for production

The included prototype uses **synthetic demo data only**.

For production geography, replace the stylized SVG with a licensed Ghana administrative-boundary dataset. A current option identified during the prototype build is the open GhanaGeo project, which describes 16 regional boundaries and district geometry with source/licensing provenance. Another simple 16-region GeoJSON repository is `virgoaugustine/Ghana-GeoJSON-data` on GitHub. Verify licensing and provenance before shipping.

For sentiment ingestion, use official APIs or other lawfully accessible public sources and respect platform terms, rate limits, deletion requirements, and applicable Ghanaian data-protection/privacy law. Preserve source URLs and timestamps so analysts can audit every aggregate insight.

Do not silently mix social-media discussion volume with representative polling. Label each metric by source population and sampling method.
