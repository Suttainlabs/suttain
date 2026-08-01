import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, Search, X, Loader2, Atom, RefreshCw,
  ExternalLink, Database, GitCompare, ChevronDown, ChevronUp, Minus
} from 'lucide-react';

// ── 3D viewer (same approach as MoleculeExplorer) ─────────────────
function Mol3DViewer({ cid, name, smiles }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    if (!containerRef.current) return;
    setStatus('loading');
    try {
      if (!window.$3Dmol) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://3dmol.org/build/3Dmol-min.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        backgroundColor: '#ffffff', antialias: true,
      });
      viewerRef.current = viewer;

      let sdf = null;
      if (cid) {
        const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`, { signal: AbortSignal.timeout(8000) });
        if (r.ok) sdf = await r.text();
      }
      if (!sdf && name) {
        const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/SDF?record_type=3d`, { signal: AbortSignal.timeout(8000) });
        if (r.ok) sdf = await r.text();
      }
      if (!sdf && smiles) {
        const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`, { signal: AbortSignal.timeout(8000) });
        if (r.ok) sdf = await r.text();
      }
      if (!sdf) { setStatus('error'); return; }
      viewer.addModel(sdf, 'sdf');
      viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'Jmol' }, sphere: { scale: 0.3, colorscheme: 'Jmol' } });
      viewer.zoomTo(); viewer.spin('y', 0.4); viewer.render();
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [cid, name, smiles]);

  useEffect(() => { load(); return () => { try { viewerRef.current?.clear(); } catch {} }; }, [load]);

  return (
    <div className="relative w-full h-56 bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white">
          <Loader2 className="w-5 h-5 text-[#007850] animate-spin" />
          <p className="text-[10px] text-slate-400">Fetching 3D structure...</p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white">
          <Atom className="w-6 h-6 text-slate-300" />
          <p className="text-[10px] text-slate-400">3D structure unavailable</p>
          <button onClick={load} className="text-[10px] text-[#007850] flex items-center gap-1 hover:underline">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}
    </div>
  );
}

// ── Property row with delta highlight ─────────────────────────────
function PropRow({ label, valA, valB, unit, numeric }) {
  if (valA == null && valB == null) return null;
  const a = numeric && valA != null ? Number(valA) : valA;
  const b = numeric && valB != null ? Number(valB) : valB;
  const showDelta = numeric && a != null && b != null && !isNaN(a) && !isNaN(b);
  const delta = showDelta ? (b - a) : null;

  const fmt = (v) => {
    if (v == null) return <span className="text-slate-300">—</span>;
    if (numeric) return <span>{Number(v).toFixed(3)}{unit ? <span className="text-slate-400 ml-1 text-[10px]">{unit}</span> : null}</span>;
    return <span>{v}{unit ? <span className="text-slate-400 ml-1 text-[10px]">{unit}</span> : null}</span>;
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <div className="text-right">{fmt(valA)}</div>
      <div className="text-center flex flex-col items-center gap-0.5 min-w-[100px]">
        <span className="text-[10px] text-slate-400 font-mono">{label}</span>
        {showDelta && (
          <span className={`text-[9px] font-bold flex items-center gap-0.5 ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {delta > 0 ? <ChevronUp className="w-2.5 h-2.5" /> : delta < 0 ? <ChevronDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
            {delta === 0 ? 'equal' : `${delta > 0 ? '+' : ''}${delta.toFixed(3)}`}
          </span>
        )}
      </div>
      <div>{fmt(valB)}</div>
    </div>
  );
}

