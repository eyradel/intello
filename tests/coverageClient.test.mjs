import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRegionalCoverage} from '../src/services/coverageClient.js';
const data={regions:[{id:'ashanti',evidence:[]}]};
test('coverage retries temporary server restart and succeeds',async()=>{
 let calls=0;const result=await loadRegionalCoverage(24,{wait:async()=>{},fetchImpl:async()=>++calls<3?new Response('Restarting',{status:503}):Response.json(data)});
 assert.deepEqual(result,data);assert.equal(calls,3);
});
test('coverage rejects HTML fallback responses with a bounded retry',async()=>{
 let calls=0;await assert.rejects(loadRegionalCoverage(24,{wait:async()=>{},fetchImpl:async()=>{calls++;return new Response('<html>Application</html>');}}));assert.equal(calls,3);
});
test('cancelled coverage request does not retry',async()=>{
 const controller=new AbortController();controller.abort();let calls=0;
 await assert.rejects(loadRegionalCoverage(24,{signal:controller.signal,fetchImpl:async()=>{calls++;return Response.json(data);}}));assert.equal(calls,0);
});
test('coverage rejects malformed schema',async()=>{
 await assert.rejects(loadRegionalCoverage(24,{wait:async()=>{},fetchImpl:async()=>Response.json({regions:[{}]})}),/invalid response/);
});
