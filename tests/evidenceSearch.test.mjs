import test from 'node:test';
import assert from 'node:assert/strict';
import { EvidenceIndex, parseSearch, searchEvidence } from '../src/services/search/evidenceIndex.js';
const records = [
  { id:'a', headline:'Mahama and Bawumia discuss water supply', text:'Water supply in Kumasi.', url:'https://example.org/a', timestamp:'2026-10-27T10:00:00Z', source:'Publisher A', region:'Ashanti', issue:'Water' },
  { id:'b', headline:'Ghana water project', text:'A football association supports water supply.', url:'https://example.org/b', timestamp:'2026-10-26T10:00:00Z', source:'Publisher B', region:'Greater Accra', issue:'Water' },
  { id:'c', headline:'Mahama football report', text:'Sports news.', url:'https://example.org/c', timestamp:'2026-10-25T10:00:00Z', source:'Publisher A', region:'Ashanti', issue:'Sport' },
  { id:'d', headline:'Undated water notice', text:'Water supplies.', url:'https://example.org/d', publicationDateKnown:false, timestamp:'2026-10-27T10:00:00Z', source:'Publisher A' }
];
test('quoted phrases, conjunctive terms and literal exclusions',()=>{
  const index=new EvidenceIndex(records);
  assert.deepEqual(index.search({q:'"water supply" -football'}).results.map(d=>d.id),['a']);
  assert.equal(index.search({q:'water kumasi'}).total,1);
  assert.equal(index.search({q:'water missingword'}).total,0);
  assert.equal(index.search({q:'-football'}).total,2);
});
test('region, source, figure and inclusive date filtering',()=>{
  const index=new EvidenceIndex(records);
  assert.equal(index.search({region:'Ashanti',source:'Publisher A',figure:'mahamudu-bawumia'}).total,1);
  assert.deepEqual(index.search({after:'2026-10-27',before:'2026-10-27'}).results.map(d=>d.id),['a']);
  assert.equal(index.search({after:'2026-10-28'}).total,0);
});
test('invalid syntax and calendar dates fail with bounded input',()=>{
  assert.throws(()=>parseSearch('"unclosed'),/Close/);
  assert.throws(()=>parseSearch('x'.repeat(513)),/512/);
  const index=new EvidenceIndex(records);
  assert.throws(()=>index.search({after:'2026-02-31'}),/calendar/);
  assert.throws(()=>index.search({after:'2026-10-28',before:'2026-10-27'}),/after/);
});
test('co-mention evidence and timeline reflect all filtered matches',()=>{
  const report=new EvidenceIndex(records).search({limit:1});
  assert.equal(report.results.length,1);
  assert.equal(report.total,4);
  assert.equal(report.correlations[0].reportCount,1);
  assert.deepEqual(report.correlations[0].evidenceIds,['a']);
  assert.equal(report.timeline.reduce((n,d)=>n+d.count,0),3);
  assert.equal(report.receipt.protectedAuditLog,false);
});
test('deduplication, safe links, stable hashes and index replacement',()=>{
  const index=new EvidenceIndex([...records,records[0],{...records[0],url:'javascript:alert(1)'}]);
  assert.equal(index.docs.length,4);
  const a=index.search({q:'kumasi'}).results[0];
  assert.equal(a.contentHash,new EvidenceIndex(records).search({q:'kumasi'}).results[0].contentHash);
  assert.match(a.contentHash,/^[a-f0-9]{64}$/);
  const engine={cachedSignals:records,getScraperSnapshot:()=>({status:'ONLINE'})};
  assert.equal(searchEvidence(engine,{}).total,4);engine.cachedSignals=[];
  assert.equal(searchEvidence(engine,{}).total,0);
});
