import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Download, ExternalLink, Copy, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { alphafoldApi } from '@/functions/alphafoldApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AlphaFoldAttribution from './AlphaFoldAttribution';

const CONFIDENCE_COLORS = {
  veryHigh: '#2563eb',
  confident: '#0d9e8e',
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
  const [molReady, setMolReady] = useState(false);
  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  // Load 3Dmol.js
  useEffect(() => {
    if (window.$3Dmol) { setMolReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://3dmol.org/build/3Dmol-min.js';
    script.async = true;
    script.onload = () => setMolReady(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleSearch = useCallback(async (id) => {
    const cleanId = (id || uniprotId).trim().toUpperCase();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setPrediction(null);
    setPlddtData(null);
    try {
      const { data: res } = await alphafoldApi({ action: 'prediction', uniprotId: cleanId });
      if (res?.error) throw new Error(res.error);
      setPrediction(res);
      // Fetch pLDDT data
      if (res?.plddtDocUrl) {
        const { data: plddtRes } = await alphafoldApi({ action: 'fetchJson', url: res.plddtDocUrl });
        if (!plddtRes.error && plddtRes.confidence) {
          const chartData = plddtRes.confidence.map((score, i) => ({
            residue: res.sequenceStart + i,
            score,
            color: plddtColor(score),
          }));
          setPlddtData(chartData);
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch prediction');
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
      if (res?.error) throw new Error(res.error);
      setGeneResults(res?.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setGeneLoading(false);
    }
  };

  // Initialize 3Dmol viewer when prediction and molReady are available
  useEffect(() => {
    if (!molReady || !prediction?.pdbUrl || !containerRef.current) return;
    const $3Dmol = window.$3Dmol;
    // Clear any previous viewer content
    containerRef.current.innerHTML = '';
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: '0x0f172a',
      antialias: true,
    });
    viewerRef.current = viewer;
    fetch(prediction.pdbUrl).then(r => r.text()).then(pdbData => {
      viewer.addModel(pdbData, 'pdb');
      viewer.setStyle({}, { cartoon: { color: 'pLDDT' } });
      viewer.zoomTo();
      viewer.render();
    });
    return () => { if (viewerRef.current) { viewerRef.current.clear(); viewerRef.current = null; } };
  }, [molReady, prediction]);

  const handleRotate = () => { if (viewerRef.current) viewerRef.current.spin('y', 1); };
  const handleStopRotate = () => { if (viewerRef.current) viewerRef.current.spin(false); };
  const handleZoomIn = () => { if (viewerRef.current) viewerRef.current.zoom(0.5, 300); };
  const handleZoomOut = () => { if (viewerRef.current) viewerRef.current.zoom(-0.5, 300); };

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
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Enter UniProt Accession ID (e.g. P04637, P03372, P08684)</label>
          <div className="flex gap-2">
            <Input
              value={uniprotId}
              onChange={e => setUniprotId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="P04637"
              className="bg-slate-900/50 border-slate-700 text-white"
            />
            <Button onClick={() => handleSearch()} disabled={loading} className="bg-[#0D9E8E] hover:bg-[#0b8a7d] text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Or search by gene name (e.g. TP53, ESR1, CYP3A4)</label>
          <div className="flex gap-2">
            <Input
              value={geneSearch}
              onChange={e => setGeneSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGeneSearch()}
              placeholder="TP53"
              className="bg-slate-900/50 border-slate-700 text-white"
            />
            <Button onClick={handleGeneSearch} disabled={geneLoading} variant="outline" className="border-slate-600 text-slate-300">
              {geneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Find
            </Button>
          </div>
          {geneResults && (
            <div className="mt-2 space-y-1">
              {geneResults.length === 0 ? (
                <p className="text-xs text-slate-500">No reviewed human proteins found for this gene.</p>
              ) : (
                geneResults.map(r => (
                  <button
                    key={r.accession}
                    onClick={() => { setUniprotId(r.accession); handleSearch(r.accession); }}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors"
                  >
                    <span className="font-mono text-[#0D9E8E] font-semibold">{r.accession}</span>
                    <span className="text-slate-400 ml-2">{r.gene}</span>
                    {r.description && <span className="text-slate-500 ml-2">— {r.description}</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Results */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Protein Identity Card */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Protein Identity</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Full Name</p>
                <p className="text-sm font-semibold text-white">{prediction.uniprotDescription}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Gene Symbol</p>
                <span className="inline-block px-3 py-1.5 rounded-lg bg-[#0D9E8E]/15 border border-[#0D9E8E]/30 text-[#0D9E8E] text-sm font-bold">
                  {prediction.gene}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Organism</p>
                <p className="text-sm text-slate-300">{prediction.organismScientificName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">UniProt Accession</p>
                  <p className="text-sm font-mono text-white">{prediction.uniprotAccession}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Entry ID</p>
                  <p className="text-sm font-mono text-slate-300">{prediction.uniprotId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Sequence Length</p>
                  <p className="text-sm text-white">{prediction.sequenceEnd - prediction.sequenceStart + 1} aa</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Model Version</p>
                  <p className="text-sm text-white">v{prediction.latestVersion}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Created</p>
                  <p className="text-sm text-slate-300">{new Date(prediction.modelCreatedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Review Status</p>
                  {prediction.isUniProtReviewed ? (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Reviewed</span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-600/30 text-slate-400 border border-slate-600/50">Unreviewed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Confidence Score */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Model Confidence</h3>
            <div className="text-center mb-4">
              <p className="text-5xl font-black" style={{ color: plddtColor(prediction.globalMetricValue) }}>
                {prediction.globalMetricValue?.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Model Confidence (pLDDT)</p>
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
                    <span className="text-slate-400">{bar.label}</span>
                    <span className="font-mono text-slate-300">{(bar.value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${bar.value * 100}%`, backgroundColor: bar.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-residue confidence chart */}
          {plddtData && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-bold text-white mb-4">Per-Residue Confidence (pLDDT)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={plddtData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="residue" stroke="#64748b" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <ReferenceLine y={70} stroke="#0d9e8e" strokeDasharray="5 5" label={{ value: 'Confident threshold', fill: '#0d9e8e', fontSize: 10, position: 'insideTopRight' }} />
                  <Line dataKey="score" stroke="#2563eb" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* PAE Heatmap */}
          {prediction.paeImageUrl && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">Predicted Aligned Error (PAE)</h3>
              <p className="text-[11px] text-slate-500 mb-3">Lower values (dark) = high structural confidence</p>
              <img src={prediction.paeImageUrl} alt="PAE Heatmap" className="w-full rounded-lg" />
              {prediction.max_predicted_aligned_error != null && (
                <p className="text-xs text-slate-400 mt-2">Max PAE: <span className="font-mono text-white">{prediction.max_predicted_aligned_error.toFixed(1)} Å</span></p>
              )}
            </div>
          )}

          {/* 3D Structure Viewer */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">3D Structure Viewer</h3>
            <div ref={containerRef} style={{ width: '100%', height: '400px', backgroundColor: '#0f172a', borderRadius: '8px' }} className="border border-slate-700/50" />
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={handleRotate} className="border-slate-600 text-slate-300 text-xs">
                <RotateCw className="w-3 h-3 mr-1" /> Rotate
              </Button>
              <Button size="sm" variant="outline" onClick={handleStopRotate} className="border-slate-600 text-slate-300 text-xs">
                Stop
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomIn} className="border-slate-600 text-slate-300 text-xs">
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut} className="border-slate-600 text-slate-300 text-xs">
                <ZoomOut className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Download links + citation */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-white mb-4">Downloads & Citation</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {prediction.pdbUrl && (
                <a href={prediction.pdbUrl} download className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PDB
                </a>
              )}
              {prediction.cifUrl && (
                <a href={prediction.cifUrl} download className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download CIF
                </a>
              )}
              {prediction.paeDocUrl && (
                <a href={prediction.paeDocUrl} download className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PAE JSON
                </a>
              )}
              <a
                href={`https://alphafold.ebi.ac.uk/entry/${prediction.uniprotAccession}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9E8E]/10 hover:bg-[#0D9E8E]/20 border border-[#0D9E8E]/30 text-[#0D9E8E] text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on AlphaFold DB
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">APA Citation</p>
              <div className="relative">
                <textarea
                  readOnly
                  value={citation}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono resize-none"
                  rows={3}
                />
                <button
                  onClick={copyCitation}
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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