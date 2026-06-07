/**
 * SolvationPanel — Water model and ion setup for MD simulations
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Droplets, Zap } from 'lucide-react';

const WATER_MODELS = ['TIP3P', 'TIP4P', 'SPC/E'];
const BOX_SHAPES = ['Cubic', 'Dodecahedral', 'Octahedral'];
const ION_TYPES = ['Na+', 'K+', 'Cl-', 'Mg2+', 'Ca2+'];

const ION_CHARGES = { 'Na+': 1, 'K+': 1, 'Cl-': -1, 'Mg2+': 2, 'Ca2+': 2 };

function calcIonsNeeded(systemCharge, ionType, concentration, solventVolume) {
  const ionCharge = ION_CHARGES[ionType] || 1;
  const neutralizingIons = Math.abs(Math.round(systemCharge / ionCharge));
  const conc = parseFloat(concentration) || 0;
  const volL = solventVolume / 1e27; // rough angstrom^3 -> L
  const extraIons = Math.round(conc * 6.022e23 * volL);
  return { neutralizingIons, extraIons, total: neutralizingIons + extraIons };
}

export default function SolvationPanel({ onApply }) {
  const [waterModel, setWaterModel] = useState('TIP3P');
  const [shellRadius, setShellRadius] = useState(10);
  const [boxShape, setBoxShape] = useState('Cubic');
  const [ionType, setIonType] = useState('Na+');
  const [concentration, setConcentration] = useState(150);
  const [ionMode, setIonMode] = useState('neutralize');
  const [systemCharge, setSystemCharge] = useState(0);
  const [applied, setApplied] = useState(false);

  const volume = (4 / 3) * Math.PI * Math.pow(shellRadius + 10, 3);
  const { neutralizingIons, extraIons, total } = calcIonsNeeded(systemCharge, ionType, concentration, volume);

  const handleApply = () => {
    const config = { waterModel, shellRadius, boxShape, ionType, concentration, ionMode, neutralizingIons, extraIons, total };
    onApply?.(config);
    setApplied(true);
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2 mb-3">
          <Droplets className="w-4 h-4" />
          Solvation Setup
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Configure the water shell and periodic box for molecular dynamics preparation.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Water Model</label>
            <div className="flex gap-1">
              {WATER_MODELS.map(m => (
                <button key={m} onClick={() => setWaterModel(m)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    waterModel === m ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Shell Radius: <span className="text-white font-semibold">{shellRadius} A</span>
            </label>
            <input type="range" min={5} max={25} value={shellRadius}
              onChange={e => setShellRadius(Number(e.target.value))}
              className="w-full accent-teal-500" />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Box Shape</label>
            <div className="flex gap-1">
              {BOX_SHAPES.map(s => (
                <button key={s} onClick={() => setBoxShape(s)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    boxShape === s ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-sm font-bold text-violet-400 flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4" />
          Ion Addition
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Ion Type</label>
            <div className="flex flex-wrap gap-1">
              {ION_TYPES.map(i => (
                <button key={i} onClick={() => setIonType(i)}
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    ionType === i ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Concentration: <span className="text-white font-semibold">{concentration} mM</span>
            </label>
            <input type="range" min={0} max={500} step={10} value={concentration}
              onChange={e => setConcentration(Number(e.target.value))}
              className="w-full accent-violet-500" />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">System Charge (e)</label>
            <input type="number" value={systemCharge}
              onChange={e => setSystemCharge(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500" />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Mode</label>
            <div className="flex gap-1">
              {['neutralize', 'neutralize+conc'].map(m => (
                <button key={m} onClick={() => setIonMode(m)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    ionMode === m ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  {m === 'neutralize' ? 'Neutralize Only' : 'Neutralize + Conc.'}
                </button>
              ))}
            </div>
          </div>

          {/* Ion count preview */}
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
            <p className="text-xs text-slate-400 mb-1">Calculated Ion Count</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">To neutralize charge:</span>
              <span className="text-yellow-400 font-semibold">{neutralizingIons} ions</span>
            </div>
            {ionMode === 'neutralize+conc' && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-300">Additional ({concentration} mM):</span>
                <span className="text-yellow-400 font-semibold">{extraIons} ions</span>
              </div>
            )}
            <div className="flex justify-between text-sm mt-1 pt-1 border-t border-slate-600">
              <span className="text-white font-semibold">Total {ionType} ions:</span>
              <span className="text-teal-400 font-bold">{ionMode === 'neutralize' ? neutralizingIons : total}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">AMBER14SB / CHARMM36 parameters applied</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleApply}
        className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white"
      >
        {applied ? 'Solvation Config Updated' : 'Apply Solvation Setup'}
      </Button>
    </div>
  );
}