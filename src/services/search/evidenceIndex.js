import { createHash, randomUUID } from 'node:crypto';
import { PUBLIC_FIGURES } from '../intelligence/publicFigureAnalytics.js';

const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const tokens = value => normalize(value).split(' ').filter(Boolean);
const digest = value => createHash('sha256').update(value).digest('hex');
export class SearchInputError extends Error {}

export function parseSearch(query = '') {
  if (query.length > 512) throw new SearchInputError('Search is limited to 512 characters.');
  const terms = [], phrases = [], excluded = [];
  const expression = /(-?)(?:"([^"]+)"|([^\s"]+))/g;
  if ((query.match(/"/g) || []).length % 2) throw new SearchInputError('Close the quoted phrase.');
  for (const part of query.matchAll(expression)) {
    const value = normalize(part[2] || part[3]);
    if (!value) continue;
    if (part[1]) excluded.push(value);
    else if (part[2]) phrases.push(value);
    else terms.push(...tokens(value));
  }
  if (terms.length + phrases.length + excluded.length > 30) throw new SearchInputError('Use at most 30 search clauses.');
  return { terms: [...new Set(terms)], phrases, excluded };
}

function dateBoundary(value, end = false) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new SearchInputError('Dates must use YYYY-MM-DD.');
  const time = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) throw new SearchInputError('Invalid calendar date.');
  return time + (end ? 86400000 : 0);
}
function safeUrl(raw) {
  try { const url = new URL(raw); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}

export class EvidenceIndex {
  constructor(records) {
    this.postings = new Map();
    const seen = new Set();
    this.docs = [];
    for (const record of records.slice(0, 2000)) {
      const url = safeUrl(record.url);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const headline = String(record.headline || '').slice(0, 1000);
      const text = String(record.text || '').slice(0, 12000);
      const normalized = normalize(headline + ' ' + text);
      const figures = PUBLIC_FIGURES.filter(f => f.aliases.some(a => (' ' + normalized + ' ').includes(' ' + normalize(a) + ' '))).map(({ id, name, party }) => ({ id, name, party }));
      const frequencies = new Map();
      const words = tokens(headline + ' ' + headline + ' ' + text);
      words.forEach(word => frequencies.set(word, (frequencies.get(word) || 0) + 1));
      const doc = {
        id: record.id || digest(url).slice(0, 16), url, headline, text,
        source: String(record.publisher || record.source || 'Unknown source'), issue: String(record.issue || 'Unassigned'),
        region: String(record.region || 'Unassigned'), regionMatches: record.regionMatches || [],
        timestamp: record.publicationDateKnown !== false && Number.isFinite(Date.parse(record.timestamp)) ? record.timestamp : null,
        ingestedAt: record.ingestedAt || null, mediaType: record.mediaType || 'news', figures,
        media: (record.media || []).filter(m => safeUrl(m.url)).slice(0, 20), provenance: record.provenance || [],
        contentHash: digest(JSON.stringify([url, headline, text, record.timestamp || null])),
        normalized, frequencies, length: words.length || 1
      };
      const index = this.docs.length;
      this.docs.push(doc);
      for (const word of frequencies.keys()) {
        if (!this.postings.has(word)) this.postings.set(word, new Set());
        this.postings.get(word).add(index);
      }
    }
    this.averageLength = this.docs.reduce((n, d) => n + d.length, 0) / Math.max(1, this.docs.length);
  }

  search(params = {}) {
    const query = String(params.q || '');
    const parsed = parseSearch(query);
    const after = dateBoundary(params.after), before = dateBoundary(params.before, true);
    if (after != null && before != null && after >= before) throw new SearchInputError('Start date must not be after the end date.');
    const offset = Math.max(0, Math.min(2000, Math.floor(Number(params.offset) || 0)));
    const limit = Math.max(1, Math.min(50, Math.floor(Number(params.limit) || 20)));
    if (params.sort && !['recent', 'relevance'].includes(params.sort)) throw new SearchInputError('Unsupported sort mode.');
    let candidates = null;
    for (const term of parsed.terms) {
      const indexes = this.postings.get(term) || new Set();
      candidates = candidates == null ? new Set(indexes) : new Set([...candidates].filter(i => indexes.has(i)));
    }
    const all = candidates == null ? this.docs : [...candidates].map(i => this.docs[i]);
    const matched = all.filter(doc => {
      const time = doc.timestamp ? Date.parse(doc.timestamp) : null;
      return parsed.phrases.every(p => (' ' + doc.normalized + ' ').includes(' ' + p + ' ')) &&
        parsed.excluded.every(p => !(' ' + doc.normalized + ' ').includes(' ' + p + ' ')) &&
        (!params.source || doc.source === params.source) && (!params.issue || doc.issue === params.issue) &&
        (!params.region || doc.region === params.region || doc.regionMatches.some(r => r.region === params.region)) &&
        (!params.figure || doc.figures.some(f => f.id === params.figure)) &&
        (!params.mediaType || doc.mediaType === params.mediaType) &&
        (after == null || time != null && time >= after) && (before == null || time != null && time < before);
    });
    const rankTerms = [...new Set([...parsed.terms, ...parsed.phrases.flatMap(tokens)])];
    const ranked = matched.map(doc => {
      let score = 0;
      for (const term of rankTerms) {
        const tf = doc.frequencies.get(term) || 0;
        const df = this.postings.get(term)?.size || 0;
        const idf = Math.log(1 + (this.docs.length - df + 0.5) / (df + 0.5));
        score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * doc.length / this.averageLength));
      }
      const { normalized, frequencies, length, ...evidence } = doc;
      return { ...evidence, score: +score.toFixed(4), matchedTerms: rankTerms.filter(term => doc.frequencies.has(term)) };
    }).sort((a, b) => (params.sort === 'recent' || !rankTerms.length ? 0 : b.score - a.score) || (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0) || a.id.localeCompare(b.id));
    const timeline = new Map(), pairs = new Map();
    for (const doc of matched) {
      if (doc.timestamp) { const day = new Date(doc.timestamp).toISOString().slice(0, 10); timeline.set(day, (timeline.get(day) || 0) + 1); }
      for (let i = 0; i < doc.figures.length; i++) for (let j = i + 1; j < doc.figures.length; j++) {
        const a = doc.figures[i], b = doc.figures[j], key = [a.id, b.id].sort().join(':');
        const pair = pairs.get(key) || { figures: [a, b], reportCount: 0, evidenceIds: [] };
        pair.reportCount++; if (pair.evidenceIds.length < 10) pair.evidenceIds.push(doc.id); pairs.set(key, pair);
      }
    }
    const options = key => [...new Set(this.docs.map(d => d[key]).filter(Boolean))].sort();
    return {
      generatedAt: new Date().toISOString(), indexedCount: this.docs.length, total: ranked.length, offset, limit,
      results: ranked.slice(offset, offset + limit),
      timeline: [...timeline].sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
      correlations: [...pairs.values()].sort((a, b) => b.reportCount - a.reportCount).slice(0, 20),
      facets: { sources: options('source'), issues: options('issue'), regions: [...new Set(this.docs.flatMap(d => [d.region, ...d.regionMatches.map(r => r.region)]))].sort(), figures: PUBLIC_FIGURES.map(({ id, name }) => ({ id, name })), mediaTypes: options('mediaType') },
      receipt: { id: randomUUID(), queryHash: digest(JSON.stringify(params)), scope: 'collected-public-source-evidence', protectedAuditLog: false },
      limitations: 'Search relevance is not credibility. Co-mentions mean names appeared in the same collected report, not a verified relationship. Content hashes identify indexed text and do not authenticate publishers. Search receipts are not protected audit logs.'
    };
  }
}

const cache = new WeakMap();
export function searchEvidence(engine, params) {
  let entry = cache.get(engine);
  if (!entry || entry.records !== engine.cachedSignals) {
    entry = { records: engine.cachedSignals, index: new EvidenceIndex(engine.cachedSignals) };
    cache.set(engine, entry);
  }
  return { ...entry.index.search(params), collection: { lastCollectedAt: engine.lastScrapedAt || null, status: engine.getScraperSnapshot().status } };
}
