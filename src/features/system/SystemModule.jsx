import React, { useEffect, useState } from 'react';

export default function SystemModule() {
  const [state,setState]=useState(null);
  const [error,setError]=useState('');
  const [updated,setUpdated]=useState(null);
  useEffect(()=>{
    const controller=new AbortController();
    async function read(){try{
      const response=await fetch('/api/v1/scraper/status',{signal:controller.signal});
      if(!response.ok) throw new Error('Collection health endpoint unavailable');
      setState(await response.json());setError('');setUpdated(new Date());
    }catch(e){if(e.name!=='AbortError')setError('Collection service unavailable. Previous measurements may be stale.');}}
    read();const timer=setInterval(read,30000);
    return ()=>{controller.abort();clearInterval(timer);};
  },[]);
  return <div className="system-module-view">
    <div className="module-topbar"><div><span className="telemetry-badge">MEASURED SERVICE TELEMETRY</span><h2 className="module-title">Collection Health and Assurance</h2></div></div>
    {error && <p role="status">{error}</p>}
    <section className="assurance-grid">
      <article><small>COLLECTOR</small><h3>{state?.status || 'UNAVAILABLE'}</h3><p>Last successful collection: {state?.lastScrapedAt ? new Date(state.lastScrapedAt).toLocaleString('en-GB',{timeZone:'Africa/Accra'})+' GMT' : 'Not recorded'}</p></article>
      <article><small>EVIDENCE RETENTION</small><h3>{state?.signalsCount ?? '—'} records</h3><p>Local snapshot; seven-day retention on successful collection, maximum 2,000 records.</p></article>
      <article><small>ANALYSIS VALIDATION</small><h3>Not established</h3><p>Sentiment, entity resolution and coordination outputs require independent evaluation and analyst review.</p></article>
      <article><small>DEPLOYMENT ASSURANCE</small><h3>Development only</h3><p>Authentication, role controls, protected audit storage and operational accreditation are not implemented.</p></article>
    </section>
    <section className="source-health-list"><h3>Source collection status</h3><p>Empty or failed responses indicate a coverage gap. Successful feed retrieval does not verify a report.</p>
      {Object.entries(state?.feedHealth || {}).map(([id,health])=><article key={id}><strong>{id}</strong><span className={['OK','NOT_MODIFIED','EMPTY'].includes(health.status)?'source-ok':'source-gap'}>{['OK','NOT_MODIFIED','EMPTY'].includes(health.status)?'RESPONDING':health.status==='DISABLED'?'DISABLED':'COVERAGE GAP'}</span><small>{health.error ? `${health.status}: ${health.error} · ` : ''}Consecutive failures: {health.failures} · Last attempt: {health.lastAttemptAt ? new Date(health.lastAttemptAt).toLocaleTimeString('en-GB',{timeZone:'Africa/Accra'})+' GMT' : 'Not measured'}</small></article>)}
      {!Object.keys(state?.feedHealth || {}).length && <p>No feed attempts recorded in this server process.</p>}
    </section>
    <p className="assurance-disclosure">No uptime, language accuracy or infrastructure deployment claims are inferred from this status endpoint. {updated ? `Last checked ${updated.toLocaleTimeString('en-GB',{timeZone:'Africa/Accra'})} GMT.` : ''}</p>
  </div>;
}
