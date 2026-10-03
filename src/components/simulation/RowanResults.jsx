import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import RowanProperties from '@/components/simulation/RowanProperties';
import RowanGeometry from '@/components/simulation/RowanGeometry';
export default function RowanResults({result,onReset,onRun,isRunning}) {
  const [tab,setTab] = useState('properties'), [dataset,setDataset] = useState(null), [loading,setLoading] = useState(false), [error,setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    if (!result.results_file_uri) return;
    setDataset(null);setError('');setLoading(true);
    (async () => {
      try {const {signed_url} = await base44.integrations.Core.CreateFileSignedUrl({file_uri:result.results_file_uri}); const response = await fetch(signed_url); if(!response.ok) throw new Error('Unable to load the stored trajectory.'); const data = await response.json(); if(!cancelled) setDataset(data);}
      catch(e) {if(!cancelled) setError(e.message);}
      finally {if(!cancelled) setLoading(false);}
    })();
    return () => {cancelled = true;};
  },[result.results_file_uri]);
  const download = () => {const blob = new Blob([JSON.stringify({result,...dataset},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`rowan-${result.provider_job_id}.json`;link.click();URL.revokeObjectURL(url);};
  return <section className="mb-8 space-y-5">
    <div className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6"><p className="research-label mb-2">Real Rowan compute run</p><h2 className="!text-lg mb-3">Calculation completed</h2><p className="text-sm">{result.computational_approach}</p><a href={`https://labs.rowansci.com/calculation/${result.provider_job_id}`} target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-research-accent underline break-all mt-3">{result.provider_job_id} · Open Rowan workflow</a><p className="text-xs text-research-muted mt-3">{result.frame_count} geometry frames · {result.credits_charged ?? 'Unreported'} Rowan credits</p></div>
    <div role="group" aria-label="Result view" className="flex flex-wrap gap-2">{[['properties','Computed properties'],['geometry','Geometry and optimization']].map(([id,label]) => <button key={id} aria-pressed={tab===id} onClick={() => setTab(id)} className={tab===id ? 'research-primary' : 'research-secondary'}>{label}</button>)}</div>
    {tab==='properties' ? <RowanProperties result={result}/> : <><RowanGeometry result={result} frames={dataset?.frames || []}/>{loading && <p role="status">Loading private optimization frames…</p>}{error && <p role="alert" className="text-destructive">{error}</p>}</>}
    <div className="rounded-xl bg-research-soft border border-research-border p-5"><h3 className="mb-2">Interpretation limits</h3><p className="text-sm text-research-muted">{result.limitations}</p><p className="text-sm text-research-muted mt-2">{result.scientific_interpretation}</p></div>
    <div className="flex flex-wrap gap-3"><button className="research-secondary" onClick={onReset}>New simulation</button><button className="research-secondary" disabled={loading || !dataset} onClick={download}>Download computed results</button><button className="research-primary" disabled={isRunning} onClick={onRun}>Run again</button></div>
  </section>;
}