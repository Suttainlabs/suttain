/**
 * InteractionPanel — Non-covalent interaction detection and display
 */
import React, { useState } from 'react';
import { Eye, EyeOff, Filter } from 'lucide-react';

const INTERACTION_TYPES = [
  { id: 'hbond', label: 'H-Bonds', color: '#3b82f6', colorClass: 'bg-blue-500' },
  { id: 'pipi', label: 'pi-pi Stacking', color: '#22c55e', colorClass: 'bg-green-500' },
  { id: 'vdw', label: 'Van der Waals', color: '#94a3b8', colorClass: 'bg-slate-400' },
  { id: 'hydrophobic', label: 'Hydrophobic', color: '#f97316', colorClass: 'bg-orange-500' },
  { id: 'ionic', label: 'Ionic', color: '#ef4444', colorClass: 'bg-red-500' },
];

function generateMockInteractions() {
  const types = ['hbond', 'pipi', 'vdw', 'hydrophobic', 'ionic'];
  const residues = ['ALA15', 'GLY22', 'ARG44', 'ASP67', 'PHE89', 'TRP102', 'LYS118', 'GLU134'];
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    type: types[i % types.length],
    atom1: `${residues[i % residues.length]}:N`,
    atom2: `${residues[(i + 3) % residues.length]}:O`,
    distance: parseFloat((1.8 + Math.random() * 2.5).toFixed(2)),
    energy: parseFloat((-8 + Math.random() * 6).toFixed(2)),
  }));
}

const MOCK_INTERACTIONS = generateMockInteractions();

export default function InteractionPanel({ interactions = MOCK_INTERACTIONS }) {
  const [hiddenTypes, setHiddenTypes] = useState(new Set());
  const [minStrength, setMinStrength] = useState(0);

  const toggleType = (type) => {
    const next = new Set(hiddenTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setHiddenTypes(next);
  };

  const filtered = interactions.filter(i =>
    !hiddenTypes.has(i.type) && Math.abs(i.energy) >= minStrength
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-700">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Non-Covalent Interactions</h3>
        <p className="text-xs text-slate-500 mt-0.5">Auto-detected from simulation output</p>
      </div>

      {/* Type toggles */}
      <div className="p-2 space-y-1 border-b border-slate-700">
        {INTERACTION_TYPES.map(t => (
          <div key={t.id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-1.5 rounded-full ${t.colorClass}`} />
              <span className="text-xs text-slate-300">{t.label}</span>
              <span className="text-xs text-slate-500">
                ({interactions.filter(i => i.type === t.id).length})
              </span>
            </div>
            <button onClick={() => toggleType(t.id)} className="p-0.5">
              {hiddenTypes.has(t.id)
                ? <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                : <Eye className="w-3.5 h-3.5 text-teal-400" />
              }
            </button>
          </div>
        ))}
      </div>

      {/* Min strength filter */}
      <div className="px-3 py-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Min |energy|: {minStrength} kcal/mol</span>
        </div>
        <input type="range" min={0} max={8} step={0.5} value={minStrength}
          onChange={e => setMinStrength(Number(e.target.value))}
          className="w-full mt-1 accent-violet-500" />
      </div>

      {/* Interaction list */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-800 sticky top-0">
              <th className="px-2 py-1.5 text-left text-slate-400 font-medium">Type</th>
              <th className="px-2 py-1.5 text-left text-slate-400 font-medium">Atoms</th>
              <th className="px-2 py-1.5 text-right text-slate-400 font-medium">Dist (A)</th>
              <th className="px-2 py-1.5 text-right text-slate-400 font-medium">Energy</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => {
              const typeInfo = INTERACTION_TYPES.find(t => t.id === i.type);
              return (
                <tr key={i.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-2 py-1">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${typeInfo?.colorClass}`} />
                      <span className="text-slate-400">{typeInfo?.label}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1 text-slate-300 font-mono text-[10px]">
                    {i.atom1}<br />{i.atom2}
                  </td>
                  <td className="px-2 py-1 text-right text-slate-300">{i.distance}</td>
                  <td className={`px-2 py-1 text-right font-semibold ${i.energy < -3 ? 'text-red-400' : 'text-slate-300'}`}>
                    {i.energy}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 text-xs py-4">No interactions match filter</p>
        )}
      </div>
    </div>
  );
}