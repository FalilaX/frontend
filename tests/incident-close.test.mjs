import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { apiErrorMessage } from '../src/app/utils/api-error.ts';
import { canCloseIncident } from '../src/app/utils/incident-closure.ts';

test('422 body validation becomes readable text without rejected input', () => {
  assert.equal(apiErrorMessage({detail:[{type:'missing',loc:['body'],msg:'Field required',input:{password:'secret'}}]}), 'Field required');
});
test('malformed errors and object messages use safe fallback', () => {
  for (const value of [null, {}, {message:{}}, {detail:[null,{},4]}, {detail:{msg:'x'}}]) {
    assert.equal(apiErrorMessage(value, 'Could not close incident.'), 'Could not close incident.');
  }
  assert.equal(apiErrorMessage({detail:'Workflow must be resolved before closure.'}), 'Workflow must be resolved before closure.');
});
test('closure requires explicit resolved workflow', () => {
  for (const value of [null, {}, {status:'resolved'}, {workflow:{status:'open'}}, {workflow:{status:'closed'}}, {workflow:{status:5}}]) assert.equal(canCloseIncident(value), false);
  assert.equal(canCloseIncident({workflow:{status:'RESOLVED'}}), true);
});
test('API failure provides renderable message and close makes one authenticated request', async () => {
  let source = await readFile(new URL('../src/app/utils/api-client.ts', import.meta.url), 'utf8');
  source = source.replace(/import[\s\S]*?from\s+["'][^"']+["'];/g, '');
  const prelude = `const {API_CONFIG, API_ENDPOINTS, buildApiUrl, buildApiUrlWithQuery, authenticatedFetch, apiErrorMessage} = globalThis.__incidentCloseTest;\n`;
  const requests=[];
  globalThis.__incidentCloseTest = {
    API_CONFIG:{TIMEOUT:1000}, API_ENDPOINTS:{INCIDENT_CLOSE:'/incidents/{incident_id}/close'},
    buildApiUrl:(path,params)=>path.replace('{incident_id}',params.incident_id),
    buildApiUrlWithQuery:()=>'', apiErrorMessage,
    authenticatedFetch:async (url, init)=>{
      requests.push({url,init});
      return new Response(JSON.stringify({detail:[{msg:'Field required',input:null}]}),{status:422});
    },
  };
  try {
    const client=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(prelude+source)).toString('base64'));
    await assert.rejects(client.closeIncident('SIM-test'), error=>error.status_code===422 && error.message==='Field required');
    assert.equal(requests.length,1);
    assert.equal(requests[0].init.method,'POST');
    assert.equal(requests[0].url,'/incidents/SIM-test/close');
  } finally { delete globalThis.__incidentCloseTest; }
});
