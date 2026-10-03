import React,{useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {Copy,Download,Save} from 'lucide-react';
import {downloadScript} from '@/components/computational/scriptFiles';
export default function ScriptCodePanel({file,engine,simType,simTypeLabel,linkedJobId,canSave=false}) {
  const queryClient=useQueryClient();
  const [busy,setBusy]=useState(false),[saved,setSaved]=useState(false),[status,setStatus]=useState('');
  const copy=async () => {try {await navigator.clipboard.writeText(file.content);setStatus('Code copied.');}catch {setStatus('Clipboard access was blocked. You can download the file instead.');}};
  const save=async () => {
    setBusy(true);setStatus('');
    try {
      await base44.entities.SavedScript.create({engine,sim_type:simType,sim_type_label:simTypeLabel || simType,filename:file.filename,content:file.content,description:file.description || '',...(linkedJobId ? {linked_job_id:linkedJobId} : {})});
      setSaved(true);setStatus('Saved to your dashboard.');queryClient.invalidateQueries({queryKey:['saved-scripts']});
    }catch(error){setStatus(`Unable to save: ${error.message}`);}finally{setBusy(false);}
  };
  return <article className="min-w-0 rounded-xl border border-research-border bg-research-card overflow-hidden">
    <div className="p-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-mono text-sm break-all">{file.filename}</h3><div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={copy}><Copy className="w-4 h-4 mr-2"/>Copy</Button>
      <Button size="sm" variant="outline" onClick={() => downloadScript(file)}><Download className="w-4 h-4 mr-2"/>Download</Button>
      {canSave && <Button size="sm" variant="outline" onClick={save} disabled={busy || saved}><Save className="w-4 h-4 mr-2"/>{busy ? 'Saving…' : saved ? 'Saved' : 'Save to dashboard'}</Button>}
    </div></div>
    {file.description && <p className="px-4 pb-4 text-sm text-research-muted">{file.description}</p>}
    <pre className="bg-research-text text-research-card p-5 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre"><code>{file.content}</code></pre>
    {status && <p role="status" className="px-4 py-3 text-sm text-research-muted">{status}</p>}
  </article>;
}