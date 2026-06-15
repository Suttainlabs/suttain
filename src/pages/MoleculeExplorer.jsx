import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Atom, Search, X, ChevronRight, Loader2, ExternalLink, Database, RefreshCw, Info } from 'lucide-react';

// ── Chemical property display helpers ─────────────────────────────

const PropRow = ({ label, value, unit }) => {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5 border-b border-slate-800 last:border-0">
      <span className="text-[11px] text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-xs font-mono text-slate-200 text-right">
        {value}{unit ? <span className="text-slate-600 ml-1">{unit}</span> : null}
      </span>
    </div>
  );
};

const Badge = ({ children, color = '#0D9E8E' }) => (
  <span
    className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
    style={{ background: color + '20', color }}
  >
    {children}
  </span>
);

const SAFETY_COLOR = {
  safe: '#10B981',
  moderate: '#F59E0B',
  hazardous: '#EF4444',
  highly_hazardous: '#991B1B',
  unknown: '#64748B',
};

// ── 3Dmol.js viewer via PubChem SDF ───────────────────────────────

function Mol3DViewer({ cid, smiles, name }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [message, setMessage] = useState('');

  const loadStructure = useCallback(async () => {
    if (!containerRef.current) return;
    setStatus('loading');
    setMessage('');

    try {
      // Dynamically load 3Dmol if not already loaded
      if (!window.$3Dmol) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://3dmol.org/build/3Dmol-min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      // Destroy previous viewer
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      const viewer = window.$3Dmol.createViewer(containerRef.current, {
        backgroundColor: '#0F172A',
        antialias: true,
      });
      viewerRef.current = viewer;

      let sdfData = null;

      // Try PubChem CID first, then name search
      const cidToUse = cid;
      const nameToUse = name;

      if (cidToUse) {
        const res = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cidToUse}/SDF?record_type=3d`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) sdfData = await res.text();
      }

      if (!sdfData && nameToUse) {
        const res = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(nameToUse)}/SDF?record_type=3d`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) sdfData = await res.text();
      }

      if (!sdfData && smiles) {
        // Fallback: compute 2D from SMILES using PubChem
        const res = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) sdfData = await res.text();
      }

      if (!sdfData) {
        setStatus('error');
        setMessage('3D structure not available for this compound.');
        return;
      }

      viewer.addModel(sdfData, 'sdf');
      viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'Jmol' }, sphere: { scale: 0.3, colorscheme: 'Jmol' } });
      viewer.zoomTo();
      viewer.spin('y', 0.5);
      viewer.render();
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setMessage('Could not load 3D structure. The compound may not have 3D coordinates in PubChem.');
    }
  }, [cid, smiles, name]);

  useEffect(() => {
    loadStructure();
    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.clear(); } catch {}
      }
    };
  }, [loadStructure]);

  return (
    <div className="relative w-full h-full min-h-0 bg-[#0F172A] rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: 300 }} />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0F172A]">
          <Loader2 className="w-7 h-7 text-[#0D9E8E] animate-spin" />
          <p className="text-xs text-slate-500">Fetching 3D coordinates from PubChem...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0F172A] px-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Atom className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-xs text-slate-500">{message}</p>
          <button
            onClick={loadStructure}
            className="text-[11px] text-[#0D9E8E] hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]">
          <p className="text-xs text-slate-600">Select a compound to visualize</p>
        </div>
      )}
    </div>
  );
}

// ── Compound list row ──────────────────────────────────────────────

function CompoundRow({ c, selected, onSelect, fromPubchem }) {
  const color = SAFETY_COLOR[c.safety_level] || SAFETY_COLOR.unknown;
  return (
    <button
      onClick={() => onSelect(c)}
      className={`w-full text-left px-4 py-3 border-b border-slate-800/60 hover:bg-slate-800/60 transition-colors flex items-start gap-3 ${
        selected?.id === c.id ? 'bg-[#0D9E8E]/10 border-l-2 border-l-[#0D9E8E]' : ''
      }`}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: color + '20' }}
      >
        <Atom className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{c.name}</p>
        {c.molecular_formula && (
          <p className="text-[10px] font-mono text-slate-600 mt-0.5">{c.molecular_formula}</p>
        )}
        {fromPubchem && c.pubchem_cid && (
          <p className="text-[10px] text-slate-700 mt-0.5">CID {c.pubchem_cid}</p>
        )}
        {!fromPubchem && c.cas_number && (
          <p className="text-[10px] text-slate-700 mt-0.5">CAS {c.cas_number}</p>
        )}
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 mt-1" />
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────

