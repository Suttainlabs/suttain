import React, { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Styles for the viewer container
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

// Try to get a PDB id from molecule string, or fetch SDF from PubChem
async function fetchMoleculeData(identifier) {
  const clean = (identifier || "").trim();
  if (!clean) return null;

  // If it looks like a PDB ID (4 chars alphanum), fetch from RCSB
  if (/^[A-Za-z0-9]{4}$/.test(clean)) {
    const url = `https://files.rcsb.org/download/${clean.toUpperCase()}.pdb`;
    const res = await fetch(url);
    if (res.ok) return { format: "pdb", data: await res.text(), source: `PDB: ${clean.toUpperCase()}` };
  }

  // If it looks like a UniProt ID, skip (can't auto-fetch easily in browser)
  // Try PubChem by name → SDF
  const nameUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(clean)}/SDF`;
  try {
    const res = await fetch(nameUrl);
    if (res.ok) return { format: "sdf", data: await res.text(), source: `PubChem: ${clean}` };
  } catch (_) {}

  // Try PubChem by SMILES
  if (clean.includes("=") || clean.includes("(") || clean.includes("#")) {
    const smilesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(clean)}/SDF`;
    try {
      const res = await fetch(smilesUrl);
      if (res.ok) return { format: "sdf", data: await res.text(), source: `SMILES: ${clean}` };
    } catch (_) {}
  }

  return null;
}

export default function MolViewer({ simType, inputs }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [style, setStyle] = useState("stick");
  const [colorScheme, setColorScheme] = useState("element");
  const [loaded, setLoaded] = useState(false);

  // Determine the best identifier from inputs
  const getMoleculeIdentifier = () => {
    if (!inputs) return null;
    return (
      inputs.molecule ||
      inputs.ligand ||
      inputs.sequence ||
      inputs.compound ||
      inputs.molecule_or_trajectory ||
      inputs.material ||
      inputs.system ||
      null
    );
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
    const identifier = getMoleculeIdentifier();
    if (!identifier || !containerRef.current) return;

    setLoading(true);
    setError(null);
    setLoaded(false);

    load3Dmol(async () => {
      try {
        // Clear previous viewer
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
          setError(`Could not load "${identifier}". Try a PDB ID (e.g. 1HHO), drug name (e.g. aspirin), or SMILES string.`);
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

  // Re-apply style when it changes (if already loaded)
  useEffect(() => {
    if (viewerRef.current && loaded) {
      applyStyle(viewerRef.current);
    }
  }, [style, colorScheme, loaded]);

  // Auto-load on mount
  useEffect(() => {
    loadMolecule();
    return () => { viewerRef.current = null; };
  }, []);

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
      viewerRef.current.zoom(0.8);
      viewerRef.current.render();
    }
  };

  const handleScreenshot = () => {
    if (viewerRef.current) {
      const imgData = viewerRef.current.pngURI();
      const a = document.createElement("a");
      a.href = imgData;
      a.download = "molecule_3d.png";
      a.click();
    }
  };

  const identifier = getMoleculeIdentifier();

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-fuchsia-400" />
          <span className="text-sm font-semibold text-white">3D Molecular Viewer</span>
          {source && <span className="text-xs text-slate-400">· {source}</span>}
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Style */}
          <select value={style} onChange={e => setStyle(e.target.value)}
            className="text-xs bg-slate-700 text-white border border-slate-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-fuchsia-400">
            {VIEWER_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {/* Color */}
          <select value={colorScheme} onChange={e => setColorScheme(e.target.value)}
            className="text-xs bg-slate-700 text-white border border-slate-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-fuchsia-400">
            {COLOR_SCHEMES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <Button size="sm" variant="ghost" onClick={handleReset} className="h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-700">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleScreenshot} disabled={!loaded} className="h-7 px-2 text-slate-300 hover:text-white hover:bg-slate-700">
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={loadMolecule} disabled={loading}
            className="h-7 px-3 text-xs bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load"}
          </Button>
        </div>
      </div>

      {/* Viewer */}
      <div className="relative" style={{ height: "420px" }}>
        <div ref={containerRef} className="w-full h-full" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80">
            <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin mb-3" />
            <p className="text-sm text-slate-300">Loading molecule…</p>
            <p className="text-xs text-slate-500 mt-1">Fetching structure for "{identifier}"</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center mb-3">
              <Eye className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-red-300 font-medium mb-1">Visualization unavailable</p>
            <p className="text-xs text-slate-400 max-w-sm">{error}</p>
          </div>
        )}

        {!identifier && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Eye className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">No molecule identifier found in inputs</p>
            <p className="text-xs text-slate-600 mt-1">Enter a PDB ID, drug name, or SMILES in the simulation form</p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          🖱️ Rotate: left-click drag · Zoom: scroll · Pan: right-click drag · Powered by <span className="text-fuchsia-400">3Dmol.js</span>
        </p>
      </div>
    </div>
  );
}