import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { parseFeed, canonicalUrl, ghanaRelevance, deduplicateArticles } from '../src/services/scraper/feedParsing.js';
import { FeedTransport } from '../src/services/scraper/feedTransport.js';
import { GhanaScraperEngine } from '../src/services/scraper/ghanaScraperEngine.js';
const now=Date.parse('2026-10-24T12:00:00Z');
const feed={id:'google-test',name:'Test wire',url:'https://news.example/feed'};
const rss=(title='Ghana hospital report',date='Sat, 24 Oct 2026 10:00:00 GMT')=>`<rss version="2.0"><channel><title>Test Publisher</title><item data-id="1"><title><![CDATA[${title}]]></title><link>https://news.example/story?utm_source=feed</link><description><![CDATA[<p>Report &amp; context&nbsp; here</p>]]></description><pubDate>${date}</pubDate><source url="https://publisher.example">Actual Publisher</source></item></channel></rss>`;
test('RSS attributes, CDATA, publisher, HTML entities and canonical links',()=>{
 const {items}=parseFeed(rss(),feed,now);assert.equal(items.length,1);assert.equal(items[0].source,'Actual Publisher');assert.equal(items[0].link,'https://news.example/story');assert.equal(items[0].description,'Report & context here');
});
test('Atom namespaced feed, alternate link and published date',()=>{
 const {items}=parseFeed('<feed xmlns="http://www.w3.org/2005/Atom"><title>Journal</title><entry><title>Ghana agriculture report</title><link rel="self" href="https://news.example/self"/><link rel="alternate" href="/article"/><published>2026-10-24T08:00:00Z</published><summary>Field report</summary></entry></feed>',feed,now);
 assert.equal(items[0].link,'https://news.example/article');assert.equal(items[0].publicationDateKnown,true);
});
test('RDF feeds supported',()=>{
 const {items}=parseFeed('<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><channel><title>Publisher</title></channel><item><title>Ghana public report</title><link>https://news.example/a</link><dc:date xmlns:dc="http://purl.org/dc/elements/1.1/">2026-10-24T10:00:00Z</dc:date></item></rdf:RDF>',feed,now);assert.equal(items.length,1);
});
test('malformed XML, HTML and entity declarations rejected',()=>{
 for(const xml of ['<rss><channel></rss>','<html><body>Error</body></html>','<!DOCTYPE rss [<!ENTITY x "abc">]><rss/>'])assert.throws(()=>parseFeed(xml,feed,now));
});
test('undated evidence is explicit; future and expired articles rejected',()=>{
 assert.equal(parseFeed(rss('Ghana news report','invalid'),feed,now).items[0].publicationDateKnown,false);
 assert.equal(parseFeed(rss('Ghana news report','2027-01-01'),feed,now).rejected.futureDate,1);
 assert.equal(parseFeed(rss('Ghana news report','2020-01-01'),feed,now).rejected.old,1);
});
test('unsafe article links rejected; tracking parameters removed',()=>{
 assert.equal(canonicalUrl('javascript:alert(1)',feed.url),null);assert.equal(canonicalUrl('https://user:pass@news.example',feed.url),null);
 assert.equal(canonicalUrl('/a?b=2&utm_source=x#fragment',feed.url),'https://news.example/a?b=2');
});
test('Ghana relevance rejects global acronym collisions',()=>{
 assert.equal(ghanaRelevance({title:'NDC cancer trial results',feedId:'google-test'}).accepted,false);
 assert.equal(ghanaRelevance({title:'Tamale water report',feedId:'google-test'}).accepted,true);
});
test('exact duplicate reports retain feed provenance',()=>{
 const item=parseFeed(rss(),feed,now).items[0];const result=deduplicateArticles([item,{...item,feedId:'other',link:'https://another.example/a'}]);assert.equal(result.items.length,1);assert.equal(result.duplicates,1);assert.equal(result.items[0].provenance.length,2);
});
test('redirects remain restricted to approved HTTPS hosts',async()=>{
 const transport=new FeedTransport({allowedHosts:['news.example'],checkRobots:false,fetchImpl:async()=>new Response('',{status:302,headers:{location:'http://127.0.0.1/private'}})});
 await assert.rejects(transport.get(feed.url),e=>e.code==='UNAPPROVED_URL');
});
test('redirect success, oversized responses, 304 and rate limit diagnostics',async()=>{
 let count=0;const transport=new FeedTransport({allowedHosts:['news.example'],checkRobots:false,fetchImpl:async()=>++count===1?new Response('',{status:302,headers:{location:'/new'}}):new Response('feed')});
 assert.equal((await transport.get(feed.url)).url,'https://news.example/new');
 const large=new FeedTransport({allowedHosts:['news.example'],maxBytes:3,checkRobots:false,fetchImpl:async()=>new Response('toolarge')});await assert.rejects(large.get(feed.url),e=>e.code==='TOO_LARGE');
 const limited=new FeedTransport({allowedHosts:['news.example'],checkRobots:false,fetchImpl:async()=>new Response('',{status:429,headers:{'retry-after':'120'}})});await assert.rejects(limited.get(feed.url),e=>e.code==='HTTP_429'&&e.retryAfter==='120');
 const unchanged=new FeedTransport({allowedHosts:['news.example'],checkRobots:false,fetchImpl:async()=>new Response(null,{status:304})});assert.equal((await unchanged.get(feed.url)).status,304);
});
test('robots denial prevents fetching feed',async()=>{
 const requests=[];const transport=new FeedTransport({allowedHosts:['news.example'],fetchImpl:async url=>{requests.push(String(url));return new Response('User-agent: *\nDisallow: /feed');}});
 await assert.rejects(transport.get(feed.url),e=>e.code==='ROBOTS_DENIED');assert.equal(requests.length,1);
});
test('single-flight refresh, persistence and conditional requests',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'ghana-collector-test-'));let calls=0;let headers;
 const localFeed={...feed,id:'local-test'};
 const transport={get:async(url,h)=>{calls++;headers=h;return {status:calls===1?200:304,text:rss('Ghana public report',new Date().toISOString()),url,headers:new Headers({etag:'"v1"'})};}};
 try{
  const engine=new GhanaScraperEngine({feeds:[localFeed],stateDir:dir,transport});
  const first=engine.runFullScrapePipeline();const second=engine.runFullScrapePipeline();assert.equal(first,second);await first;assert.equal(calls,1);assert.equal(engine.cachedSignals.length,1);
  const restored=new GhanaScraperEngine({feeds:[localFeed],stateDir:dir,transport});assert.equal(restored.cachedSignals.length,1);restored.feedHealth[localFeed.id].nextAttemptAt=0;await restored.runFullScrapePipeline();assert.equal(headers['If-None-Match'],'"v1"');assert.equal(restored.cachedSignals.length,1);assert.equal(restored.feedHealth[localFeed.id].status,'NOT_MODIFIED');
 }finally{if(!resolve(dir).startsWith(resolve(tmpdir())+sep)||!dir.includes('ghana-collector-test-'))throw new Error('Unexpected test cleanup directory');rmSync(dir,{recursive:true,force:true});}
});

