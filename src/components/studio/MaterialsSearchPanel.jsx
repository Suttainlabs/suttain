import React, { useState } from 'react';
import { Boxes, Download, ExternalLink, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { suttainMaterials } from '@/functions/suttainMaterials';
import { LoadingState, ErrorState, SourceLabel, DataRow } from '@/components/shared/FunctionResult';

export default function MaterialsSearchPanel() {
  const [query, setQuery] = useState('');
  const [formula, setFormula] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedRef, setExpandedRef] = useState(null);

  const run = async () => {
    if (!query.trim() && !formula.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {};
      if (query.trim()) payload.query = query.trim();
      if (formula.trim()) payload.formula = formula.trim();
      const res = await suttainMaterials(payload);
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Boxes className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">Materials Structure Search</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">Search crystallographic databases for crystal structures with CIF downloads. Optionally query Materials Project if you have an API key saved in settings.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Mineral or material name"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <input value={formula} onChange={e => setFormula(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Formula (optional, e.g. Fe2O3)"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
      </div>
      <button onClick={run} disabled={loading || (!query.trim() && !formula.trim())}
        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
        Search Materials
      </button>

      {loading && <LoadingState label="Searching crystallographic databases..." />}
      {error && <ErrorState message={error} />}

      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />

          {result.crystal_structures && result.crystal_structures.length > 0 ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs font-semibold text-slate-500">Crystal Structures ({result.crystal_structures.length})</p>
              {result.crystal_structures.map((cs, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800 font-mono">{cs.formula}</span>
                    <div className="flex items-center gap-2">
                      <a href={cs.cif_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white rounded-lg"
                        style={{ background: '#007850' }}>
                        <Download className="w-3 h-3" /> CIF
                      </a>
                      <a href={`/ComputationalStudio/Materials?cif=${encodeURIComponent(cs.cif_url)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                        <ArrowRight className="w-3 h-3" /> Use for engine input
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <DataRow label="Space Group" value={`${cs.space_group}${cs.space_group_number ? ` (#${cs.space_group_number})` : ''}`} />
                    {cs.volume != null && <DataRow label="Volume" value={cs.volume.toFixed(2)} unit="A^3" />}
                    {cs.cell && (
                      <>
                        <DataRow label="a" value={cs.cell.a.toFixed(3)} unit="A" />
                        <DataRow label="b" value={cs.cell.b.toFixed(3)} unit="A" />
                        <DataRow label="c" value={cs.cell.c.toFixed(3)} unit="A" />
                        <DataRow label="alpha" value={cs.cell.alpha.toFixed(1)} unit="deg" />
                        <DataRow label="beta" value={cs.cell.beta.toFixed(1)} unit="deg" />
                        <DataRow label="gamma" value={cs.cell.gamma.toFixed(1)} unit="deg" />
                      </>
                    )}
                  </div>
                  {cs.elements && cs.elements.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-slate-400">Elements:</span>
                      {cs.elements.map((el, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded">{el}</span>
                      ))}
                    </div>
                  )}
                  {cs.reference && (
                    <button onClick={() => setExpandedRef(expandedRef === i ? null : i)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
                      {expandedRef === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Reference
                    </button>
                  )}
                  {expandedRef === i && cs.reference && (
                    <p className="mt-1 text-xs text-slate-400 font-mono">{cs.reference}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No crystal structures found for this query.</p>
          )}

          {result.materials_project && (
            <div className="mt-4 p-4 border border-violet-200 rounded-xl bg-violet-50">
              <p className="text-xs font-bold text-violet-700 mb-2">Materials Project Data</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <DataRow label="Material ID" value={result.materials_project.material_id} />
                <DataRow label="Formula" value={result.materials_project.formula} />
                {result.materials_project.band_gap_eV != null && <DataRow label="Band Gap" value={result.materials_project.band_gap_eV.toFixed(3)} unit="eV" />}
                {result.materials_project.density != null && <DataRow label="Density" value={result.materials_project.density.toFixed(2)} unit="g/cm3" />}
                {result.materials_project.energy_above_hull != null && <DataRow label="Energy Above Hull" value={result.materials_project.energy_above_hull.toFixed(3)} unit="eV/atom" />}
                {result.materials_project.crystal_system && <DataRow label="Crystal System" value={result.materials_project.crystal_system} />}
                {result.materials_project.space_group && <DataRow label="Space Group" value={result.materials_project.space_group} />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}