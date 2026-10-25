import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPublicFigureAnalytics, validateSocialImport } from '../src/services/intelligence/publicFigureAnalytics.js';
import { parseFeed } from '../src/services/scraper/feedParsing.js';
import { validateSocialFeeds } from '../src/services/scraper/socialSources.js';
const now=Date.parse('2026-10-25T12:00:00Z');
const story=(id,text)=>({id,headline:text,url:`https://publisher.example/${id}`,timestamp:'2026-10-25T10:00:00Z',source:'Publisher',publicationDateKnown:true});
test('real article counts replace inflated popularity and duplicate URLs do not multiply',()=>{
  const s=story('one','Mahama and Bawumia discuss Ghana');
  const result=buildPublicFigureAnalytics([s,{...s,id:'copy'}],{now});
  assert.equal(result.recordCount,1);
  assert.equal(result.figures.find(f=>f.id==='john-mahama').newsArticles,1);
  assert.equal(result.parties.find(p=>p.party==='NDC').newsVisibilityShare,50);
  assert.equal(result.parties.find(p=>p.party==='NPP').newsVisibilityShare,50);
});
test('generic office titles and short aliases do not identify people',()=>{
  const result=buildPublicFigureAnalytics([story('generic','The president and minority leader met JM for a meeting')],{now});
  assert.equal(result.figures.reduce((n,f)=>n+f.newsArticles,0),0);
});
test('empty samples have no invented popularity or party shares',()=>{
  const result=buildPublicFigureAnalytics([],{now});
  assert.ok(result.parties.every(p=>p.newsVisibilityShare===null));
  assert.ok(result.figures.every(f=>f.newsArticles===0));
});
test('undated and out-of-window records excluded',()=>{
  const record=story('one','Mahama statement');
  const result=buildPublicFigureAnalytics([{...record,publicationDateKnown:false},{...record,url:'https://publisher.example/old',timestamp:'2020-01-01'}],{now});
  assert.equal(result.recordCount,0);assert.equal(result.unknownDates,1);
});
test('social imports require public scope, known public figure, valid platform URL and provenance',()=>{
  const payload={schemaVersion:1,publicContent:true,permissionBasis:'Owner authorized public export',records:[{platform:'twitter',figureId:'john-mahama',url:'https://x.com/example/status/123',publishedAt:new Date().toISOString(),text:'Public statement',public:true}]};
  const records=validateSocialImport(payload);
  assert.equal(records[0].socialPlatform,'x');
  const result=buildPublicFigureAnalytics(records);
  assert.equal(result.figures.find(f=>f.id==='john-mahama').socialPosts,1);
  assert.equal(result.figures.find(f=>f.id==='john-mahama').newsArticles,0);
  assert.throws(()=>validateSocialImport({...payload,publicContent:false}));
  assert.throws(()=>validateSocialImport({...payload,records:[{...payload.records[0],url:'https://x.com.evil.example/post'}]}));
  assert.throws(()=>validateSocialImport({...payload,records:[{...payload.records[0],figureId:'private-person'}]}));
});
test('publisher media enclosures are preserved as links without downloading',()=>{
  const result=parseFeed('<rss><channel><item><title>Ghana media bulletin</title><link>https://publisher.example/news</link><enclosure url="https://publisher.example/audio.mp3" type="audio/mpeg"/><enclosure url="javascript:alert(1)" type="image/png"/></item></channel></rss>',{url:'https://publisher.example/feed',id:'publisher',name:'Publisher'});
  assert.equal(result.items[0].media.length,1);
  assert.equal(result.items[0].media[0].type,'audio/mpeg');
});
test('social feed configuration requires public scope and authorization metadata',()=>{
  const feed={id:'official-feed',name:'Authorized feed',url:'https://publisher.example/social.xml',socialPlatform:'x',publicContent:true,permissionBasis:'Source-owner authorization'};
  assert.equal(validateSocialFeeds([feed])[0].isAuthorizedSocialFeed,true);
  assert.throws(()=>validateSocialFeeds([{...feed,permissionBasis:''}]));
  assert.throws(()=>validateSocialFeeds([{...feed,url:'http://127.0.0.1/feed'}]));
  assert.throws(()=>validateSocialFeeds([feed,feed]));
});
