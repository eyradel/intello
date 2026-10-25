# Public figures, parties and social media

Public Figures and Parties now use collected evidence rather than the synthetic profile and party metrics. The initial registry covers 15 reference political figures; it does not discover every Ghanaian public figure. Add names, distinctive aliases and sourced party references to the registry to expand coverage. Current roles and unverified biography details are intentionally not inferred. Identity and party mappings require analyst verification.

News visibility counts distinct collected article URLs mentioning each figure. Party share uses the sum of figure/article assignments as its denominator. A single article can mention several figures. Social posts are counted separately. These values are not voter support, national popularity, audience size, endorsements or representative public opinion. Zero reports means no collected evidence, not an unpopular person.

## Authorized social feeds

`src/config/publicSources.json` contains an initially empty `feeds` array. Configure up to two RSS/Atom feeds supplied by an authorized source operator. Each entry requires `id`, `name`, `url` (public HTTPS XML feed), `socialPlatform` (`facebook`, `x`, `instagram` or `youtube`), `publicContent: true`, and a meaningful `permissionBasis`. Do not put credentials or personal data in this file; it is committed to the repository. The feed provider must be authorized to provide the underlying posts. An arbitrary third-party mirror is not evidence of permission.

These feeds use the existing robots checks, deadlines, size bounds, backoff and URL allowlist. Local and Vercel collectors include configured feeds. Actual post links, dates, text and media are read from RSS/Atom; HTML Facebook/X pages are not parsed by this adapter. Posts need explicit Ghana context or a regional place mention to pass relevance filtering. Configuration alone does not establish account authenticity or report accuracy.

No Facebook/X source is enabled by default. The interface reports absent collection explicitly. Direct scraping, login automation, private groups/messages and access-control bypasses are not implemented.

## Public-post imports

The Public Figures view imports normalized JSON into the current browser session. The import is not uploaded, stored in localStorage or written to the server. A new import replaces the previous one; clearing it removes it from the session. Use the empty downloadable template and supply:

```
{
  "schemaVersion": 1,
  "publicContent": true,
  "permissionBasis": "Describe your authorization to use this public-post export",
  "records": [
    {
      "platform": "x",
      "figureId": "john-mahama",
      "url": "https://x.com/REPLACE_WITH_ACCOUNT/status/REPLACE_WITH_POST_ID",
      "publishedAt": "REPLACE_WITH_ACTUAL_ISO_PUBLICATION_TIMESTAMP",
      "text": "REPLACE_WITH_ACTUAL_PUBLIC_POST_TEXT",
      "public": true
    }
  ]
}
```

This is a schema example, not a factual post. Use real public source records. The importer validates platform domains, public scope, timestamps and known public-figure IDs, with a 2 MiB / 2,000-record limit. It cannot verify your permission declaration or account ownership. Twitter is normalized to X. Private people cannot be added through this importer.

## Media and coverage limits

Publisher RSS media enclosures provide links to images, audio and video. The system does not download all media, transcribe recordings, identify people in images or claim full Facebook/X coverage. It retains source-provided metadata and links for review.

The server exposes `/api/v1/public-figures/coverage?hours=168` in local development, preview and Vercel. Social imports remain browser-local and therefore are absent from the server endpoint. Vercel history remains ephemeral until durable storage is configured.
