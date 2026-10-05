import { secrets } from 'base44:runtime';
import { hashApiKey } from './researchApiSecurity.ts';
import { deny } from './securityGuards.ts';
async function signingKey() {return await crypto.subtle.importKey('raw',new TextEncoder().encode(secrets.get('RESEARCH_API_INTERNAL_SECRET')),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function signedApiInput(operation,input,keyId,requestId) {
  const {__research_context:ignored,...data}=input;
  const context={operation,key_id:keyId,request_id:requestId,expires_at:Date.now()+90000,input_hash:await hashApiKey(JSON.stringify(data))};
  const signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(),new TextEncoder().encode(JSON.stringify(context))))).map(b=>b.toString(16).padStart(2,'0')).join('');
  return {...data,__research_context:{context,signature}};
}
export async function verifyApiContext(input,operation) {
  const {__research_context:envelope,...data}=input;
  if(!envelope?.context || typeof envelope.signature!=='string' || !/^[a-f0-9]{64}$/.test(envelope.signature)) deny('Invalid internal API authorization.',401);
  const {context,signature}=envelope;
  const bytes=Uint8Array.from(signature.match(/../g),x=>parseInt(x,16));
  if(!await crypto.subtle.verify('HMAC',await signingKey(),bytes,new TextEncoder().encode(JSON.stringify(context))) || context.operation!==operation || context.expires_at<Date.now() || context.expires_at>Date.now()+90000 || context.input_hash!==await hashApiKey(JSON.stringify(data))) deny('Invalid or expired API authorization.',401);
  return context;
}
export async function callApiOperation(base44,operation,input,keyId,requestId) {
  const payload=await signedApiInput(operation,input,keyId,requestId);
  return await base44.asServiceRole.functions.invoke(operation,payload);
}