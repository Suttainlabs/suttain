import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, RotateCcw, Eye, Download, SplitSquareHorizontal, Square, Wrench, Plus, Camera, ScanSearch, Layers } from "lucide-react";
import VisualizationController from './VisualizationController';
import { Button } from "@/components/ui/button";
import MolecularEditor3D from "./MolecularEditor3D";
import AtomInspectorPanel from "./AtomInspectorPanel";
import PDBLayerPanel from "./PDBLayerPanel";

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

import { resolveMolecule } from '@/components/simulation/resolveMolecule';
import loadMolecularViewer from '@/components/simulation/loadMolecularViewer';
import VisualizationContext from '@/components/simulation/VisualizationContext';

// ── Single panel viewer ──────────────────────────────────────────────────────
const SinglePanel = React.forwardRef(function SinglePanel({ initialIdentifier, visualizationTarget, hasCommands, label, accentColor = "fuchsia", onLoadedChange, onPdbLoaded, externalQuery }, ref) {
  const containerRef = useRef(null);
  const internalViewerRef = useRef(null);
  const viewerRefFinal = ref || internalViewerRef;
  const [query, setQuery] = useState(visualizationTarget?.smiles || visualizationTarget?.pdb_id || visualizationTarget?.name || initialIdentifier || "");
  const requestRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [style, setStyle] = useState("stick");
  const [colorScheme, setColorScheme] = useState("element");
  const [loaded, setLoaded] = useState(false);
  const [inspectorMode, setInspectorMode] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [selectedBond, setSelectedBond] = useState(null);
  const prevHighlightRef = useRef(null);

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

  React.useEffect(() => {
    if (ref && internalViewerRef.current) {
      ref.current = internalViewerRef.current;
    }
  }, [ref]);

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

  const loadMolecule = async (value, target = null) => {
    const identifier = typeof value === 'string' ? value.trim() : query.trim();
    if (!containerRef.current) return;
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    setLoaded(false);
    setSource(null);
    setSelectedAtom(null);
    setSelectedBond(null);
    prevHighlightRef.current = null;
    onLoadedChange?.(false);
    onPdbLoaded?.(null);
    try {
        await loadMolecularViewer();
        if (request !== requestRef.current || !containerRef.current) return;
        if (internalViewerRef.current) {
          internalViewerRef.current.clear();
        } else {
          internalViewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
            backgroundColor: "#0f172a",
            antialias: true,
          });
        }

        if (ref) ref.current = internalViewerRef.current;
        const molData = await resolveMolecule(identifier, target);
        if (request !== requestRef.current || !containerRef.current) return;
        if (!molData) {
          setError('Enter a specific molecule, catalyst, reactant, SMILES, or PDB ID to display its structure.');
          return;
        }
        const model = internalViewerRef.current.addModel(molData.data, molData.format);
        if (!model.selectedAtoms({}).length) {
          internalViewerRef.current.clear();
          setError('No readable atoms were found. Enter a specific molecule or a valid structure identifier.');
          return;
        }
        internalViewerRef.current.resize();
        applyStyle(internalViewerRef.current);
        internalViewerRef.current.zoomTo();
        internalViewerRef.current.zoom(0.8);
        internalViewerRef.current.render();
        setSource(molData.source);
        setLoaded(true);
        if (onLoadedChange) onLoadedChange(true);
        if (onPdbLoaded) onPdbLoaded(molData.pdbId || null);

        // Set up atom click handler
        internalViewerRef.current.setClickable({}, true, (atom) => {
          // Reset previous highlight
          if (prevHighlightRef.current) {
            internalViewerRef.current.setStyle(
              { serial: prevHighlightRef.current },
              {}
            );
            applyStyle(internalViewerRef.current);
          }
          // Highlight clicked atom
          internalViewerRef.current.setStyle(
            { serial: atom.serial },
            { sphere: { color: '#f0abfc', radius: 0.5, opacity: 0.9 } }
          );
          internalViewerRef.current.render();
          prevHighlightRef.current = atom.serial;
          setSelectedAtom({
            elem: atom.elem,
            serial: atom.serial,
            resn: atom.resn,
            chain: atom.chain,
            x: atom.x,
            y: atom.y,
            z: atom.z,
            index: atom.index,
          });
          setSelectedBond(null);
        });
      } catch (e) {
        if (request === requestRef.current) setError(e.message || 'The structure could not be loaded. Try another identifier.');
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
  };

  useEffect(() => {
    if (internalViewerRef.current && loaded) applyStyle(internalViewerRef.current);
  }, [style, colorScheme, loaded]);

  useEffect(() => {
    const identifier = visualizationTarget?.smiles || visualizationTarget?.pdb_id || visualizationTarget?.name || initialIdentifier || '';
    setQuery(identifier);
    if (identifier) loadMolecule(initialIdentifier || identifier, visualizationTarget);
  }, [initialIdentifier, visualizationTarget?.smiles, visualizationTarget?.pdb_id, visualizationTarget?.name]);

  useEffect(() => {
    if (externalQuery) { setQuery(externalQuery); loadMolecule(externalQuery); }
  }, [externalQuery]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      internalViewerRef.current?.resize();
      internalViewerRef.current?.render();
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      ++requestRef.current;
      observer.disconnect();
      internalViewerRef.current?.clear();
      internalViewerRef.current = null;
      if (ref) ref.current = null;
    };
  }, []);

  const handleReset = () => {
    if (internalViewerRef.current) { internalViewerRef.current.zoomTo(); internalViewerRef.current.zoom(0.8); internalViewerRef.current.render(); }
  };

  const handleScreenshot = () => {
    if (internalViewerRef.current) {
      const a = document.createElement("a");
      a.href = internalViewerRef.current.pngURI();
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

      {/* Reference search is hidden for immutable computed output. */}
      {!visualizationTarget?.computed && <>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-semibold">Presets:</span>
        {[{ name: 'H₂O', smiles: 'O' }, { name: 'Ethanol', smiles: 'CCO' }, { name: 'Benzene', smiles: 'c1ccccc1' }].map(p => (
          <button key={p.name} onClick={() => { setQuery(p.smiles); loadMolecule(p.smiles, { smiles: p.smiles }); }} className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded border border-slate-600">{p.name}</button>
        ))}
      </div>

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

      </>}
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
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setInspectorMode(v => !v);
            setSelectedAtom(null);
            setSelectedBond(null);
          }}
          disabled={!loaded}
          title="Toggle Atom Inspector"
          className={`h-7 px-2 transition-colors ${inspectorMode ? 'bg-fuchsia-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
        >
          <ScanSearch className="w-3.5 h-3.5" />
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
          <div role="status" className="absolute inset-0 flex flex-col items-center justify-center bg-research-card p-4 text-center z-10">
            <div className="w-10 h-10 rounded-full bg-research-soft flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-research-accent" />
            </div>
            <p className="text-sm text-research-text font-medium mb-1">Choose a structure to explore</p>
            <p className="text-sm text-research-muted">{error}</p>
            {hasCommands && <p className="text-sm text-research-muted mt-2">Your visualization commands are available below for use with engine output files.</p>}
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

        {/* Inspector mode overlay hint */}
        {inspectorMode && loaded && !selectedAtom && !selectedBond && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-fuchsia-900/80 text-fuchsia-200 text-[10px] px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            Click an atom to inspect
          </div>
        )}
      </div>

      {/* Atom Inspector Panel */}
      {inspectorMode && (
        <AtomInspectorPanel
          atomData={selectedAtom}
          bondData={selectedBond}
          onClear={() => {
            setSelectedAtom(null);
            setSelectedBond(null);
            if (prevHighlightRef.current && internalViewerRef.current) {
              applyStyle(internalViewerRef.current);
              prevHighlightRef.current = null;
            }
          }}
        />
      )}
    </div>
  );
});

// ── Main MolViewer ────────────────────────────────────────────────────────────
export default function MolViewer({ simType, inputs, visualizationTarget, visualizationCommands }) {
  const [compareMode, setCompareMode] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [moleculeLoaded, setMoleculeLoaded] = useState(false);
  const [showController, setShowController] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [loadedPdbId, setLoadedPdbId] = useState(null);
  const [externalLoadQuery, setExternalLoadQuery] = useState(null);
  const viewerRef = useRef(null);
  const singlePanelRef = useRef(null);

  const getMoleculeIdentifier = () => {
    if (!inputs) return null;
    return (
      inputs.molecule || inputs.ligand || inputs.sequence ||
      inputs.compound || inputs.molecule_or_trajectory ||
      inputs.material || inputs.system || inputs.reactants || inputs.surface || null
    );
  };

  const initialIdentifier = getMoleculeIdentifier();

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700">
        <Eye className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-white">3D Molecular Viewer</span>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => {
              if (viewerRef.current) {
                const a = document.createElement("a");
                a.href = viewerRef.current.pngURI();
                a.download = `suttain-snapshot-${new Date().getTime()}.png`;
                a.click();
              }
            }}
            title="Download viewport as PNG"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5">
            <Camera className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Snapshot</span>
          </button>
          {!visualizationTarget?.computed && <>
          <span className="text-xs text-slate-400 hidden sm:block">Tools:</span>
          <button
            onClick={() => {
              setShowController(!showController);
              if (showEditor) setShowEditor(false);
            }}
            title="Add/remove items"
            className={`p-1.5 rounded-lg transition-colors ${showController ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}>
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLayerPanel(v => !v)}
            title="Layer panel & PDB search"
            className={`p-1.5 rounded-lg transition-colors ${showLayerPanel ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}>
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowEditor(!showEditor);
              if (showController) setShowController(false);
            }}
            title="Structure editor"
            className={`p-1.5 rounded-lg transition-colors ${showEditor ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}>
            <Wrench className="w-4 h-4" />
          </button>
          </>}
          <span className="text-xs text-slate-400 hidden sm:block">View:</span>
        </div>
        <div className="flex items-center gap-3">
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

      <VisualizationContext target={visualizationTarget} input={initialIdentifier} />

      {/* Visualization Controller */}
      {showController && (
        <div style={{ height: '300px' }} className="overflow-y-auto border-t border-slate-700">
          <div className="p-4">
            <VisualizationController
              viewerRef={viewerRef}
              onAddMolecule={(mol) => console.log('Added:', mol)}
              onRemoveItem={(id) => console.log('Removed:', id)}
              onSeparateResidue={(sep) => console.log('Separated:', sep)}
            />
          </div>
        </div>
      )}

      {/* Panels */}
      {showEditor ? (
        <div style={{ height: "600px" }} className="flex flex-col overflow-hidden">
          <MolecularEditor3D />
        </div>
      ) : compareMode ? (
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-700" style={{ height: "520px" }}>
          <div className="flex-1 flex flex-col overflow-hidden">
            <SinglePanel ref={viewerRef} initialIdentifier={initialIdentifier} visualizationTarget={visualizationTarget} hasCommands={!!visualizationCommands} label="Molecule A" accentColor="fuchsia" onLoadedChange={setMoleculeLoaded} onPdbLoaded={setLoadedPdbId} />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <SinglePanel initialIdentifier={null} label="Molecule B" accentColor="cyan" />
          </div>
        </div>
      ) : (
        <div className="flex" style={{ height: "480px" }}>
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <SinglePanel
              ref={viewerRef}
              initialIdentifier={initialIdentifier}
              visualizationTarget={visualizationTarget}
              hasCommands={!!visualizationCommands}
              externalQuery={externalLoadQuery}
              accentColor="fuchsia"
              onLoadedChange={setMoleculeLoaded}
              onPdbLoaded={setLoadedPdbId}
            />
          </div>
          {showLayerPanel && (
            <PDBLayerPanel
              viewerRef={viewerRef}
              loadedPdbId={loadedPdbId}
              onLoadPdb={(pdbId) => setExternalLoadQuery(pdbId)}
            />
          )}
        </div>
      )}

      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Rotate: left-click drag · Zoom: scroll · Pan: right-click drag · <span className="text-fuchsia-400">Inspector:</span> enable via <ScanSearch className="w-3 h-3 inline text-fuchsia-400 mx-0.5" /> then click any atom · Powered by <span className="text-fuchsia-400">3Dmol.js</span>
        </p>
      </div>
    </div>
  );
}