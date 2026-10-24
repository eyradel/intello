import { setTimeout as delayFor } from 'node:timers/promises';
import robotsParser from 'robots-parser';
export const AGENT='GhanaPostIntelligence/0.4';
export class CollectionError extends Error {
  constructor(code,message,details={}){super(message);this.code=code;Object.assign(this,details);}
}
export class FeedTransport {
  constructor({allowedHosts,fetchImpl=fetch,timeoutMs=12000,maxBytes=2*1024*1024,checkRobots=true}={}){
    this.allowedHosts=new Set(allowedHosts);this.fetch=fetchImpl;this.timeoutMs=timeoutMs;this.maxBytes=maxBytes;this.checkRobots=checkRobots;this.robots=new Map();this.hostQueues=new Map();this.nextHostAt=new Map();
  }
  validate(raw){const url=new URL(raw);if(url.protocol!=='https:' || url.username || url.password || (url.port && url.port!=='443') || !this.allowedHosts.has(url.hostname))throw new CollectionError('UNAPPROVED_URL','Only configured HTTPS source hosts may be fetched');return url;}
  async request(raw,{headers={},signal,robots=false}={}){
    let url=this.validate(raw);
    for(let redirects=0;redirects<=4;redirects++){
      if(!robots && this.checkRobots) await this.permission(url,signal);
      const res=await this.fetch(url,{headers:{'User-Agent':AGENT,'Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml',...headers},redirect:'manual',signal});
      if([301,302,303,307,308].includes(res.status)){
        await res.body?.cancel();
        if(!res.headers.get('location'))throw new CollectionError('REDIRECT','Missing redirect destination');
        url=this.validate(new URL(res.headers.get('location'),url));continue;
      }
      if(res.status===304)return {status:304,headers:res.headers,url:url.href,text:''};
      if(!res.ok){await res.body?.cancel();throw new CollectionError(`HTTP_${res.status}`,`Source returned HTTP ${res.status}`,{httpStatus:res.status,retryAfter:res.headers.get('retry-after')});}
      const chunks=[];let size=0;
      if(Number(res.headers.get('content-length'))>this.maxBytes){await res.body?.cancel();throw new CollectionError('TOO_LARGE','Feed exceeds size limit');}
      const reader=res.body?.getReader();
      if(reader){try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>this.maxBytes)throw new CollectionError('TOO_LARGE','Feed exceeds size limit');chunks.push(part.value);}}catch(e){await reader.cancel();throw e;}}
      return {status:res.status,headers:res.headers,url:url.href,text:Buffer.concat(chunks).toString('utf8')};
    }
    throw new CollectionError('REDIRECT_LIMIT','Too many source redirects');
  }
  async permission(url,signal){
    let entry=this.robots.get(url.origin);
    if(!entry || Date.now()>entry.expires){
      try{
        const response=await this.request(`${url.origin}/robots.txt`,{signal,robots:true});
        entry={parser:robotsParser(`${url.origin}/robots.txt`,response.text),expires:Date.now()+3600000};
      }catch(e){
        if(e.httpStatus===404 || e.httpStatus===410)entry={parser:robotsParser(`${url.origin}/robots.txt`,''),expires:Date.now()+3600000};
        else throw new CollectionError('ROBOTS_UNAVAILABLE','Source permissions could not be retrieved');
      }
      this.robots.set(url.origin,entry);
    }
    if(entry.parser.isAllowed(url.href,AGENT)===false)throw new CollectionError('ROBOTS_DENIED','Source robots policy disallows this feed');
    const delay=Math.min(86400,Math.max(1,entry.parser.getCrawlDelay(AGENT)||1))*1000;
    const until=this.nextHostAt.get(url.origin)||0;
    if(until-Date.now()>5000)throw new CollectionError('HOST_COOLDOWN','Host crawl interval has not elapsed',{retryAt:until});
    if(Date.now()<until)await delayFor(until-Date.now(),undefined,{signal});
    this.nextHostAt.set(url.origin,Date.now()+delay);
  }
  async get(url,headers={}){
    const host=this.validate(url).hostname;
    const prior=this.hostQueues.get(host)||Promise.resolve();
    const operation=prior.catch(()=>{}).then(async()=>{
      const signal=AbortSignal.timeout(this.timeoutMs);
      try{return await this.request(url,{headers,signal});}catch(e){if(signal.aborted)throw new CollectionError('TIMEOUT','Source request deadline exceeded');throw e;}
    });
    this.hostQueues.set(host,operation);
    try{return await operation;}finally{if(this.hostQueues.get(host)===operation)this.hostQueues.delete(host);}
  }
}
