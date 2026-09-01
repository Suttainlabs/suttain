/**
 * ChainResiduePanel: Lists chains and sequence for a loaded structure
 */
import React, { useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AA_COLORS = {
  ALA:'bg-green-500', ARG:'bg-blue-500', ASN:'bg-cyan-500', ASP:'bg-red-500',
  CYS:'bg-yellow-500', GLN:'bg-cyan-400', GLU:'bg-red-400', GLY:'bg-gray-400',
  HIS:'bg-blue-400', ILE:'bg-green-600', LEU:'bg-green-400', LYS:'bg-blue-600',
  MET:'bg-yellow-600', PHE:'bg-purple-500', PRO:'bg-orange-400', SER:'bg-teal-400',
  THR:'bg-teal-500', TRP:'bg-indigo-500', TYR:'bg-purple-400', VAL:'bg-green-300',
};

export default function ChainResiduePanel({ chains = [], atoms = [], onFocusResidue, onToggleChain }) {
  const [hiddenChains, setHiddenChains] = useState(new Set());
  const [activeChain, setActiveChain] = useState(null);

  const toggleChain = (chain) => {
    const next = new Set(hiddenChains);
    if (next.has(chain)) next.delete(chain);
    else next.add(chain);
    setHiddenChains(next);
    onToggleChain?.(chain, !next.has(chain));
  };

  // Build residue list for active chain
  const residues = React.useMemo(() => {
    if (!activeChain || !atoms.length) return [];
    const seen = new Set();
    return atoms
      .filter(a => a.chain === activeChain)
      .filter(a => { const key = `${a.resi}-${a.resn}`; if (seen.has(key)) return false; seen.add(key); return true; })
      .sort((a, b) => a.resi - b.resi);
  }, [activeChain, atoms]);

  if (!chains.length) {
    return (
      <div className="p-4 text-slate-500 text-xs">
        Load a structure to view chain and residue information.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-700">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Chain Manager</h3>
        <p className="text-xs text-slate-500 mt-0.5">Toggle visibility or click to view sequence</p>
      </div>

      {/* Chain list */}
      <div className="flex flex-col gap-1 p-2">
        {chains.map(chain => (
          <div
            key={chain}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeChain === chain ? 'bg-teal-900/50 border border-teal-600' : 'bg-slate-800 hover:bg-slate-750'
            }`}
            onClick={() => setActiveChain(activeChain === chain ? null : chain)}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-700 rounded flex items-center justify-center text-xs font-bold text-white">
                {chain}
              </div>
              <span className="text-sm text-slate-300">Chain {chain}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); toggleChain(chain); }}
              className="p-1 hover:bg-slate-600 rounded"
            >
              {hiddenChains.has(chain)
                ? <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                : <Eye className="w-3.5 h-3.5 text-teal-400" />
              }
            </button>
          </div>
        ))}
      </div>

      {/* Sequence panel */}
      {activeChain && residues.length > 0 && (
        <div className="flex-1 overflow-auto p-2 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2 font-semibold">Chain {activeChain} Sequence</p>
          <div className="flex flex-wrap gap-0.5">
            {residues.map((r, i) => {
              const color = AA_COLORS[r.resn] || 'bg-slate-600';
              return (
                <button
                  key={i}
                  title={`${r.resn} ${r.resi}`}
                  onClick={() => onFocusResidue?.(r.chain, r.resi)}
                  className={`w-6 h-6 rounded text-white text-[9px] font-bold hover:ring-2 hover:ring-white transition-all ${color}`}
                >
                  {r.resn?.slice(0, 1)}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-slate-500">{residues.length} residues</div>
        </div>
      )}
    </div>
  );
}