import React, { useState } from 'react';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function ApiKeyForm({record,teams,busy,onSave,onClose}) {
 const [label,setLabel]=useState(record?.label || ''),[kind,setKind]=useState(record?.kind || 'personal');
 const [team,setTeam]=useState(record?.team_id || teams[0]?.id || 'new'),[teamName,setTeamName]=useState('');
 const [rate,setRate]=useState(record?.rate_limit || 30),[monthly,setMonthly]=useState(record?.monthly_limit || 1000);
 return <Dialog open onOpenChange={open=>{if(!open && !busy) onClose();}}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{record?'Edit API key':'Create API key'}</DialogTitle><DialogDescription>Available with an active paid Research subscription. All documented API operations are included.</DialogDescription></DialogHeader>
 <form onSubmit={e=>{e.preventDefault();onSave({id:record?.id,label,kind,team_id:team,team_name:teamName,rate_limit:Number(rate),monthly_limit:Number(monthly)});}} className="space-y-4">
  <div><label htmlFor="api-label" className="text-sm font-medium">Key label</label><Input id="api-label" value={label} onChange={e=>setLabel(e.target.value)} maxLength={80} required placeholder="Analysis notebook" /></div>
  <div><label htmlFor="api-kind" className="text-sm font-medium">Ownership</label><select id="api-kind" disabled={!!record} value={kind} onChange={e=>setKind(e.target.value)} className="simulation-control"><option value="personal">Personal key</option><option value="team">Shared team key</option></select></div>
  {kind==='team' && !record && <><div><label htmlFor="api-team" className="text-sm font-medium">Team you own</label><select id="api-team" value={team} onChange={e=>setTeam(e.target.value)} className="simulation-control">{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}<option value="new">Create a team</option></select></div>{team==='new' && <div><label htmlFor="api-team-name" className="text-sm font-medium">New team name</label><Input id="api-team-name" value={teamName} onChange={e=>setTeamName(e.target.value)} required maxLength={80}/></div>}</>}
  <div className="grid sm:grid-cols-2 gap-4"><div><label htmlFor="api-rate" className="text-sm font-medium">Requests per minute</label><Input id="api-rate" type="number" min="1" max="60" step="1" required value={rate} onChange={e=>setRate(e.target.value)}/></div><div><label htmlFor="api-monthly" className="text-sm font-medium">Requests per month</label><Input id="api-monthly" type="number" min="1" max="10000" step="1" required value={monthly} onChange={e=>setMonthly(e.target.value)}/></div></div>
  <p className="text-xs text-muted-foreground">Monthly quotas reset on the first day at 00:00 UTC; minute limits use UTC clock-minute windows. Limits apply to the whole key, including all teammates. Provider-specific limits still apply.</p>
  <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button><Button disabled={busy}>{busy?'Saving…':record?'Save changes':'Create key'}</Button></div>
 </form></DialogContent></Dialog>;
}