import React,{useEffect,useRef,useState} from 'react';
import loadMolecularViewer from '@/components/simulation/loadMolecularViewer';
export default function RowanMoleculeViewer({xyz,values,selectedAtom,onSelect}) {
  const container=useRef(null),viewer=useRef(null),select=useRef(onSelect),[ready,setReady]=useState(false),[error,setError]=useState('');
  select.current=onSelect;
  useEffect(() => {
    let stopped=false;setReady(false);setError('');
    if(!xyz)return;
    (async () => {try {
      await loadMolecularViewer();if(stopped)return;
      const color=window.getComputedStyle(container.current).backgroundColor.match(/\d+/g);
      const background=color ? '#'+color.slice(0,3).map(v => Number(v).toString(16).padStart(2,'0')).join('') : window.getComputedStyle(document.documentElement).getPropertyValue('--color-bg-card').trim();
      viewer.current=window.$3Dmol.createViewer(container.current,{backgroundColor:background,antialias:true});
      viewer.current.addModel(xyz,'xyz');viewer.current.setStyle({},{stick:{},sphere:{scale:0.25}});
      viewer.current.setClickable({},true,atom => select.current?.(atom.index));viewer.current.zoomTo();viewer.current.render();setReady(true);
    }catch(e){if(!stopped)setError(e.message);}})();
    const observer=new ResizeObserver(() => {viewer.current?.resize();viewer.current?.render();});observer.observe(container.current);
    return () => {stopped=true;observer.disconnect();viewer.current?.clear();viewer.current=null;};
  },[xyz]);
  useEffect(() => {
    if(!ready || !viewer.current)return;
    const v=viewer.current,css=window.getComputedStyle(document.documentElement),negative=css.getPropertyValue('--color-brand-primary').trim(),positive=css.getPropertyValue('--color-brand-purple').trim(),neutral=css.getPropertyValue('--color-text-muted').trim();
    v.setStyle({},{stick:{},sphere:{scale:0.25}});
    if(Array.isArray(values))values.forEach((value,index) => {if(Number.isFinite(value))v.setStyle({index},{stick:{color:value < -0.001 ? negative : value > 0.001 ? positive : neutral},sphere:{scale:0.3,color:value < -0.001 ? negative : value > 0.001 ? positive : neutral}});});
    v.removeAllLabels();
    if(Number.isInteger(selectedAtom)){v.addStyle({index:selectedAtom},{sphere:{scale:0.55,opacity:0.7}});const atom=v.getModel()?.selectedAtoms({index:selectedAtom})?.[0];if(atom)v.addLabel(`${selectedAtom+1} ${atom.elem}`,{position:atom,backgroundColor:neutral,fontColor:css.getPropertyValue('--color-text-white').trim(),fontSize:14});}
    v.render();
  },[ready,values,selectedAtom]);
  return <div className="space-y-3"><div className="relative h-96 rounded-lg border border-research-border overflow-hidden"><div ref={container} className="absolute inset-0 bg-research-card"/>{!xyz && <p role="status" className="absolute inset-0 flex items-center justify-center p-4">Coordinates were not reported.</p>}{xyz && !ready && !error && <p role="status" className="absolute bottom-4 left-4 text-sm text-research-muted">Loading computed geometry…</p>}{error && <p role="alert" className="absolute inset-0 flex items-center justify-center bg-research-card p-4 text-destructive">{error}</p>}</div><div className="flex justify-between items-center gap-3"><p className="text-xs text-research-muted">Rotate: drag · Zoom: scroll · Select: click an atom</p><button disabled={!ready} className="research-secondary !px-3 !py-2 disabled:opacity-50" onClick={() => {viewer.current.zoomTo();viewer.current.render();}}>Reset view</button></div></div>;
}