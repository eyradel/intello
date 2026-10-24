import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createVercelHandler } from '../src/server/vercelHandler.js';
import { GhanaScraperEngine } from '../src/services/scraper/ghanaScraperEngine.js';

function fixture() {
  let collections = 0;
  const engine = {
    cachedSignals: [{ id: 'test-signal' }], cachedTrending: [], cachedNarratives: [], cachedCoordination: null, cachedReasoningBrief: null,
    runFullScrapePipeline: async () => { collections++; },
    getRegionalSummaries: hours => ({ regions: [], windowHours: hours }),
    getScraperSnapshot: () => ({ status: 'ONLINE' })
  };
  const handler = createVercelHandler(engine);
  async function call(url, method = 'GET') {
    const headers = {};
    let data;
    const res = { setHeader: (key, value) => { headers[key] = value; }, end: raw => { data = JSON.parse(raw); } };
    await handler({ url, method }, res);
    return { status: res.statusCode, data, headers };
  }
  return { call, count: () => collections, engine };
}
test('Vercel rewrite maps API requests to the deployed function', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.deepEqual(config.rewrites[0], { source: '/api/v1/:path*', destination: '/api/intelligence?route=:path*' });
  assert.equal(config.functions['api/intelligence.js'].maxDuration, 60);
});
test('rewritten coverage route preserves query window and throttles collection', async () => {
  const { call, count } = fixture();
  const result = await call('/api/intelligence?route=coverage/regions&hours=72');
  assert.equal(result.status, 200);
  assert.equal(result.data.windowHours, 72);
  await call('/api/v1/coverage/regions');
  assert.equal(count(), 1);
});
test('all reported missing routes return JSON', async () => {
  const { call } = fixture();
  for (const route of ['coverage/regions', 'live-signals', 'scraper/status', 'thinking/national-brief']) {
    const response = await call('/api/intelligence?route=' + route);
    assert.equal(response.status, 200);
    assert.match(response.headers['Content-Type'], /application\/json/);
  }
});
test('unknown routes do not trigger collection', async () => {
  const { call, count } = fixture();
  assert.equal((await call('/api/intelligence?route=unknown')).status, 404);
  assert.equal(count(), 0);
});
test('memory-only collector never writes a snapshot', () => {
  const engine = new GhanaScraperEngine({ feeds: [], persist: false, stateDir: '/unwritable-test-location' });
  assert.doesNotThrow(() => engine.saveSnapshot());
  assert.equal(engine.cachedSignals.length, 0);
});
