import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { inferGeography, regionalSummaries } from '../src/services/scraper/regionalCoverage.js';
import { GhanaScraperEngine } from '../src/services/scraper/ghanaScraperEngine.js';
test('specific regions do not collapse into older regions', () => {
  for (const name of ['Western North','Bono East','Upper East','Upper West']) assert.equal(inferGeography(name).region,name);
});
test('unknown geography stays unknown and words do not match substrings', () => {
  assert.equal(inferGeography('National promotion and motivation').region,'Unassigned');
  assert.equal(inferGeography('Wa hospital').region,'Upper West');
  assert.equal(inferGeography('Kumasi and Tamale').regionMatches.length,2);
});
test('all 16 regions show coverage gaps and exclude undated evidence', () => {
  const result = regionalSummaries([{timestamp:new Date().toISOString(),publicationDateKnown:false,regionMatches:[{region:'Ashanti'}]}]);
  assert.equal(result.regions.length,16);
  assert.equal(result.regions.every(r=>r.articleCount===0),true);
  assert.equal(result.unknownPublicationDateCount,1);
});
test('empty collection preserves prior evidence', async () => {
  const ghanaScraper = new GhanaScraperEngine({feeds:[],stateDir:mkdtempSync(join(tmpdir(),'ghana-coverage-test-'))});
  const previous = ghanaScraper.cachedSignals;
  const fetch = ghanaScraper.fetchSingleFeed;
  ghanaScraper.cachedSignals = [{id:'retained',timestamp:new Date().toISOString()}];
  ghanaScraper.fetchSingleFeed = async () => [];
  try { await ghanaScraper.runFullScrapePipeline(); assert.equal(ghanaScraper.cachedSignals[0].id,'retained'); }
  finally { ghanaScraper.cachedSignals=previous; ghanaScraper.fetchSingleFeed=fetch; }
});
