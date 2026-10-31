import React, { useState } from 'react';
import { Download, FileText, Table2, Braces, Loader2 } from 'lucide-react';
import { bindingSummary } from '@/components/binding/BindingInterpretation';
import { downloadText, toCsv, fetchStoredRaw, pdfReport, fileName } from '@/components/research/researchDownloads';

const when = d => (d ? new Date(/Z|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`).toLocaleString() : '—');

export default function HostedDownloads({ job }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  if (!job || job.status !== 'completed') return null;
  const r = job.result || {};
  const task = r.task || job.sim_type;
  const title = job.job_name || (task === 'adme' ? 'ADME prediction' : 'Protein–ligand binding');
  const citations = (r.citations || []).map(c => c.text || c.title).filter(Boolean);
  const meta = [['Engine', `${job.engine}${r.model ? ` · ${r.model}` : ''}`], ['Engine version', r.provider_version || 'Not reported'], ['Engine job ID', job.provider_job_id], ['Suttain job ID', job.id], ['Run', when(job.created_date)]];

  const run = async (kind, fn) => { setBusy(kind); setMsg(''); try { await fn(); } catch (e) { setMsg(e.message || 'Download failed.'); } finally { setBusy(''); } };

  const csv = () => {
    let text;
    if (task === 'adme') {
      const keys = [...new Set((r.adme || []).flatMap(row => Object.keys(row.properties || {})))];
      text = toCsv(['smiles', 'status', 'error', ...keys], (r.adme || []).map(row => [row.smiles, row.status, row.error || '', ...keys.map(k => row.properties?.[k] ?? '')]));
    } else {
      const s = bindingSummary(job);
      text = toCsv(['section', 'field', 'value'], [
        ...meta.map(([k, v]) => ['run', k, v]),
        ['input', 'protein_sequence', job.inputs?.protein_sequence], ['input', 'ligand_smiles', job.inputs?.ligand_smiles],
        ['interpretation', 'verdict', s.verdict], ...s.warnings.map(w => ['interpretation', 'warning', w]),
        ...s.affinityRows.map(([k, v]) => ['interpreted', k, v]), ...s.structureRows.map(([k, v]) => ['interpreted', k, v]),
        ...(r.metrics || []).map(m => ['raw_engine_value', m.key, m.value]),
      ]);
    }
    downloadText(fileName(title, job.id, 'csv'), `${text}\n`, 'text/csv');
  };

  const json = async () => {
    const raw = await fetchStoredRaw(r.results_file_uri).catch(() => null);
    const payload = { suttain_job_id: job.id, engine: job.engine, model: r.model, engine_version: r.provider_version, engine_job_id: job.provider_job_id, created: job.created_date, inputs: job.inputs, metrics: r.metrics, adme: r.adme, citations: r.citations, limitations: r.limitations, raw_engine_response: raw?.raw ?? raw ?? 'Not available' };
    downloadText(fileName(title, job.id, 'json'), JSON.stringify(payload, null, 2), 'application/json');
  };

  const pdf = () => {
    let sections;
    if (task === 'adme') {
      sections = (r.adme || []).map((row, i) => ({ heading: `Molecule ${i + 1}`, text: row.smiles, rows: [['Status', row.status], ...Object.entries(row.properties || {}).map(([k, v]) => [k.replace(/_/g, ' '), typeof v === 'number' ? Number(v.toPrecision(4)) : v])], note: row.error || undefined }));
    } else {
      const s = bindingSummary(job);
      const seq = String(job.inputs?.protein_sequence || '');
      sections = [
        { heading: 'Result', text: s.verdict, note: s.warnings.length ? `Caution: ${s.warnings.join(' ')}` : undefined },
        { heading: 'Inputs', rows: [['Protein length', `${seq.replace(/\s/g, '').length} residues`], ['Ligand SMILES', job.inputs?.ligand_smiles]], note: `Sequence: ${seq.slice(0, 600)}${seq.length > 600 ? '…' : ''}` },
        ...(s.affinityRows.length ? [{ heading: 'Binding and affinity', rows: s.affinityRows, note: 'Boltz-2 affinity is log10(IC50 in µM); use it to compare active compounds within one series. Binding confidence of 0.7+ is the documented high-confidence range.' }] : []),
        ...(s.structureRows.length ? [{ heading: 'Structure confidence', rows: s.structureRows, note: 'Scores from 0 to 1; higher is more confident. They describe the predicted pose, not binding strength.' }] : []),
        { heading: 'All values reported by the engine', rows: (r.metrics || []).map(m => [m.key, typeof m.value === 'number' ? Number(m.value.toPrecision(4)) : m.value]) },
      ];
    }
    if (r.limitations) sections.push({ heading: 'Limitations', text: r.limitations });
    pdfReport({ title, subtitle: `${job.engine}${r.model ? ` · ${r.model}` : ''}`, meta, sections, citations }).save(fileName(title, job.id, 'pdf'));
  };

  const Btn = ({ kind, icon: Icon, label, onClick }) => <button type="button" disabled={!!busy} onClick={() => run(kind, onClick)} className="research-secondary !min-h-10 !px-3 !py-2 text-sm disabled:opacity-50">{busy === kind ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{label}</button>;

  return (
    <div className="border-t border-research-border pt-4">
      <p className="research-label mb-3 flex items-center gap-2"><Download className="h-3.5 w-3.5" />Download results</p>
      <div className="flex flex-wrap gap-2">
        <Btn kind="pdf" icon={FileText} label="Report (PDF)" onClick={pdf} />
        <Btn kind="csv" icon={Table2} label="Data (CSV)" onClick={csv} />
        <Btn kind="json" icon={Braces} label="Full engine output (JSON)" onClick={json} />
      </div>
      <p className="mt-2 text-xs text-research-muted">The PDF is a shareable summary. The CSV opens in Excel. The JSON is the complete response from {job.engine}, with inputs and job IDs, for your records or reanalysis.</p>
      {msg && <p role="alert" className="mt-2 text-xs text-destructive">{msg}</p>}
    </div>
  );
}
