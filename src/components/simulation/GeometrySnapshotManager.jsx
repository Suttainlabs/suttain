import React, { useState, useEffect } from "react";
import { Camera, Play } from "lucide-react";

export default function GeometrySnapshotManager({ steps, selectedStep, viewer, onSnapshotTaken }) {
  const [snapshots, setSnapshots] = useState({});
  const [loading, setLoading] = useState(false);

  // Simulate geometry change on step selection
  useEffect(() => {
    if (selectedStep === null || !viewer) return;

    setLoading(true);
    
    // Simulate geometry deformation animation
    // In production: would use RDKit or similar to generate coords for each step
    const step = steps[selectedStep];
    if (step) {
      // Mock animation: add visual feedback to viewer
      if (viewer.render) {
        // Simulate bond stretch/contraction based on convergence
        const convergenceFactor = selectedStep / Math.max(steps.length - 1, 1);
        
        // Change viewer style to indicate state
        const alpha = 0.5 + convergenceFactor * 0.5;
        viewer.setStyle({}, { cartoon: { opacity: alpha }, stick: { opacity: alpha } });
        viewer.render();

        // Store snapshot metadata
        setSnapshots(prev => ({
          ...prev,
          [selectedStep]: {
            step: selectedStep,
            energy: step.energy,
            rmsd: step.rmsd,
            timestamp: Date.now(),
          }
        }));

        if (onSnapshotTaken) {
          onSnapshotTaken(selectedStep, step);
        }
      }
    }

    setLoading(false);
  }, [selectedStep, steps, viewer, onSnapshotTaken]);

  const downloadSnapshot = (stepIndex) => {
    if (!viewer || !viewer.pngURI) return;
    const a = document.createElement("a");
    a.href = viewer.pngURI();
    a.download = `geometry_step_${stepIndex}.png`;
    a.click();
  };

  const getSnapshotCount = () => Object.keys(snapshots).length;

  return (
    <div className="fixed top-16 right-4 z-30 max-w-xs">
      {/* Snapshot Counter */}
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Camera className="w-4 h-4 text-cyan-400" />
          Geometry Snapshots
        </div>
        
        <div className="text-xs text-slate-400">
          Captured: <span className="text-white font-mono">{getSnapshotCount()}</span>
        </div>

        {selectedStep !== null && (
          <div className="space-y-1.5 pt-1.5 border-t border-slate-700">
            <div className="text-xs text-slate-300">
              Current Step: <span className="text-amber-400 font-semibold">{selectedStep}</span>
            </div>
            {steps[selectedStep] && (
              <div className="text-xs space-y-0.5 text-slate-400">
                <div>E: <span className="text-orange-400">{steps[selectedStep].energy}</span> Eh</div>
                <div>RMSD: <span className="text-cyan-400">{steps[selectedStep].rmsd}</span></div>
              </div>
            )}
            <button
              onClick={() => downloadSnapshot(selectedStep)}
              disabled={loading}
              className="w-full px-2 py-1.5 mt-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
            >
              <Camera className="w-3 h-3" />
              Save Geometry
            </button>
          </div>
        )}

        {getSnapshotCount() > 0 && (
          <div className="space-y-1 pt-1.5 border-t border-slate-700">
            <div className="text-xs font-semibold text-slate-300 mb-1">Saved Steps</div>
            <div className="max-h-24 overflow-y-auto space-y-0.5">
              {Object.entries(snapshots).map(([step, data]) => (
                <div
                  key={step}
                  className="flex items-center justify-between p-1 bg-slate-700/30 rounded border border-slate-600 hover:bg-slate-700/50 transition-colors"
                >
                  <span className="text-xs text-slate-300">
                    Step <span className="font-mono font-semibold">{step}</span>
                  </span>
                  <button
                    onClick={() => downloadSnapshot(parseInt(step))}
                    className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
                    title="Download"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}