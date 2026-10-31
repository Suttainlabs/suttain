import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Table2, Braces, Loader2, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HostedDownloads from '@/components/binding/HostedDownloads';
import { rowanCsv, rowanPdf } from '@/components/simulation/RowanExports';
import { downloadText, fetchStoredRaw, fileName } from '@/components/research/researchDownloads';

const when = d => (d ? new Date(/Z|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function ComputeDownloads({ job }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const r = { ...(job.result || {}), simType: { label: job.sim_type_label || job.job_name } };
  const title = job.job_name || job.sim_type_label || 'calculation';
  const run = async (kind, fn) => { setBusy(kind); setMsg(''); try { await fn(); } catch (e) { setMsg(e.message || 'Download failed.'); } finally { setBusy(''); } };
  const dataset = async () => (r.results_file_uri ? fetchStoredRaw(r.results_file_uri).catch(() => null) : null);
  const isRowan = r.execution_mode === 'real' && /rowan|peregrine/i.test(`${job.engine} ${r.engine}`) && (r.energy != null || r.results_file_uri);
  const Btn = ({ kind, icon: Icon, label, onClick }) => <button type="button" disabled={!!busy} onClick={() => run(kind, onClick)} className="research-secondary !min-h-10 !px-3 !py-2 text-sm disabled:opacity-50">{busy === kind ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{label}</button>;
  return (
    <div className="border-t border-research-border pt-4">
      <p className="research-label mb-3 flex items-center gap-2"><Download className="h-3.5 w-3.5" />Download results</p>
      <div className="flex flex-wrap gap-2">
        {isRowan && <Btn kind="pdf" icon={FileText} label="Report (PDF)" onClick={async () => rowanPdf(await dataset(), r).save(fileName(title, job.id, 'pdf'))} />}
        {isRowan && <Btn kind="csv" icon={Table2} label="Data (CSV)" onClick={async () => downloadText(fileName(title, job.id, 'csv'), `${rowanCsv(await dataset(), r)}\n`, 'text/csv')} />}
        <Btn kind="json" icon={Braces} label="Full output (JSON)" onClick={async () => downloadText(fileName(title, job.id, 'json'), JSON.stringify({ suttain_job_id: job.id, engine: job.engine, created: job.created_date, inputs: job.inputs, environmental_params: job.environmental_params, result: job.result, stored_engine_response: (await dataset()) ?? 'Not available' }, null, 2), 'application/json')} />
      </div>
      {msg && <p role="alert" className="mt-2 text-xs text-destructive">{msg}</p>}
    </div>
  );
}

// Every completed research calculation, newest first, with its downloads.
export default function ResearchResultsLibrary({ user }) {
  const [open, setOpen] = useState(null);
  const q = useQuery({
    queryKey: ['research-results-library', user?.id],
    enabled: !!user?.id,
    queryFn: () => base44.entities.SimulationJob.filter({ created_by_id: user.id, status: 'completed', execution_mode: 'real' }, '-created_date', 30),
  });
  const jobs = q.data || [];
  return (
    <section className="rounded-xl border border-research-border bg-research-card p-5 sm:p-6 mt-5" aria-labelledby="results-library-title">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5"><div><p className="research-label mb-2">Your results</p><h2 id="results-library-title" className="!text-lg">Completed calculations</h2></div><span className="research-label">Latest 30 · download any of them</span></div>
      {q.isLoading ? <p role="status" className="flex items-center gap-2 text-sm text-research-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading your results…</p>
        : q.error ? <p role="alert" className="text-sm text-destructive">Your results could not be loaded. <button className="underline" onClick={() => q.refetch()}>Try again</button></p>
        : !jobs.length ? <p className="text-sm text-research-muted">No completed calculations yet. Results from Binding &amp; ADME and Atomistic Simulation will appear here.</p>
        : <ul className="divide-y divide-research-border">{jobs.map(job => {
            const hosted = ['binding', 'adme'].includes(job.sim_type);
            const isOpen = open === job.id;
            return <li key={job.id} className="py-3">
              <button type="button" onClick={() => setOpen(isOpen ? null : job.id)} aria-expanded={isOpen} className="flex w-full items-start justify-between gap-3 text-left">
                <span className="min-w-0"><span className="block text-sm font-medium break-words">{job.job_name || job.sim_type_label || job.sim_type}</span><span className="block text-xs text-research-muted">{job.engine} · {when(job.created_date)}{hosted && job.inputs?.ligand_smiles ? ` · ${job.inputs.ligand_smiles}` : ''}</span></span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-research-accent">Downloads<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></span>
              </button>
              {isOpen && <div className="mt-3">{hosted ? <HostedDownloads job={job} /> : <ComputeDownloads job={job} />}</div>}
            </li>;
          })}</ul>}
    </section>
  );
}
