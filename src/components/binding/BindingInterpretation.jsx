import React from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, Info } from 'lucide-react';

// Plain-language reading of hosted binding outputs. Definitions follow the model authors' documentation:
//  - Boltz-2 (github.com/jwohlwend/boltz docs/prediction.md): affinity_pred_value = log10(IC50 in µM), lower = stronger;
//    pIC50 = 6 − value; ΔG ≈ (6 − value) × 1.364 kcal/mol; affinity_probability_binary = probability the ligand is a binder.
//    Use probability for hit discovery (binder vs decoy); use the value only to compare actives within one series.
//  - Boltz-2.1 via Boltz API (api.boltz.bio/docs/api/guides/predictions): binding_confidence 0–1, "0.7+ is typically the
//    high-confidence range"; optimization_score ranks candidates within the same run.
//  - Structure confidence (ptm, iptm, plddt) is 0–1, higher = more confident; it describes the predicted pose, not affinity.

const pick = (metrics, ...suffixes) => {
  for (const s of suffixes) {
    const m = metrics.find(x => x.key === s || x.key.endsWith(`.${s}`));
    if (m && typeof m.value === 'number' && Number.isFinite(m.value)) return m.value;
  }
  return null;
};
const f = (v, d = 2) => (v == null ? '—' : Number(v).toFixed(d));
const conc = uM => (uM >= 1000 ? `${f(uM / 1000, 1)} mM` : uM >= 1 ? `${f(uM, uM < 10 ? 1 : 0)} µM` : `${f(uM * 1000, uM * 1000 < 10 ? 1 : 0)} nM`);

function Verdict({ tone, title, children }) {
  const Icon = tone === 'good' ? CheckCircle2 : tone === 'bad' ? AlertTriangle : CircleDashed;
  const cls = tone === 'good' ? 'border-research-accent bg-research-soft' : tone === 'bad' ? 'border-amber-300 bg-amber-50' : 'border-research-border bg-research-card';
  return <div className={`rounded-lg border p-4 ${cls}`}><p className="flex items-center gap-2 text-sm font-semibold"><Icon className={`h-4 w-4 shrink-0 ${tone === 'bad' ? 'text-amber-700' : 'text-research-accent'}`} />{title}</p><div className="mt-1 text-sm text-research-text">{children}</div></div>;
}

function Row({ label, value, help }) {
  return <div className="flex items-start justify-between gap-4 border-b border-research-border py-2.5 last:border-0">
    <div className="min-w-0"><p className="text-sm">{label}</p>{help && <p className="text-xs text-research-muted">{help}</p>}</div>
    <p className="shrink-0 font-mono text-sm tabular-nums">{value}</p>
  </div>;
}

// Rough heavy-atom count from SMILES (bracket atoms + organic-subset symbols, excluding H).
const heavyAtoms = smi => { const s = String(smi || ''); const br = (s.match(/\[[^\]]+\]/g) || []).filter(a => !/^\[2?H/.test(a)).length; const rest = s.replace(/\[[^\]]+\]/g, '').match(/Cl|Br|[BCNOPSFI]|[bcnops]/g) || []; return br + rest.length; };

