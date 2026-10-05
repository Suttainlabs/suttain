import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireApiAdmin,hasResearchSubscription,hashApiKey,reserveApiRequest } from '../../shared/researchApiSecurity.ts';
import { callApiOperation } from '../../shared/researchApiInternal.ts';
import { apiCatalog,dispatchApiOperation,validateApiInput } from '../../shared/researchApiOperations.ts';
import { deny } from '../../shared/securityGuards.ts';
import { waitUntil } from 'base44:runtime';
export default async function(req) {
  const requestId=crypto.randomUUID();
  const headers={'X-Request-Id':requestId,'Cache-Control':'no-store'};
  let auditStore,auditKey,admitted=false;
  const audit=status=>auditStore.updateMany({id:auditKey},{$set:{last_status:status},...(status>=400?{$inc:{error_count:1}}:{})}).catch(()=>console.error('API usage status update failed',requestId));
  try {
    if(req.method!=='POST') deny('Use POST with a JSON request.',405);
    const token=(req.headers.get('Authorization') || '').replace(/^Bearer\s+/i,'');
    if(!/^sut_live_[a-f0-9]{64}$/.test(token)) deny('Supply your API key as Authorization: Bearer <key>.',401);
    const base44=createClientFromRequest(req), store=base44.asServiceRole.entities.ResearchApiKey;
    const matches=await store.filter({key_hash:await hashApiKey(token),status:'active'},undefined,1);
    if(!matches.length) deny('Invalid or revoked API key.',401);
    const key=matches[0];
    const owners=await base44.asServiceRole.entities.User.filter({id:key.owner_user_id},undefined,1);
    requireApiAdmin(owners[0]);
    if(!await hasResearchSubscription(owners[0])) deny('The key owner must have an active paid Research subscription.',403);
    if(key.kind==='team') {
      const teams=await base44.asServiceRole.entities.Team.filter({id:key.team_id,created_by_id:key.owner_user_id},undefined,1);
      if(!teams.length) deny('Team access is no longer available.',403);
    }
    const text=await req.text();if(new TextEncoder().encode(text).byteLength>32000) deny('Maximum request size is 32 KB.',413);
    let body;try{body=JSON.parse(text);}catch{deny('Invalid JSON.',400);}
    if(!apiCatalog().some(e=>e.name===body?.operation)) deny('Unknown operation. See the API operation reference.',400);
    validateApiInput(body.operation,body.input);
    const quota=await reserveApiRequest(store,key.id,requestId);
    auditStore=store;auditKey=key.id;admitted=true;
    headers['X-RateLimit-Remaining']=String(quota.rate_remaining);headers['X-MonthlyLimit-Remaining']=String(quota.monthly_remaining);headers['X-MonthlyLimit-Reset']=quota.monthly_reset;
    const client={functions:{invoke:(name,input)=>callApiOperation(base44,name,input,key.id,requestId)}};
    const response=await dispatchApiOperation(body.operation,body.input,client);
    waitUntil(audit(response.status));
    const responseHeaders=new Headers(response.headers);for(const [name,value] of Object.entries(headers)) responseHeaders.set(name,value);
    return new Response(response.body,{status:response.status,headers:responseHeaders});
  } catch(error) {
    if(admitted) waitUntil(audit(error.status || 500));
    if(error.retryAfter) headers['Retry-After']=String(error.retryAfter);
    return Response.json({error:error.status?error.message:'API operation could not be completed.',code:error.code || (error.status===401?'INVALID_KEY':error.status===403?'RESEARCH_REQUIRED':'REQUEST_FAILED'),request_id:requestId},{status:error.status || 500,headers});
  }
}