test('deadline aborts an unresponsive source',async()=>{
 const transport=new FeedTransport({allowedHosts:['news.example'],checkRobots:false,timeoutMs:10,fetchImpl:async(url,{signal})=>new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(signal.reason),{once:true});})});
 // Hold the event loop open while AbortSignal.timeout uses an unreferenced timer.
 const keepAlive=setInterval(()=>{},1000);
 try{await assert.rejects(transport.get(feed.url),e=>e.code==='TIMEOUT');}finally{clearInterval(keepAlive);}
});
test('rate-limit backoff and disabled feeds prevent repeat requests',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'ghana-backoff-test-'));let calls=0;
 const engine=new GhanaScraperEngine({feeds:[feed],stateDir:dir,transport:{get:async()=>{calls++;const error=new Error('Rate limited');error.code='HTTP_429';error.httpStatus=429;error.retryAfter='600';throw error;}}});
 await engine.collectFeed(feed);await engine.collectFeed(feed);
 assert.equal(calls,1);assert.ok(engine.feedHealth[feed.id].nextAttemptAt>=Date.now()+590000);
 await engine.collectFeed({...feed,id:'disabled',enabled:false,disabledReason:'Not permitted'});assert.equal(calls,1);assert.equal(engine.feedHealth.disabled.status,'DISABLED');
});
