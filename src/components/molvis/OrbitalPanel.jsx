/**
 * OrbitalPanel: HOMO/LUMO and ESP surface controls for DFT results
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function OrbitalPanel({ hasResult = false, onExportESP }) {
  const [showHOMO, setShowHOMO] = useState(true);
  const [showLUMO, setShowLUMO] = useState(true);
  const [homoOpacity, setHomoOpacity] = useState(0.7);
  const [lumoOpacity, setLumoOpacity] = useState(0.7);
  const [homoIso, setHomoIso] = useState(0.02);
  const [lumoIso, setLumoIso] = useState(0.02);
  const [espThreshold, setEspThreshold] = useState(0.05);
  const [espOpacity, setEspOpacity] = useState(0.75);
  const [showESP, setShowESP] = useState(false);

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-violet-400 mb-1">Molecular Orbitals</h3>
        <p className="text-xs text-slate-500 mb-4">Available after DFT/QM simulation completes</p>

        {/* HOMO */}
        <div className="bg-slate-800 rounded-lg p-3 mb-3 border border-red-900/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-400">HOMO</span>
              <span className="text-xs text-slate-500">Highest Occupied MO</span>
            </div>
            <button
              onClick={() => setShowHOMO(h => !h)}
              className={`px-2 py-0.5 rounded text-xs font-medium ${showHOMO ? 'bg-red-700 text-white' : 'bg-slate-700 text-slate-400'}`}
            >
              {showHOMO ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-400">Isovalue: {homoIso.toFixed(3)}</label>
              <input type="range" min={0.001} max={0.1} step={0.001} value={homoIso}
                onChange={e => setHomoIso(Number(e.target.value))}
                className="w-full accent-red-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Opacity: {Math.round(homoOpacity * 100)}%</label>
              <input type="range" min={0.1} max={1} step={0.05} value={homoOpacity}
                onChange={e => setHomoOpacity(Number(e.target.value))}
                className="w-full accent-red-500" />
            </div>
          </div>
        </div>

        {/* LUMO */}
        <div className="bg-slate-800 rounded-lg p-3 border border-blue-900/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-blue-400">LUMO</span>
              <span className="text-xs text-slate-500">Lowest Unoccupied MO</span>
            </div>
            <button
              onClick={() => setShowLUMO(l => !l)}
              className={`px-2 py-0.5 rounded text-xs font-medium ${showLUMO ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-400'}`}
            >
              {showLUMO ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-400">Isovalue: {lumoIso.toFixed(3)}</label>
              <input type="range" min={0.001} max={0.1} step={0.001} value={lumoIso}
                onChange={e => setLumoIso(Number(e.target.value))}
                className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Opacity: {Math.round(lumoOpacity * 100)}%</label>
              <input type="range" min={0.1} max={1} step={0.05} value={lumoOpacity}
                onChange={e => setLumoOpacity(Number(e.target.value))}
                className="w-full accent-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ESP Surface */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-teal-400">ESP Surface</h3>
          <button
            onClick={() => setShowESP(e => !e)}
            className={`px-2 py-0.5 rounded text-xs font-medium ${showESP ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            {showESP ? 'On' : 'Off'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Red = negative charge density, Blue = positive. Generated after DFT run.
        </p>

        {/* Gradient legend */}
        <div className="h-3 rounded-full mb-2" style={{ background: 'linear-gradient(to right, #ef4444, #ffffff, #3b82f6)' }} />
        <div className="flex justify-between text-xs text-slate-500 mb-3">
          <span>- (negative)</span>
          <span>+ (positive)</span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-400">Isosurface Threshold: {espThreshold.toFixed(3)}</label>
            <input type="range" min={0.001} max={0.2} step={0.001} value={espThreshold}
              onChange={e => setEspThreshold(Number(e.target.value))}
              className="w-full accent-teal-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Opacity: {Math.round(espOpacity * 100)}%</label>
            <input type="range" min={0.1} max={1} step={0.05} value={espOpacity}
              onChange={e => setEspOpacity(Number(e.target.value))}
              className="w-full accent-teal-500" />
          </div>
        </div>

        <Button
          onClick={onExportESP}
          variant="outline"
          className="w-full mt-3 border-teal-600 text-teal-400 hover:bg-teal-900/30 text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export ESP Map (PNG)
        </Button>
      </div>
    </div>
  );
}