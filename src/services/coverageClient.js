export async function loadRegionalCoverage(hours, {signal, fetchImpl=fetch, wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}) {
  let lastError;
  for(let attempt=0;attempt<3;attempt++){
    signal?.throwIfAborted();
    try {
      const timeout=AbortSignal.timeout(8000);
      const response=await fetchImpl(`/api/v1/coverage/regions?hours=${hours}`,{signal:signal?AbortSignal.any([signal,timeout]):timeout,cache:'no-store'});
      if(!response.ok)throw new Error(`Coverage service returned HTTP ${response.status}`);
      const data=await response.json();
      if(!Array.isArray(data.regions) || !data.regions.every(r=>typeof r.id==='string' && Array.isArray(r.evidence)))throw new Error('Coverage service returned an invalid response');
      return data;
    }catch(error){
      if(signal?.aborted)throw signal.reason;
      lastError=error;
      if(attempt<2)await wait(500*(attempt+1));
    }
  }
  throw lastError;
}
