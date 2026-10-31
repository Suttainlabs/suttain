import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { Copy, Check, Info, Loader2, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { analyseStructure, CLASS_STYLE } from '@/components/binding/structureAnalysis';
import { PLDDT_BANDS, LIGAND } from '@/components/binding/StructureViewer3D';

const StructureViewer3D = lazy(() => import('@/components/binding/StructureViewer3D'));
const bandColor = p => (PLDDT_BANDS.find(b => p > b.min) || PLDDT_BANDS[3]).color;

// Engine metric names and meanings (Boltz-2 / Boltz-2.1 documentation).
const METRICS = {
  binding_confidence: ['Binding confidence', 'Boltz-2.1 binder-vs-decoy score, 0–1. 0.7 and above is the documented high-confidence range.'],
  affinity_probability_binary: ['Binder probability', 'Predicted probability that the ligand is a binder, 0–1.'],
  affinity_pred_value: ['Affinity, log10 IC50 (µM)', 'Lower means stronger. pIC50 = 6 − value. Compare only within one compound series.'],
  optimization_score: ['Optimization score', 'Ranks analogs within one run. Not comparable across runs.'],
  structure_confidence: ['Structure confidence', '0.8 × pLDDT + 0.2 × ipTM, 0–1.'],
  confidence_score: ['Structure confidence', 'Overall confidence in the predicted complex, 0–1.'],
  ligand_iptm: ['Ligand ipTM', 'Confidence in where the ligand sits relative to the protein, 0–1.'],
  iptm: ['ipTM', 'Confidence in the placement of chains relative to each other, 0–1.'],
  ptm: ['pTM', 'Confidence in the overall fold, 0–1. Above about 0.5 suggests the fold is right.'],
  protein_iptm: ['Protein ipTM', 'Protein–protein interface confidence; 0 with a single protein chain.'],
  complex_plddt: ['Complex pLDDT', 'Average per-atom local confidence, 0–1.'],
  complex_iplddt: ['Interface pLDDT', 'Average local confidence at the interface, 0–1.'],
  complex_pde: ['Complex PDE', 'Predicted distance error across the complex, Å. Lower is better.'],
  complex_ipde: ['Interface PDE', 'Predicted distance error at the interface, Å. Lower is better.'],
};
const ORDER = Object.keys(METRICS);
const pretty = k => k.replace(/[_.]+/g, ' ').replace(/^\w/, c => c.toUpperCase());
const fmt = v => (typeof v === 'number' && Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : Number(v.toFixed(3)).toString()) : '—');
const secs = (a, b) => { const ms = Date.parse(b) - Date.parse(a); return Number.isFinite(ms) && ms >= 0 ? Math.round(ms / 1000) : null; };
const dur = s => (s == null ? '—' : s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const utc = d => (d && !/Z|[+-]\d\d:?\d\d$/.test(d) ? `${d}Z` : d);

function metricMap(job, structure) {
  const out = {};
  for (const m of job.result?.metrics || []) if (typeof m.value === 'number') out[String(m.key).split('.').pop()] = m.value;
  Object.entries(structure?.metrics || {}).forEach(([k, v]) => { if (typeof v === 'number') out[k] = v; });
  if (out.confidence_score != null && out.structure_confidence != null) delete out.confidence_score;
  return out;
}

// x: is the pose reliable? (ligand interface confidence). y: is there a binding signal?
function axes(m) {
  const x = m.ligand_iptm ?? m.iptm ?? null;
  const yKind = m.binding_confidence != null ? 'bc' : m.affinity_probability_binary != null ? 'prob' : null;
  const y = yKind === 'bc' ? m.binding_confidence : yKind === 'prob' ? m.affinity_probability_binary : null;
  return { x, y, yKind, yCut: yKind === 'prob' ? 0.5 : 0.7, xCut: 0.6 };
}

function verdictFor({ x, y, yKind, yCut, xCut }) {
  if (y == null) return { tone: 'neutral', title: 'Structure predicted', text: 'This engine returned a structure but no binding score, so Suttain cannot say whether the ligand binds.' };
  const pose = x == null ? null : x >= 0.8 ? 'high' : x >= xCut ? 'moderate' : 'low';
  const poseText = pose ? ` The predicted pose itself has ${pose} confidence (ligand ipTM ${fmt(x)}).` : '';
  const score = yKind === 'bc' ? `binding confidence ${fmt(y)}` : `binder probability ${fmt(y)}`;
  if (y >= yCut) return { tone: 'good', title: 'Predicted binder', text: `The model separates this ligand from decoys (${score}).${poseText} Confirm experimentally before relying on it.` };
  if (y >= (yKind === 'bc' ? 0.4 : 0.3)) return { tone: 'mid', title: 'Uncertain binder', text: `The binding signal is in the grey zone (${score}).${poseText} Worth testing only alongside stronger candidates.` };
  return { tone: 'low', title: 'Not predicted to bind', text: `The model scores this ligand like a decoy (${score}).${poseText} A confident pose does not mean the ligand binds.` };
}

function CopyText({ text, label = 'Copy', dark }) {
  const [done, setDone] = useState(false);
  return <button type="button" onClick={() => navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs ${dark ? 'text-white/80 hover:bg-white/10' : 'text-research-muted hover:bg-research-soft hover:text-research-text'}`} aria-label={`${label}: ${text}`}>
    {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{done ? 'Copied' : label}
  </button>;
}

function TrustMap({ current, others }) {
  const { x, y, xCut, yCut, yKind } = current;
  const P = v => 8 + v * 84;
  const yLabel = yKind === 'prob' ? 'Binder probability' : 'Binding confidence';
  return <figure className="w-full">
    <svg viewBox="0 0 100 100" className="aspect-square w-full max-w-[280px] overflow-visible" role="img" aria-label={`Trust map. Pose reliability ${fmt(x)}, ${yLabel.toLowerCase()} ${fmt(y)}.`}>
      <rect x="8" y="8" width="84" height="84" rx="3" fill="rgba(255,255,255,0.06)" />
      <rect x={P(xCut)} y="8" width={92 - P(xCut)} height={92 - P(yCut) - 8 + 8 - (92 - P(1 - yCut) - 8) * 0} fill="none" />
      <rect x={P(xCut)} y="8" width={92 - P(xCut)} height={(1 - yCut) * 84} rx="2" fill="rgba(54,226,196,0.22)" />
      <line x1={P(xCut)} y1="8" x2={P(xCut)} y2="92" stroke="rgba(255,255,255,0.25)" strokeDasharray="1.5 1.5" strokeWidth="0.4" />
      <line x1="8" y1={8 + (1 - yCut) * 84} x2="92" y2={8 + (1 - yCut) * 84} stroke="rgba(255,255,255,0.25)" strokeDasharray="1.5 1.5" strokeWidth="0.4" />
      <text x="90" y="13" textAnchor="end" fontSize="3.6" fill="#BFF5EB">Confident binder</text>
      <text x="10" y="13" fontSize="3.6" fill="rgba(255,255,255,0.6)">Signal, shaky pose</text>
      <text x="90" y="89" textAnchor="end" fontSize="3.6" fill="rgba(255,255,255,0.6)">Good pose, no signal</text>
      <text x="10" y="89" fontSize="3.6" fill="rgba(255,255,255,0.6)">Low confidence</text>
      {others.map((o, i) => <circle key={i} cx={P(o.x)} cy={8 + (1 - o.y) * 84} r="1.6" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5"><title>{`${o.ligand}: ${fmt(o.y)} / ${fmt(o.x)}`}</title></circle>)}
      {x != null && y != null && <g>
        <circle cx={P(x)} cy={8 + (1 - y) * 84} r="5" fill={LIGAND} opacity="0.25"><animate attributeName="r" values="3;6;3" dur="2.4s" repeatCount="indefinite" /></circle>
        <circle cx={P(x)} cy={8 + (1 - y) * 84} r="2.4" fill={LIGAND} stroke="#fff" strokeWidth="0.6" />
      </g>}
      <text x="50" y="99" textAnchor="middle" fontSize="3.6" fill="rgba(255,255,255,0.75)">Pose reliability (ligand ipTM) →</text>
      <text x="2" y="50" textAnchor="middle" fontSize="3.6" fill="rgba(255,255,255,0.75)" transform="rotate(-90 2 50)">{yLabel} →</text>
    </svg>
    <figcaption className="mt-1 text-[11px] text-white/60">{others.length ? `Hollow dots: your ${others.length} other run${others.length > 1 ? 's' : ''} on this protein with the same engine.` : 'Run more ligands on this protein to compare them here.'}</figcaption>
  </figure>;
}

function Timeline({ queued, ran }) {
  const total = (queued || 0) + (ran || 0);
  if (!total) return null;
  const qw = Math.max(12, Math.min(88, (queued / total) * 100));
  return <div className="mt-6">
    <div className="flex h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true"><span className="bg-white/35" style={{ width: `${qw}%` }} /><span className="bg-[#36E2C4]" style={{ width: `${100 - qw}%` }} /></div>
    <div className="mt-2 flex justify-between text-xs text-white/75"><span>Waiting for a GPU · <b className="font-medium text-white">{dur(queued)}</b></span><span>Computing · <b className="font-medium text-white">{dur(ran)}</b></span></div>
  </div>;
}

function Barcode({ residues, pocket, selected, onSelect }) {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const pocketSet = useMemo(() => new Set(pocket.map(p => p.resi)), [pocket]);
  if (!residues.length) return null;
  const n = residues.length;
  const at = e => { const r = ref.current.getBoundingClientRect(); return Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n))); };
  const ticks = []; for (let i = 100; i < residues[n - 1].resi; i += n > 600 ? 200 : 100) ticks.push(i);
  return <div>
    <div className="relative">
      <div ref={ref} className="relative h-14 cursor-crosshair select-none" onMouseMove={e => setTip(at(e))} onMouseLeave={() => setTip(null)} onClick={e => { const r = residues[at(e)]; onSelect({ chain: r.chain, resi: r.resi }); }}>
        <svg viewBox={`0 0 ${n} 40`} preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full" aria-hidden="true">
          {residues.map((r, i) => <rect key={i} x={i} y={40 - Math.max(6, (r.plddt / 100) * 40)} width="1.02" height={Math.max(6, (r.plddt / 100) * 40)} fill={bandColor(r.plddt)} />)}
        </svg>
        <svg viewBox={`0 0 ${n} 10`} preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-3 w-full" aria-hidden="true">
          {residues.map((r, i) => pocketSet.has(r.resi) ? <rect key={i} x={i - 0.5} y="0" width={Math.max(2, n / 300)} height="10" fill={LIGAND} /> : null)}
        </svg>
        {selected && (() => { const i = residues.findIndex(r => r.resi === Number(selected.resi)); return i >= 0 ? <span className="pointer-events-none absolute inset-y-0 w-0.5 bg-research-text" style={{ left: `${(i / n) * 100}%` }} /> : null; })()}
        {tip != null && <span className="pointer-events-none absolute -top-7 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-research-text px-2 py-0.5 font-mono text-[11px] text-white" style={{ left: `${(tip / n) * 100}%` }}>{residues[tip].resn} {residues[tip].resi} · pLDDT {residues[tip].plddt.toFixed(0)}{pocketSet.has(residues[tip].resi) ? ' · pocket' : ''}</span>}
      </div>
      <div className="relative mt-1 h-4 text-[11px] text-research-muted">
        <span className="absolute left-0">{residues[0].resi}</span>
        {ticks.map(t => <span key={t} className="absolute -translate-x-1/2" style={{ left: `${((t - residues[0].resi) / n) * 100}%` }}>{t}</span>)}
        <span className="absolute right-0">{residues[n - 1].resi}</span>
      </div>
    </div>
    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-research-muted"><span>Bar height and colour: model confidence (pLDDT) per residue.</span><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: LIGAND }} />touches the ligand</span><span>Click to find a residue in 3D.</span></p>
  </div>;
}

function Pocket({ analysis, selected, onSelect }) {
  const { pocket, ligandPlddt } = analysis;
  const polar = pocket.reduce((s, p) => s + p.polar, 0);
  const mix = Object.entries(pocket.reduce((acc, p) => ({ ...acc, [p.cls]: (acc[p.cls] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  return <div className="flex h-full flex-col">
    <div className="grid grid-cols-3 gap-2">
      {[['Contact residues', pocket.length], ['Polar contacts', polar], ['Ligand pLDDT', ligandPlddt == null ? '—' : ligandPlddt.toFixed(0)]].map(([k, v]) => <div key={k} className="rounded-xl bg-research-soft px-3 py-2.5"><p className="text-xl font-semibold tabular-nums text-research-text">{v}</p><p className="text-[11px] leading-tight text-research-muted">{k}</p></div>)}
    </div>
    {!!mix.length && <div className="mt-3"><div className="flex h-2 overflow-hidden rounded-full">{mix.map(([c, k]) => <span key={c} style={{ width: `${(k / pocket.length) * 100}%`, background: CLASS_STYLE[c].color }} title={`${CLASS_STYLE[c].label}: ${k}`} />)}</div>
      <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-research-muted">{mix.map(([c, k]) => <span key={c} className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: CLASS_STYLE[c].color }} />{CLASS_STYLE[c].label} {k}</span>)}</p></div>}
    {pocket.length ? <ul className="mt-3 max-h-[300px] flex-1 space-y-1 overflow-y-auto pr-1 lg:max-h-none" aria-label="Residues in contact with the ligand">
      {pocket.map(p => { const on = selected?.chain === p.chain && Number(selected?.resi) === p.resi; return <li key={`${p.chain}${p.resi}`}>
        <button type="button" onClick={() => onSelect(on ? null : { chain: p.chain, resi: p.resi })} aria-pressed={on} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${on ? 'bg-research-text text-white' : 'hover:bg-research-soft'}`}>
          <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: CLASS_STYLE[p.cls].color }} />
          <span className="min-w-0 flex-1"><span className="block font-mono text-sm">{p.resn} {p.resi}<span className={`ml-1.5 text-[11px] ${on ? 'text-white/70' : 'text-research-muted'}`}>chain {p.chain}</span></span>
            <span className={`block text-[11px] ${on ? 'text-white/70' : 'text-research-muted'}`}>{CLASS_STYLE[p.cls].label}{p.polar ? ` · ${p.polar} polar contact${p.polar > 1 ? 's' : ''}` : ''}{p.plddt != null ? ` · pLDDT ${p.plddt.toFixed(0)}` : ''}</span></span>
          <span className="font-mono text-sm tabular-nums">{p.dist.toFixed(1)} Å</span>
        </button></li>; })}
    </ul> : <p className="mt-4 text-sm text-research-muted">No protein atoms are within 4.5 Å of the ligand in this pose, so the model did not place it in a pocket.</p>}
    <p className="mt-3 text-[11px] text-research-muted">Measured on the predicted pose: residues with any heavy atom within 4.5 Å of the ligand. Polar contact = N/O pair within 3.5 Å (a possible hydrogen bond; angles not checked).</p>
  </div>;
}

