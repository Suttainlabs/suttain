import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser,deny } from '../../shared/securityGuards.ts';
import { API_LIMITS,hasResearchSubscription,newApiSecret,hashApiKey,safeKey,validateKeySettings } from '../../shared/researchApiSecurity.ts';
import { apiCatalog } from '../../shared/researchApiOperations.ts';
export default async function(req) {
  try {
    const base44=createClientFromRequest(req), user=await requireUser(base44);
    const text=await req.text();if(text.length>4000) deny('Request too large.',413);
    const input=JSON.parse(text || '{}'), action=input.action || 'list';
    const store=base44.asServiceRole.entities.ResearchApiKey;
    const keys=await store.filter({owner_user_id:user.id},'-created_date',API_LIMITS.keys+1);
    const teams=await base44.asServiceRole.entities.Team.filter({created_by_id:user.id},'-created_date',100);
    if(action==='revoke') {
      const key=keys.find(k=>k.id===input.id);if(!key) deny('Key not found.',404);
      await store.updateMany({id:key.id,owner_user_id:user.id},{$set:{status:'revoked',revoked_at:new Date().toISOString()},$inc:{version:1}});
      return Response.json({success:true});
    }
    const eligible=await hasResearchSubscription(user);
    if(action==='list') return Response.json({eligible,keys:keys.map(safeKey),teams:teams.map(t=>({id:t.id,name:t.name})),limits:API_LIMITS,catalog:apiCatalog(),monthly_reset:new Date(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth()+1,1)).toISOString()});
    if(!eligible) deny('An active paid Research subscription is required. Existing subscribers need no new purchase or migration.',403);
    if(action==='createTeam') {
      if(typeof input.name!=='string' || !input.name.trim() || input.name.length>80) deny('Enter a team name up to 80 characters.',400);
      if(teams.length>=20) deny('Team limit reached.',400);
      const team=await base44.entities.Team.create({name:input.name.trim(),members:[{email:user.email,role:'owner',joined_date:new Date().toISOString()}]});
      return Response.json({team:{id:team.id,name:team.name}});
    }
    if(action==='archive') {
      const key=keys.find(k=>k.id===input.id);if(!key || key.status!=='revoked') deny('Only revoked keys can be archived.',400);
      await store.delete(key.id);return Response.json({success:true});
    }
    if(action==='create') {
      if(keys.length>=API_LIMITS.keys) deny('Key record limit reached (20). Archive a revoked key before creating another.',400);
      const settings=validateKeySettings(input);if(!['personal','team'].includes(input.kind)) deny('Select personal or team.',400);
      const team=input.kind==='team'?teams.find(t=>t.id===input.team_id):null;
      if(input.kind==='team' && !team) deny('Only the team creator can provision its API keys.',403);
      const secret=newApiSecret();
      const record=await store.create({...settings,owner_user_id:user.id,kind:input.kind,team_id:team?.id || '',team_name:team?.name || '',key_hash:await hashApiKey(secret),prefix:secret.slice(0,17),status:'active',version:0,month_count:0,minute_count:0,total_count:0,error_count:0,denied_count:0});
      return Response.json({key:safeKey(record),secret},{headers:{'Cache-Control':'no-store'}});
    }
    if(action==='update') {
      const key=keys.find(k=>k.id===input.id);if(!key || key.status!=='active') deny('Active key not found.',404);
      const settings=validateKeySettings(input);
      const result=await store.updateMany({id:key.id,owner_user_id:user.id,status:'active',version:key.version},{$set:settings,$inc:{version:1}});
      if(result.updated!==1) deny('Key changed during this update. Refresh and retry.',409);
      return Response.json({success:true});
    }
    deny('Unknown key-management action.',400);
  } catch(error) {return Response.json({error:error.status?error.message:'Key management is temporarily unavailable.'},{status:error.status || 500,headers:{'Cache-Control':'no-store'}});}
}