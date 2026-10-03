import React,{useState} from 'react';
import {useInfiniteQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import ScriptCodePanel from '@/components/computational/ScriptCodePanel';
import {downloadScript} from '@/components/computational/scriptFiles';
import {FileCode2,Download} from 'lucide-react';
export default function SavedScripts({user}) {
  const [selected,setSelected]=useState(null);
  const {data,isPending,error,refetch,hasNextPage,fetchNextPage,isFetchingNextPage}=useInfiniteQuery({
    queryKey:['saved-scripts',user.id],initialPageParam:0,
    queryFn:({pageParam}) => base44.entities.SavedScript.filter({created_by_id:user.id},'-created_date',50,pageParam),
    getNextPageParam:(last,pages) => last.length===50 ? pages.length*50 : undefined,
  });
  const scripts=data?.pages.flat() || [];
  return <section aria-labelledby="saved-scripts-heading" className="rounded-2xl border border-research-border bg-research-card p-5 sm:p-6 text-research-text">
    <h2 id="saved-scripts-heading" className="flex items-center gap-2 text-lg font-medium"><FileCode2 className="w-5 h-5 text-research-accent"/>Saved scripts</h2>
    <p className="text-sm text-research-muted mt-2 mb-5">Your saved engine input files, ready to reopen or download.</p>
    {isPending && <p role="status" className="text-sm text-research-muted">Loading saved scripts…</p>}
    {error && <div role="alert" className="text-sm text-destructive">Unable to load scripts: {error.message}<Button variant="outline" size="sm" onClick={() => refetch()} className="ml-3">Retry</Button></div>}
    {!isPending && !error && !scripts.length && <p className="text-sm text-research-muted">No saved scripts yet. Generate input files in a simulation and choose “Save to dashboard”.</p>}
    <ul className="divide-y divide-research-border">{scripts.map(script => <li key={script.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0"><p className="font-mono text-sm break-all">{script.filename}</p><p className="text-xs text-research-muted mt-1">{script.engine} · {script.sim_type_label} · {new Date(script.created_date).toLocaleDateString()}</p></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setSelected(script)}>View code</Button><Button variant="outline" size="sm" onClick={() => downloadScript(script)} aria-label={`Download ${script.filename}`}><Download className="w-4 h-4 mr-2"/>Download</Button></div>
    </li>)}</ul>
    {hasNextPage && <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{isFetchingNextPage ? 'Loading…' : 'Load more scripts'}</Button>}
    <Dialog open={!!selected} onOpenChange={open => {if(!open)setSelected(null);}}><DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-research-card"><DialogHeader><DialogTitle>Saved script</DialogTitle><DialogDescription>{selected?.engine} · {selected?.sim_type_label}</DialogDescription></DialogHeader>{selected && <ScriptCodePanel key={selected.id} file={selected}/>}</DialogContent></Dialog>
  </section>;
}