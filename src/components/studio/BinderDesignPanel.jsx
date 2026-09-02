import React, { useState } from "react";
import { Boxes, Loader2, Download, ExternalLink, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { StudioPanel, StudioButton, StudioInput, SourcedBadge, TrustLabel, StudioSectionHeading } from "@/components/studio/StudioShared";
import Studio3DViewer from "@/components/studio/Studio3DViewer";
import { parsePDBAtoms } from "@/components/studio/proteinUtils";
import { useToast } from "@/components/ui/use-toast";

const d = (r) => r?.data?.data || r?.data || r;

export default function BinderDesignPanel() {
  const { toast } = useToast();
  const [target, setTarget] = useState("");
  const [targetName, setTargetName] = useState("");
  const [binderLength, setBinderLength] = useState("80");
  const [hotspots, setHotspots] = useState("");
  const [optimizeFor, setOptimizeFor] = useState("affinity");
  const [numCandidates, setNumCandidates] = useState("3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const topAtoms = result?.topStructure?.pdbText ? parsePDBAtoms(result.topStructure.pdbText) : [];

  const run = async () => {
    if (!target.trim()) {
      setError("Enter a target antigen.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = d(
        await base44.functions.invoke("binderDesign", {
          target: target.trim(),
          targetName: targetName.trim(),
          binderLength,
          hotspots: hotspots.trim(),
          optimizeFor,
          numCandidates,
        })
      );
      if (res.error) throw new Error(res.error);
      setResult(res);
      toast({ title: "Binder design complete", description: `${res.candidates?.length || 0} candidate(s) generated.` });
    } catch (e) {
      setError(e.message);
      toast({ title: "Binder design failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdb = (pdbText, name) => {
    const blob = new Blob([pdbText], { type: "chemical/x-pdb" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <StudioSectionHeading
        icon={Boxes}
        title="De novo binder design"
        subtitle="Generate candidate mini-protein binder sequences against a target antigen, with ESMFold structure prediction for the top candidate."
      />
      <StudioPanel icon={Boxes} title="Design parameters" subtitle="Target antigen plus tuning options" badge={<SourcedBadge />}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Target antigen (UniProt ID, PDB ID, or sequence)</label>
            <StudioInput value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. P00533 or MKTAYIAK..." className="w-full" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Target name (optional)</label>
            <StudioInput value={targetName} onChange={(e) => setTargetName(e.target.value)} placeholder="e.g. EGFR extracellular domain" className="w-full" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Binder length (residues)</label>
            <StudioInput value={binderLength} onChange={(e) => setBinderLength(e.target.value)} placeholder="80" className="w-full" mono />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Hotspot residues (optional)</label>
            <StudioInput value={hotspots} onChange={(e) => setHotspots(e.target.value)} placeholder="e.g. ASP42, GLU45" className="w-full" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Optimize for</label>
            <select value={optimizeFor} onChange={(e) => setOptimizeFor(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F6E56]">
              <option value="affinity">Binding affinity</option>
              <option value="stability">Thermostability and solubility</option>
              <option value="developability">Developability (low aggregation)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Number of candidates</label>
            <select value={numCandidates} onChange={(e) => setNumCandidates(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F6E56]">
              <option value="1">1</option>
              <option value="3">3</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <StudioButton onClick={run} loading={loading} disabled={loading}>
            <Boxes className="w-4 h-4" /> Design binders
          </StudioButton>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </StudioPanel>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Designing candidate binders and predicting structure...
        </div>
      )}

      {result && !loading && (
        <StudioPanel
          icon={Boxes}
          title="Ranked candidate binders"
          subtitle={result.targetContext || result.target}
          badge={
            <div className="flex items-center gap-2">
              <SourcedBadge />
              <TrustLabel source={result.source} type="external" />
            </div>
          }
        >
          {result.honestyNote && (
            <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{result.honestyNote}</p>
            </div>
          )}
          {result.topStructure && topAtoms.length > 0 && (
            <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden" style={{ height: 320 }}>
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Top candidate structure ({result.topStructure.candidate_id}, ESMFold)</span>
                {result.topStructure.plddt != null && <span className="text-xs font-mono text-slate-500">pLDDT {result.topStructure.plddt}</span>}
              </div>
              <div style={{ height: 284 }}>
                <Studio3DViewer atoms={topAtoms} height={284} />
              </div>
            </div>
          )}
          <div className="space-y-2">
            {result.candidates?.map((c) => (
              <div key={c.candidate_id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-800">{c.candidate_id}</span>
                  <span className="text-xs font-mono text-slate-500">Interface score: {c.interface_score}/100</span>
                </div>
                <p className="text-xs font-mono text-slate-600 bg-slate-50 rounded p-2 break-all mb-2">{c.sequence}</p>
                <p className="text-xs text-slate-500 mb-2">{c.rationale}</p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Affinity: {c.predicted_affinity}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Aggregation: {c.aggregation_risk}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Solubility: {c.solubility}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Stability: {c.stability}</span>
                </div>
                {result.topStructure?.candidate_id === c.candidate_id && result.topStructure.pdbText && (
                  <button
                    onClick={() => downloadPdb(result.topStructure.pdbText, `${c.candidate_id}_esmfold.pdb`)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <Download className="w-3 h-3" /> Download structure (PDB)
                  </button>
                )}
              </div>
            ))}
          </div>
          {result.designSummary && <p className="mt-3 text-xs text-slate-500">{result.designSummary}</p>}
          {result.citations && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-400 mb-2">Reference methods (cited, not executed by Suttain)</div>
              <div className="flex flex-wrap gap-2">
                {result.citations.map((c, i) => (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 hover:text-[#0F6E56]">
                    {c.method} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </StudioPanel>
      )}
    </div>
  );
}