export default function BindingInterpretation({ job }) {
  const r = job.result || {};
  const metrics = r.metrics || [];
  const bindingConfidence = pick(metrics, 'binding_metrics.binding_confidence', 'binding_confidence');
  const optimization = pick(metrics, 'binding_metrics.optimization_score', 'optimization_score');
  const pBinder = pick(metrics, 'affinity_score.probability_binary', 'affinity_probability_binary');
  const affinity = pick(metrics, 'affinity_score.pred_value', 'affinity_pred_value');
  const iptm = pick(metrics, 'ligand_iptm', 'iptm');
  const ptm = pick(metrics, 'ptm');
  const plddt = pick(metrics, 'complex_plddt', 'avg_lddt');
  const confidence = pick(metrics, 'confidence_score');
  const seqLen = String(job.inputs?.protein_sequence || '').replace(/\s/g, '').length;
  const atoms = heavyAtoms(job.inputs?.ligand_smiles);

  const warnings = [];
  if (seqLen && seqLen < 20) warnings.push(`The protein is only ${seqLen} residues, too short for a meaningful binding prediction.`);
  if (atoms >= 50) warnings.push(`The ligand has about ${atoms} heavy atoms. Boltz-2 is less reliable for ligands of 50 or more atoms.`);
  if (iptm != null && iptm < 0.5) warnings.push(`Interface confidence (ipTM ${f(iptm)}) is low, so the predicted pose, and any affinity read from it, is uncertain.`);
  if (affinity != null && pBinder != null && pBinder < 0.5) warnings.push('The affinity value is only meaningful for compounds that bind. With a low binder probability, do not read it as a potency.');

  let headline = null;
  if (bindingConfidence != null) {
    headline = bindingConfidence >= 0.7
      ? <Verdict tone="good" title={`Likely binder · binding confidence ${f(bindingConfidence)}`}>In the high-confidence range (0.7 and above, per the Boltz API documentation). Confirm experimentally before relying on it.</Verdict>
      : bindingConfidence >= 0.4
        ? <Verdict tone="neutral" title={`Uncertain · binding confidence ${f(bindingConfidence)}`}>Below the 0.7 high-confidence range. Treat this compound as unconfirmed and compare it with known binders or decoys run the same way.</Verdict>
        : <Verdict tone="bad" title={`Not predicted to bind · binding confidence ${f(bindingConfidence)}`}>Well below the 0.7 high-confidence range. The model does not support this ligand binding this protein.</Verdict>;
  } else if (pBinder != null) {
    headline = pBinder >= 0.5
      ? <Verdict tone="good" title={`Predicted binder · probability ${f(pBinder)}`}>Boltz-2 rates this ligand more likely a binder than a decoy. Rowan's Boltz-2 FAQ reports a substantial false-positive rate for predicted hits, so confirm experimentally.</Verdict>
      : <Verdict tone="bad" title={`Predicted non-binder · probability ${f(pBinder)}`}>Boltz-2 rates this ligand more likely a decoy than a binder.</Verdict>;
  }

  return (
    <div className="space-y-4">
      {headline}

      {warnings.length > 0 && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3"><p className="mb-1 flex items-center gap-2 text-sm font-medium text-amber-900"><AlertTriangle className="h-4 w-4" />Read with caution</p><ul className="list-disc space-y-1 pl-5 text-xs text-amber-900">{warnings.map(w => <li key={w}>{w}</li>)}</ul></div>}

      {(affinity != null || optimization != null) && (
        <section><p className="research-label mb-1">{affinity != null ? 'Affinity' : 'Ranking'}</p>
          {affinity != null && <>
            <Row label="Predicted IC50" value={`≈ ${conc(Math.pow(10, affinity))}`} help={`From log10(IC50/µM) = ${f(affinity, 3)}. Lower IC50 = stronger.`} />
            <Row label="Predicted pIC50" value={f(6 - affinity)} help="Higher = stronger. Model estimate, not a measurement." />
            {6 - affinity > 0 && <Row label="Approx. binding free energy" value={`≈ −${f((6 - affinity) * 1.364, 1)} kcal/mol`} help="Conversion given by the Boltz-2 authors: (6 − value) × 1.364." />}
          </>}
          {optimization != null && <Row label="Optimization score" value={f(optimization)} help="Ranks candidates against each other within the same run. A single compound's score has no absolute meaning." />}
          {affinity != null && <p className="mt-2 text-xs text-research-muted">The Boltz-2 authors say to use affinity values to compare active compounds within one series (hit-to-lead, lead optimization), not to judge arbitrary molecules.</p>}
        </section>
      )}

      {(iptm != null || plddt != null || ptm != null) && (
        <section><p className="research-label mb-1">Structure confidence</p>
          {iptm != null && <Row label="Interface confidence (ipTM)" value={f(iptm)} help="How confident the model is in where the ligand sits. 0–1, higher is better." />}
          {plddt != null && <Row label="Local accuracy (pLDDT)" value={f(plddt)} help="Average per-residue confidence of the complex. 0–1, higher is better." />}
          {ptm != null && <Row label="Overall fold (pTM)" value={f(ptm)} help="Confidence in the overall structure. 0–1." />}
          {confidence != null && <Row label="Ranking score" value={f(confidence)} help="0.8 × pLDDT + 0.2 × ipTM, used to pick the best sample." />}
          <p className="mt-2 flex items-start gap-1.5 text-xs text-research-muted"><Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />High structure confidence means the predicted pose is well defined. It does not mean the ligand binds strongly.</p>
        </section>
      )}
    </div>
  );
}

// Plain-text version of the same reading, for downloads and reports.
export function bindingSummary(job) {
  const r = job.result || {};
  const metrics = r.metrics || [];
  const bc = pick(metrics, 'binding_metrics.binding_confidence', 'binding_confidence');
  const opt = pick(metrics, 'binding_metrics.optimization_score', 'optimization_score');
  const pb = pick(metrics, 'affinity_score.probability_binary', 'affinity_probability_binary');
  const aff = pick(metrics, 'affinity_score.pred_value', 'affinity_pred_value');
  const iptm = pick(metrics, 'ligand_iptm', 'iptm');
  const ptm = pick(metrics, 'ptm');
  const plddt = pick(metrics, 'complex_plddt', 'avg_lddt');
  const conf = pick(metrics, 'confidence_score');
  const seqLen = String(job.inputs?.protein_sequence || '').replace(/\s/g, '').length;
  const atoms = heavyAtoms(job.inputs?.ligand_smiles);
  let verdict = 'No binding verdict reported by the engine.';
  if (bc != null) verdict = bc >= 0.7 ? `Likely binder (binding confidence ${f(bc)}; 0.7+ is the documented high-confidence range).` : bc >= 0.4 ? `Uncertain (binding confidence ${f(bc)}; below the 0.7 high-confidence range).` : `Not predicted to bind (binding confidence ${f(bc)}; well below the 0.7 high-confidence range).`;
  else if (pb != null) verdict = pb >= 0.5 ? `Predicted binder (binder probability ${f(pb)}).` : `Predicted non-binder (binder probability ${f(pb)}).`;
  const warnings = [];
  if (seqLen && seqLen < 20) warnings.push(`Protein is only ${seqLen} residues: too short for a meaningful prediction.`);
  if (atoms >= 50) warnings.push(`Ligand has about ${atoms} heavy atoms; Boltz-2 is less reliable at 50+.`);
  if (iptm != null && iptm < 0.5) warnings.push(`Low interface confidence (ipTM ${f(iptm)}): the pose and any affinity are uncertain.`);
  if (aff != null && pb != null && pb < 0.5) warnings.push('Affinity values are only meaningful for binders; do not read this one as a potency.');
  const affinityRows = [];
  if (aff != null) {
    affinityRows.push(['Predicted IC50', `~${conc(Math.pow(10, aff))}`], ['log10(IC50 / µM) (raw)', f(aff, 3)], ['Predicted pIC50', f(6 - aff)]);
    if (6 - aff > 0) affinityRows.push(['Approx. binding free energy', `~-${f((6 - aff) * 1.364, 1)} kcal/mol`]);
  }
  if (pb != null) affinityRows.push(['Binder probability', f(pb)]);
  if (bc != null) affinityRows.push(['Binding confidence', f(bc)]);
  if (opt != null) affinityRows.push(['Optimization score (rank within a run)', f(opt)]);
  const structureRows = [['Interface confidence (ipTM)', f(iptm)], ['Local accuracy (pLDDT)', f(plddt)], ['Overall fold (pTM)', f(ptm)], ...(conf != null ? [['Ranking score', f(conf)]] : [])].filter(([, v]) => v !== '—');
  return { verdict, warnings, affinityRows, structureRows };
}
