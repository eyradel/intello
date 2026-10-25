import { GHANA_ENTITY_REGISTRY } from './localThinkingEngine.js';

export const PUBLIC_FIGURES = GHANA_ENTITY_REGISTRY.filter(e => e.type === 'POLITICIAN').map(e => ({
  id: e.id, name: e.name, party: e.party,
  // These are reference identities, not verified current officeholder records.
  aliases: [e.name, ...e.aliases.filter(a => a.length >= 6 && !/president|minister|speaker|leader|flagbearer|candidate|running mate|\bmp\b|party|movement|majority|minority/i.test(a))],
  affiliationStatus: 'REFERENCE_REQUIRES_VERIFICATION'
}));
export const SOCIAL_COVERAGE = [
  { platform: 'Facebook', status: 'NOT_CONNECTED', method: 'Authorized publisher feed or public-post export required' },
  { platform: 'X', aliases: ['Twitter'], status: 'NOT_CONNECTED', method: 'Authorized publisher feed or public-post export required' },
  { platform: 'Instagram', status: 'NOT_CONNECTED', method: 'Authorized public-post export or permitted feed required' },
  { platform: 'YouTube', status: 'NOT_CONFIGURED', method: 'Public channel feed with a verified channel identity required' }
];
const normalized = text => String(text || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const match = (text, alias) => (` ${normalized(text)} `).includes(` ${normalized(alias)} `);
const publicUrl = raw => {
  try { const url = new URL(raw); return url.protocol === 'https:' && !url.username && !url.password ? url : null; } catch { return null; }
};

// Strict normalized export format. No automatic requests to social-network pages.
export function validateSocialImport(input) {
  if (!input || input.schemaVersion !== 1 || input.publicContent !== true || typeof input.permissionBasis !== 'string' || input.permissionBasis.trim().length < 8) throw new Error('Provide schemaVersion 1, publicContent true and a permissionBasis.');
  if (!Array.isArray(input.records) || input.records.length > 2000) throw new Error('Import must contain at most 2,000 public-post records.');
  const platforms = { facebook: ['facebook.com', 'www.facebook.com'], x: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'], instagram: ['instagram.com', 'www.instagram.com'], youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'] };
  return input.records.map((row, index) => {
    const platform = String(row.platform || '').toLowerCase() === 'twitter' ? 'x' : String(row.platform || '').toLowerCase();
    const url = publicUrl(row.url);
    const figure = PUBLIC_FIGURES.find(f => f.id === row.figureId);
    const published = Date.parse(row.publishedAt);
    if (!figure || !url || !platforms[platform]?.includes(url.hostname) || !Number.isFinite(published) || published > Date.now() + 900000 || typeof row.text !== 'string' || !row.text.trim() || row.text.length > 10000 || row.public !== true) throw new Error(`Invalid public-post record ${index + 1}: check figureId, platform, public URL, date and text.`);
    return {
      id: `import-${platform}-${index}`, url: url.href, headline: row.text.slice(0, 180), text: row.text,
      timestamp: new Date(published).toISOString(), publicationDateKnown: true, source: `${platform} public-post import`,
      mediaType: 'social', socialPlatform: platform, figureId: figure.id,
      provenance: { method: 'analyst-import', permissionBasis: input.permissionBasis.trim(), importedAt: new Date().toISOString(), identityVerified: false },
      media: []
    };
  });
}

export function buildPublicFigureAnalytics(signals, { hours = 168, now = Date.now() } = {}) {
  const unique = new Map();
  let unknownDates = 0;
  for (const record of signals) {
    if (!record || !publicUrl(record.url)) continue;
    if (record.publicationDateKnown === false || !Number.isFinite(Date.parse(record.timestamp))) { unknownDates++; continue; }
    const age = now - Date.parse(record.timestamp);
    if (age < 0 || age > hours * 3600000) continue;
    const url = new URL(record.url); url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
    unique.set(url.href, record);
  }
  const records = [...unique.values()];
  const figures = PUBLIC_FIGURES.map(figure => {
    const evidence = records.filter(r => r.figureId === figure.id || figure.aliases.some(alias => match(`${r.headline} ${r.text}`, alias)));
    const news = evidence.filter(r => r.mediaType !== 'social');
    const social = evidence.filter(r => r.mediaType === 'social');
    return {
      ...figure, newsArticles: news.length, socialPosts: social.length, totalRecords: evidence.length,
      newsPublishers: new Set(news.map(r => r.publisher || r.source)).size,
      platforms: [...new Set(social.map(r => r.socialPlatform))],
      mediaCount: evidence.reduce((n, r) => n + (r.media?.length || 0), 0),
      evidence: evidence.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 30)
    };
  });
  // Denominator counts figure/article assignments, not unique people or voters.
  const totalNewsAssignments = figures.reduce((n, f) => n + f.newsArticles, 0);
  const parties = [...new Set(figures.map(f => f.party))].map(party => {
    const members = figures.filter(f => f.party === party).sort((a, b) => b.newsArticles - a.newsArticles || a.name.localeCompare(b.name));
    const assignments = members.reduce((n, f) => n + f.newsArticles, 0);
    return { party, trackedFigures: members.length, newsAssignments: assignments,
      newsVisibilityShare: totalNewsAssignments ? +(100 * assignments / totalNewsAssignments).toFixed(1) : null,
      socialPosts: members.reduce((n, f) => n + f.socialPosts, 0),
      figures: members.map(f => ({ id: f.id, name: f.name, newsArticles: f.newsArticles, withinPartyShare: assignments ? +(100 * f.newsArticles / assignments).toFixed(1) : null })) };
  });
  return {
    generatedAt: new Date(now).toISOString(), windowHours: hours, recordCount: records.length, unknownDates,
    figures: figures.sort((a, b) => b.newsArticles - a.newsArticles || b.socialPosts - a.socialPosts || a.name.localeCompare(b.name)),
    parties, socialCoverage: SOCIAL_COVERAGE.map(source => {
      const key = source.platform.toLowerCase();
      const posts = records.filter(r => r.socialPlatform === key && r.mediaType === 'social');
      return { ...source, status: posts.some(p => p.collectionMethod === 'authorized-feed') ? 'FEED_EVIDENCE_PRESENT' : posts.length ? 'IMPORT_ONLY' : source.status };
    }),
    methodology: 'News visibility is the count of distinct collected articles mentioning a reference public figure. Party shares divide figure/article assignments by all such assignments; an article can mention multiple figures. Social imports are counted separately. These metrics do not measure popularity, voter support, unique audience, endorsement or representative public opinion. Names and party affiliations require analyst verification.'
  };
}