export default function BindingJobView({ job }) {
  const [info, setInfo] = useState(null);
  const [text, setText] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [others, setOthers] = useState([]);
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
    // Other completed runs on the same protein with the same engine (scores are only comparable within one engine).
    base44.entities.SimulationJob.filter({ sim_type: 'binding', status: 'completed' }, '-created_date', 60).then(list => {
      if (dead || !Array.isArray(list)) return;
      setOthers(list.filter(j => j.id !== job.id && j.result?.router_provider === job.result?.router_provider && (j.inputs?.protein_sequence || '') === (inputs.protein_sequence || '')).map(j => {
        const a = axes(metricMap(j, j.result?.structure));
        return a.x != null && a.y != null ? { x: a.x, y: a.y, ligand: j.inputs?.ligand_smiles || 'ligand' } : null;
      }).filter(Boolean).slice(0, 25));
    }).catch(() => {});
    return () => { dead = true; };
  }, [job.id]);

  const ext = info?.format === 'pdb' ? 'pdb' : 'cif';
  const analysis = useMemo(() => (text ? analyseStructure(text, ext) : null), [text, ext]);
  const fileUrl = useMemo(() => (text ? URL.createObjectURL(new Blob([text], { type: 'chemical/x-mmcif' })) : null), [text]);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const m = metricMap(job, info);
  const ax = axes(m);
  const verdict = verdictFor(ax);
  const t = info?.timings || {};
  const queued = secs(t.created_at, t.started_at), ran = secs(t.started_at, t.completed_at);
  const created = t.created_at || utc(job.created_date);
  const providerId = info?.prediction_id || job.provider_job_id;
  const runId = `SR-${String(job.id).slice(-6).toUpperCase()}`;
  const model = info?.model ? info.model.replace(/^boltz-/i, 'Boltz-') : job.result?.model;
  const metricRows = Object.entries(m).sort(([a], [b]) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
  const dot = verdict.tone === 'good' ? '#36E2C4' : verdict.tone === 'mid' ? '#FFD166' : verdict.tone === 'low' ? '#FF7A59' : '#8CC8FF';

  return <section aria-label="Suttain run report" className="overflow-hidden rounded-3xl border border-research-border bg-research-card">
    {/* Verdict + trust map */}
    <div className="relative overflow-hidden px-5 py-6 text-white sm:px-8 sm:py-8" style={{ background: 'linear-gradient(135deg, #0A1F1D 0%, #01544E 58%, #02786F 100%)' }}>
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ background: LIGAND }} aria-hidden="true" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70"><span>Suttain run report</span><span className="rounded-full bg-white/10 px-2 py-0.5 font-mono normal-case tracking-normal text-white">{runId}</span></p>
          <h2 className="mt-4 flex items-center gap-3 !text-3xl !font-semibold !text-white sm:!text-4xl"><span className="h-3 w-3 shrink-0 rounded-full" style={{ background: dot, boxShadow: `0 0 0 6px ${dot}33` }} />{verdict.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">{verdict.text}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {[job.engine, model, info?.version || job.result?.provider_version, created && new Date(created).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })].filter(Boolean).map(c => <span key={c} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/90">{c}</span>)}
          </div>
          {providerId && <p className="mt-3 flex flex-wrap items-center gap-1 text-xs text-white/60">Engine job <span className="font-mono text-white/80">{providerId}</span><CopyText text={providerId} dark /></p>}
          <Timeline queued={queued} ran={ran} />
        </div>
        <TrustMap current={ax} others={others} />
      </div>
    </div>

    {/* Structure + pocket */}
    <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
      <div className="min-w-0">
        {text ? <Suspense fallback={<div className="flex h-[440px] items-center justify-center rounded-2xl bg-[#08201D] text-sm text-white/70"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading viewer…</div>}>
          <StructureViewer3D text={text} format={ext} selected={selected} onPick={setSelected} pocket={analysis?.pocket || []} downloads={[
            { label: `Predicted complex (.${ext})`, href: fileUrl, name: `${runId}-${providerId || 'complex'}.${ext}` },
            { label: 'Posed ligand (.sdf)', href: info?.sdf_url, name: `${runId}-ligand.sdf` },
          ]} />
        </Suspense> : <div className="flex h-[360px] flex-col items-center justify-center gap-2 rounded-2xl bg-[#08201D] p-6 text-center text-sm text-white/75 lg:h-full lg:min-h-[600px]">
          {error ? <p role="alert">{error}</p> : info && !info.available ? <p className="max-w-sm">{info.reason}</p> : <><Loader2 className="h-5 w-5 animate-spin" /><p>Fetching the predicted structure…</p></>}
        </div>}
      </div>
      <div className="min-w-0 rounded-2xl border border-research-border p-4 sm:p-5">
        <h3 className="!text-base !font-semibold">Binding pocket</h3>
        <p className="mb-4 text-xs text-research-muted">Where the model placed the ligand, residue by residue. Click one to fly to it.</p>
        {analysis ? <Pocket analysis={analysis} selected={selected} onSelect={setSelected} /> : <p className="text-sm text-research-muted">{text || !info?.available ? 'Pocket analysis needs the structure file.' : 'Analysing…'}</p>}
      </div>
    </div>

    {/* Confidence along the chain */}
    {analysis?.residues?.length > 0 && <div className="border-t border-research-border px-4 py-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h3 className="!text-base !font-semibold">Confidence along the chain</h3><p className="text-xs text-research-muted">{analysis.residues.length} residues · chain {analysis.residues[0].chain}</p></div></div>
      <Barcode residues={analysis.residues} pocket={analysis.pocket} selected={selected} onSelect={setSelected} />
      {inputs.protein_sequence && <details className="mt-4 rounded-xl border border-research-border">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm">Protein sequence<ChevronDown className="h-4 w-4 text-research-muted" /></summary>
        <div className="border-t border-research-border px-4 py-3"><p className="max-h-48 overflow-y-auto break-all font-mono text-xs leading-6 text-research-text">{inputs.protein_sequence}</p><div className="mt-2"><CopyText text={inputs.protein_sequence} label="Copy sequence" /></div></div>
      </details>}
    </div>}

    {/* Inputs + every engine value */}
    <div className="grid gap-5 border-t border-research-border px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
      <div className="min-w-0">
        <h3 className="!text-base !font-semibold">Ligand</h3>
        {inputs.ligand_smiles ? <><p className="mt-2 break-all rounded-xl bg-research-soft px-3 py-2.5 font-mono text-sm text-research-text">{inputs.ligand_smiles}</p><div className="mt-1"><CopyText text={inputs.ligand_smiles} label="Copy SMILES" /></div></> : <p className="text-sm text-research-muted">Not recorded.</p>}
        {analysis?.ligandAtoms ? <p className="mt-2 text-xs text-research-muted">{analysis.ligandAtoms} heavy atoms placed{analysis.ligandAtoms >= 50 ? ' · large ligands (50+ atoms) are less reliable with this model' : ''}.</p> : null}
      </div>
      <div className="min-w-0">
        <h3 className="!text-base !font-semibold">Every value from the engine</h3>
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {metricRows.map(([k, v]) => <div key={k} className="rounded-xl border border-research-border px-3 py-2.5">
            <dt className="flex items-center gap-1 text-[11px] text-research-muted">{METRICS[k]?.[0] || pretty(k)}{METRICS[k] && <span title={METRICS[k][1]} aria-label={METRICS[k][1]} className="cursor-help"><Info className="h-3 w-3 opacity-60" /></span>}</dt>
            <dd className="mt-0.5 font-mono text-base tabular-nums text-research-text">{fmt(v)}</dd>
          </div>)}
        </dl>
        <p className="mt-2 text-[11px] text-research-muted">As reported by {job.engine}, rounded to 3 decimals. Machine-learning predictions, not lab measurements.</p>
      </div>
    </div>
  </section>;
}
