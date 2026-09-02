import React, { useState } from "react";
import { Plug, Loader2, Info, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { StudioPanel, StudioButton, StudioInput, SourcedBadge, TrustLabel, StudioSectionHeading } from "@/components/studio/StudioShared";
import { useToast } from "@/components/ui/use-toast";

const d = (r) => r?.data?.data || r?.data || r;

function scoreColor(s) {
  if (s == null) return "#64748b";
  if (s <= -8) return "#0F6E56";
  if (s <= -5) return "#D4900A";
  return "#C42B2B";
}

function confidenceStyle(conf) {
  if (conf === "high") return { bg: "#dcfce7", color: "#166534" };
  if (conf === "medium") return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#fee2e2", color: "#991b1b" };
}

export default function DockingPanel() {
  const { toast } = useToast();
  const [receptor, setReceptor] = useState("");
  const [receptorType, setReceptorType] = useState("uniprot");
  const [ligand, setLigand] = useState("");
  const [ligandType, setLigandType] = useState("smiles");
  const [numPoses, setNumPoses] = useState("3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!receptor.trim() || !ligand.trim()) {
      setError("Enter both a receptor and a ligand.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = d(
        await base44.functions.invoke("dockingAnalysis", {
          receptor: receptor.trim(),
          receptorType,
          ligand: ligand.trim(),
          ligandType,
          numPoses,
        })
      );
      if (res.error) throw new Error(res.error);
      setResult(res);
      toast({ title: "Docking analysis complete", description: `${res.poses?.length || 0} pose(s) predicted.` });
    } catch (e) {
      setError(e.message);
      toast({ title: "Docking analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <StudioSectionHeading
        icon={Plug}
        title="Docking and binding analysis"
        subtitle="Predict ranked binding poses and interaction residues for a ligand against a protein receptor."
      />
      <StudioPanel icon={Plug} title="Docking inputs" subtitle="Receptor plus ligand" badge={<SourcedBadge />}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Receptor type</label>
            <select value={receptorType} onChange={(e) => setReceptorType(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F6E56]">
              <option value="uniprot">UniProt ID (AlphaFold)</option>
              <option value="pdb">PDB ID (RCSB)</option>
              <option value="sequence">Protein sequence</option>
              <option value="name">Protein name</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Receptor</label>
            <StudioInput value={receptor} onChange={(e) => setReceptor(e.target.value)} placeholder="e.g. P00533" className="w-full" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Ligand type</label>
            <select value={ligandType} onChange={(e) => setLigandType(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F6E56]">
              <option value="smiles">SMILES</option>
              <option value="name">Compound name</option>
              <option value="protein">Protein (UniProt or sequence)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Ligand</label>
            <StudioInput value={ligand} onChange={(e) => setLigand(e.target.value)} placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O" className="w-full" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Number of poses</label>
            <select value={numPoses} onChange={(e) => setNumPoses(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F6E56]">
              <option value="1">1</option>
              <option value="3">3</option>
              <option value="5">5</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <StudioButton onClick={run} loading={loading} disabled={loading}>
            <Plug className="w-4 h-4" /> Run docking analysis
          </StudioButton>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </StudioPanel>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Predicting binding poses...
        </div>
      )}

      {result && !loading && (
        <StudioPanel
          icon={Plug}
          title="Predicted binding poses"
          subtitle={result.receptorContext || `${result.receptor} vs ${result.ligand}`}
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
          <div className="space-y-2">
            {result.poses?.map((p) => {
              const cs = confidenceStyle(p.confidence);
              return (
                <div key={p.pose_id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800">{p.pose_id}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold" style={{ color: scoreColor(p.docking_score) }}>
                        {p.docking_score} kcal/mol
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: cs.bg, color: cs.color }}>
                        {p.confidence}
                      </span>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Affinity: </span>
                      <span className="text-slate-700">{p.predicted_affinity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Binding site: </span>
                      <span className="font-mono text-slate-700">{p.binding_site_residues}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="text-slate-400">Key interactions: </span>
                    {p.key_interactions}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{p.rationale}</p>
                </div>
              );
            })}
          </div>
          {result.summary && <p className="mt-3 text-xs text-slate-500">{result.summary}</p>}
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