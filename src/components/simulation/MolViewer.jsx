import React, { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Eye, Download, SplitSquareHorizontal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const VIEWER_STYLES = [
  { label: "Stick", value: "stick" },
  { label: "Sphere", value: "sphere" },
  { label: "Line", value: "line" },
  { label: "Cross", value: "cross" },
  { label: "Cartoon", value: "cartoon" },
];

const COLOR_SCHEMES = [
  { label: "Element (CPK)", value: "element" },
  { label: "Chain", value: "chain" },
  { label: "SS (Secondary)", value: "ssPyMol" },
  { label: "Spectrum", value: "spectrum" },
  { label: "Residue", value: "amino" },
];

// Load 3Dmol.js from CDN once
let _3dmolLoaded = false;
let _3dmolCallbacks = [];
function load3Dmol(cb) {
  if (window.$3Dmol) { cb(); return; }
  _3dmolCallbacks.push(cb);
  if (_3dmolLoaded) return;
  _3dmolLoaded = true;
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.1.0/3Dmol-min.js";
  script.onload = () => { _3dmolCallbacks.forEach(fn => fn()); _3dmolCallbacks = []; };
  document.head.appendChild(script);
}

function looksLikeDescription(str) {
  const words = str.trim().split(/\s+/);
  return words.length > 3 && !str.includes('=') && !str.includes('(') && !str.includes('#') && !/^[A-Za-z0-9]{4}$/.test(str.trim());
}

async function fetchMoleculeData(identifier) {
  const clean = (identifier || "").trim();
  if (!clean) return null;
  if (looksLikeDescription(clean)) return null;

  if (/^[A-Za-z0-9]{4}$/.test(clean)) {
    const url = `https://files.rcsb.org/download/${clean.toUpperCase()}.pdb`;
    const res = await fetch(url);
    if (res.ok) return { format: "pdb", data: await res.text(), source: `PDB: ${clean.toUpperCase()}` };
  }

  const nameUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(clean)}/SDF`;
  try {
    const res = await fetch(nameUrl);
    if (res.ok) return { format: "sdf", data: await res.text(), source: `PubChem: ${clean}` };
  } catch (_) {}

  if (clean.includes("=") || clean.includes("(") || clean.includes("#")) {
    const smilesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(clean)}/SDF`;
    try {
      const res = await fetch(smilesUrl);
      if (res.ok) return { format: "sdf", data: await res.text(), source: `SMILES: ${clean}` };
    } catch (_) {}
  }

  return null;
}

