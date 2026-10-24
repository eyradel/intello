import { analyzeTargetAwareSentiment, resolveEntitiesFromText } from '../services/intelligence/localThinkingEngine.js';

export function createVercelHandler(engine) {
  let lastCheck = 0;
  async function ensureCollection() {
    if (engine.pendingRun) return engine.pendingRun;
    if (!lastCheck || Date.now() - lastCheck >= 900000) {
      lastCheck = Date.now();
      await engine.runFullScrapePipeline();
    }
  }
  return async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, data) => { res.statusCode = status; res.end(JSON.stringify(data)); };
    try {
      const url = new URL(req.url, 'http://localhost');
      const route = url.searchParams.get('route') || url.pathname.replace(/^\/api\/v1\//, '');
      if (!['GET', 'POST'].includes(req.method)) {
        res.setHeader('Allow', 'GET, POST');
        return send(405, { error: 'Method not allowed' });
      }
      if (route === 'thinking/analyze') {
        let body = req.body;
        if (body == null && req.method === 'POST') {
          let raw = '';
          for await (const chunk of req) {
            raw += chunk;
            if (Buffer.byteLength(raw) > 16384) return send(413, { error: 'Input exceeds 16 KiB' });
          }
          body = raw ? JSON.parse(raw) : {};
        }
        if (typeof body === 'string') body = JSON.parse(body);
        const text = body?.text || url.searchParams.get('text') || '';
        if (typeof text !== 'string' || !text.trim() || text.length > 16000) return send(400, { error: 'Provide text between 1 and 16000 characters' });
        const entities = resolveEntitiesFromText(text);
        const targetEntity = entities[0]?.name || null;
        return send(200, { text, entities, targetEntity, sentiment: analyzeTargetAwareSentiment(text, targetEntity), engineStatus: 'LOCAL_HEURISTICS_UNVALIDATED' });
      }
      const supported = ['coverage/regions', 'scraper/status', 'scraper/refresh', 'live-signals', 'signals', 'trending-entities', 'thinking/national-brief', 'thinking/narratives', 'thinking/coordination', 'politicians/search'];
      if (!supported.includes(route)) return send(404, { error: 'Unknown service route', route });
      if (req.method === 'POST' && route !== 'scraper/refresh') return send(405, { error: 'Use GET for this route' });
      await ensureCollection();
      if (route === 'coverage/regions') return send(200, engine.getRegionalSummaries(Math.min(168, Math.max(1, Number(url.searchParams.get('hours')) || 24))));
      if (route === 'scraper/status') return send(200, { ...engine.getScraperSnapshot(), hosting: { runtime: 'vercel-function', storage: 'ephemeral-memory', collection: 'request-driven', durableRetention: false } });
      if (route === 'scraper/refresh') return send(200, { success: !engine.lastError, snapshot: engine.getScraperSnapshot(), message: 'Collection checked; source cooldowns apply' });
      if (route === 'live-signals' || route === 'signals') return send(200, engine.cachedSignals);
      if (route === 'trending-entities') return send(200, engine.cachedTrending);
      if (route === 'thinking/national-brief') return send(200, engine.cachedReasoningBrief);
      if (route === 'thinking/narratives') return send(200, engine.cachedNarratives);
      if (route === 'thinking/coordination') return send(200, engine.cachedCoordination);
      if (route === 'politicians/search') return send(200, await engine.searchPoliticianOnInternet((url.searchParams.get('query') || url.searchParams.get('q') || '').slice(0, 150)));
    } catch (error) {
      return send(error instanceof SyntaxError ? 400 : 503, { error: error instanceof SyntaxError ? 'Invalid JSON body' : 'Collection service could not complete the request', detail: error.message });
    }
  };
}
