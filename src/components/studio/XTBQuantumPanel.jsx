import React, { useState } from 'react';
import { FlaskConical, ChevronDown, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import { StudioPanel, StudioButton, StudioInput, SourcedBadge, TrustLabel } from '@/components/studio/StudioShared';

export default function XTBQuantumPanel() {
  const [input, setInput] = useState('');
  const [isSmiles, setIsSmiles] = useState(false);
  const [mode, setMode] = useState('rapid');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = isSmiles
        ? { smiles: input.trim(), mode }
        : { query: input.trim(), mode };
      const res = await base44.functions.invoke('computeXTB', payload);
      const data = res?.data?.data || res?.data || res;
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Could not complete the calculation.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val, decimals) => (val != null ? Number(val).toFixed(decimals) : null);

  return (
    <StudioPanel icon={FlaskConical} iconColor="#534AB7"
      title="Quantum Geometry and Energy (GFN2-xTB)"
      subtitle="Real semi-empirical optimization on a cloud xTB engine">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <StudioInput value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} placeholder="ethanol  or  CCO" className="flex-1" />
          <StudioButton onClick={run} disabled={!input.trim()} loading={loading}>Run GFN2-xTB</StudioButton>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isSmiles}
              onChange={(e) => setIsSmiles(e.target.checked)}
              className="rounded border-slate-300"
            />
            This is a SMILES string
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <span>Mode:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#0F6E56]"
            >
              <option value="rapid">rapid</option>
              <option value="precise">precise</option>
            </select>
          </label>
        </div>
      </div>

      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#534AB7] rounded-full animate-spin" />
          <p className="text-sm text-slate-500 text-center">
            Running real GFN2-xTB calculation on the cloud engine...
          </p>
          <p className="text-xs text-slate-400">This typically takes 5 to 15 seconds.</p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Could not complete the calculation: {error}</p>
            <p className="text-xs text-red-500 mt-1">If the compound name was not recognized, try entering it as a SMILES string and enable the toggle above.</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <SourcedBadge />
            <TrustLabel source="Rowan cloud xTB engine" type="external" />
          </div>

          {/* Prominent total energy readout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Total Energy</p>
            <p className="text-2xl font-mono font-semibold text-slate-900">
              {fmt(result.result?.total_energy_hartree, 6)} Ha
            </p>
            <p className="text-sm font-mono text-slate-500 mt-1">
              {fmt(result.result?.total_energy_kcal_mol, 2)} kcal/mol
            </p>
          </div>

          {/* Key metrics */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm gap-2">
              <span className="text-slate-500">Atoms optimized</span>
              <span className="font-mono text-slate-800">{result.result?.n_atoms ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm gap-2">
              <span className="text-slate-500">Resolved SMILES</span>
              <span className="font-mono text-slate-800 text-right text-xs break-all">{result.resolved_smiles || 'N/A'}</span>
            </div>
            {result.result?.homo_lumo_gap != null && (
              <div className="flex justify-between text-sm gap-2">
                <span className="text-slate-500">HOMO-LUMO gap</span>
                <span className="font-mono text-slate-800">{fmt(result.result.homo_lumo_gap, 4)} Ha</span>
              </div>
            )}
            {result.result?.dipole != null && (
              <div className="flex justify-between text-sm gap-2">
                <span className="text-slate-500">Dipole</span>
                <span className="font-mono text-slate-800">
                  {Array.isArray(result.result.dipole)
                    ? `${fmt(result.result.dipole[0], 3)} D`
                    : `${fmt(result.result.dipole, 3)} D`}
                </span>
              </div>
            )}
            {result.result?.mulliken_charges != null && (
              <div className="flex justify-between text-sm gap-2">
                <span className="text-slate-500">Mulliken charges</span>
                <span className="font-mono text-slate-800 text-xs">
                  {Array.isArray(result.result.mulliken_charges)
                    ? `${result.result.mulliken_charges.length} atoms`
                    : 'available'}
                </span>
              </div>
            )}
          </div>

          {/* 3D optimized geometry */}
          {result.result?.optimized_geometry && result.result.optimized_geometry.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
              <Studio3DViewer
                atoms={result.result.optimized_geometry.map((a) => ({ element: a.element, position: a.position }))}
                height={300}
              />
            </div>
          )}

          {/* Collapsible optimized geometry table */}
          {result.result?.optimized_geometry && result.result.optimized_geometry.length > 0 && (
            <details className="border border-slate-200 rounded-lg">
              <summary className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50">
                <ChevronDown className="w-4 h-4" />
                Optimized geometry (Angstrom)
              </summary>
              <div className="border-t border-slate-200 overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-2 px-3 font-semibold text-slate-500">Atom</th>
                      <th className="text-right py-2 px-3 font-semibold text-slate-500">x</th>
                      <th className="text-right py-2 px-3 font-semibold text-slate-500">y</th>
                      <th className="text-right py-2 px-3 font-semibold text-slate-500">z</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.result.optimized_geometry.map((atom, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1.5 px-3 text-slate-700 font-semibold">{atom.element}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600">{fmt(atom.position?.[0], 4)}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600">{fmt(atom.position?.[1], 4)}</td>
                        <td className="py-1.5 px-3 text-right text-slate-600">{fmt(atom.position?.[2], 4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Provenance footer */}
          {result.provenance && (
            <p className="text-xs text-slate-400">
              Real GFN2-xTB via {result.engine || 'cloud engine'}, level of theory {result.provenance.level_of_theory}, initial geometry from {result.provenance.initial_geometry_source}, {result.provenance.elapsed_seconds}s
            </p>
          )}

          {/* Honesty note */}
          {result.honesty_note && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
              <p className="text-xs text-violet-700">{result.honesty_note}</p>
            </div>
          )}
        </div>
      )}
    </StudioPanel>
  );
}