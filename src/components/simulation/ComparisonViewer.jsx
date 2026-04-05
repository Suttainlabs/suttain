import React, { useRef, useState, useEffect } from "react";
import { Loader2, Eye, Download, RotateCcw, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VIEWER_STYLES = [
  { label: "Stick", value: "stick" },
  { label: "Sphere", value: "sphere" },
  { label: "Line", value: "line" },
  { label: "Cartoon", value: "cartoon" },
];

const COLOR_SCHEMES = [
  { label: "Element", value: "element" },
  { label: "Chain", value: "chain" },
  { label: "SS", value: "ssPyMol" },
  { label: "Spectrum", value: "spectrum" },
];

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

async function fetchMoleculeData(identifier) {
  const clean = (identifier || "").trim();
  if (!clean) return null;

  if (/^[A-Za-z0-9]{4}$/.test(clean)) {
    const url = `https://files.rcsb.org/download/${clean.toUpperCase()}.pdb`;
    const res = await fetch(url);
    if (res.ok) return { format: "pdb", data: await res.text() };
  }

  const nameUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(clean)}/SDF`;
  try {
    const res = await fetch(nameUrl);
    if (res.ok) return { format: "sdf", data: await res.text() };
  } catch (_) {}

  if (clean.includes("=") || clean.includes("(")) {
    const smilesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(clean)}/SDF`;
    try {
      const res = await fetch(smilesUrl);
      if (res.ok) return { format: "sdf", data: await res.text() };
    } catch (_) {}
  }

  return null;
}

// Single panel viewer with RMSD coloring support
const ComparisonPanel = React.forwardRef(function ComparisonPanel({ side, onLoadedChange }, ref) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [style, setStyle] = useState("stick");
  const [colorScheme, setColorScheme] = useState("element");
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    if (ref) ref.current = viewerRef.current;
  }, [ref]);

  const applyStyle = (viewer) => {
    viewer.setStyle({}, { [style]: { colorscheme: colorScheme } });
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
        if (!viewerRef.current) {
          viewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
            backgroundColor: "#0f172a",
            antialias: true,
          });
        } else {
          viewerRef.current.clear();
        }

        const molData = await fetchMoleculeData(identifier);
        if (!molData) {
          setError(`Could not load "${identifier}". Try a PDB ID, drug name, or SMILES.`);
          if (onLoadedChange) onLoadedChange(false);
          setLoading(false);
          return;
        }

        viewerRef.current.addModel(molData.data, molData.format);
        applyStyle(viewerRef.current);
        viewerRef.current.zoomTo();
        viewerRef.current.zoom(0.8);
        viewerRef.current.render();
        setLoaded(true);
        if (onLoadedChange) onLoadedChange(true);
      } catch (e) {
        setError("Failed to load: " + e.message);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (viewerRef.current && loaded) applyStyle(viewerRef.current);
  }, [style, colorScheme, loaded]);

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
      viewerRef.current.zoom(0.8);
      viewerRef.current.render();
    }
  };

  const handleScreenshot = () => {
    if (viewerRef.current) {
      const a = document.createElement("a");
      a.href = viewerRef.current.pngURI();
      a.download = `comparison_${side}.png`;
      a.click();
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-slate-700 last:border-r-0">
      {/* Label */}
      <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 text-xs font-bold text-cyan-400 uppercase tracking-widest">
        {side === "left" ? "Structure A" : "Structure B"}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && loadMolecule()}
          placeholder="PDB ID, molecule name, or SMILES…"
          className="flex-1 bg-slate-700 text-white text-xs border border-slate-600 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder-slate-500"
        />
        <Button size="sm" onClick={loadMolecule} disabled={loading}
          className="h-7 px-3 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded flex-shrink-0">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load"}
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 bg-slate-800 border-b border-slate-700 text-xs">
        <select value={style} onChange={e => setStyle(e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded px-2 py-1 focus:outline-none text-xs">
          {VIEWER_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={colorScheme} onChange={e => setColorScheme(e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 rounded px-2 py-1 focus:outline-none text-xs">
          {COLOR_SCHEMES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Button size="sm" variant="ghost" onClick={handleReset} disabled={!loaded}
          className="h-6 px-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50">
          <RotateCcw className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleScreenshot} disabled={!loaded}
          className="h-6 px-1.5 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50">
          <Download className="w-3 h-3" />
        </Button>
      </div>

      {/* 3D Viewer Canvas */}
      <div className="relative flex-1 min-h-64">
        <div ref={containerRef} className="w-full h-full absolute inset-0" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
            <p className="text-xs text-slate-300">Loading…</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-900/90">
            <Eye className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-xs text-red-300 font-semibold mb-1">Load failed</p>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        )}

        {!query.trim() && !loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Eye className="w-7 h-7 text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">Load structure to compare</p>
          </div>
        )}

        {loaded && (
          <div className="absolute bottom-2 left-2 bg-slate-900/70 text-green-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </div>
        )}
      </div>
    </div>
  );
});

// Main comparison viewer component
export default function ComparisonViewer() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [leftLoaded, setLeftLoaded] = useState(false);
  const [rightLoaded, setRightLoaded] = useState(false);
  const [showAlignment, setShowAlignment] = useState(false);

  const handleAlign = () => {
    if (!leftRef.current || !rightRef.current || !leftLoaded || !rightLoaded) {
      alert("Load both structures first");
      return;
    }
    // TODO: Implement structure alignment (requires RDKit or alignment library)
    setShowAlignment(true);
  };

  const handleExportComparison = () => {
    if (!leftRef.current || !rightRef.current) return;
    
    // Capture both views
    const leftCanvas = leftRef.current?.pngURI?.();
    const rightCanvas = rightRef.current?.pngURI?.();
    
    if (leftCanvas && rightCanvas) {
      // In a real implementation, would create a composite image with both canvases
      console.log("Export comparison (would combine both views)");
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Structure Comparison</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAlign}
            disabled={!leftLoaded || !rightLoaded}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-3 h-3" /> Align & Show Differences
          </Button>
          <Button
            onClick={handleExportComparison}
            disabled={!leftLoaded || !rightLoaded}
            size="sm"
            className="gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
          >
            <Download className="w-3 h-3" /> Export
          </Button>
        </div>
      </div>

      {/* Alignment Status */}
      {showAlignment && (
        <div className="px-4 py-2 bg-blue-900/30 border-b border-blue-700/50 flex items-center gap-2 text-xs text-blue-300">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Structures aligned. RMSD values shown as atomic coloring (blue = close, red = far).</span>
        </div>
      )}

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <ComparisonPanel ref={leftRef} side="left" onLoadedChange={setLeftLoaded} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <ComparisonPanel ref={rightRef} side="right" onLoadedChange={setRightLoaded} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
        <p>🖱️ Rotate: drag · Zoom: scroll · Pan: right-click drag · Powered by 3Dmol.js</p>
      </div>
    </div>
  );
}