// ── Single panel viewer ──────────────────────────────────────────────────────
function SinglePanel({ initialIdentifier, label, accentColor = "fuchsia" }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [query, setQuery] = useState(initialIdentifier || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [style, setStyle] = useState("stick");
  const [colorScheme, setColorScheme] = useState("element");
  const [loaded, setLoaded] = useState(false);

  const accent = accentColor === "cyan" ? {
    ring: "focus:ring-cyan-400",
    btn: "bg-cyan-600 hover:bg-cyan-700",
    text: "text-cyan-400",
    label: "text-cyan-300",
  } : {
    ring: "focus:ring-fuchsia-400",
    btn: "bg-fuchsia-600 hover:bg-fuchsia-700",
    text: "text-fuchsia-400",
    label: "text-fuchsia-300",
  };

  const applyStyle = (viewer) => {
    viewer.setStyle({}, {});
    if (style === "cartoon") {
      viewer.setStyle({ hetflag: false }, { cartoon: { color: colorScheme === "element" ? "spectrum" : colorScheme } });
      viewer.setStyle({ hetflag: true }, { stick: { colorscheme: colorScheme } });
    } else {
      viewer.setStyle({}, { [style]: { colorscheme: colorScheme } });
    }
    viewer.render();
  };

  const loadMolecule = async () => {
    const identifier = query.trim();
    if (!identifier || !containerRef.current) return;

    setLoading(true);
    setError(null);
    setLoaded(false);

    load3Dmol(async () => {
      try {
        if (viewerRef.current) {
          viewerRef.current.clear();
        } else {
          viewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
            backgroundColor: "#0f172a",
            antialias: true,
          });
        }

        const molData = await fetchMoleculeData(identifier);

        if (!molData) {
          if (looksLikeDescription(identifier)) {
            setError(`"${identifier}" is a process/reaction type, not a single molecule.`);
          } else {
            setError(`Could not load "${identifier}". Try a PDB ID, drug name, or SMILES.`);
          }
          setLoading(false);
          return;
        }

        viewerRef.current.addModel(molData.data, molData.format);
        applyStyle(viewerRef.current);
        viewerRef.current.zoomTo();
        viewerRef.current.zoom(0.8);
        viewerRef.current.render();
        setSource(molData.source);
        setLoaded(true);
      } catch (e) {
        setError("Failed to load molecule: " + e.message);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (viewerRef.current && loaded) applyStyle(viewerRef.current);
  }, [style, colorScheme, loaded]);

  useEffect(() => {
    if (initialIdentifier) loadMolecule();
    return () => { viewerRef.current = null; };
  }, []);

  const handleReset = () => {
    if (viewerRef.current) { viewerRef.current.zoomTo(); viewerRef.current.zoom(0.8); viewerRef.current.render(); }
  };

  const handleScreenshot = () => {
    if (viewerRef.current) {
      const a = document.createElement("a");
      a.href = viewerRef.current.pngURI();
      a.download = `molecule_${label || "A"}.png`;
      a.click();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel label */}
      {label && (
        <div className={`px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-xs font-bold ${accent.label} uppercase tracking-widest`}>
          {label}
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && loadMolecule()}
          placeholder="PDB ID, molecule name, or SMILES…"
          className={`flex-1 bg-slate-700 text-white text-xs border border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 ${accent.ring} placeholder-slate-500`}
        />
        <Button size="sm" onClick={loadMolecule} disabled={loading}
          className={`h-7 px-3 text-xs ${accent.btn} text-white rounded-lg flex-shrink-0`}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load"}
        </Button>
      </div>

      {/* Style controls */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
        <select value={style} onChange={e => setStyle(e.target.value)}
          className="text-xs bg-slate-700 text-white border border-slate-600 rounded-lg px-2 py-1 focus:outline-none">
          {VIEWER_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={colorScheme} onChange={e => setColorScheme(e.target.value)}
          className="text-xs bg-slate-700 text-white border border-slate-600 rounded-lg px-2 py-1 focus:outline-none">
          {COLOR_SCHEMES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Button size="sm" variant="ghost" onClick={handleReset} className="h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-700 ml-auto">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleScreenshot} disabled={!loaded} className="h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-700">
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* 3D canvas */}
      <div className="relative flex-1" style={{ minHeight: "320px" }}>
        <div ref={containerRef} className="w-full h-full absolute inset-0" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
            <Loader2 className={`w-7 h-7 ${accent.text} animate-spin mb-2`} />
            <p className="text-xs text-slate-300">Loading…</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-xs text-red-300 font-medium mb-1">Visualization unavailable</p>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        )}

        {!query.trim() && !loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
            <Eye className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">Enter a molecule above and click Load</p>
          </div>
        )}

        {/* Source badge */}
        {source && loaded && (
          <div className="absolute bottom-2 left-2 z-10 bg-slate-900/70 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">
            {source}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main MolViewer ────────────────────────────────────────────────────────────
export default function MolViewer({ simType, inputs }) {
  const [compareMode, setCompareMode] = useState(false);

  const getMoleculeIdentifier = () => {
    if (!inputs) return null;
    return (
      inputs.molecule || inputs.ligand || inputs.sequence ||
      inputs.compound || inputs.molecule_or_trajectory ||
      inputs.material || inputs.system || null
    );
  };

  const initialIdentifier = getMoleculeIdentifier();

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <Eye className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-white">3D Molecular Viewer</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:block">Split compare:</span>
          <button
            onClick={() => setCompareMode(false)}
            title="Single view"
            className={`p-1.5 rounded-lg transition-colors ${!compareMode ? "bg-fuchsia-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}>
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCompareMode(true)}
            title="Split compare"
            className={`p-1.5 rounded-lg transition-colors ${compareMode ? "bg-fuchsia-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}>
            <SplitSquareHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panels */}
      {compareMode ? (
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-700" style={{ height: "520px" }}>
          <div className="flex-1 flex flex-col overflow-hidden">
            <SinglePanel initialIdentifier={initialIdentifier} label="Molecule A" accentColor="fuchsia" />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <SinglePanel initialIdentifier={null} label="Molecule B" accentColor="cyan" />
          </div>
        </div>
      ) : (
        <div style={{ height: "480px" }} className="flex flex-col">
          <SinglePanel initialIdentifier={initialIdentifier} accentColor="fuchsia" />
        </div>
      )}

      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          🖱️ Rotate: left-click drag · Zoom: scroll · Pan: right-click drag · Powered by <span className="text-fuchsia-400">3Dmol.js</span>
        </p>
      </div>
    </div>
  );
}