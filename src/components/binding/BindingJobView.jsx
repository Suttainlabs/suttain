import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { CheckCircle2, Copy, Check, Info, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const StructureViewer3D = lazy(() => import('@/components/binding/StructureViewer3D'));

// Display names and plain-language meaning for engine metrics (Boltz-2 / Boltz-2.1 definitions).
const METRICS = {
  structure_confidence: ['Structure Confidence', 'Overall confidence in the predicted complex, 0–1 (Boltz: 0.8 × pLDDT + 0.2 × ipTM). Higher is better.'],
  confidence_score: ['Structure Confidence', 'Overall confidence in the predicted complex, 0–1. Higher is better.'],
  ptm: ['PTM', 'Predicted TM-score of the whole complex, 0–1. Above about 0.5 suggests the overall fold is right.'],
  iptm: ['IPTM', 'Interface pTM: confidence in how the chains are placed relative to each other, 0–1.'],
  ligand_iptm: ['Ligand IPTM', 'Interface confidence for the protein–ligand contact, 0–1.'],
  protein_iptm: ['Protein IPTM', 'Interface confidence between protein chains, 0–1. Zero when there is only one protein chain.'],
  complex_plddt: ['Complex pLDDT', 'Average per-atom local confidence, 0–1. Above 0.9 is very high.'],
  complex_iplddt: ['Complex ipLDDT', 'Average local confidence at the interface, 0–1.'],
  complex_pde: ['Complex PDE', 'Predicted distance error across the complex, in Å. Lower is better.'],
  complex_ipde: ['Complex iPDE', 'Predicted distance error at the interface, in Å. Lower is better.'],
  binding_confidence: ['Binding Confidence', 'Boltz-2.1 binder-vs-decoy score, 0–1. 0.7 and above is the documented high-confidence range.'],
  optimization_score: ['Optimization Score', 'Ranks analogs within one run for lead optimization. Not comparable across runs.'],
  affinity_pred_value: ['Affinity (log10 IC50, µM)', 'Predicted log10(IC50 in µM). Lower means stronger binding. pIC50 = 6 − value.'],
  affinity_probability_binary: ['Binder probability', 'Predicted probability that the ligand is a binder, 0–1.'],
};
const ORDER = Object.keys(METRICS);
const pretty = k => k.replace(/[_.]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : Number(v.toFixed(3)).toString()) : String(v ?? '—'));
const dur = (a, b) => {
  const ms = Date.parse(b) - Date.parse(a);
  if (!Number.isFinite(ms) || ms < 0) return null;
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
};
const utc = d => (d && !/Z|[+-]\d\d:?\d\d$/.test(d) ? `${d}Z` : d);

function collectMetrics(job, structure) {
  const out = {};
  for (const m of job.result?.metrics || []) {
    const leaf = String(m.key).split('.').pop();
    if (typeof m.value === 'number') out[leaf] = m.value;
  }
  Object.entries(structure?.metrics || {}).forEach(([k, v]) => { if (typeof v === 'number') out[k] = v; });
  if (out.confidence_score != null && out.structure_confidence != null) delete out.confidence_score;
  return Object.entries(out).sort(([a], [b]) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b));
}

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return <button type="button" onClick={() => navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-research-text hover:bg-research-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-research-accent">
    {done ? <Check className="h-4 w-4 text-research-accent" /> : <Copy className="h-4 w-4" />}{done ? 'Copied' : 'Copy'}
  </button>;
}

function SequencePanel({ sequence, chain = 'A', selected, onSelect }) {
  const groups = useMemo(() => {
    const g = [];
    for (let i = 0; i < sequence.length; i += 10) g.push({ start: i, residues: sequence.slice(i, i + 10) });
    return g;
  }, [sequence]);
  return <div>
    <div className="mb-2 flex items-center justify-between"><p className="text-sm font-medium text-research-text">Protein <span className="ml-1 rounded-md bg-research-soft px-1.5 py-0.5 font-mono text-xs">{chain}</span></p><span className="text-xs text-research-muted">{sequence.length} residues</span></div>
    <div className="max-h-72 overflow-y-auto rounded-lg border border-research-border p-3 font-mono text-[13px] leading-none text-research-text">
      <div className="flex flex-wrap gap-x-3 gap-y-3">{groups.map(g => <div key={g.start} className="relative pt-4">
        <span className="absolute right-0 top-0 text-[11px] text-research-muted">{Math.min(g.start + 10, sequence.length)}</span>
        {[...g.residues].map((aa, i) => {
          const resi = g.start + i + 1;
          const on = selected?.chain === chain && Number(selected?.resi) === resi;
          return <button key={resi} type="button" onClick={() => onSelect(on ? null : { chain, resi })} aria-pressed={on} aria-label={`Residue ${aa}${resi}`} className={`inline-block w-[1.1ch] rounded-sm text-center hover:bg-research-soft ${on ? 'bg-[#E64980] text-white hover:bg-[#E64980]' : ''}`}>{aa}</button>;
        })}
      </div>)}</div>
    </div>
    <p className="mt-1.5 text-xs text-research-muted">Click a residue to find it in the 3D structure.</p>
  </div>;
}

