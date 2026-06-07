/**
 * MolVisCore — WebGL-based 3D viewer using 3Dmol.js
 * Handles: rendering, style switching, measurements, PDB import
 */
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Ruler, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const RENDER_STYLES = [
  { id: 'stick', label: 'Ball & Stick' },
  { id: 'sphere', label: 'Space Fill' },
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'surface', label: 'Surface' },
  { id: 'line', label: 'Wireframe' },
  { id: 'cross', label: 'Cross' },
];

const COLOR_SCHEMES = [
  { id: 'default', label: 'Default' },
  { id: 'chain', label: 'By Chain' },
  { id: 'residue', label: 'By Residue' },
  { id: 'spectrum', label: 'Spectrum' },
  { id: 'hydrophobicity', label: 'Hydrophobicity' },
  { id: 'ssJmol', label: 'Secondary Structure' },
  { id: 'lDDT', label: 'B-Factor' },
];

function load3DmolScript() {
  return new Promise((resolve, reject) => {
    if (window.$3Dmol) { resolve(window.$3Dmol); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/3dmol@2.0.3/build/3Dmol-min.js';
    script.onload = () => resolve(window.$3Dmol);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const MolVisCore = forwardRef(function MolVisCore(
  { onAtomClick, onStructureLoaded, performanceMode = false },
  ref
) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadedName, setLoadedName] = useState('');
  const [renderStyle, setRenderStyle] = useState('stick');
  const [colorScheme, setColorScheme] = useState('default');
  const [measureMode, setMeasureMode] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [measureAtoms, setMeasureAtoms] = useState([]);
  const [pdbId, setPdbId] = useState('');
  const [pdbMeta, setPdbMeta] = useState(null);
  const [pdbSearching, setPdbSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let viewer = null;
    load3DmolScript().then(($3Dmol) => {
      if (!containerRef.current) return;
      viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: performanceMode ? '#111827' : '#0d1f2d',
        antialias: !performanceMode,
        id: 'molvis-main',
      });
      viewerRef.current = viewer;
      viewer.render();
    });
    return () => {
      if (viewer) viewer.clear();
    };
  }, [performanceMode]);

  const applyStyle = (style, color) => {
    const v = viewerRef.current;
    if (!v) return;
    v.setStyle({}, {});
    const spec = {};
    if (color === 'default') {
      spec.color = 'spectrum';
    } else {
      spec.colorfunc = undefined;
      spec.colorscheme = color === 'chain' ? 'chain' :
        color === 'residue' ? 'amino' :
        color === 'hydrophobicity' ? 'hydrophobicity' :
        color === 'ssJmol' ? 'ssJmol' :
        color === 'lDDT' ? 'lDDT' :
        color === 'spectrum' ? 'spectrum' : 'amino';
    }
    if (style === 'stick') {
      v.setStyle({}, { stick: { colorscheme: spec.colorscheme || 'amino', radius: 0.15 }, sphere: { colorscheme: spec.colorscheme || 'amino', radius: 0.25 } });
    } else if (style === 'sphere') {
      v.setStyle({}, { sphere: { colorscheme: spec.colorscheme || 'amino' } });
    } else if (style === 'cartoon') {
      v.setStyle({}, { cartoon: { colorscheme: spec.colorscheme || 'ssJmol' } });
    } else if (style === 'surface') {
      v.setStyle({}, { stick: { colorscheme: spec.colorscheme || 'amino', radius: 0.1 } });
      v.addSurface(window.$3Dmol.SurfaceType.VDW, { opacity: 0.85, colorscheme: spec.colorscheme || 'amino' });
    } else if (style === 'line') {
      v.setStyle({}, { line: { colorscheme: spec.colorscheme || 'amino' } });
    } else if (style === 'cross') {
      v.setStyle({}, { cross: { colorscheme: spec.colorscheme || 'amino', lineWidth: 5 } });
    }
    v.render();
  };

  const handleStyleChange = (s) => {
    setRenderStyle(s);
    applyStyle(s, colorScheme);
  };

  const handleColorChange = (c) => {
    setColorScheme(c);
    applyStyle(renderStyle, c);
  };

  const loadPDB = async (id) => {
    if (!id || !viewerRef.current) return;
    setLoading(true); setError(''); setPdbMeta(null);
    const $3Dmol = window.$3Dmol;
    try {
      // Fetch structure
      const res = await fetch(`https://files.rcsb.org/download/${id.toUpperCase()}.pdb`);
      if (!res.ok) throw new Error(`PDB ${id.toUpperCase()} not found`);
      const pdbData = await res.text();

      // Fetch metadata
      const metaRes = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${id.toUpperCase()}`);
      if (metaRes.ok) {
        const meta = await metaRes.json();
        setPdbMeta({
          name: meta.struct?.title || id.toUpperCase(),
          organism: meta.rcsb_entry_info?.organism_scientific_name || 'Unknown',
          resolution: meta.rcsb_entry_info?.resolution_combined?.[0] || 'N/A',
          deposited: meta.rcsb_accession_info?.deposit_date?.split('T')[0] || 'N/A',
        });
      }

      viewerRef.current.clear();
      const model = viewerRef.current.addModel(pdbData, 'pdb');
      applyStyle(renderStyle, colorScheme);
      viewerRef.current.zoomTo();
      viewerRef.current.render();
      setLoadedName(id.toUpperCase());

      // Extract chains/residues for parent
      const atoms = model.selectedAtoms({});
      const chains = [...new Set(atoms.map(a => a.chain).filter(Boolean))];
      const residues = [...new Set(atoms.map(a => a.resn).filter(Boolean))];
      onStructureLoaded?.({ chains, residues, atoms, model });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const loadData = (data, format) => {
    if (!viewerRef.current || !window.$3Dmol) return;
    setLoading(true);
    try {
      viewerRef.current.clear();
      const model = viewerRef.current.addModel(data, format);
      applyStyle(renderStyle, colorScheme);
      viewerRef.current.zoomTo();
      viewerRef.current.render();
      const atoms = model.selectedAtoms({});
      const chains = [...new Set(atoms.map(a => a.chain).filter(Boolean))];
      onStructureLoaded?.({ chains, atoms, model });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const focusResidue = (chain, resi) => {
    if (!viewerRef.current) return;
    viewerRef.current.zoomTo({ chain, resi });
    viewerRef.current.render();
  };

  const toggleChainVisibility = (chain, visible) => {
    if (!viewerRef.current) return;
    viewerRef.current.setStyle({ chain }, visible ? {} : { hidden: true });
    applyStyle(renderStyle, colorScheme);
  };

  const exportPNG = () => {
    if (!viewerRef.current) return;
    const png = viewerRef.current.pngURI();
    const a = document.createElement('a');
    a.href = png;
    a.download = `${loadedName || 'molecule'}.png`;
    a.click();
  };

  useImperativeHandle(ref, () => ({
    loadPDB,
    loadData,
    focusResidue,
    toggleChainVisibility,
    exportPNG,
    getViewer: () => viewerRef.current,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* PDB Search Bar */}
      <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-700">
        <div className="flex-1 flex items-center gap-2">
          <input
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-400 w-36 focus:outline-none focus:border-teal-500"
            placeholder="PDB ID (e.g. 1CRN)"
            value={pdbId}
            onChange={e => setPdbId(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && loadPDB(pdbId)}
          />
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
            onClick={() => loadPDB(pdbId)}
            disabled={pdbSearching || !pdbId}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Fetch PDB'}
          </Button>
        </div>
        {pdbMeta && (
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-300">
            <span className="font-semibold text-teal-400">{loadedName}</span>
            <span>{pdbMeta.name.slice(0, 40)}{pdbMeta.name.length > 40 ? '...' : ''}</span>
            <Badge variant="outline" className="text-slate-300 border-slate-500 text-xs">{pdbMeta.resolution} A</Badge>
            <span>{pdbMeta.deposited}</span>
          </div>
        )}
        {error && <span className="text-red-400 text-xs">{error}</span>}
        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={exportPNG}>
          Export PNG
        </Button>
      </div>

      {/* Style Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-800 border-b border-slate-700 flex-wrap">
        <span className="text-xs text-slate-400 mr-1">Style:</span>
        {RENDER_STYLES.map(s => (
          <button
            key={s.id}
            onClick={() => handleStyleChange(s.id)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              renderStyle === s.id
                ? 'bg-teal-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-3 mr-1">Color:</span>
        <select
          value={colorScheme}
          onChange={e => handleColorChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded px-2 py-1"
        >
          {COLOR_SCHEMES.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button
          onClick={() => setMeasureMode(m => !m)}
          className={`ml-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
            measureMode ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Click atoms to measure bond length, angle, or dihedral"
        >
          <Ruler className="w-3 h-3" />
          Measure {measureMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="relative flex-1" style={{ minHeight: 420 }}>
        {loading && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              <span className="text-slate-300 text-sm">Loading structure...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" style={{ minHeight: 420 }} />

        {/* Measurement overlays */}
        {measurements.length > 0 && (
          <div className="absolute bottom-3 left-3 space-y-1">
            {measurements.map((m, i) => (
              <div key={i} className="bg-slate-900/80 border border-slate-600 rounded px-2 py-1 text-xs text-white">
                {m}
              </div>
            ))}
          </div>
        )}

        {/* Camera controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <button
            onClick={() => { viewerRef.current?.zoom(1.2); viewerRef.current?.render(); }}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded text-slate-300"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => { viewerRef.current?.zoom(0.8); viewerRef.current?.render(); }}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded text-slate-300"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { viewerRef.current?.zoomTo(); viewerRef.current?.render(); }}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded text-slate-300"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {!loadedName && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-slate-500 text-sm">Enter a PDB ID above or upload a file to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MolVisCore;