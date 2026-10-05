import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { deny } from './securityGuards.ts';
import { requireApiAdmin } from './researchApiSecurity.ts';
import { verifyApiContext,callApiOperation } from './researchApiInternal.ts';
export async function operationClient(req,operation) {
  const base44=createClientFromRequest(req);
  const input=await req.clone().json().catch(()=>({}));
  if(!input.__research_context) return base44;
  const context=await verifyApiContext(input,operation);
  const key=await base44.asServiceRole.entities.ResearchApiKey.get(context.key_id);
  if(key.status!=='active') deny('Invalid or revoked API key.',401);
  const owner=await base44.asServiceRole.entities.User.get(key.owner_user_id);
  if(!owner) deny('API owner no longer exists.',403);
  requireApiAdmin(owner);
  return scopedApiClient(base44,owner,(name,data)=>callApiOperation(base44,name,data,key.id,context.request_id));
}
const writable=['SimulationDraft','SimulationJob','DrugDiscoveryJob'];
export function scopedApiClient(base44,owner,invoke) {
  const entities=new Proxy({}, {get:(_,name)=> {
    const store=base44.asServiceRole.entities[name];
    if(![...writable,'Chemical','SecurityActionLog','SafetyAuditLog'].includes(name)) deny('This resource is not exposed by the API.',403);
    const links=base44.asServiceRole.entities.ResearchApiJob;
    const scope=async query=> {
      const filter={...(query || {})};
      if(!writable.includes(name)) return {$and:[filter,name==='SecurityActionLog'?{actor_id:owner.id}:{created_by_id:owner.id}]};
      if(filter.created_by_id===owner.id) delete filter.created_by_id;
      const linked=await links.filter({owner_user_id:owner.id,record_type:name,...(typeof filter.id==='string'?{record_id:filter.id}:{})},'-created_date',500);
      return {$and:[filter,{$or:[{created_by_id:owner.id},{id:{$in:linked.map(link=>link.record_id)}}]}]};
    };
    const annotate=record=>writable.includes(name)?{...record,api_owner_user_id:owner.id}:record;
    const filter=async(query,sort,limit)=> (await store.filter(await scope(query),sort,Math.min(limit || 100,500))).map(annotate);
    const owned=async id=>{const found=await filter({id},undefined,1);if(!found.length) deny('Resource not found.',404);return found[0];};
    return {filter,list:(sort,limit)=>filter({},sort,limit),get:owned,
      create:async data=>{
        if(name==='Chemical') deny('Read-only API resource.',403);
        if(name==='SecurityActionLog' && data.actor_id!==owner.id) deny('Forbidden',403);
        const {created_by_id:ignored,id:ignoredId,...safe}=data;
        const record=await store.create(safe);
        if(writable.includes(name)) {
          try {await links.create({owner_user_id:owner.id,record_type:name,record_id:record.id});}
          catch(error) {await store.delete(record.id);throw error;}
        }
        return annotate(record);
      },
      update:async(id,data)=>{if(!writable.includes(name)) deny('Read-only API resource.',403);await owned(id);const {created_by_id:ignoredCreator,id:ignored,api_owner_user_id:ignoredOwner,...safe}=data;return annotate(await store.update(id,safe));}
    };
  }});
  const auth={me:async()=>({...owner,role:'user',admin_granted_access:false,product_access:['research'],subscription_status:'active',subscription_end_date:null}),isAuthenticated:async()=>true};
  const scoped={entities,auth,integrations:base44.asServiceRole.integrations,functions:{invoke}};
  return {...scoped,asServiceRole:scoped};
}