import React, { useEffect, useRef, useState } from 'react';
import { Download, Palette, RotateCcw, Loader2, Crosshair, Maximize2, Waves } from 'lucide-react';

// Suttain confidence ramp (pLDDT bands follow the standard 90 / 70 / 50 cut-offs).
export const PLDDT_BANDS = [
  { label: 'Very high', range: '>90', color: '#02786F', min: 90 },
  { label: 'Confident', range: '70–90', color: '#4FB3E8', min: 70 },
  { label: 'Low', range: '50–70', color: '#F2B705', min: 50 },
  { label: 'Very low', range: '<50', color: '#E4572E', min: -Infinity },
];
export const plddtColor = b => (PLDDT_BANDS.find(band => (b > 1 ? b : b * 100) > band.min) || PLDDT_BANDS[3]).color;
export const LIGAND = '#D6336C';
const CHAIN_COLORS = ['#02786F', '#4FB3E8', '#F2B705', '#7C5CFF', '#E4572E'];
const SELECT = '#0A1F1D';
const BG = '#F4FBFA';

export default function StructureViewer3D({ text, format = 'cif', selected, onPick, pocket = [], downloads = [] }) {
  const host = useRef(null);
  const viewer = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const [colorMode, setColorMode] = useState('plddt');
  const [focus, setFocus] = useState(false);
  const [surface, setSurface] = useState(false);
  const [hover, setHover] = useState(null);
  const [state, setState] = useState('loading');
  const [menu, setMenu] = useState(false);
  const [selName, setSelName] = useState('');

  useEffect(() => {
    let dead = false, ro = null;
    setState('loading');
    import('3dmol').then(mod => {
      if (dead || !host.current) return;
      const $3Dmol = mod.default?.createViewer ? mod.default : mod;
      host.current.innerHTML = '';
      const v = $3Dmol.createViewer(host.current, { backgroundColor: BG, antialias: true });
      v.addModel(text, format === 'pdb' ? 'pdb' : 'cif');
      v.setHoverable({}, true, a => setHover(a && { chain: a.chain, resi: a.resi, resn: a.resn, atom: a.atom, b: a.b, het: !!a.hetflag }), () => setHover(null));
      v.setClickable({}, true, a => { if (!a.hetflag) pickRef.current?.({ chain: a.chain, resi: a.resi }); });
      viewer.current = v;
      // Keep the model centred when the panel changes size (the layout settles after first paint).
      ro = new ResizeObserver(() => { v.resize(); v.render(); });
      ro.observe(host.current);
      requestAnimationFrame(() => { v.resize(); v.zoomTo(); v.render(); setState('ready'); });
    }).catch(() => !dead && setState('error'));
    return () => { dead = true; ro?.disconnect(); try { viewer.current?.clear(); } catch { /* ignore */ } viewer.current = null; };
  }, [text, format]);

  useEffect(() => {
    const v = viewer.current;
    if (!v || state !== 'ready') return;
    const chains = [...new Set(v.selectedAtoms({ hetflag: false }).map(a => a.chain))];
    const colorfunc = colorMode === 'plddt' ? a => plddtColor(a.b) : a => CHAIN_COLORS[Math.max(0, chains.indexOf(a.chain)) % CHAIN_COLORS.length];
    v.setStyle({}, {});
    v.removeAllSurfaces();
    v.setStyle({ hetflag: false }, { cartoon: { colorfunc, thickness: 0.35, opacity: focus ? 0.55 : 1 } });
    v.setStyle({ hetflag: true }, { stick: { radius: 0.28, color: LIGAND }, sphere: { scale: 0.28, color: LIGAND } });
    pocket.forEach(r => v.addStyle({ chain: r.chain, resi: r.resi, hetflag: false }, { stick: { radius: focus ? 0.17 : 0.12, colorfunc } }));
    if (surface) v.addSurface('VDW', { opacity: 0.18, color: '#9FE8DA' }, { hetflag: false, ...(pocket.length && focus ? { resi: pocket.map(r => r.resi) } : {}) });
    if (selected) {
      v.addStyle({ chain: selected.chain, resi: selected.resi, hetflag: false }, { stick: { radius: 0.22, color: SELECT }, cartoon: { color: SELECT } });
      setSelName(v.selectedAtoms({ chain: selected.chain, resi: selected.resi })[0]?.resn || '');
    }
    if (selected) v.center({ chain: selected.chain, resi: selected.resi }, 600);
    else if (focus && pocket.length) v.zoomTo({ or: [{ hetflag: true }, { chain: pocket[0].chain, resi: pocket.map(r => r.resi) }] }, 700);
    v.render();
  }, [state, colorMode, focus, surface, selected, pocket]);

  const reset = () => { setFocus(false); pickRef.current?.(null); viewer.current?.zoomTo({}, 500); };
  const savePng = () => {
    const uri = viewer.current?.pngURI();
    if (!uri) return;
    const a = document.createElement('a'); a.href = uri; a.download = 'suttain-structure.png'; a.click();
  };

  const tool = (on) => `inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#02786F] ${on ? 'bg-[#02786F] text-white' : 'text-[#2F4A46] hover:bg-[#02786F]/10 hover:text-[#01544E]'}`;
  const label = hover
    ? `${hover.het ? 'Ligand' : `${hover.resn} ${hover.resi}`} · chain ${hover.chain}${hover.het ? ` · ${hover.atom}` : ''}${Number.isFinite(hover.b) ? ` · pLDDT ${(hover.b > 1 ? hover.b : hover.b * 100).toFixed(0)}` : ''}`
    : selected ? `${selName || 'Residue'} ${selected.resi} · chain ${selected.chain}` : null;

  return <div className="relative flex h-[440px] flex-col overflow-hidden rounded-2xl sm:h-[540px] lg:h-[640px]" style={{ background: 'radial-gradient(120% 90% at 70% 15%, #FFFFFF 0%, #EEF8F6 55%, #E1F2EF 100%)' }}>
    <div className="relative z-10 flex flex-wrap items-center gap-1 border-b border-[#CFE7E3] bg-white/80 px-2 py-2 backdrop-blur">
      <button type="button" className={tool(!focus)} onClick={() => { setFocus(false); viewer.current?.zoomTo({}, 500); }} aria-pressed={!focus}><Maximize2 className="h-4 w-4" />Complex</button>
      <button type="button" className={tool(focus)} onClick={() => { pickRef.current?.(null); setFocus(true); }} aria-pressed={focus} disabled={!pocket.length}><Crosshair className="h-4 w-4" />Pocket</button>
      <span className="mx-1 h-5 w-px bg-[#CFE7E3]" aria-hidden="true" />
      <button type="button" className={tool(false)} onClick={() => setColorMode(m => m === 'plddt' ? 'chain' : 'plddt')} aria-label={colorMode === 'plddt' ? 'Colour by chain' : 'Colour by confidence'}><Palette className="h-4 w-4" /><span className="hidden sm:inline">{colorMode === 'plddt' ? 'Confidence' : 'Chains'}</span></button>
      <button type="button" className={tool(surface)} onClick={() => setSurface(s => !s)} aria-pressed={surface}><Waves className="h-4 w-4" /><span className="hidden sm:inline">Surface</span></button>
      <div className="ml-auto flex items-center gap-1">
        <button type="button" className={tool(false)} onClick={reset} aria-label="Reset view"><RotateCcw className="h-4 w-4" /></button>
        <div className="relative">
          <button type="button" className={tool(menu)} onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-haspopup="menu" aria-label="Download"><Download className="h-4 w-4" /></button>
          {menu && <div role="menu" className="absolute right-0 top-11 z-20 w-60 rounded-xl border border-[#CFE7E3] bg-white p-1 shadow-xl">
            {downloads.filter(d => d.href).map(d => <a key={d.label} role="menuitem" href={d.href} download={d.name} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2 text-sm text-[#2F4A46] hover:bg-[#02786F]/10">{d.label}</a>)}
            <button type="button" role="menuitem" onClick={() => { setMenu(false); savePng(); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#2F4A46] hover:bg-[#02786F]/10">Snapshot of this view (PNG)</button>
          </div>}
        </div>
      </div>
    </div>

    <div className="relative flex-1">
      <div ref={host} className="absolute inset-0" role="img" aria-label="Interactive 3D model of the predicted complex. Drag to rotate, scroll to zoom, click a residue to select it." />
      {state === 'loading' && <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-[#4A635F]"><Loader2 className="h-4 w-4 animate-spin" />Building the 3D model…</div>}
      {state === 'error' && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-[#4A635F]">The 3D viewer could not start in this browser. The structure file can still be downloaded.</div>}
      {label && <div className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-[#CFE7E3] bg-white/90 px-3 py-1 font-mono text-xs text-[#01544E] shadow-sm backdrop-blur" aria-live="polite">{label}</div>}
    </div>

    <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#CFE7E3] bg-white/80 px-3 py-2.5">
      {colorMode === 'plddt'
        ? <div className="min-w-0"><p className="mb-1 text-[11px] uppercase tracking-wider text-[#4A635F]">Model confidence · pLDDT</p>
            <div className="flex overflow-hidden rounded-full">{PLDDT_BANDS.slice().reverse().map(b => <span key={b.label} className={`px-2 py-0.5 text-[11px] font-medium ${b.label === 'Low' ? 'text-[#3B2F00]' : 'text-white'}`} style={{ background: b.color }} title={b.label}>{b.range}</span>)}</div></div>
        : <p className="text-xs text-[#4A635F]">Coloured by chain</p>}
      <p className="flex items-center gap-2 text-xs text-[#4A635F]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: LIGAND }} />Ligand<span className="hidden sm:inline text-[#7A918D]">· drag to rotate · scroll to zoom</span></p>
    </div>
  </div>;
}
