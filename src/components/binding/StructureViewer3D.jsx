import React, { useEffect, useRef, useState } from 'react';
import { Download, Palette, Layers, RotateCcw, Loader2 } from 'lucide-react';

// AlphaFold-style pLDDT bands. Boltz writes per-atom pLDDT (0-100) into the B-factor column.
export const PLDDT_BANDS = [
  { label: 'Very high', range: '> 90', color: '#0053D6', min: 90 },
  { label: 'Confident', range: '71–90', color: '#65CBF3', min: 70 },
  { label: 'Low', range: '51–70', color: '#FFDB13', min: 50 },
  { label: 'Very low', range: '≤ 50', color: '#FF7D45', min: -Infinity },
];
const plddtColor = b => (PLDDT_BANDS.find(band => (b > 1 ? b : b * 100) > band.min) || PLDDT_BANDS[3]).color;
const CHAIN_COLORS = ['#02786F', '#7C5CFF', '#E8590C', '#1C7ED6', '#C2255C'];
const SELECT = '#E64980';

export default function StructureViewer3D({ text, format = 'cif', selected, onPick, downloads = [] }) {
  const host = useRef(null);
  const viewer = useRef(null);
  const lib = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const [colorMode, setColorMode] = useState('plddt');
  const [repr, setRepr] = useState('cartoon');
  const [hover, setHover] = useState(null);
  const [state, setState] = useState('loading');
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let dead = false;
    setState('loading');
    import('3dmol').then(mod => {
      if (dead || !host.current) return;
      const $3Dmol = mod.default?.createViewer ? mod.default : mod;
      lib.current = $3Dmol;
      host.current.innerHTML = '';
      const v = $3Dmol.createViewer(host.current, { backgroundColor: 'white', antialias: true });
      v.addModel(text, format === 'pdb' ? 'pdb' : 'cif');
      const describe = a => a && ({ chain: a.chain, resi: a.resi, resn: a.resn, atom: a.atom, b: a.b, het: !!a.hetflag });
      v.setHoverable({}, true, a => setHover(describe(a)), () => setHover(null));
      v.setClickable({}, true, a => { if (!a.hetflag) pickRef.current?.({ chain: a.chain, resi: a.resi }); });
      v.zoomTo();
      viewer.current = v;
      setState('ready');
    }).catch(() => !dead && setState('error'));
    return () => { dead = true; try { viewer.current?.clear(); } catch { /* ignore */ } viewer.current = null; };
  }, [text, format]);

  useEffect(() => {
    const v = viewer.current;
    if (!v || state !== 'ready') return;
    const chains = [...new Set(v.selectedAtoms({ hetflag: false }).map(a => a.chain))];
    const color = colorMode === 'plddt' ? { colorfunc: a => plddtColor(a.b) } : { colorfunc: a => CHAIN_COLORS[Math.max(0, chains.indexOf(a.chain)) % CHAIN_COLORS.length] };
    v.setStyle({}, {});
    v.setStyle({ hetflag: false }, repr === 'cartoon' ? { cartoon: { ...color, thickness: 0.4 } } : { stick: { radius: 0.18, ...color }, });
    v.setStyle({ hetflag: true }, { stick: { radius: 0.24, colorscheme: 'greenCarbon' }, sphere: { scale: 0.25, colorscheme: 'greenCarbon' } });
    v.removeAllSurfaces?.();
    if (selected) {
      v.addStyle({ chain: selected.chain, resi: selected.resi }, { stick: { radius: 0.22, color: SELECT }, cartoon: { color: SELECT } });
      v.zoomTo({ chain: selected.chain, resi: selected.resi }, 600);
    }
    v.render();
  }, [state, colorMode, repr, selected]);

  const reset = () => { viewer.current?.zoomTo({}, 500); };
  const savePng = () => {
    const uri = viewer.current?.pngURI();
    if (!uri) return;
    const a = document.createElement('a'); a.href = uri; a.download = 'structure.png'; a.click();
  };

  const btn = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-research-muted hover:bg-research-soft hover:text-research-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-research-accent';
  return <div className="relative h-[420px] sm:h-[520px] lg:h-full lg:min-h-[560px] overflow-hidden rounded-xl border border-research-border bg-white">
    <div ref={host} className="absolute inset-0" aria-label="Interactive 3D structure. Drag to rotate, scroll to zoom, click a residue to select it." role="img" />
    {state === 'loading' && <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-research-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading 3D structure…</div>}
    {state === 'error' && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-research-muted">The 3D viewer could not start in this browser. You can still download the structure file.</div>}

    {colorMode === 'plddt' && <div className="absolute left-3 top-3 rounded-xl border border-research-border bg-white/95 p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-research-text">pLDDT confidence</p>
      <ul className="space-y-1.5">{PLDDT_BANDS.map(b => <li key={b.label} className="flex items-center gap-2 text-xs sm:text-sm text-research-text"><span className="h-3 w-3 rounded-full" style={{ background: b.color }} /><span className="w-20">{b.label}</span><span className="ml-auto pl-3 font-mono text-research-muted">{b.range}</span></li>)}</ul>
    </div>}

    <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-xl border border-research-border bg-white/95 p-1 shadow-sm">
      <button type="button" className={btn} onClick={() => setColorMode(m => m === 'plddt' ? 'chain' : 'plddt')} title={colorMode === 'plddt' ? 'Colour by chain' : 'Colour by pLDDT'} aria-label={colorMode === 'plddt' ? 'Colour by chain' : 'Colour by pLDDT confidence'}><Palette className="h-4 w-4" /></button>
      <button type="button" className={btn} onClick={() => setRepr(r => r === 'cartoon' ? 'sticks' : 'cartoon')} title={repr === 'cartoon' ? 'Show all atoms' : 'Show cartoon'} aria-label={repr === 'cartoon' ? 'Show all atoms as sticks' : 'Show cartoon'}><Layers className="h-4 w-4" /></button>
      <button type="button" className={btn} onClick={reset} title="Reset view" aria-label="Reset view"><RotateCcw className="h-4 w-4" /></button>
      <div className="relative">
        <button type="button" className={btn} onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-haspopup="menu" title="Download" aria-label="Download structure"><Download className="h-4 w-4" /></button>
        {menu && <div role="menu" className="absolute right-0 top-10 z-10 w-56 rounded-lg border border-research-border bg-white p-1 shadow-lg">
          {downloads.filter(d => d.href).map(d => <a key={d.label} role="menuitem" href={d.href} download={d.name} onClick={() => setMenu(false)} className="block rounded-md px-3 py-2 text-sm text-research-text hover:bg-research-soft">{d.label}</a>)}
          <button type="button" role="menuitem" onClick={() => { setMenu(false); savePng(); }} className="block w-full rounded-md px-3 py-2 text-left text-sm text-research-text hover:bg-research-soft">Image of this view (PNG)</button>
        </div>}
      </div>
    </div>

    {(hover || selected) && <div className="absolute bottom-3 right-3 max-w-[calc(100%-1.5rem)] truncate rounded-md bg-[#FFF4E6] px-3 py-1.5 font-mono text-xs sm:text-sm text-[#B4540A]" aria-live="polite">
      {hover ? `${hover.het ? 'Ligand' : 'Residue'} | ${hover.chain} | ${hover.resn} ${hover.resi}${hover.het ? ` | ${hover.atom}` : ''}${Number.isFinite(hover.b) ? ` | pLDDT ${(hover.b > 1 ? hover.b : hover.b * 100).toFixed(1)}` : ''}` : `Selected | ${selected.chain} | residue ${selected.resi}`}
    </div>}
    <p className="pointer-events-none absolute bottom-3 left-3 hidden text-xs text-research-muted sm:block">Drag to rotate · scroll to zoom · click a residue</p>
  </div>;
}
