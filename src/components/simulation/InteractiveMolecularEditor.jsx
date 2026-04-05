import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, RotateCcw, Save, Play, Pause, 
  Zap, Sliders, TrendingUp, AlertCircle, Check 
} from "lucide-react";
import OptimizationPlotOverlay from "./OptimizationPlotOverlay";
import GeometrySnapshotManager from "./GeometrySnapshotManager";

const FUNCTIONAL_GROUPS = [
  { name: "Hydroxyl", smiles: "O", color: "text-red-400", icon: "OH" },
  { name: "Carboxyl", smiles: "C(=O)O", color: "text-orange-400", icon: "COOH" },
  { name: "Amino", smiles: "N", color: "text-blue-400", icon: "NH2" },
  { name: "Methyl", smiles: "C", color: "text-gray-400", icon: "CH3" },
  { name: "Phenyl", smiles: "c1ccccc1", color: "text-purple-400", icon: "Ph" },
  { name: "Thiol", smiles: "S", color: "text-yellow-400", icon: "SH" },
  { name: "Aldehyde", smiles: "C=O", color: "text-pink-400", icon: "CHO" },
  { name: "Ether", smiles: "O", color: "text-indigo-400", icon: "OR" },
];

const LIGAND_PRESETS = [
  { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
  { name: "Ibuprofen", smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O" },
  { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
  { name: "Ethanol", smiles: "CCO" },
  { name: "Acetone", smiles: "CC(=O)C" },
  { name: "Benzene", smiles: "c1ccccc1" },
];

export default function InteractiveMolecularEditor({ viewer, loaded }) {
  const [editMode, setEditMode] = useState(false);
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const [modifiedStructure, setModifiedStructure] = useState(null);
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationSteps, setOptimizationSteps] = useState([]);
  const [ligandMode, setLigandMode] = useState(false);
  const [selectedLigand, setSelectedLigand] = useState(null);
  const [showFunctionalGroups, setShowFunctionalGroups] = useState(false);
  const [atomInfo, setAtomInfo] = useState(null);
  const [showPlotOverlay, setShowPlotOverlay] = useState(false);
  const [selectedOptStep, setSelectedOptStep] = useState(null);

  // Simulate geometry optimization progress
  const runOptimization = async () => {
    if (!viewer) return;
    
    setOptimizationRunning(true);
    setOptimizationProgress(0);
    setOptimizationSteps([]);
    
    const steps = [];
    const mockEnergies = [];
    
    // Simulate optimization convergence (0 to 100%)
    for (let step = 0; step <= 10; step++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Mock energy calculation (converging)
      const energy = -100 * (1 - Math.exp(-step / 3)) + Math.random() * 0.5;
      mockEnergies.push(energy);
      
      const stepData = {
        step,
        energy: energy.toFixed(4),
        rmsd: (0.5 * Math.exp(-step / 2)).toFixed(4),
        maxForce: (2.0 * Math.exp(-step / 1.5)).toFixed(4),
      };
      
      steps.push(stepData);
      setOptimizationSteps([...steps]);
      setOptimizationProgress((step / 10) * 100);
      
      // Highlight convergence
      if (viewer && step % 2 === 0) {
        viewer.render();
      }
    }
    
    setOptimizationRunning(false);
    setOptimizationProgress(100);
  };

  const addLigand = (ligandSmiles) => {
    if (!viewer || !loaded) return;
    setSelectedLigand(ligandSmiles);
    // In production, would use RDKit or similar to generate 3D coords
    // For now, show UI feedback
    setLigandMode(true);
  };

  const addFunctionalGroup = (groupSmiles) => {
    if (!viewer || !loaded) return;
    // In production, would modify the loaded structure
    // For now, show toast/notification
    setModifiedStructure(`Added functional group: ${groupSmiles}`);
    setTimeout(() => setModifiedStructure(null), 3000);
  };

  const highlightAtom = (atomIndex) => {
    if (!viewer) return;
    viewer.setStyle({ index: atomIndex }, { stick: { colorscheme: "whiteCarbon" }, sphere: { scale: 1.5 } });
    viewer.render();
    setAtomInfo({ index: atomIndex, element: "C" }); // Mock data
  };

  const clearSelection = () => {
    if (viewer) {
      viewer.setStyle({}, {});
      viewer.render();
    }
    setSelectedAtoms([]);
    setAtomInfo(null);
  };

  if (!loaded) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center text-slate-400 text-sm">
        Load a molecule first to access editing tools.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* Plot Overlay */}
      {optimizationSteps.length > 0 && showPlotOverlay && (
        <OptimizationPlotOverlay
          steps={optimizationSteps}
          selectedStep={selectedOptStep}
          onStepSelect={setSelectedOptStep}
          onClose={() => setShowPlotOverlay(false)}
        />
      )}

      {/* Geometry Snapshot Manager */}
      {optimizationSteps.length > 0 && (
        <GeometrySnapshotManager
          steps={optimizationSteps}
          selectedStep={selectedOptStep}
          viewer={viewer}
          onSnapshotTaken={() => {}}
        />
      )}
      {/* Edit Mode Toggle */}
      <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-3 border border-slate-700">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            editMode 
              ? "bg-violet-600 text-white" 
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          {editMode ? "✓ Edit Mode ON" : "Edit Mode"}
        </button>
        <span className="text-xs text-slate-500">Interactive structure modification</span>
      </div>

      {editMode && (
        <>
          {/* Ligand Docking Section */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-white">Ligand Docking</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {LIGAND_PRESETS.map(lig => (
                <button
                  key={lig.name}
                  onClick={() => addLigand(lig.smiles)}
                  className={`px-3 py-2 text-white text-xs rounded-lg border transition-all font-medium ${
                    selectedLigand === lig.smiles
                      ? 'bg-cyan-600 border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-500/50'
                      : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Plus className="w-3 h-3 inline mr-1" /> {lig.name}
                </button>
              ))}
            </div>

            {selectedLigand && (
              <div className="bg-slate-700 border border-cyan-500/30 rounded-lg p-2 text-xs text-cyan-300">
                ✓ Ligand ready: {selectedLigand.substring(0, 30)}...
              </div>
            )}
          </div>

          {/* Functional Groups Library */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
            <button
              onClick={() => setShowFunctionalGroups(!showFunctionalGroups)}
              className="flex items-center gap-2 w-full text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
            >
              <Sliders className="w-4 h-4" />
              Functional Groups
              <span className="text-xs text-slate-500 ml-auto">{showFunctionalGroups ? "▼" : "▶"}</span>
            </button>

            {showFunctionalGroups && (
              <div className="grid grid-cols-2 gap-2">
                {FUNCTIONAL_GROUPS.map(fg => (
                  <button
                    key={fg.name}
                    onClick={() => addFunctionalGroup(fg.smiles)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-xs rounded-lg border border-slate-600 hover:border-slate-500 transition-all font-medium cursor-pointer"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    <span className={fg.color}>{fg.icon}</span> {fg.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Atom Inspector */}
          {atomInfo && (
            <div className="bg-slate-800 rounded-lg p-3 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-300">Atom Inspector</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAtomInfo(null)}
                  className="h-6 px-2 text-slate-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>Index: <span className="text-white font-mono">{atomInfo.index}</span></div>
                <div>Element: <span className="text-white font-mono">{atomInfo.element}</span></div>
              </div>
            </div>
          )}

          {/* Clear & Reset */}
          <Button
            onClick={clearSelection}
            variant="outline"
            className="w-full gap-2 text-xs border-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Selection
          </Button>
        </>
      )}

      {/* Geometry Optimization Section */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white">Geometry Optimization</h4>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runOptimization}
              disabled={optimizationRunning}
              size="sm"
              className={`h-7 px-3 gap-1.5 ${
                optimizationRunning
                  ? "bg-amber-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {optimizationRunning ? (
                <>
                  <Pause className="w-3 h-3" /> Running
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> Optimize
                </>
              )}
            </Button>
            {optimizationSteps.length > 0 && (
              <Button
                onClick={() => setShowPlotOverlay(!showPlotOverlay)}
                size="sm"
                variant={showPlotOverlay ? "default" : "outline"}
                className="h-7 px-3 gap-1.5 text-xs"
              >
                📊 Path
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {optimizationRunning || optimizationProgress > 0 ? (
          <>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Convergence</span>
                <span className="text-slate-300 font-mono">{optimizationProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300"
                  style={{ width: `${optimizationProgress}%` }}
                />
              </div>
            </div>

            {/* Steps Display */}
            {optimizationSteps.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-300 sticky top-0 bg-slate-700 py-1">
                  Optimization Progress
                </div>
                {optimizationSteps.map((step, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-400 p-1 hover:bg-slate-600/50 rounded">
                    <span>Step {step.step}</span>
                    <div className="flex gap-3 text-slate-300">
                      <span className="font-mono">E: {step.energy}</span>
                      <span className="font-mono">RMSD: {step.rmsd}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {optimizationProgress === 100 && (
              <div className="flex items-center justify-between gap-2 p-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-semibold">Geometry optimized ✓</span>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-semibold">Click path to explore</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">Click Optimize to start geometry refinement</p>
        )}
      </div>

      {/* Status Feedback */}
      {modifiedStructure && (
        <div className="flex items-center gap-2 p-3 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-xs text-cyan-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {modifiedStructure}
        </div>
      )}
    </div>
  );
}