// ── Compound selector panel ────────────────────────────────────────
function CompoundSelector({ slot, selected, onSelect }) {
  const [search, setSearch] = useState('');
  const [localChemicals, setLocalChemicals] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounce = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    base44.entities.Chemical.list('-created_date', 200)
      .then(d => setLocalChemicals(d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (!search.trim() || search.length < 2) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      const q = search.toLowerCase();
      const local = localChemicals
        .filter(c => c.name?.toLowerCase().includes(q) || c.cas_number?.includes(q) || c.molecular_formula?.toLowerCase().includes(q))
        .slice(0, 5)
        .map(c => ({ ...c, _source: 'local' }));

      let pubchem = [];
      try {
        const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(search)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,InChIKey/JSON?MaxRecords=6`, { signal: AbortSignal.timeout(6000) });
        if (r.ok) {
          const json = await r.json();
          const localCids = new Set(localChemicals.map(c => String(c.pubchem_cid)).filter(Boolean));
          pubchem = (json.PropertyTable?.Properties || [])
            .filter(p => !localCids.has(String(p.CID)))
            .slice(0, 6 - local.length)
            .map(p => ({
              id: `pubchem_${p.CID}`,
              name: search.charAt(0).toUpperCase() + search.slice(1),
              iupac_name: p.IUPACName,
              molecular_formula: p.MolecularFormula,
              molecular_weight: p.MolecularWeight,
              canonical_smiles: p.CanonicalSMILES,
              inchi_key: p.InChIKey,
              pubchem_cid: String(p.CID),
              _pubchem_cid: p.CID,
              _source: 'pubchem',
            }));
        }
      } catch {}
      setResults([...local, ...pubchem]);
      setOpen(true);
      setLoading(false);
    }, 400);
  }, [search, localChemicals]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (c) => { onSelect(c); setSearch(''); setResults([]); setOpen(false); };
  const clear = () => { onSelect(null); setSearch(''); setResults([]); };

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center justify-between bg-white border border-[#007850]/30 rounded-xl px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-900">{selected.name}</p>
            {selected.molecular_formula && <p className="text-[10px] font-mono text-slate-400 mt-0.5">{selected.molecular_formula}</p>}
            {selected._source === 'pubchem' && <span className="text-[9px] text-[#007850] font-bold uppercase">PubChem</span>}
          </div>
          <button onClick={clear} className="text-slate-400 hover:text-slate-600 ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setOpen(true); }}
              placeholder={`Select compound ${slot}...`}
              className="w-full bg-white border border-slate-200 focus:border-[#007850] text-slate-800 placeholder-slate-400 text-sm pl-9 pr-4 py-3 rounded-xl outline-none transition-colors shadow-sm"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#007850] animate-spin" />}
          </div>
          {open && results.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {results.map(c => (
                <button
                  key={c.id}
                  onMouseDown={() => pick(c)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{c.name}</p>
                    {c.molecular_formula && <p className="text-[10px] font-mono text-slate-400">{c.molecular_formula}</p>}
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${c._source === 'local' ? 'bg-slate-100 text-slate-500' : 'bg-[#007850]/10 text-[#007850]'}`}>
                    {c._source === 'local' ? 'Local' : 'PubChem'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function ChemicalComparison() {
  const navigate = useNavigate();
  const [compA, setCompA] = useState(null);
  const [compB, setCompB] = useState(null);

  const ready = compA && compB;

  const phys = (c) => c?.physical_properties || {};
  const tox = (c) => c?.toxicity_data || {};
  const env = (c) => c?.environmental_data || {};

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-slate-800 flex flex-col">
      {/* Sub-header */}
      <div className="border-b border-slate-200 bg-white/80 sticky top-[68px] z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('ResearchPortal'))} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-200" />
          <GitCompare className="w-3.5 h-3.5 text-[#007850]" />
          <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Chemical Comparison</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Compound A</p>
            <CompoundSelector slot="A" selected={compA} onSelect={setCompA} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Compound B</p>
            <CompoundSelector slot="B" selected={compB} onSelect={setCompB} />
          </div>
        </div>

        {!ready && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <GitCompare className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Select two compounds to compare</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Search your local database or PubChem's 118M+ compounds to load side-by-side properties, 3D structures, and toxicity data.
            </p>
          </div>
        )}

        {ready && (
          <div className="space-y-6">

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_120px_1fr] gap-2 items-center">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-900">{compA.name}</p>
                {compA.iupac_name && <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{compA.iupac_name}</p>}
                {compA.pubchem_cid && (
                  <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compA.pubchem_cid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[#007850] hover:underline mt-1">
                    PubChem <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">vs</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-900">{compB.name}</p>
                {compB.iupac_name && <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{compB.iupac_name}</p>}
                {compB.pubchem_cid && (
                  <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compB.pubchem_cid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[#007850] hover:underline mt-1">
                    PubChem <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>

            {/* 3D Structures */}
            <div>
              <SectionHeader label="3D Molecular Structure" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Mol3DViewer cid={compA.pubchem_cid || compA._pubchem_cid} name={compA.name} smiles={compA.canonical_smiles || compA.smiles} />
                <Mol3DViewer cid={compB.pubchem_cid || compB._pubchem_cid} name={compB.name} smiles={compB.canonical_smiles || compB.smiles} />
              </div>
            </div>

            {/* Identity */}
            <div>
              <SectionHeader label="Identity" />
              <CompareTable>
                <PropRow label="Formula" valA={compA.molecular_formula} valB={compB.molecular_formula} />
                <PropRow label="MW (g/mol)" valA={compA.molecular_weight} valB={compB.molecular_weight} numeric unit="g/mol" />
                <PropRow label="Exact Mass" valA={compA.exact_mass} valB={compB.exact_mass} numeric unit="Da" />
                <PropRow label="CAS" valA={compA.cas_number} valB={compB.cas_number} />
                <PropRow label="PubChem CID" valA={compA.pubchem_cid} valB={compB.pubchem_cid} />
                <PropRow label="Safety Level" valA={compA.safety_level?.replace(/_/g, ' ')} valB={compB.safety_level?.replace(/_/g, ' ')} />
                <PropRow label="Type" valA={compA.chemical_type?.replace(/_/g, ' ')} valB={compB.chemical_type?.replace(/_/g, ' ')} />
              </CompareTable>
            </div>

            {/* Physical Properties */}
            {(Object.values(phys(compA)).some(v => v != null) || Object.values(phys(compB)).some(v => v != null)) && (
              <div>
                <SectionHeader label="Physical Properties" />
                <CompareTable>
                  <PropRow label="Melting Pt" valA={phys(compA).melting_point} valB={phys(compB).melting_point} numeric unit="°C" />
                  <PropRow label="Boiling Pt" valA={phys(compA).boiling_point} valB={phys(compB).boiling_point} numeric unit="°C" />
                  <PropRow label="Density" valA={phys(compA).density} valB={phys(compB).density} numeric unit="g/cm3" />
                  <PropRow label="LogP" valA={phys(compA).log_p} valB={phys(compB).log_p} numeric />
                  <PropRow label="pKa" valA={phys(compA).pka} valB={phys(compB).pka} numeric />
                  <PropRow label="Flash Pt" valA={phys(compA).flash_point} valB={phys(compB).flash_point} numeric unit="°C" />
                  <PropRow label="Vapor Pressure" valA={phys(compA).vapor_pressure} valB={phys(compB).vapor_pressure} numeric unit="mmHg" />
                  <PropRow label="Solubility" valA={phys(compA).solubility_water} valB={phys(compB).solubility_water} />
                </CompareTable>
              </div>
            )}

            {/* Toxicity */}
            {(Object.values(tox(compA)).some(v => v != null) || Object.values(tox(compB)).some(v => v != null)) && (
              <div>
                <SectionHeader label="Toxicity" />
                <CompareTable>
                  <PropRow label="LD50 oral" valA={tox(compA).ld50_oral} valB={tox(compB).ld50_oral} />
                  <PropRow label="LD50 dermal" valA={tox(compA).ld50_dermal} valB={tox(compB).ld50_dermal} />
                  <PropRow label="Carcinogenicity" valA={tox(compA).carcinogenicity} valB={tox(compB).carcinogenicity} />
                  <PropRow label="Signal Word" valA={tox(compA).signal_word} valB={tox(compB).signal_word} />
                  <PropRow label="Mutagenicity" valA={tox(compA).mutagenicity} valB={tox(compB).mutagenicity} />
                </CompareTable>
              </div>
            )}

            {/* Environmental */}
            {(Object.values(env(compA)).some(v => v != null) || Object.values(env(compB)).some(v => v != null)) && (
              <div>
                <SectionHeader label="Environmental" />
                <CompareTable>
                  <PropRow label="Biodegradability" valA={env(compA).biodegradability} valB={env(compB).biodegradability} />
                  <PropRow label="Aquatic Toxicity" valA={env(compA).aquatic_toxicity} valB={env(compB).aquatic_toxicity} />
                  <PropRow label="GWP" valA={env(compA).global_warming_potential} valB={env(compB).global_warming_potential} numeric />
                  <PropRow label="Bioaccumulation" valA={env(compA).bioaccumulation_factor} valB={env(compB).bioaccumulation_factor} numeric />
                </CompareTable>
              </div>
            )}

            {/* SMILES */}
            {(compA.canonical_smiles || compA.smiles || compB.canonical_smiles || compB.smiles) && (
              <div>
                <SectionHeader label="SMILES" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] font-mono text-slate-500 break-all leading-relaxed">
                      {compA.canonical_smiles || compA.smiles || '—'}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <p className="text-[10px] font-mono text-slate-500 break-all leading-relaxed">
                      {compB.canonical_smiles || compB.smiles || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function CompareTable({ children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-600 shadow-sm">
      {children}
    </div>
  );
}