import React, { useRef, useState } from 'react';
import MolVisCore from '@/components/molvis/MolVisCore';
import ChainResiduePanel from '@/components/molvis/ChainResiduePanel';
import SolvationPanel from '@/components/molvis/SolvationPanel';
import TrajectoryPlayer from '@/components/molvis/TrajectoryPlayer';
import InteractionPanel from '@/components/molvis/InteractionPanel';
import OrbitalPanel from '@/components/molvis/OrbitalPanel';
import FileImportPanel from '@/components/molvis/FileImportPanel';
import PublicationExport from '@/components/molvis/PublicationExport';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Atom, Layers, Droplets, Play, Zap, GitCompare,
  Link, Download, Upload, Cpu, Settings
} from 'lucide-react';

const PANELS = [
  { id: 'chains', label: 'Chains', icon: Layers },
  { id: 'interactions', label: 'Interactions', icon: Link },
  { id: 'orbitals', label: 'Orbitals / ESP', icon: Zap },
  { id: 'solvation', label: 'Solvation', icon: Droplets },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'import', label: 'Import', icon: Upload },
];

export default function MolecularVisualization() {
  const viewerRef = useRef(null);
  const [structureInfo, setStructureInfo] = useState({ chains: [], atoms: [] });
  const [activePanel, setActivePanel] = useState('chains');
  const [showTrajectory, setShowTrajectory] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  const handleStructureLoaded = (info) => {
    setStructureInfo(info);
    if (info.chains?.length > 0) setActivePanel('chains');
  };

  const handleFileLoaded = ({ data, format, name, isTraj }) => {
    if (isTraj) { setShowTrajectory(true); return; }
    if (data && viewerRef.current) {
      viewerRef.current.loadData(data, format);
    }
  };

  const handleExport = ({ format }) => {
    if (format === 'png') viewerRef.current?.exportPNG();
  };

  return (
    <div
      className="flex flex-col bg-[#0d1f2d]"
      style={{ minHeight: '100vh' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <Atom className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">Molecular Visualization Lab</span>
          <Badge variant="outline" className="text-teal-400 border-teal-600 text-xs">3Dmol.js WebGL</Badge>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTrajectory(t => !t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showTrajectory ? 'bg-teal-700 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Trajectory
          </button>
          <button
            onClick={() => setPerformanceMode(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              performanceMode ? 'bg-orange-700 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            title="Reduce rendering quality for large systems (100k+ atoms)"
          >
            <Cpu className="w-3.5 h-3.5" />
            Perf Mode {performanceMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* Left: Chain / panel sidebar */}
        <div className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden">
          <div className="flex flex-col flex-shrink-0">
            {PANELS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePanel(p.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors border-b border-slate-800 ${
                  activePanel === p.id
                    ? 'bg-teal-900/50 text-teal-300 border-l-2 border-l-teal-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <p.icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {activePanel === 'chains' && (
              <ChainResiduePanel
                chains={structureInfo.chains}
                atoms={structureInfo.atoms}
                onFocusResidue={(chain, resi) => viewerRef.current?.focusResidue(chain, resi)}
                onToggleChain={(chain, visible) => viewerRef.current?.toggleChainVisibility(chain, visible)}
              />
            )}
            {activePanel === 'interactions' && (
              <InteractionPanel />
            )}
            {activePanel === 'orbitals' && (
              <OrbitalPanel
                onExportESP={() => viewerRef.current?.exportPNG()}
              />
            )}
            {activePanel === 'solvation' && (
              <SolvationPanel />
            )}
            {activePanel === 'export' && (
              <PublicationExport onExport={handleExport} />
            )}
            {activePanel === 'import' && (
              <FileImportPanel onFileLoaded={handleFileLoaded} />
            )}
          </div>
        </div>

        {/* Center: 3D Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-hidden">
            <MolVisCore
              ref={viewerRef}
              onStructureLoaded={handleStructureLoaded}
              performanceMode={performanceMode}
            />
          </div>

          {/* Trajectory Player (collapsible) */}
          {showTrajectory && (
            <div className="flex-shrink-0 border-t border-slate-700">
              <TrajectoryPlayer
                totalFrames={200}
                residueCount={structureInfo.atoms?.length > 0
                  ? Math.min(200, new Set(structureInfo.atoms.map(a => a.resi)).size)
                  : 80}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}