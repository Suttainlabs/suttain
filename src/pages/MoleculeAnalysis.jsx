import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../components/auth/AuthContext';
import CompoundAnalysisResult from '../components/research/CompoundAnalysisResult';
import { getMolecularData } from '@/functions/getMolecularData';
import { base44 } from '@/api/base44Client';
import StructurePrepSuite from '../components/structural/StructurePrepSuite';
import {
  Search, Atom, Code, FileText, List, Loader2, AlertCircle,
  ArrowLeft, X, ChevronRight, ExternalLink, Database, RefreshCw,
  Wrench, ChevronDown, Box, ShieldAlert, Microscope
} from 'lucide-react';

// ── Query configuration (from MolecularIntelligence) ───────────────
const QUERY_TYPES = [
  { id: 'name', label: 'Name / CAS', icon: Search, placeholder: 'e.g. Bisphenol A, 80-05-7, Titanium dioxide, Aspirin', multiline: false },
  { id: 'smiles', label: 'SMILES', icon: Code, placeholder: 'e.g. CC(=O)Oc1ccccc1C(=O)O', multiline: false },
  { id: 'inchi', label: 'InChI', icon: FileText, placeholder: 'e.g. InChI=1S/C9H8O4/c1-6(10)13-8-5-3-2-4-7(8)9(11)12/h2-5H,1H3,(H,11,12)', multiline: false },
  { id: 'ingredient_list', label: 'Ingredient List', icon: List, placeholder: 'Paste ingredient list, one per line:\nAqua\nGlycerine\nNiacinamide\n...', multiline: true },
];

const EXAMPLES = [
  { label: 'Bisphenol A', type: 'name', note: 'Endocrine disruptor' },
  { label: 'Titanium dioxide', type: 'name', note: 'Possible carcinogen' },
  { label: 'Sodium lauryl sulfate', type: 'name', note: 'Common surfactant' },
  { label: 'CC(=O)Oc1ccccc1C(=O)O', type: 'smiles', note: 'Aspirin (SMILES)' },
  { label: 'Parabens', type: 'name', note: 'Preservative class' },
  { label: 'Perfluorooctanoic acid', type: 'name', note: 'PFAS / PFOA' },
];

const LOADING_STEPS = [
  'Querying PubChem compound database',
  'Retrieving bioassay and property data',
  'Cross-referencing EPA CompTox',
  'Running regulatory status check',
  'Generating hazard classification',
  'Calculating environmental fate',
];

const SAFETY_COLOR = {
  safe: '#10B981',
  moderate: '#F59E0B',
  hazardous: '#EF4444',
  highly_hazardous: '#991B1B',
  unknown: '#64748B',
};

// ── Property display helpers (from MoleculeExplorer) ───────────────
const PropRow = ({ label, value, unit }) => {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-[11px] text-slate-600 font-medium flex-shrink-0">{label}</span>
      <span className="text-xs font-mono text-slate-900 text-right">
        {value}{unit ? <span className="text-slate-700 ml-1">{unit}</span> : null}
      </span>
    </div>
  );
};

const Badge = ({ children, color = '#007850' }) => (
  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded" style={{ background: color + '20', color }}>
    {children}
  </span>
);

