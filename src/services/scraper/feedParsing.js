import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { createHash } from 'node:crypto';
import { inferGeography } from './regionalCoverage.js';
const list = value => value == null ? [] : Array.isArray(value) ? value : [value];
const value = node => typeof node === 'object' ? node?.['#text'] || '' : String(node ?? '');
const parser = new XMLParser({ignoreAttributes:false,removeNSPrefix:true,parseTagValue:false,htmlEntities:true,trimValues:true});
export function cleanText(input) {
  return value(input).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'")
    .replace(/&#(x[0-9a-f]+|\d+);/gi,(_,code)=>{const n=code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):Number(code);return n>0 && n<=0x10ffff?String.fromCodePoint(n):'';})
    .replace(/\s+/g,' ').trim();
}
export function canonicalUrl(raw, base) {
  try {const url=new URL(raw,base);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return null;
    url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^(fbclid|gclid|mc_cid|mc_eid)$/i.test(key))url.searchParams.delete(key);
    url.searchParams.sort();return url.href;
  }catch{return null;}
}
export function parseFeed(xml, feed, now=Date.now()) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('XML declarations with external or custom entities are not accepted');
  if (XMLValidator.validate(xml)!==true) throw new Error('Malformed feed XML');
  const doc=parser.parse(xml);
  const root=doc.rss?.channel || doc.feed || doc.RDF;
  if(!root)throw new Error('Response is not RSS, Atom or RDF');
  const entries=list(root.item || root.entry || doc.RDF?.item);
  const items=[];const rejected={invalid:0,futureDate:0,old:0};
  for(const entry of entries.slice(0,100)){
    const title=cleanText(entry.title).slice(0,600);
    const links=list(entry.link);
    const atomLink=links.find(l=>l && typeof l==='object' && (!l['@_rel'] || l['@_rel']==='alternate'));
    const rawLink=atomLink?.['@_href'] || value(links[0]) || (entry.guid?.['@_isPermaLink']!=='false'?value(entry.guid):'');
    const link=rawLink?canonicalUrl(rawLink,feed.url):null;
    if(!title || title.length<8 || !link){rejected.invalid++;continue;}
    const parsed=Date.parse(value(entry.pubDate || entry.published || entry.date || entry.updated));
    const publicationDateKnown=Number.isFinite(parsed);
    if(publicationDateKnown && parsed>now+15*60000){rejected.futureDate++;continue;}
    if(publicationDateKnown && parsed<now-7*86400000){rejected.old++;continue;}
    const publisher=cleanText(entry.source || root.title || feed.name);
    const media = [...list(entry.enclosure), ...list(entry.content), ...list(entry.thumbnail), ...list(entry.group?.content), ...list(entry.group?.thumbnail)]
      .filter(node => node && typeof node === 'object' && (node['@_url'] || node['@_href']))
      .map(node => ({ url: canonicalUrl(node['@_url'] || node['@_href'], feed.url), type: node['@_type'] || node['@_medium'] || 'unspecified', title: cleanText(node.title || '') }))
      .filter(item => item.url && /^(image|video|audio)(\/|$)/i.test(item.type)).slice(0, 20);
    items.push({title,media,mediaType:feed.isAuthorizedSocialFeed?'social':'news',socialPlatform:feed.socialPlatform || null,collectionMethod:feed.isAuthorizedSocialFeed?'authorized-feed':'publisher-feed',description:cleanText(entry.description || entry.summary || entry.encoded || entry.content).slice(0,1200),link,
      pubDate:new Date(publicationDateKnown?parsed:now),publicationDateKnown,publisher,publisherUrl:entry.source?.['@_url']?canonicalUrl(entry.source['@_url'],feed.url):null,
      source:publisher || feed.name,feedId:feed.id,feedName:feed.name,feedUrl:feed.url,ingestedAt:new Date(now).toISOString()});
  }
  return {items,rejected,entryCount:entries.length};
}
export function ghanaRelevance(item) {
  const text=`${item.title} ${item.description}`;
  const hasCountry=/\bghana(?:ian|ians)?\b|\bgalamsey\b|\bdumsor\b|\bcedi\b|\bmahama\b|\bbawumia\b|\bakufo[ -]addo\b/i.test(text);
  const place=inferGeography(text).regionMatches.length>0;
  // A domestic publisher supplies geographical context; Google query labels do not.
  const domestic=item.mediaType!=='social' && !String(item.feedId).startsWith('google-') && !String(item.feedId).startsWith('live-pol-');
  return {accepted:hasCountry||place||domestic,reason:hasCountry?'explicit-country-context':place?'place-mention':domestic?'domestic-source':'no-ghana-context'};
}
export function deduplicateArticles(items) {
  const result=[];const urls=new Map();const titles=new Map();let duplicates=0;
  for(const item of items){
    const title=item.title.toLocaleLowerCase('en').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
    const day=item.publicationDateKnown?item.pubDate.toISOString().slice(0,10):'undated';
    const key=`${item.mediaType || 'news'}:${item.socialPlatform || ''}:${day}:${title}`;
    const existing=urls.get(item.link)||titles.get(key);
    if(existing){duplicates++;existing.provenance.push({feedId:item.feedId,feedUrl:item.feedUrl,url:item.link,publisher:item.publisher});continue;}
    const article={...item,provenance:[{feedId:item.feedId,feedUrl:item.feedUrl,url:item.link,publisher:item.publisher}]};
    article.stableId='SIG-'+createHash('sha256').update(item.link).digest('hex').slice(0,16);
    result.push(article);urls.set(item.link,article);titles.set(key,article);
  }
  return {items:result,duplicates};
}
