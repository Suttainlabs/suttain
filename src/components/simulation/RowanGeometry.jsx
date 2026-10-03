import React, { useEffect, useState } from 'react';
import MolViewer from '@/components/simulation/MolViewer';
export default function RowanGeometry({result,frames=[]}) {
  const [frame,setFrame] = useState(Math.max(0,frames.length-1)), [playing,setPlaying] = useState(false);
  useEffect(() => {setFrame(Math.max(0,frames.length-1));},[frames.length]);
  useEffect(() => { if (!playing || frames.length < 2) return; const timer = setInterval(() => setFrame(i => (i+1)%frames.length),600); return () => clearInterval(timer); },[playing,frames.length]);
  const xyz = frames[frame]?.xyz || result.final_xyz;
  const target = {computed:true,name:'Rowan computed geometry',provider_job_id:result.provider_job_id};
  if (!xyz) return <p role="status" className="p-6 text-research-muted">Rowan did not return coordinates.</p>;
  return <div className="space-y-4">
    <MolViewer inputs={{molecule:xyz}} visualizationTarget={target}/>
    {frames.length > 1 && <div className="rounded-xl border border-research-border bg-research-card p-4 space-y-3"><label htmlFor="rowan-frame" className="text-sm">Optimization frame {frame+1} of {frames.length}</label><input id="rowan-frame" type="range" min="0" max={frames.length-1} value={frame} onChange={e => {setPlaying(false);setFrame(Number(e.target.value));}} className="w-full accent-research-accent"/><div className="flex gap-3 items-center"><button className="research-secondary" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play optimization'}</button><span className="text-sm font-mono">{frames[frame]?.energy ?? 'Not reported'} Hartree</span></div></div>}
  </div>;
}