export default function BindingJobView({ job }) {
  const [info, setInfo] = useState(null);
  const [text, setText] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const inputs = job.inputs || job.result?.inputs_normalized || {};

  useEffect(() => {
    let dead = false;
    setInfo(null); setText(null); setError(null); setSelected(null);
    base44.functions.invoke('getHostedStructure', { job_id: job.id }).then(async ({ data }) => {
      if (dead) return;
      if (data?.error) throw new Error(data.error);
      setInfo(data);
      if (data?.available && data.cif_url) {
        const res = await fetch(data.cif_url);
        if (!res.ok) throw new Error('The structure file could not be downloaded.');
        const t = await res.text();
        if (!dead) setText(t);
      }
    }).catch(e => !dead && setError(e?.response?.data?.error || e.message || 'Could not load the structure.'));
    return () => { dead = true; };
  }, [job.id]);

  const fileUrl = useMemo(() => (text ? URL.createObjectURL(new Blob([text], { type: 'chemical/x-mmcif' })) : null), [text]);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const metrics = collectMetrics(job, info);
  const t = info?.timings || {};
  const created = t.created_at || utc(job.created_date);
  const queued = t.started_at ? dur(t.created_at, t.started_at) : null;
  const duration = t.completed_at ? dur(t.started_at || t.created_at, t.completed_at) : null;
  const id = info?.prediction_id || job.provider_job_id || job.id;
  const ext = info?.format === 'pdb' ? 'pdb' : 'cif';
  const meta = [
    ['Model', info?.model ? info.model.replace(/^boltz-/i, 'Boltz-') : job.result?.model],
    ['Version', info?.version || job.result?.provider_version],
    ['Engine', job.engine],
    ['Queued', queued],
    ['Duration', duration],
    ['Created', created ? new Date(created).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null],
  ].filter(([, v]) => v);

  return <section aria-label="Prediction details" className="rounded-2xl border border-research-border bg-research-card p-4 sm:p-6">
    <header className="mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="min-w-0 break-all font-mono !text-xl sm:!text-2xl !font-semibold">{id}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B2F2BB] bg-[#EBFBEE] px-2.5 py-1 text-sm text-[#2B8A3E]"><CheckCircle2 className="h-4 w-4" />Succeeded</span>
      </div>
      <p className="mt-1 text-sm text-research-muted">{job.job_name || 'Protein–ligand binding'} · Suttain job {job.id}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
        {meta.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-xs text-research-muted">{k}</dt><dd className="mt-0.5 truncate text-sm text-research-text">{v}</dd></div>)}
      </dl>
    </header>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="min-w-0 space-y-5 rounded-xl border border-research-border p-4">
        {inputs.protein_sequence && <SequencePanel sequence={String(inputs.protein_sequence)} selected={selected} onSelect={setSelected} />}
        {inputs.ligand_smiles && <div>
          <div className="mb-1.5 flex items-center justify-between"><p className="text-sm font-medium text-research-text">Ligand <span className="ml-1 rounded-md bg-research-soft px-1.5 py-0.5 font-mono text-xs">B</span></p><CopyButton text={inputs.ligand_smiles} /></div>
          <p className="break-all rounded-lg bg-research-soft px-3 py-2 font-mono text-sm text-research-text">{inputs.ligand_smiles}</p>
        </div>}
        <div className="border-t border-research-border pt-4">
          <p className="research-label mb-3">Metrics</p>
          {metrics.length ? <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {metrics.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-3 border-b border-research-border py-2 last:border-0 sm:[&:nth-last-child(2)]:border-0">
              <dt className="flex min-w-0 items-center gap-1 text-sm text-research-muted">{METRICS[k]?.[0] || pretty(k)}{METRICS[k] && <span title={METRICS[k][1]} aria-label={METRICS[k][1]} className="cursor-help"><Info className="h-3.5 w-3.5 opacity-60" /></span>}</dt>
              <dd className="font-mono text-sm tabular-nums text-research-text">{fmt(v)}</dd>
            </div>)}
          </dl> : <p className="text-sm text-research-muted">No metrics were reported.</p>}
          <p className="mt-2 text-xs text-research-muted">Exactly as reported by {job.engine}, rounded to 3 decimals. Hover the info icon for what each value means.</p>
        </div>
      </div>

      <div className="min-w-0">
        {text ? <Suspense fallback={<div className="flex h-[420px] items-center justify-center rounded-xl border border-research-border text-sm text-research-muted"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading viewer…</div>}>
          <StructureViewer3D text={text} format={ext} selected={selected} onPick={setSelected} downloads={[
            { label: `Complex structure (.${ext})`, href: fileUrl, name: `${id}.${ext}` },
            { label: 'Posed ligand (.sdf)', href: info?.sdf_url, name: `${id}-ligand.sdf` },
          ]} />
        </Suspense> : <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-research-border p-6 text-center text-sm text-research-muted">
          {error ? <p role="alert">{error}</p> : info && !info.available ? <p>{info.reason}</p> : <><Loader2 className="h-5 w-5 animate-spin" /><p>Fetching the predicted structure…</p></>}
        </div>}
      </div>
    </div>
  </section>;
}
