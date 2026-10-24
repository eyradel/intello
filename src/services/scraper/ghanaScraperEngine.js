import { FeedTransport } from './feedTransport.js';
import { cleanText, parseFeed, ghanaRelevance, deduplicateArticles } from './feedParsing.js';
import { readFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { inferGeography, regionalSummaries } from './regionalCoverage.js';
// ─── HIGH-THROUGHPUT GHANA OPEN-SOURCE SCRAPER ENGINE ─────────────────────────
// Resilient RSS & Public Media Scraper for Ghana Post Intelligence
// Zero External API Quota Required · 100% Local Natural Language Processing



import {
  resolveEntitiesFromText,
  analyzeTargetAwareSentiment,
  detectCoordinationClusters,
  extractDynamicNarratives,
  runLocalThinkingReasoning
} from '../intelligence/localThinkingEngine.js';

// Configured public feeds; availability and report accuracy are not guaranteed
export const GHANA_FEED_REGISTRY = [
  { id: 'google-ghana-top', name: 'Google News Ghana (National)', enabled: false, disabledReason: 'Robots policy disallows collection; use direct publishers', url: 'https://news.google.com/rss?hl=en-GH&gl=GH&ceid=GH:en', reliability: 98 },
  { id: 'google-ghana-politics', name: 'Ghana Politics Wire', enabled: false, disabledReason: 'Robots policy disallows collection; use direct publishers', url: 'https://news.google.com/rss/search?q=Ghana+(politics+OR+election+OR+parliament)&hl=en-GH&gl=GH&ceid=GH:en', reliability: 96 },
  { id: 'google-ghana-elections', name: 'Electoral & Governance Wire', enabled: false, disabledReason: 'Robots policy disallows collection; use direct publishers', url: 'https://news.google.com/rss/search?q=Ghana+(Mahama+OR+Bawumia+OR+Akufo-Addo+OR+NPP+OR+NDC)&hl=en-GH&gl=GH&ceid=GH:en', reliability: 95 },
  { id: 'google-ghana-economy', name: 'Economy, Cedi & Fiscal Wire', enabled: false, disabledReason: 'Robots policy disallows collection; use direct publishers', url: 'https://news.google.com/rss/search?q=Ghana+(economy+OR+cedi+OR+inflation+OR+IMF+OR+cocoa)&hl=en-GH&gl=GH&ceid=GH:en', reliability: 94 },
  { id: 'google-ghana-civic', name: 'Civic, Galamsey & Energy Wire', enabled: false, disabledReason: 'Robots policy disallows collection; use direct publishers', url: 'https://news.google.com/rss/search?q=Ghana+(dumsor+OR+galamsey+OR+water+OR+strike+OR+police)&hl=en-GH&gl=GH&ceid=GH:en', reliability: 94 },
  { id: '3news', name: '3News', url: 'https://3news.com/feed.xml' },
  { id: 'citi-fm', name: 'Citi Newsroom', url: 'https://citifmonline.com/feed/', reliability: 92 },
  { id: 'myjoyonline', name: 'JoyNews / MyJoyOnline', url: 'https://myjoyonline.com/feed/', reliability: 93 },
  { id: 'graphic-online', name: 'Graphic Online', url: 'https://www.graphic.com.gh/feed.xml', reliability: 94 },
  { id: 'ghanaweb', name: 'GhanaWeb', url: 'https://ghanaweb.com/GhanaHomePage/NewsArchive/rss.php', reliability: 90 },
  { id: 'peace-fm', name: 'Peace FM Online', url: 'https://www.peacefmonline.com/pages/rss/local.php', reliability: 89 },
];

export class GhanaScraperEngine {
  constructor({feeds = GHANA_FEED_REGISTRY, stateDir = process.env.GHANA_STATE_DIR, transport, persist = true} = {}) {
    this.persist = persist;
    this.feeds = feeds;
    this.transport = transport || new FeedTransport({allowedHosts: feeds.flatMap(f => {const host=new URL(f.url).hostname;return [host, host.startsWith('www.') ? host.slice(4) : `www.${host}`];})});
    this.feedCache = {};
    this.pendingRun = null;
    this.lastAttemptAt = null;
    this.lastError = null;
    this.cachedSignals = [];
    this.cachedTrending = [];
    this.cachedNarratives = [];
    this.cachedCoordination = null;
    this.cachedReasoningBrief = null;
    this.lastScrapedAt = null;
    this.isScrapingActive = false;
    this.stateFile = resolve(stateDir || '.ghana-state', 'snapshot.json');
    this.feedHealth = {};
    this.stats = {
      totalScrapedCount: 0,
      uniqueArticlesCount: 0,
      deduplicatedCount: 0,
      configuredFeedsCount: this.feeds.length,
      activeFeedsCount: 0,
      feedLatencies: {},
      zeroQuotaTokensUsed: 0
    };
    try {
      const saved = this.persist ? JSON.parse(readFileSync(this.stateFile, 'utf8')) : null;
      if (saved?.version === 1 && Array.isArray(saved.signals)) {
        this.cachedSignals = saved.signals.slice(0, 2000);
        this.lastScrapedAt = saved.lastScrapedAt;
        this.feedHealth = saved.feedHealth || {};
        this.feedCache = saved.feedCache || {};
      }
    } catch { /* A first run has no persisted snapshot. */ }
  }

  saveSnapshot() {
    if (!this.persist) return;
    mkdirSync(resolve(this.stateFile, '..'), { recursive: true });
    const temp = this.stateFile + `.${process.pid}.tmp`;
    writeFileSync(temp, JSON.stringify({ version: 1, lastScrapedAt: this.lastScrapedAt, signals: this.cachedSignals, feedHealth:this.feedHealth, feedCache:this.feedCache }));
    renameSync(temp, this.stateFile);
  }

  async collectFeed(feed) {
    const health = this.feedHealth[feed.id] ||= { failures: 0, nextAttemptAt: 0 };
    if(feed.enabled === false){health.status='DISABLED';health.error=feed.disabledReason;return [];}
    if (Date.now() < health.nextAttemptAt) return [];
    const items = await this.fetchSingleFeed(feed);
    const outcome = this.feedCache[feed.id]?.outcome;
    const success = outcome?.status === 'OK' || outcome?.status === 'NOT_MODIFIED' || outcome?.status === 'EMPTY';
    health.lastAttemptAt = new Date().toISOString();
    health.status = outcome?.status || (items.length ? 'OK' : 'FAILED');
    health.error = outcome?.error || null;
    health.httpStatus = outcome?.httpStatus || null;
    health.failures = success ? 0 : health.failures + 1;
    if (success) health.lastSuccessAt = health.lastAttemptAt;
    const retryAfter = outcome?.retryAfter;
    const retryMs = retryAfter ? (/^\d+$/.test(retryAfter) ? Number(retryAfter)*1000 : Math.max(0,Date.parse(retryAfter)-Date.now())) : 0;
    const backoff = success ? 300000 : Math.min(3600000, 60000 * 2 ** Math.min(health.failures, 6));
    health.nextAttemptAt = Math.max(Date.now()+Math.max(backoff,Number.isFinite(retryMs)?retryMs:0),outcome?.retryAt || 0);
    return items;
  }

  cleanXmlEntities(str) { return cleanText(str); }

  async fetchSingleFeed(feed) {
    const started = Date.now();
    const cache = this.feedCache[feed.id] ||= {};
    try {
      const headers = {};
      if(cache.etag)headers['If-None-Match']=cache.etag;
      if(cache.lastModified)headers['If-Modified-Since']=cache.lastModified;
      const response = await this.transport.get(feed.url,headers);
      this.stats.feedLatencies[feed.id]=Date.now()-started;
      if(response.status===304){cache.outcome={status:'NOT_MODIFIED',httpStatus:304};return [];}
      const contentType=response.headers.get('content-type') || '';
      if(/text\/html/i.test(contentType))throw new Error('Source returned HTML rather than a feed');
      const result = parseFeed(response.text,{...feed,url:response.url});
      cache.etag=response.headers.get('etag');
      cache.lastModified=response.headers.get('last-modified');
      cache.outcome={status:result.items.length?'OK':'EMPTY',httpStatus:200,rejected:result.rejected,entryCount:result.entryCount};
      return result.items;
    } catch(error) {
      this.stats.feedLatencies[feed.id]=Date.now()-started;
      cache.outcome={status:error.code || 'PARSE_OR_NETWORK_ERROR',error:error.message,httpStatus:error.httpStatus,retryAfter:error.retryAfter,retryAt:error.retryAt};
      return [];
    }
  }

  inferRegionFromText(text) {
    return inferGeography(text);
  }

  getRegionalSummaries(hours = 24) {
    return regionalSummaries(this.cachedSignals, Date.now(), hours);
  }

  inferCivicIssueFromText(text) {
    const t = text.toLowerCase();
    if (t.includes('dumsor') || t.includes('power') || t.includes('electricity') || t.includes('gridco') || t.includes('ecg')) return 'Electricity & Grid Reliability';
    if (t.includes('galamsey') || t.includes('mining') || t.includes('river') || t.includes('turbidity')) return 'Illegal Mining (Galamsey) & Water';
    if (t.includes('water') || t.includes('gwcl') || t.includes('potable')) return 'Potable Water Access';
    if (t.includes('cedi') || t.includes('inflation') || t.includes('fuel') || t.includes('fare') || t.includes('market') || t.includes('price')) return 'Cost of Living & Food Staples';
    if (t.includes('election') || t.includes('parliament') || t.includes('voter') || t.includes('speaker') || t.includes('collation')) return 'Electoral Dynamics & Governance';
    if (t.includes('health') || t.includes('hospital') || t.includes('doctor') || t.includes('nhis') || t.includes('nurse')) return 'Healthcare & Public Safety';
    if (t.includes('cocoa') || t.includes('farmer') || t.includes('fertilizer') || t.includes('agriculture')) return 'Agriculture & Farmer Incomes';
    if (t.includes('school') || t.includes('teacher') || t.includes('shs') || t.includes('student') || t.includes('university')) return 'Education & School Feeding';
    return 'National Civic Affairs';
  }

  runFullScrapePipeline() {
    if (this.pendingRun) return this.pendingRun;
    this.pendingRun = this.executePipeline().then(() => this.getScraperSnapshot()).finally(() => { this.pendingRun=null; });
    return this.pendingRun;
  }

  async executePipeline() {
    this.lastAttemptAt = new Date().toISOString();
    this.lastError = null;
    this.isScrapingActive = true;

    try {
      // 1. Concurrent Fetch Across Feeds
      const feedResults = [];
      // At most three concurrent feeds, with per-feed cooldown and backoff.
      for (let offset = 0; offset < this.feeds.length; offset += 3) {
        feedResults.push(...await Promise.allSettled(
          this.feeds.slice(offset, offset + 3).map(feed => this.collectFeed(feed))
        ));
      }

      const rawItems = [];
      feedResults.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          rawItems.push(...r.value);
        }
      });

      this.stats.activeFeedsCount = Object.values(this.feedHealth).filter(h => ['OK','NOT_MODIFIED','EMPTY'].includes(h.status)).length;
      this.stats.totalScrapedCount += rawItems.length;

      const relevant = rawItems.filter(item => ghanaRelevance(item).accepted);
      this.stats.rejectedIrrelevantCount = rawItems.length-relevant.length;
      const deduped = deduplicateArticles(relevant);
      const uniqueItems = deduped.items;
      this.stats.deduplicatedCount += deduped.duplicates;
      this.stats.uniqueArticlesCount = uniqueItems.length;

      // 3. Local Thinking Analysis on every unique item
      const enrichedSignals = [];
      const entityTally = {};

      for (let idx = 0; idx < uniqueItems.length; idx++) {
        const item = uniqueItems[idx];
        const fullContent = `${item.title} ${item.description}`;
        
        // Target Entity Disambiguation
        const matchedEntities = resolveEntitiesFromText(fullContent);
        const primaryEntity = matchedEntities[0] || null;
        const entityName = primaryEntity ? primaryEntity.name : item.source;

        // Target-Aware Sentiment with Ghana Lexicon
        const sentimentAnalysis = analyzeTargetAwareSentiment(fullContent, entityName);

        // Geolocation & Civic Issue inference
        const { region, regionId, regionMatches } = this.inferRegionFromText(fullContent);
        const issue = this.inferCivicIssueFromText(fullContent);

        // Determine Level and Category
        let category = 'MEDIA';
        const tLow = fullContent.toLowerCase();
        if (tLow.includes('npp') || tLow.includes('ndc') || tLow.includes('election') || tLow.includes('parliament') || tLow.includes('bawumia') || tLow.includes('mahama')) category = 'POLITICAL';
        else if (tLow.includes('strike') || tLow.includes('court') || tLow.includes('police') || tLow.includes('killed') || tLow.includes('arrest') || tLow.includes('crisis')) category = 'ALERTS';
        else if (tLow.includes('water') || tLow.includes('power') || tLow.includes('dumsor') || tLow.includes('fare') || tLow.includes('galamsey')) category = 'ISSUES';
        else if (tLow.includes('assembly') || tLow.includes('student') || tLow.includes('community') || tLow.includes('chief')) category = 'CIVIC';

        let level = 'INFO';
        if (category === 'ALERTS' || sentimentAnalysis.score < -45 || tLow.includes('dies') || tLow.includes('emergency') || tLow.includes('protest')) level = 'CRITICAL';
        else if (category === 'ISSUES' || sentimentAnalysis.score < -20 || tLow.includes('probe') || tLow.includes('warns')) level = 'WATCH';

        const sig = {
          id: item.stableId,
          provenance: item.provenance,
          publisher: item.publisher,
          feedId: item.feedId,
          feedName: item.feedName,
          regionMatches,
          publicationDateKnown: item.publicationDateKnown,
          ingestedAt: new Date().toISOString(),
          time: item.pubDate.toTimeString().split(' ')[0],
          timestamp: item.pubDate.toISOString(),
          level,
          category,
          region,
          regionId,
          headline: item.title,
          text: item.description || `${item.title}. Reported by ${item.source}.`,
          source: item.source,
          platform: 'Public news feed (unverified report)',
          confidence: sentimentAnalysis.confidence,
          sentiment: sentimentAnalysis.score,
          emotions: sentimentAnalysis.emotions,
          entity: entityName,
          entityParty: primaryEntity ? primaryEntity.party : 'CIVIC',
          issue,
          url: item.link
        };

        enrichedSignals.push(sig);

        // Update Entity Aggregation
        for (const ent of matchedEntities) {
          if (!entityTally[ent.name]) {
            entityTally[ent.name] = {
              ...ent,
              mentions: 0,
              weightedScore: 0,
              recentMentions: 0,
              sentimentSum: 0,
              articles: [],
              sources: new Set()
            };
          }
          const t = entityTally[ent.name];
          t.mentions++;
          t.weightedScore += (Date.now() - item.pubDate.getTime() < 3600000 ? 3 : 1);
          t.sentimentSum += sentimentAnalysis.score;
          t.sources.add(item.source);
          if (t.articles.length < 5) {
            t.articles.push({ headline: item.title, source: item.source, url: item.link, time: item.pubDate.toISOString() });
          }
        }
      }

      if (enrichedSignals.length) {
        const retained = new Map(this.cachedSignals.filter(s=>ghanaRelevance({title:s.headline,description:s.text,feedId:s.feedId || (s.url?.includes('news.google.com')?'google-legacy':'legacy')}).accepted).map(s => [s.id, s]));
        const titleKey=s=>`${s.timestamp?.slice(0,10)}:${s.headline?.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ')}`;
        const priorTitles=new Map([...retained.values()].map(s=>[titleKey(s),s.id]));
        for (const signal of enrichedSignals) {
          const id=retained.has(signal.id)?signal.id:priorTitles.get(titleKey(signal)) || signal.id;
          const prior = retained.get(id);
          const provenance=[...(prior?.provenance || []),...(signal.provenance || [])];
          const uniqueProvenance=[...new Map(provenance.map(p=>[`${p.feedId}:${p.url}`,p])).values()].slice(0,30);
          retained.set(id,{...signal,id,provenance:uniqueProvenance,firstSeenAt:prior?.firstSeenAt || prior?.ingestedAt || signal.ingestedAt,lastSeenAt:signal.ingestedAt});
          priorTitles.set(titleKey(signal),id);
        }
        this.cachedSignals = [...retained.values()]
          .filter(s => Date.parse(s.timestamp) >= Date.now() - 7 * 86400000)
          .sort((a,b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 2000);
      }
      else {
        this.cachedSignals = this.cachedSignals.filter(s=>Date.parse(s.timestamp)>=Date.now()-7*86400000);
        if(Object.values(this.feedHealth).some(h=>h.lastSuccessAt>=this.lastAttemptAt)) this.lastScrapedAt=new Date().toISOString();
        this.saveSnapshot();
        return this.getScraperSnapshot();
      }

      // 4. Build Trending Entities
      this.cachedTrending = Object.values(entityTally).map(e => ({
        name: e.name,
        party: e.party,
        role: e.role,
        type: e.type,
        mentions: e.mentions,
        weightedScore: e.weightedScore,
        avgSentiment: Math.round(e.sentimentSum / Math.max(1, e.mentions)),
        sources: [...e.sources],
        sourceCount: e.sources.size,
        articles: e.articles,
        velocity: 'Baseline not established',
        surging: false
      })).sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 30);

      // 5. Run Local CIB Coordination Detection
      this.cachedCoordination = detectCoordinationClusters(enrichedSignals);

      // 6. Run Dynamic Emergent Narrative Modeler
      this.cachedNarratives = extractDynamicNarratives(uniqueItems);

      // 7. Run Local Causal Thinking & Strategic Reasoning
      this.cachedReasoningBrief = runLocalThinkingReasoning(enrichedSignals, [], this.cachedTrending);

      this.lastScrapedAt = new Date().toISOString();
      this.saveSnapshot();
    } catch (err) {
      this.lastError=err.message;
      console.error('Error executing scraper pipeline:', err);
    } finally {
      this.isScrapingActive = false;
    }

    return this.getScraperSnapshot();
  }

  async searchPoliticianOnInternet(rawQuery) {
    if (!rawQuery || rawQuery.trim().length === 0) return null;
    const cleanQuery = rawQuery.trim();
    const queryLow = cleanQuery.toLowerCase();

    // 1. Identify canonical identity & role mapping
    let canonicalName = cleanQuery;
    let role = 'Ghanaian Political Figure & Public Official';
    let party = 'Unknown';
    let affiliation = 'Public Administration of Ghana';
    let initials = cleanQuery.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'GH';
    let defaultId = `pol-custom-${cleanQuery.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    {
      // Check known entity registry
      const matched = resolveEntitiesFromText(cleanQuery);
      if (matched.length > 0) {
        canonicalName = matched[0].name;
        role = matched[0].role;
        party = matched[0].party;
        affiliation = matched[0].party === 'NPP' ? 'New Patriotic Party' : matched[0].party === 'NDC' ? 'National Democratic Congress' : 'Independent / Civic';
        initials = canonicalName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        defaultId = `pol-${matched[0].id || canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      }
    }

    // 2. Dual-query live search across Google News Ghana wires for maximum live freshness
    const queryUrls = [
      `https://news.google.com/rss/search?q=${encodeURIComponent(canonicalName + ' Ghana')}&hl=en-GH&gl=GH&ceid=GH:en`,
      `https://news.google.com/rss/search?q=${encodeURIComponent('Ghana ' + cleanQuery)}&hl=en-GH&gl=GH&ceid=GH:en`
    ];

    const feedPromises = queryUrls.map((url, i) => 
      this.fetchSingleFeed({ id: `live-pol-${i}`, url, name: 'Google News Wire' })
    );

    const feedResults = await Promise.allSettled(feedPromises);
    const combinedArticles = [];
    feedResults.forEach(r => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        combinedArticles.push(...r.value);
      }
    });

    // Also include matching articles from currently cached live feed
    if (Array.isArray(this.cachedSignals)) {
      this.cachedSignals.forEach(s => {
        const full = `${s.headline} ${s.text}`.toLowerCase();
        if (full.includes(canonicalName.toLowerCase()) || full.includes(cleanQuery.toLowerCase())) {
          combinedArticles.push({
            title: s.headline,
            description: s.text,
            link: s.url,
            pubDate: new Date(s.timestamp || Date.now()),
            source: s.source
          });
        }
      });
    }

    // 3. Deduplicate by title & STRICTLY SORT BY PUBDATE DESCENDING (Latest first)
    const seen = new Set();
    const uniqueArticles = [];
    for (const art of combinedArticles) {
      const norm = (art.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (norm.length > 10 && !seen.has(norm)) {
        seen.add(norm);
        uniqueArticles.push(art);
      }
    }

    uniqueArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // 4. Local thinking & sentiment analysis on the freshest real articles
    let totalScore = 0;
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    const extractedPoints = [];
    const positiveIssues = [];
    const negativeIssues = [];
    const recentArticlesList = [];
    const sourceTally = new Set();
    const regionMentions = {};

    const formatRelativeTime = (dateObj) => {
      const now = Date.now();
      const diffMs = now - dateObj.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 1) return 'Just now (Live Wire)';
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    for (const art of uniqueArticles.slice(0, 30)) {
      const fullText = (art.title + ' ' + (art.description || '')).trim();
      const sent = analyzeTargetAwareSentiment(fullText, canonicalName);
      totalScore += sent.score;

      // Extract publisher from title (e.g. "... - Daily Graphic" -> "Daily Graphic")
      const pubMatch = art.title.match(/\s+-\s+([^-]+)$/);
      const cleanHeadline = art.title.replace(/\s+-\s+[^-]+$/, '').trim();
      const publisherName = pubMatch ? pubMatch[1].trim() : (art.source || 'Ghana News Wire');
      sourceTally.add(publisherName);

      if (sent.score >= 10) posCount++;
      else if (sent.score <= -10) negCount++;
      else neuCount++;

      // Infer region
      const { regionId } = this.inferRegionFromText(fullText);
      if (regionId) regionMentions[regionId] = (regionMentions[regionId] || 0) + 1;

      const relTime = formatRelativeTime(new Date(art.pubDate));

      // Extract authentic point directly from headline
      if (cleanHeadline.length > 20) {
        const pointText = `${cleanHeadline} [${publisherName} · ${relTime}]`;
        if (extractedPoints.length < 6 && !extractedPoints.some(p => p.includes(cleanHeadline.substring(0, 25)))) {
          extractedPoints.push(pointText);
        }
      }

      if (sent.score > 12) {
        if (!positiveIssues.some(p => p.includes(cleanHeadline.substring(0, 20)))) {
          positiveIssues.push(`${cleanHeadline} (${publisherName})`);
        }
      } else if (sent.score < -12) {
        if (!negativeIssues.some(n => n.includes(cleanHeadline.substring(0, 20)))) {
          negativeIssues.push(`${cleanHeadline} (${publisherName})`);
        }
      }

      if (recentArticlesList.length < 10) {
        recentArticlesList.push({
          headline: cleanHeadline,
          source: publisherName,
          url: art.link,
          time: art.pubDate ? new Date(art.pubDate).toISOString() : new Date().toISOString(),
          relativeTime: relTime,
          sentiment: sent.score
        });
      }
    }

    const totalSample = uniqueArticles.length || 1;
    const posPct = Math.round((posCount / Math.max(1, posCount + neuCount + negCount)) * 100);
    const negPct = Math.round((negCount / Math.max(1, posCount + neuCount + negCount)) * 100);
    const neuPct = Math.max(0, 100 - posPct - negPct);
    const nationalSentiment = uniqueArticles.length > 0 ? Math.round(totalScore / Math.min(30, uniqueArticles.length)) : null;

    // Popularity score calculation (0 - 100 scale)
    const mentionDensity = Math.min(65, uniqueArticles.length * 2.8);
    const positiveFactor = Math.max(0, (nationalSentiment + 50) * 0.35);
    const popularityScore = null; // No representative popularity measurement exists.

    // Latest breaking event derived directly from the #1 freshest article
    const freshestArticle = recentArticlesList[0];
    const topTopic = freshestArticle ? freshestArticle.headline : 'Government Economic Strategy';

    // AI Summary generated locally from real scraped news topics
    const localAiSummary = `Real-time public OSINT scan across ${uniqueArticles.length} recent Ghanaian news articles (sorted by recency). Current media coverage is heavily centered on "${topTopic}", with reports streaming in from ${[...sourceTally].slice(0, 4).join(', ')}. Heuristic news tone registers at ${nationalSentiment > 0 ? '+' : ''}${nationalSentiment} with ${posPct}% positive discussion share and ${negPct}% scrutiny/criticism.`;

    return {
      id: defaultId,
      name: canonicalName,
      searchQuery: cleanQuery,
      initials,
      role,
      party,
      affiliation,
      aliases: [cleanQuery, canonicalName],
      nationalSentiment,
      popularityScore,
      popularityLevel: popularityScore >= 75 ? 'HIGH MEDIA VISIBILITY' : popularityScore >= 50 ? 'MODERATE VISIBILITY' : 'EMERGING',
      positivePct: posPct,
      neutralPct: neuPct,
      negativePct: negPct,
      movement24h: null,
      movement7d: null,
      movement30d: null,
      mentions: String(uniqueArticles.length),
      mentionCount: uniqueArticles.length,
      velocity: 'Baseline not established',
      points: extractedPoints.slice(0, 6),
      topPositiveIssues: positiveIssues.slice(0, 4),
      topNegativeIssues: negativeIssues.slice(0, 4),
      dominantTopics: extractedPoints.slice(0, 4).map(p => p.split(' [')[0]),
      recentArticles: recentArticlesList,
      highestDiscussionRegions: Object.keys(regionMentions),
      regionalBreakdown: regionMentions,
      confidence: null,
      sourceDistribution: {
        news: uniqueArticles.length ? 100 : 0,
        social: 0,
        broadcast: 0,
        forums: 0
      },
      aiSummary: localAiSummary,
      events: recentArticlesList.slice(0, 4).map(a => ({
        date: a.relativeTime,
        title: a.headline,
        impact: `${a.sentiment > 0 ? '+' : ''}${(a.sentiment * 0.1).toFixed(1)} pts`
      })),
      sentimentHistory: [],
      isLiveScraped: true,
      scrapedAt: new Date().toISOString(),
      liveArticlesCount: uniqueArticles.length,
      freshnessLabel: 'PUBLIC FEED RESULTS — CHECK ARTICLE DATES',
      quotaUsed: '0 Tokens (Direct Google News & Press Wire Scraping + Local Thinking)'
    };
  }

  getScraperSnapshot() {
    return {
      status: this.isScrapingActive ? 'COLLECTING' : !this.lastScrapedAt ? 'NO_DATA' : Date.now() - Date.parse(this.lastScrapedAt) > 1800000 ? 'STALE' : 'ONLINE',
      lastScrapedAt: this.lastScrapedAt,
      lastAttemptAt: this.lastAttemptAt,
      lastError: this.lastError,
      isScrapingActive: this.isScrapingActive,
      stats: this.stats,
      feedHealth: this.feedHealth,
      limitations: ['Heuristic text analysis is unvalidated', 'Coverage is limited to accessible configured RSS/Atom feeds', 'News tone is not public opinion'],
      signalsCount: this.cachedSignals.length,
      trendingCount: this.cachedTrending.length,
      narrativesCount: this.cachedNarratives.length,
      coordinationRisk: this.cachedCoordination?.globalCoordinationScore ?? null,
      quotaUsed: '0 Tokens (Pure Local Processing)'
    };
  }
}

export const ghanaScraper = new GhanaScraperEngine();
