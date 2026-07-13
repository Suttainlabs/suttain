import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { alphafoldApi } from '@/functions/alphafoldApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AlphaFoldAttribution from './AlphaFoldAttribution';
import MolecularViewerManager from './MolecularViewerManager';

const CONFIDENCE_COLORS = {
  veryHigh: '#2563eb',
  confident: '#007850',
  low: '#f59e0b',
  veryLow: '#dc2626',
};

function plddtColor(score) {
  if (score > 90) return CONFIDENCE_COLORS.veryHigh;
  if (score >= 70) return CONFIDENCE_COLORS.confident;
  if (score >= 50) return CONFIDENCE_COLORS.low;
  return CONFIDENCE_COLORS.veryLow;
}

function confidenceLabel(score) {
  if (score > 90) return { label: 'Very High', color: CONFIDENCE_COLORS.veryHigh };
  if (score >= 70) return { label: 'Confident', color: CONFIDENCE_COLORS.confident };
  if (score >= 50) return { label: 'Low', color: CONFIDENCE_COLORS.low };
  return { label: 'Very Low', color: CONFIDENCE_COLORS.veryLow };
}

export default function ProteinStructureExplorer() {
  const [uniprotId, setUniprotId] = useState('');
  const [geneSearch, setGeneSearch] = useState('');
  const [geneResults, setGeneResults] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [plddtData, setPlddtData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geneLoading, setGeneLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearch = useCallback(async (id) => {
    const cleanId = (id || uniprotId).trim().toUpperCase();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setPrediction(null);
    setPlddtData(null);
    try {
      const { data: res } = await alphafoldApi({ action: 'prediction', uniprotId: cleanId });
      if (res?.error) {
        console.error('[ProteinStructureExplorer] Prediction error from backend:', res);
        throw new Error(res.error);
      }
      setPrediction(res);
      // Fetch pLDDT data
      if (res?.plddtDocUrl) {
        const { data: plddtRes } = await alphafoldApi({ action: 'fetchJson', url: res.plddtDocUrl });
        if (plddtRes?.error) {
          console.error('[ProteinStructureExplorer] pLDDT fetch error from backend:', plddtRes);
        } else if (plddtRes?.confidence) {
          const chartData = plddtRes.confidence.map((score, i) => ({
            residue: res.sequenceStart + i,
            score,
            color: plddtColor(score),
          }));
          setPlddtData(chartData);
        }
      }
    } catch (e) {
      console.error('[ProteinStructureExplorer] handleSearch error:', e);
      const errMsg = e?.response?.data?.error
        || e?.message
        || 'Failed to fetch prediction. The AlphaFold or UniProt service may be temporarily unavailable. Check the browser console for details.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [uniprotId]);

  const handleGeneSearch = async () => {
    if (!geneSearch.trim()) return;
    setGeneLoading(true);
    setGeneResults(null);
    try {
      const { data: res } = await alphafoldApi({ action: 'geneSearch', gene: geneSearch.trim() });
      if (res?.error) {
        console.error('[ProteinStructureExplorer] Gene search error from backend:', res);
        throw new Error(res.error);
      }
      setGeneResults(res?.results || []);
    } catch (e) {
      console.error('[ProteinStructureExplorer] handleGeneSearch error:', e);
      const errMsg = e?.response?.data?.error
        || e?.message
        || 'Failed to search UniProt. The service may be rate-limiting requests. Check the browser console for details.';
      setError(errMsg);
    } finally {
      setGeneLoading(false);
    }
  };

  const citation = prediction
    ? `AlphaFold DB. (n.d.). ${prediction.uniprotDescription} (${prediction.gene}). AlphaFold Protein Structure Database. Retrieved from https://alphafold.ebi.ac.uk/entry/${prediction.uniprotAccession}`
    : '';

  const copyCitation = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search inputs */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Enter UniProt Accession ID (e.g. P04637, P03372, P08684)</label>
          <div className="flex gap-2">
            <Input
              value={uniprotId}
              onChange={e => setUniprotId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="P04637"
              className="bg-white border-slate-300 text-slate-800"
            />
            <Button onClick={() => handleSearch()} disabled={loading} className="bg-[#007850] hover:bg-[#0b8a7d] text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Or search by gene name (e.g. TP53, ESR1, CYP3A4)</label>
          <div className="flex gap-2">
            <Input
              value={geneSearch}
              onChange={e => setGeneSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGeneSearch()}
              placeholder="TP53"
              className="bg-white border-slate-300 text-slate-800"
            />
            <Button onClick={handleGeneSearch} disabled={geneLoading} variant="outline" className="border-slate-300 text-slate-700">
              {geneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Find
            </Button>
          </div>
          {geneResults && (
            <div className="mt-2 space-y-1">
              {geneResults.length === 0 ? (
                <p className="text-xs text-slate-400">No reviewed human proteins found for this gene.</p>
              ) : (
                geneResults.map(r => (
                  <button
                    key={r.accession}
                    onClick={() => { setUniprotId(r.accession); handleSearch(r.accession); }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <span className="font-mono text-[#007850] font-semibold">{r.accession}</span>
                    <span className="text-slate-600 ml-2">{r.gene}</span>
                    {r.description && <span className="text-slate-400 ml-2">— {r.description}</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {/* Results */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Protein Identity Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Protein Identity</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Full Name</p>
                <p className="text-sm font-semibold text-slate-800">{prediction.uniprotDescription}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Gene Symbol</p>
                <span className="inline-block px-3 py-1.5 rounded-lg bg-[#007850]/10 border border-[#007850]/30 text-[#007850] text-sm font-bold">
                  {prediction.gene}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Organism</p>
                <p className="text-sm text-slate-700">{prediction.organismScientificName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">UniProt Accession</p>
                  <p className="text-sm font-mono text-slate-800">{prediction.uniprotAccession}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Entry ID</p>
                  <p className="text-sm font-mono text-slate-600">{prediction.uniprotId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Sequence Length</p>
                  <p className="text-sm text-slate-800">{prediction.sequenceEnd - prediction.sequenceStart + 1} aa</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Model Version</p>
                  <p className="text-sm text-slate-800">v{prediction.latestVersion}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Created</p>
                  <p className="text-sm text-slate-600">{new Date(prediction.modelCreatedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Review Status</p>
                  {prediction.isUniProtReviewed ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Reviewed</span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">Unreviewed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Confidence Score */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Model Confidence</h3>
            <div className="text-center mb-4">
              <p className="text-5xl font-black" style={{ color: plddtColor(prediction.globalMetricValue) }}>
                {prediction.globalMetricValue?.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Model Confidence (pLDDT)</p>
              <span
                className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: confidenceLabel(prediction.globalMetricValue).color + '20', color: confidenceLabel(prediction.globalMetricValue).color }}
              >
                {confidenceLabel(prediction.globalMetricValue).label}
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Very High (>90)', value: prediction.fractionPlddtVeryHigh, color: CONFIDENCE_COLORS.veryHigh },
                { label: 'Confident (70-90)', value: prediction.fractionPlddtConfident, color: CONFIDENCE_COLORS.confident },
                { label: 'Low (50-70)', value: prediction.fractionPlddtLow, color: CONFIDENCE_COLORS.low },
                { label: 'Very Low (<50)', value: prediction.fractionPlddtVeryLow, color: CONFIDENCE_COLORS.veryLow },
              ].map(bar => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">{bar.label}</span>
                    <span className="font-mono text-slate-700">{(bar.value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${bar.value * 100}%`, backgroundColor: bar.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-residue confidence chart */}
          {plddtData && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Per-Residue Confidence (pLDDT)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={plddtData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="residue" stroke="#64748b" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#475569' }}
                  />
                  <ReferenceLine y={70} stroke="#007850" strokeDasharray="5 5" label={{ value: 'Confident threshold', fill: '#007850', fontSize: 10, position: 'insideTopRight' }} />
                  <Line dataKey="score" stroke="#2563eb" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* PAE Heatmap */}
          {prediction.paeImageUrl && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Predicted Aligned Error (PAE)</h3>
              <p className="text-[11px] text-slate-400 mb-3">Lower values (dark) = high structural confidence</p>
              <img src={prediction.paeImageUrl} alt="PAE Heatmap" className="w-full rounded-lg" />
              {prediction.max_predicted_aligned_error != null && (
                <p className="text-xs text-slate-600 mt-2">Max PAE: <span className="font-mono text-slate-800">{prediction.max_predicted_aligned_error.toFixed(1)} A</span></p>
              )}
            </div>
          )}

          {/* 3D Structure Viewer */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
            <MolecularViewerManager pdbUrl={prediction.pdbUrl} />
          </div>

          {/* Download links + citation */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Downloads &amp; Citation</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {prediction.pdbUrl && (
                <a href={prediction.pdbUrl} download className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PDB
                </a>
              )}
              {prediction.cifUrl && (
                <a href={prediction.cifUrl} download className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download CIF
                </a>
              )}
              {prediction.paeDocUrl && (
                <a href={prediction.paeDocUrl} download className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PAE JSON
                </a>
              )}
              <a
                href={`https://alphafold.ebi.ac.uk/entry/${prediction.uniprotAccession}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#007850]/10 hover:bg-[#007850]/20 border border-[#007850]/30 text-[#007850] text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on AlphaFold DB
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">APA Citation</p>
              <div className="relative">
                <textarea
                  readOnly
                  value={citation}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-700 font-mono resize-none"
                  rows={3}
                />
                <button
                  onClick={copyCitation}
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlphaFoldAttribution />
    </div>
  );
}