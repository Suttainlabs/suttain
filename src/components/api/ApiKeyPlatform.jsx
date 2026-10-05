import React,{useState} from 'react';
import { Link } from 'react-router-dom';
import { KeyRound,Plus,RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useApiKeys from '@/components/api/useApiKeys';
import ApiKeyCard from '@/components/api/ApiKeyCard';
import ApiKeyForm from '@/components/api/ApiKeyForm';
import ApiSecretDialog from '@/components/api/ApiSecretDialog';
import ApiUsageSummary from '@/components/api/ApiUsageSummary';
export default function ApiKeyPlatform() {
 const state=useApiKeys(),[form,setForm]=useState(null),[kind,setKind]=useState('personal');
 const records=state.data?.keys || [],eligible=state.data?.eligible;
 async function save(input) {
  let teamId=input.team_id;
  if(!input.id && input.kind==='team' && teamId==='new'){const result=await state.action({action:'createTeam',name:input.team_name});if(!result) return;teamId=result.team.id;}
  const result=await state.action({...input,team_id:teamId,action:input.id?'update':'create'});if(result) setForm(null);
 }
 return <section id="api-keys" className="scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-7 mb-10 space-y-6">
  <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-primary mb-2">Research premium</p><h2 className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary"/>API keys for your lab</h2><p className="text-sm text-muted-foreground mt-2 max-w-xl">Bring Suttain into your scripts and notebooks. Manage personal keys and shared team credentials with enforced usage limits.</p></div>{eligible && <Button onClick={()=>setForm({})}><Plus className="w-4 h-4 mr-2"/>Create key</Button>}</div>
  {state.isAuthLoading || (state.user && state.isLoading)?<p role="status" className="text-sm text-muted-foreground">Checking Research access…</p>:!state.user?<div className="rounded-lg bg-muted p-5"><p className="text-sm mb-3">Sign in to manage keys. An active paid Research subscription is required.</p><Button asChild><Link to="/login?returnTo=%2FAPIPortal">Sign in</Link></Button></div>:state.isError?<div role="alert"><p className="text-sm text-destructive">{state.queryError?.response?.data?.error || state.queryError?.message || 'Unable to load your keys.'}</p><Button variant="outline" onClick={()=>state.refetch()}>Retry</Button></div>:<>
   {!eligible && <div className="rounded-lg border border-border bg-muted p-5"><h3 className="text-base">Research subscription required</h3><p className="text-sm text-muted-foreground mt-2 mb-3">Key creation and API calls require an active paid Research subscription. Existing Research subscribers are eligible automatically after payment verification. You can still revoke your existing keys.</p><Button asChild><Link to="/Pricing">View Research plans</Link></Button></div>}
   <ApiUsageSummary keys={records} reset={state.data?.monthly_reset}/>
   <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-3"><div className="flex gap-2">{['personal','team'].map(k=><Button key={k} size="sm" variant={kind===k?'secondary':'ghost'} aria-pressed={kind===k} onClick={()=>setKind(k)}>{k==='personal'?'Personal keys':'Shared team keys'}</Button>)}</div><Button size="sm" variant="ghost" disabled={state.isFetching} onClick={()=>state.refetch()}><RefreshCw className="w-4 h-4 mr-2"/>Refresh</Button></div>
   {records.filter(k=>k.kind===kind).length?<div className="grid xl:grid-cols-2 gap-4">{records.filter(k=>k.kind===kind).map(record=><ApiKeyCard key={record.id} record={record} eligible={eligible} busy={state.busy} onEdit={setForm} onRevoke={id=>state.action({action:'revoke',id})} onArchive={id=>state.action({action:'archive',id})}/>)}</div>:<p className="text-sm text-muted-foreground py-4">No {kind==='personal'?'personal':'shared team'} keys yet.{eligible?' Create a key to connect your first script.':''}</p>}
   <p className="text-xs text-muted-foreground">Team creators manage shared keys. Teammates use the shared secret without receiving account or billing permissions. Team requests and saved jobs are attributed to the subscribing key owner.</p>
  </>}
  {typeof state.error==='string' && state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
  {form && <ApiKeyForm record={form.id?form:null} teams={state.data?.teams || []} busy={state.busy} onSave={save} onClose={()=>setForm(null)}/>}
  {state.secret && <ApiSecretDialog secret={state.secret} onClose={()=>state.setSecret('')}/>}
 </section>;
}