import React, { useState, useMemo } from 'react';
import { Search, Loader2, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { alphafoldApi } from '@/functions/alphafoldApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AlphaFoldAttribution from './AlphaFoldAttribution';

const CLASS_COLORS = {
  LPath: '#dc2626',
  Amb: '#f59e0b',
  LBen: '#16a34a',
};

const CLASS_LABELS = {
  LPath: 'Likely Pathogenic',
  Amb: 'Ambiguous',
  LBen: 'Likely Benign',
};

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i]?.trim(); });
    return row;
  });
}

export default function MutationSensitivityAnalyzer() {
  const [uniprotId, setUniprotId] = useState('');
  const [residueFilter, setResidueFilter] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoad = async () => {
    const cleanId = uniprotId.trim().toUpperCase();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setPrediction(null);
    setVariants([]);
    try {
      const { data: predRes } = await alphafoldApi({ action: 'prediction', uniprotId: cleanId });
      if (predRes?.error) throw new Error(predRes.error);
      setPrediction(predRes);
      if (!predRes?.amAnnotationsUrl) throw new Error('No AlphaMissense data available for this protein');
      const { data: csvRes } = await alphafoldApi({ action: 'fetchCsv', url: predRes.amAnnotationsUrl });
      if (csvRes?.error) throw new Error(csvRes.error);
      const parsed = parseCsv(csvRes.csv);
      const processed = parsed
        .filter(r => r.am_pathogenicity && r.am_class)
        .map(r => ({
          ...r,
          am_pathogenicity: parseFloat(r.am_pathogenicity),
        }));
      setVariants(processed);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!residueFilter) return variants;
    const num = parseInt(residueFilter);
    return variants.filter(v => {
      const match = v.protein_variant?.match(/(\d+)/);
      return match && Math.abs(parseInt(match[1]) - num) <= 10;
    });
  }, [variants, residueFilter]);

  const stats = useMemo(() => {
    const lpath = variants.filter(v => v.am_class === 'LPath').length;
    const amb = variants.filter(v => v.am_class === 'Amb').length;
    const lben = variants.filter(v => v.am_class === 'LBen').length;
    return { total: variants.length, lpath, amb, lben };
  }, [variants]);

  const histogram = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({ bin: `${i}-${i + 1}`, range: `${(i / 10).toFixed(1)}-${((i + 1) / 10).toFixed(1)}`, count: 0 }));
    variants.forEach(v => {
      const idx = Math.min(Math.floor(v.am_pathogenicity * 10), 9);
      bins[idx].count++;
    });
    return bins;
  }, [variants]);

  const pathPercent = stats.total > 0 ? ((stats.lpath / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
        <div className="flex gap-2">
          <Input
            value={uniprotId}
            onChange={e => setUniprotId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="UniProt ID (e.g. P04637)"
            className="bg-white border-slate-300 text-slate-800"
          />
          <Button onClick={handleLoad} disabled={loading} className="bg-[#007850] hover:bg-[#00695C] text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Search className="w-4 h-4 mr-1.5" />}
            Load AlphaMissense Data
          </Button>
        </div>
        {prediction && (
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Filter by residue number (optional, shows ±10 residues around a binding region)</label>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <Input
                type="number"
                value={residueFilter}
                onChange={e => setResidueFilter(e.target.value)}
                placeholder="e.g. 175"
                className="bg-white border-slate-300 text-slate-800 max-w-[200px]"
              />
            </div>
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {variants.length > 0 && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Variants</p>
              <p className="text-3xl font-black text-slate-900">{stats.total.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Likely Pathogenic</p>
              <p className="text-3xl font-black" style={{ color: CLASS_COLORS.LPath }}>{stats.lpath.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Ambiguous</p>
              <p className="text-3xl font-black" style={{ color: CLASS_COLORS.Amb }}>{stats.amb.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Likely Benign</p>
              <p className="text-3xl font-black" style={{ color: CLASS_COLORS.LBen }}>{stats.lben.toLocaleString()}</p>
            </div>
          </div>

          {/* Histogram */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Pathogenicity Score Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={histogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {histogram.map((entry, i) => (
                    <Cell key={i} fill={i >= 7 ? CLASS_COLORS.LPath : i >= 4 ? CLASS_COLORS.Amb : CLASS_COLORS.LBen} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight block */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-red-600">{pathPercent}%</span> of possible mutations in this protein are predicted to be pathogenic, indicating {pathPercent > 20 ? 'high' : pathPercent > 10 ? 'moderate' : 'low'} structural sensitivity to chemical interference.
            </p>
          </div>

          {/* Filterable table */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Variant Table {residueFilter && <span className="text-xs text-slate-500 font-normal">({filtered.length} filtered)</span>}
            </h3>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="text-left text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-3">Protein Variant</th>
                    <th className="py-2 pr-3">Pathogenicity Score</th>
                    <th className="py-2 pr-3">Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 500).map((v, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-mono text-slate-700">{v.protein_variant}</td>
                      <td className="py-2 pr-3 font-mono text-slate-700">{v.am_pathogenicity?.toFixed(3)}</td>
                      <td className="py-2 pr-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: (CLASS_COLORS[v.am_class] || '#64748b') + '20', color: CLASS_COLORS[v.am_class] || '#64748b' }}>
                          {CLASS_LABELS[v.am_class] || v.am_class}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <AlphaFoldAttribution includeAlphaMissense />
        </>
      )}
    </div>
  );
}