export default function MoleculeExplorer() {
  const navigate = useNavigate();
  const [chemicals, setChemicals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pubchemResults, setPubchemResults] = useState([]);
  const [pubchemLoading, setPubchemLoading] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await base44.entities.Chemical.list('-created_date', 200);
        setChemicals(data);
        setFiltered(data);
      } catch {
        setChemicals([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(chemicals);
      setPubchemResults([]);
      return;
    }
    const localMatches = chemicals.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.cas_number?.includes(q) ||
      c.iupac_name?.toLowerCase().includes(q) ||
      c.molecular_formula?.toLowerCase().includes(q) ||
      c.pubchem_cid?.includes(q)
    );
    setFiltered(localMatches);

    // Search PubChem if local results are sparse
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (q.length < 2) return;
      setPubchemLoading(true);
      try {
        const res = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,InChIKey/JSON?MaxRecords=8`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (res.ok) {
          const json = await res.json();
          const props = json.PropertyTable?.Properties || [];
          // Filter out ones already in local DB
          const localCids = new Set(chemicals.map(c => String(c.pubchem_cid)).filter(Boolean));
          const newResults = props
            .filter(p => !localCids.has(String(p.CID)))
            .map(p => ({
              id: `pubchem_${p.CID}`,
              _pubchem_cid: p.CID,
              pubchem_cid: String(p.CID),
              name: q.charAt(0).toUpperCase() + q.slice(1),
              iupac_name: p.IUPACName,
              molecular_formula: p.MolecularFormula,
              molecular_weight: p.MolecularWeight,
              canonical_smiles: p.CanonicalSMILES,
              inchi_key: p.InChIKey,
              _fromPubchem: true,
            }));
          setPubchemResults(newResults);
        } else {
          setPubchemResults([]);
        }
      } catch {
        setPubchemResults([]);
      } finally {
        setPubchemLoading(false);
      }
    }, 500);
  }, [search, chemicals]);

  const safetyColor = selected ? (SAFETY_COLOR[selected.safety_level] || SAFETY_COLOR.unknown) : SAFETY_COLOR.unknown;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Sub-header */}
      <div className="border-b border-slate-700/50 bg-slate-900/60 sticky top-16 z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <button
            onClick={() => navigate(createPageUrl('ResearchPortal'))}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-700" />
          <Atom className="w-3.5 h-3.5 text-[#0D9E8E] flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Molecule Explorer</span>
          <span className="hidden sm:flex items-center gap-2 ml-auto text-[10px] text-slate-600 font-mono">
            <Database className="w-3 h-3" />
            {chemicals.length} compounds loaded
          </span>
        </div>
      </div>

      {/* Main layout: list | viewer | properties */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0, height: 'calc(100vh - 104px)' }}>

        {/* Left: compound list */}
        <div className="w-64 xl:w-72 flex-shrink-0 bg-slate-900/80 border-r border-slate-700/50 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-700/50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, CAS, formula..."
                className="w-full bg-slate-800 border border-slate-700 focus:border-[#0D9E8E] text-white placeholder-slate-600 text-xs pl-8 pr-8 py-2 rounded-lg outline-none transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-[#0D9E8E] animate-spin" />
              </div>
            ) : (
              <>
                {/* Local DB results */}
                {filtered.map(c => (
                  <CompoundRow key={c.id} c={c} selected={selected} onSelect={setSelected} />
                ))}

                {/* PubChem results */}
                {pubchemResults.length > 0 && (
                  <>
                    <div className="px-3 py-1.5 bg-slate-800/40 border-y border-slate-700/40">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Database className="w-2.5 h-2.5" /> PubChem
                      </p>
                    </div>
                    {pubchemResults.map(c => (
                      <CompoundRow key={c.id} c={c} selected={selected} onSelect={setSelected} fromPubchem />
                    ))}
                  </>
                )}

                {/* Loading PubChem */}
                {pubchemLoading && (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-[#0D9E8E] animate-spin" />
                    <p className="text-[10px] text-slate-600">Searching PubChem...</p>
                  </div>
                )}

                {/* Empty state */}
                {filtered.length === 0 && pubchemResults.length === 0 && !pubchemLoading && search && (
                  <div className="px-4 py-10 text-center">
                    <p className="text-xs text-slate-600">No matches found.</p>
                  </div>
                )}
                {filtered.length === 0 && pubchemResults.length === 0 && !pubchemLoading && !search && chemicals.length === 0 && (
                  <div className="px-4 py-10 text-center">
                    <p className="text-xs text-slate-600">No compounds in database.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center: 3D viewer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {selected ? (
            <>
              <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/40 flex items-center gap-3 flex-shrink-0">
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{selected.name}</p>
                  {selected.iupac_name && (
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate max-w-xs">{selected.iupac_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  {selected.safety_level && (
                    <Badge color={safetyColor}>{selected.safety_level.replace(/_/g, ' ')}</Badge>
                  )}
                  {selected.pubchem_cid && (
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selected.pubchem_cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-500 hover:text-[#0D9E8E] flex items-center gap-1 transition-colors"
                    >
                      PubChem <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex-1 p-4 min-h-0">
                <Mol3DViewer
                  cid={selected.pubchem_cid}
                  smiles={selected.smiles || selected.canonical_smiles}
                  name={selected.name}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <Atom className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-1">Select a compound</p>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Choose any compound from your database to render its 3D structure via PubChem's coordinate database.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: properties panel */}
        {selected && (
          <div className="w-64 xl:w-72 flex-shrink-0 bg-slate-900/80 border-l border-slate-700/50 overflow-y-auto">
            <div className="p-4 border-b border-slate-700/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Properties</p>
            </div>

            <div className="p-4 space-y-5">
              {/* Identity */}
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Identity</p>
                <div>
                  <PropRow label="Formula" value={selected.molecular_formula} />
                  <PropRow label="MW" value={selected.molecular_weight != null ? Number(selected.molecular_weight).toFixed(3) : null} unit="g/mol" />
                                     <PropRow label="Exact Mass" value={selected.exact_mass != null ? Number(selected.exact_mass).toFixed(4) : null} unit="Da" />
                  <PropRow label="CAS" value={selected.cas_number} />
                  <PropRow label="PubChem CID" value={selected.pubchem_cid} />
                  <PropRow label="InChI Key" value={selected.inchi_key} />
                  <PropRow label="Type" value={selected.chemical_type?.replace(/_/g, ' ')} />
                  <PropRow label="Category" value={selected.category?.replace(/_/g, ' ')} />
                </div>
              </div>

              {/* Physical */}
              {selected.physical_properties && Object.values(selected.physical_properties).some(v => v != null) && (
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Physical</p>
                  <PropRow label="Melting Pt" value={selected.physical_properties.melting_point} unit="°C" />
                  <PropRow label="Boiling Pt" value={selected.physical_properties.boiling_point} unit="°C" />
                  <PropRow label="Density" value={selected.physical_properties.density} unit="g/cm3" />
                  <PropRow label="LogP" value={selected.physical_properties.log_p} />
                  <PropRow label="pKa" value={selected.physical_properties.pka} />
                  <PropRow label="Flash Pt" value={selected.physical_properties.flash_point} unit="°C" />
                  <PropRow label="Solubility" value={selected.physical_properties.solubility_water} />
                  <PropRow label="Vapor Pressure" value={selected.physical_properties.vapor_pressure} unit="mmHg" />
                </div>
              )}

              {/* Toxicity */}
              {selected.toxicity_data && Object.values(selected.toxicity_data).some(v => v != null) && (
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Toxicity</p>
                  <PropRow label="LD50 oral" value={selected.toxicity_data.ld50_oral} />
                  <PropRow label="LD50 dermal" value={selected.toxicity_data.ld50_dermal} />
                  <PropRow label="Carcinogenicity" value={selected.toxicity_data.carcinogenicity} />
                  <PropRow label="Signal word" value={selected.toxicity_data.signal_word} />
                </div>
              )}

              {/* Environmental */}
              {selected.environmental_data && Object.values(selected.environmental_data).some(v => v != null) && (
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Environment</p>
                  <PropRow label="Biodegradability" value={selected.environmental_data.biodegradability} />
                  <PropRow label="Aquatic toxicity" value={selected.environmental_data.aquatic_toxicity} />
                  <PropRow label="GWP" value={selected.environmental_data.global_warming_potential} />
                </div>
              )}

              {/* SMILES */}
              {(selected.smiles || selected.canonical_smiles) && (
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">SMILES</p>
                  <p className="text-[10px] font-mono text-slate-500 break-all leading-relaxed bg-slate-800/60 rounded p-2">
                    {selected.canonical_smiles || selected.smiles}
                  </p>
                </div>
              )}

              {/* Description */}
              {selected.function_description && (
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Function</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{selected.function_description}</p>
                </div>
              )}

              {/* PubChem link */}
              {selected.pubchem_cid && (
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selected.pubchem_cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[11px] text-[#0D9E8E] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View full record on PubChem
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}