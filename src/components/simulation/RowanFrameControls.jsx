import React,{useEffect,useState} from 'react';
export default function RowanFrameControls({frames,frame,onFrame}) {
  const [playing,setPlaying]=useState(false);
  useEffect(() => {if(!playing || frames.length<2)return;const timer=setInterval(() => onFrame(i => (i+1)%frames.length),600);return () => clearInterval(timer);},[playing,frames.length,onFrame]);
  if(frames.length<2)return <p className="text-xs text-research-muted">Final computed geometry</p>;
  return <div className="space-y-2 rounded-lg bg-research-soft p-4"><label htmlFor="rowan-frame" className="block text-sm">Optimization frame {frame+1} of {frames.length}</label><input id="rowan-frame" type="range" min={0} max={frames.length-1} value={frame} onChange={e => {setPlaying(false);onFrame(Number(e.target.value));}} className="w-full accent-research-accent"/><button className="research-secondary !py-2" onClick={() => setPlaying(v => !v)}>{playing ? 'Pause' : 'Play optimization'}</button></div>;
}