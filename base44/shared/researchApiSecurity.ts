import { secrets } from 'base44:runtime';
import { deny } from './securityGuards.ts';
import { subscriptionPillars } from './subscriptionPillars.ts';
export const API_LIMITS = { rate:60, monthly:10000, keys:20 };
export async function hashApiKey(value) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join(''); }
export function newApiSecret() { return 'sut_live_' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join(''); }
export function validateKeySettings(data) {
  if(typeof data.label !== 'string' || !data.label.trim() || data.label.trim().length>80) deny('Enter a key label of 1–80 characters.',400);
  if(!Number.isInteger(data.rate_limit) || data.rate_limit<1 || data.rate_limit>API_LIMITS.rate || !Number.isInteger(data.monthly_limit) || data.monthly_limit<1 || data.monthly_limit>API_LIMITS.monthly) deny('Limits must be whole numbers: 1–60 requests/minute and 1–10,000 requests/month.',400);
  return {label:data.label.trim(),rate_limit:data.rate_limit,monthly_limit:data.monthly_limit};
}
async function stripeGet(path) {
  const res=await fetch('https://api.stripe.com/v1'+path,{headers:{Authorization:'Bearer '+secrets.get('STRIPE_SECRET_KEY'),'Stripe-Version':'2025-10-29.clover'},signal:AbortSignal.timeout(12000)});
  if(!res.ok) deny('Subscription verification is unavailable. Retry shortly.',503);
  return await res.json();
}
export async function hasResearchSubscription(user) {
  if(!user?.stripe_customer_id || !/^cus_[A-Za-z0-9]+$/.test(user.stripe_customer_id)) return false;
  const customer=await stripeGet('/customers/'+encodeURIComponent(user.stripe_customer_id));
  if(customer.deleted || (customer.metadata?.user_id ? customer.metadata.user_id!==user.id : customer.email?.toLowerCase()!==user.email?.toLowerCase())) return false;
  let after='';
  for(let page=0;page<10;page++) {
    const list=await stripeGet('/subscriptions?customer='+encodeURIComponent(customer.id)+'&status=all&limit=100'+(after?'&starting_after='+encodeURIComponent(after):''));
    if(list.data.some(sub=>sub.status==='active' && (!sub.metadata?.user_id || sub.metadata.user_id===user.id) && (!sub.metadata?.base44_app_id || sub.metadata.base44_app_id===secrets.get('BASE44_APP_ID')) && subscriptionPillars([sub]).includes('research'))) return true;
    if(!list.has_more) return false; after=list.data.at(-1).id;
  }
  return false;
}
export function safeKey(key) {
  const month=new Date().toISOString().slice(0,7), used=key.usage_month===month ? key.month_count || 0 : 0;
  return {id:key.id,label:key.label,kind:key.kind,team_id:key.team_id,team_name:key.team_name,prefix:key.prefix,status:key.status,created_date:key.created_date,revoked_at:key.revoked_at,rate_limit:key.rate_limit,monthly_limit:key.monthly_limit,used,remaining:Math.max(0,key.monthly_limit-used),total_count:key.total_count || 0,error_count:key.error_count || 0,denied_count:key.denied_count || 0,last_used_at:key.last_used_at,last_status:key.last_status,last_request_id:key.last_request_id};
}
export async function reserveApiRequest(store,keyId,requestId,now=new Date()) {
  const month=now.toISOString().slice(0,7), minute=now.toISOString().slice(0,16);
  for(let attempt=0;attempt<8;attempt++) {
    const key=await store.get(keyId);
    if(key.status!=='active') deny('API key has been revoked.',401);
    const used=key.usage_month===month ? key.month_count || 0 : 0, rate=key.minute_window===minute ? key.minute_count || 0 : 0;
    if(used>=key.monthly_limit || rate>=key.rate_limit) {
      await store.updateMany({id:key.id},{$inc:{denied_count:1}});
      const error=new Error(used>=key.monthly_limit?'Monthly API quota reached.':'API rate limit reached.'); error.status=429; error.code=used>=key.monthly_limit?'MONTHLY_LIMIT':'RATE_LIMIT'; error.retryAfter=used>=key.monthly_limit?Math.ceil((Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1)-now.getTime())/1000):60-now.getUTCSeconds(); throw error;
    }
    const result=await store.updateMany({id:key.id,version:key.version,status:'active'},{$set:{usage_month:month,month_count:used+1,minute_window:minute,minute_count:rate+1,last_used_at:now.toISOString(),last_request_id:requestId},$inc:{version:1,total_count:1}});
    if(result.updated===1) return {monthly_remaining:key.monthly_limit-used-1,rate_remaining:key.rate_limit-rate-1,monthly_reset:new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1)).toISOString()};
  }
  const error=new Error('API is busy. Retry shortly.');error.status=429;error.retryAfter=1;throw error;
}