// ── 3Dmol.js viewer (from MoleculeExplorer) ────────────────────────
function Mol3DViewer({ cid, smiles, name, pdbContent, pdbName }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const loadStructure = useCallback(async () => {
    if (!containerRef.current) return;
    setStatus('loading');
    setMessage('');

    try {
      if (!window.$3Dmol) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://3dmol.org/build/3Dmol-min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      if (containerRef.current) containerRef.current.innerHTML = '';

      const viewer = window.$3Dmol.createViewer(containerRef.current, { backgroundColor: '#f8fafc', antialias: true });
      viewerRef.current = viewer;

      if (pdbContent) {
        viewer.addModel(pdbContent, 'pdb');
      } else {
        // Try to resolve an SDF: 3D coordinates first, then fall back to 2D
        // (PubChem only generates 3D conformers for a subset of compounds,
        // but every compound with a CID has 2D coordinates).
        const fetchSdf = async (recordType) => {
          if (cid) {
            try {
              const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=${recordType}`, { signal: AbortSignal.timeout(8000) });
              if (res.ok) return await res.text();
            } catch {}
          }
          if (name) {
            try {
              const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/SDF?record_type=${recordType}`, { signal: AbortSignal.timeout(8000) });
              if (res.ok) return await res.text();
            } catch {}
          }
          if (smiles) {
            try {
              const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=${recordType}`, { signal: AbortSignal.timeout(8000) });
              if (res.ok) return await res.text();
            } catch {}
          }
          return null;
        };

        let sdfData = await fetchSdf('3d');
        if (!sdfData) sdfData = await fetchSdf('2d');
        if (!sdfData) {
          setStatus('error');
          setMessage('3D structure not available for this compound.');
          return;
        }
        viewer.addModel(sdfData, 'sdf');
      }

      viewer.setStyle({}, { stick: { radius: 0.15, colorscheme: 'Jmol' }, sphere: { scale: 0.3, colorscheme: 'Jmol' } });
      viewer.zoomTo();
      viewer.spin('y', 0.5);
      viewer.render();
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setMessage('Could not load 3D structure. The compound may not have 3D coordinates in PubChem.');
    }
  }, [cid, smiles, name, pdbContent]);

  useEffect(() => {
    loadStructure();
    return () => { if (viewerRef.current) { try { viewerRef.current.clear(); } catch {} } };
  }, [loadStructure]);

  return (
    <div className="relative w-full h-full min-h-0 bg-slate-100 rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: 300 }} />
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100">
          <Loader2 className="w-7 h-7 text-[#007850] animate-spin" />
          <p className="text-xs text-slate-500">Fetching 3D coordinates from PubChem...</p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 px-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Atom className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-xs text-slate-500">{message}</p>
          <button onClick={loadStructure} className="text-[11px] text-[#007850] hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}
      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <p className="text-xs text-slate-600">Select a compound to visualize</p>
        </div>
      )}
    </div>
  );
}

// ── Compound list row (from MoleculeExplorer) ──────────────────────
function CompoundRow({ c, selected, onSelect, fromPubchem }) {
  const color = SAFETY_COLOR[c.safety_level] || SAFETY_COLOR.unknown;
  return (
    <button
      onClick={() => onSelect(c)}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-white transition-colors flex items-start gap-3 ${
        selected?.id === c.id ? 'bg-[#007850]/10 border-l-2 border-l-[#007850]' : ''
      }`}
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color + '20' }}>
        <Atom className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate leading-tight">{c.name}</p>
        {c.molecular_formula && <p className="text-[10px] font-mono text-slate-600 mt-0.5">{c.molecular_formula}</p>}
        {fromPubchem && c.pubchem_cid && <p className="text-[10px] text-slate-700 mt-0.5">CID {c.pubchem_cid}</p>}
        {!fromPubchem && c.cas_number && <p className="text-[10px] text-slate-700 mt-0.5">CAS {c.cas_number}</p>}
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 mt-1" />
    </button>
  );
}

// ── Properties panel (from MoleculeExplorer) ───────────────────────
function PropertiesPanel({ selected }) {
  if (!selected) return null;
  return (
    <div className="p-4 space-y-5">
      <div>
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Identity</p>
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
      {selected.physical_properties && Object.values(selected.physical_properties).some(v => v != null) && (
        <div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Physical</p>
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
      {selected.toxicity_data && Object.values(selected.toxicity_data).some(v => v != null) && (
        <div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Toxicity</p>
          <PropRow label="LD50 oral" value={selected.toxicity_data.ld50_oral} />
          <PropRow label="LD50 dermal" value={selected.toxicity_data.ld50_dermal} />
          <PropRow label="Carcinogenicity" value={selected.toxicity_data.carcinogenicity} />
          <PropRow label="Signal word" value={selected.toxicity_data.signal_word} />
        </div>
      )}
      {selected.environmental_data && Object.values(selected.environmental_data).some(v => v != null) && (
        <div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Environment</p>
          <PropRow label="Biodegradability" value={selected.environmental_data.biodegradability} />
          <PropRow label="Aquatic toxicity" value={selected.environmental_data.aquatic_toxicity} />
          <PropRow label="GWP" value={selected.environmental_data.global_warming_potential} />
        </div>
      )}
      {(selected.smiles || selected.canonical_smiles) && (
        <div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">SMILES</p>
          <p className="text-[10px] font-mono text-slate-700 break-all leading-relaxed bg-white rounded p-2 border border-slate-100">
            {selected.canonical_smiles || selected.smiles}
          </p>
        </div>
      )}
      {selected.function_description && (
        <div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2">Function</p>
          <p className="text-[11px] text-slate-700 leading-relaxed">{selected.function_description}</p>
        </div>
      )}
      {selected.pubchem_cid && (
        <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selected.pubchem_cid}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-[#007850] hover:underline">
          <ExternalLink className="w-3 h-3" /> View full record on PubChem
        </a>
      )}
    </div>
  );
}

// ── Main merged page ───────────────────────────────────────────────
export default function MoleculeAnalysis() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Intelligence state
  const [queryType, setQueryType] = useState('name');
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [queryHistory, setQueryHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mi_query_history') || '[]'); } catch { return []; }
  });

  // Explorer state
  const [chemicals, setChemicals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pubchemResults, setPubchemResults] = useState([]);
  const [pubchemLoading, setPubchemLoading] = useState(false);
  const searchTimeout = useRef(null);
  const [prepPdb, setPrepPdb] = useState(null);
  const [prepPdbName, setPrepPdbName] = useState('');
  const [showPrep, setShowPrep] = useState(false);

  // Active tab: 'intelligence' | 'structure'
  const [activeTab, setActiveTab] = useState('intelligence');

  // Load local chemical database
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

  // Local + PubChem search
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

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (q.length < 2) return;
      setPubchemLoading(true);
      try {
        const res = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,InChIKey/JSON?MaxRecords=8`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (!res.ok) { setPubchemResults([]); return; }
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) { setPubchemResults([]); return; }
        let json;
        try { json = await res.json(); } catch { setPubchemResults([]); return; }
        if (json.Fault || !json.PropertyTable) { setPubchemResults([]); return; }
        const props = (json.PropertyTable?.Properties || []).filter(p => p.CID != null);
        if (props.length === 0) { setPubchemResults([]); return; }
        const localCids = new Set(chemicals.map(c => String(c.pubchem_cid)).filter(Boolean));
        const newResults = props
          .filter(p => !localCids.has(String(p.CID)))
          .map(p => ({
            id: `pubchem_${p.CID}`,
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
      } catch {
        setPubchemResults([]);
      } finally {
        setPubchemLoading(false);
      }
    }, 500);
  }, [search, chemicals]);

  // Run intelligence analysis
  const runAnalysis = useCallback(async (q, type) => {
    if (!q?.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSelected(null);
    setPrepPdb(null);
    setActiveTab('intelligence');
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => prev < LOADING_STEPS.length - 1 ? prev + 1 : prev);
    }, 1800);

    try {
      const response = await getMolecularData({ query: q.trim(), queryType: type || 'name', mode: 'full' });
      const data = response.data;
      setResult(data);

      const entry = { query: q.trim(), type: type || 'name', timestamp: new Date().toISOString() };
      const newHistory = [entry, ...queryHistory.filter(h => h.query !== q.trim())].slice(0, 10);
      setQueryHistory(newHistory);
      localStorage.setItem('mi_query_history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setLoadingStep(0);
    }
  }, [queryHistory]);

  // URL param init
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const type = params.get('type') || 'name';
    if (q) {
      setQuery(q);
      const matchedType = QUERY_TYPES.find(t => t.id === type);
      if (matchedType) setQueryType(type);
      runAnalysis(q, type);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runAnalysis(query, queryType);
  };

  // Select a compound from the explorer list — load into structure tab
  const handleSelectCompound = useCallback((c) => {
    setSelected(c);
    setPrepPdb(null);
    setResult(null);
    setError(null);
    setActiveTab('structure');
  }, []);

  const activeType = QUERY_TYPES.find(t => t.id === queryType);
  const safetyColor = selected ? (SAFETY_COLOR[selected.safety_level] || SAFETY_COLOR.unknown) : SAFETY_COLOR.unknown;

  // Derive 3D viewer props from intelligence result or selected compound
  const viewerCid = prepPdb ? null : (selected?.pubchem_cid || result?.compound?.pubchem_cid || result?.pubchem_cid);
  const viewerSmiles = prepPdb ? null : (selected?.smiles || selected?.canonical_smiles || result?.compound?.smiles || result?.compound?.canonical_smiles || result?.smiles);
  const viewerName = prepPdb ? prepPdbName : (selected?.name || result?.compound?.name || result?.name || query);
  const hasStructureTarget = !!(selected || prepPdb || (result && (viewerCid || viewerSmiles || viewerName)));

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-slate-900">
      {/* Sub-header */}
      <div className="border-b border-slate-200 bg-white sticky top-[68px] z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6 h-10 flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('ResearchPortal'))} className="text-slate-500 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-slate-200" />
          <Atom className="w-3.5 h-3.5 text-[#007850] flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 tracking-widest uppercase">Molecule Analysis</span>
          <span className="hidden sm:flex items-center gap-2 ml-auto text-[10px] text-slate-600 font-mono">
            <span>PubChem</span><span className="text-slate-300">·</span><span>ChEMBL</span><span className="text-slate-300">·</span><span>EPA CompTox</span>
          </span>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Left: Search + compound browser */}
          <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-3">

              {/* Intelligence query */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 border-b border-slate-200">
                  {QUERY_TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setQueryType(t.id); setQuery(''); setResult(null); setError(null); }}
                        className={`flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold transition-colors ${
                          queryType === t.id
                            ? 'bg-[#007850]/10 text-[#007850] border-b-2 border-[#007850] -mb-px'
                            : 'text-slate-500 hover:text-slate-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="leading-tight text-center">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                  {activeType?.multiline ? (
                    <textarea
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={activeType.placeholder}
                      rows={6}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#007850] focus:ring-1 focus:ring-[#007850]/40 text-slate-900 placeholder-slate-400 text-xs font-mono px-3 py-2.5 rounded-lg outline-none transition-colors resize-none"
                    />
                  ) : (
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder={activeType?.placeholder}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#007850] focus:ring-1 focus:ring-[#007850]/40 text-slate-900 placeholder-slate-400 text-sm font-mono px-3 py-2.5 rounded-lg outline-none transition-colors"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={!query.trim() || isAnalyzing}
                    className="w-full mt-3 py-2.5 bg-[#007850] hover:bg-[#0b8a7b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Atom className="w-4 h-4" />Analyze Compound</>}
                  </button>
                </form>
              </div>

              {/* Examples */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-3">Quick Examples</p>
                <div className="space-y-1">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex.label}
                      onClick={() => { setQuery(ex.label); setQueryType(ex.type); runAnalysis(ex.label, ex.type); }}
                      className="w-full text-left flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <span className="text-xs font-mono text-slate-700 group-hover:text-[#007850] truncate">{ex.label}</span>
                      <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">{ex.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compound browser */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-slate-200">
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Database className="w-3 h-3" /> Browse Compounds
                  </p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search name, CAS, formula..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#007850] text-slate-900 placeholder-slate-400 text-xs pl-8 pr-8 py-2 rounded-lg outline-none transition-colors"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-4 h-4 text-[#007850] animate-spin" />
                    </div>
                  ) : (
                    <>
                      {filtered.map(c => (
                        <CompoundRow key={c.id} c={c} selected={selected} onSelect={handleSelectCompound} />
                      ))}
                      {pubchemResults.length > 0 && (
                        <>
                          <div className="px-3 py-1.5 bg-white border-y border-slate-200">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                              <Database className="w-2.5 h-2.5" /> PubChem
                            </p>
                          </div>
                          {pubchemResults.map(c => (
                            <CompoundRow key={c.id} c={c} selected={selected} onSelect={handleSelectCompound} fromPubchem />
                          ))}
                        </>
                      )}
                      {pubchemLoading && (
                        <div className="flex items-center justify-center py-4 gap-2">
                          <Loader2 className="w-3.5 h-3.5 text-[#007850] animate-spin" />
                          <p className="text-[10px] text-slate-600">Searching PubChem...</p>
                        </div>
                      )}
                      {filtered.length === 0 && pubchemResults.length === 0 && !pubchemLoading && search && (
                        <div className="px-4 py-8 text-center">
                          <p className="text-xs text-slate-600">No compounds found for "{search}".</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Query history */}
              {queryHistory.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Recent Queries</p>
                    <button onClick={() => { setQueryHistory([]); localStorage.removeItem('mi_query_history'); }} className="text-slate-600 hover:text-slate-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {queryHistory.slice(0, 6).map((h, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(h.query); setQueryType(h.type); runAnalysis(h.query, h.type); }}
                        className="w-full text-left text-xs font-mono text-slate-500 hover:text-slate-700 truncate px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
                      >
                        {h.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results with tabs */}
          <div className="flex-1 min-w-0">
            {/* Empty state */}
            {!result && !isAnalyzing && !error && !selected && !prepPdb && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-5">
                  <Atom className="w-7 h-7 text-slate-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Analyze or browse a compound</h3>
                <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                  Search by name, SMILES, InChI, or ingredient list for full hazard and regulatory intelligence. Or browse the compound list to inspect 3D structures and properties.
                </p>
              </div>
            )}

            {/* Loading state */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#007850]/10 border border-[#007850]/30 flex items-center justify-center mb-6">
                  <Atom className="w-7 h-7 text-[#007850] animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-5">Analyzing compound...</h3>
                <div className="space-y-2.5 text-left max-w-xs w-full">
                  {LOADING_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-2.5 text-xs transition-all duration-500 ${i <= loadingStep ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {i < loadingStep ? (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#007850] flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] text-slate-900 font-bold">✓</span>
                        </span>
                      ) : i === loadingStep ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#007850] flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-200 flex-shrink-0" />
                      )}
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !isAnalyzing && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-1">Analysis failed</p>
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              </div>
            )}

            {/* Tabbed results */}
            {(result || selected || prepPdb) && !isAnalyzing && (
              <div className="flex flex-col h-full">
                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-slate-200 mb-4">
                  <button
                    onClick={() => setActiveTab('intelligence')}
                    disabled={!result}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                      activeTab === 'intelligence'
                        ? 'text-[#007850] border-[#007850]'
                        : 'text-slate-500 border-transparent hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Intelligence
                  </button>
                  <button
                    onClick={() => setActiveTab('structure')}
                    disabled={!hasStructureTarget}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                      activeTab === 'structure'
                        ? 'text-[#007850] border-[#007850]'
                        : 'text-slate-500 border-transparent hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    3D Structure
                  </button>
                </div>

                {/* Intelligence tab */}
                {activeTab === 'intelligence' && result && (
                  <CompoundAnalysisResult data={result} query={query} />
                )}

                {/* 3D Structure tab */}
                {activeTab === 'structure' && hasStructureTarget && (
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* 3D viewer + header */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="px-4 py-3 border border-slate-200 border-b-0 bg-slate-50 rounded-t-xl flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                            {prepPdb ? (prepPdbName || 'Prepared structure') : (selected?.name || result?.compound?.name || result?.name || 'Compound')}
                          </p>
                          {prepPdb ? (
                            <p className="text-[10px] text-[#007850] mt-0.5">PDB from Structure Prep</p>
                          ) : (selected?.iupac_name || result?.compound?.iupac_name) ? (
                            <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate max-w-xs">
                              {selected?.iupac_name || result?.compound?.iupac_name}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                          {prepPdb && (
                            <button onClick={() => { setPrepPdb(null); setPrepPdbName(''); }} className="text-[10px] text-slate-500 hover:text-slate-600 flex items-center gap-1 transition-colors">
                              <X className="w-3 h-3" /> Clear
                            </button>
                          )}
                          {!prepPdb && (selected?.safety_level || result?.compound?.safety_level) && (
                            <Badge color={safetyColor}>{(selected?.safety_level || result?.compound?.safety_level || '').replace(/_/g, ' ')}</Badge>
                          )}
                          {!prepPdb && viewerCid && (
                            <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${viewerCid}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-[#007850] flex items-center gap-1 transition-colors">
                              PubChem <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setShowPrep(!showPrep)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                              showPrep ? 'bg-[#007850]/15 text-[#007850]' : 'bg-slate-100 text-slate-500 hover:text-slate-600'
                            }`}
                          >
                            <Wrench className="w-3 h-3" /> Prep
                            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showPrep ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-slate-200 border-t-0 rounded-b-xl" style={{ minHeight: 360 }}>
                        <Mol3DViewer
                          cid={viewerCid}
                          smiles={viewerSmiles}
                          name={viewerName}
                          pdbContent={prepPdb}
                          pdbName={prepPdbName}
                        />
                      </div>

                      {showPrep && (
                        <div className="mt-4 border border-slate-200 bg-slate-50 max-h-[45%] overflow-y-auto p-4 rounded-xl">
                          <StructurePrepSuite
                            modes={['split', 'merge']}
                            onResult={(pdb, name) => {
                              setPrepPdb(pdb);
                              setPrepPdbName(name);
                              setSelected(null);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Properties panel */}
                    {(selected || result?.compound) && (
                      <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-[600px]">
                        <div className="p-4 border-b border-slate-200">
                          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Properties</p>
                        </div>
                        <PropertiesPanel selected={selected || result?.compound} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}