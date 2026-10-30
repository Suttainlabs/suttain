import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileCode2, Terminal, PackageCheck, Play } from 'lucide-react';
import ScriptCodePanel from '@/components/computational/ScriptCodePanel';
import { downloadScriptBundle } from '@/components/computational/scriptFiles';

const kb = s => `${Math.max(1, Math.round((s || '').length / 1024))} KB`;

// Prepared input package: how to run it, then one file at a time instead of every file printed in full.
export default function SimulationInputFiles({ result, simTypeLabel, linkedJobId }) {
  const files = result?.files || [];
  const [active, setActive] = useState(0);
  if (!files.length) return null;
  const runner = files.find(f => /^run\.sh$/i.test(f.filename));
  const command = result.command || (runner ? 'bash run.sh' : null);
  const file = files[Math.min(active, files.length - 1)];

  return (
    <section className="space-y-4 text-research-text">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-medium"><FileCode2 className="w-5 h-5 text-research-accent" />Input package · {files.length} files</h2>
        <Button size="sm" onClick={() => downloadScriptBundle(result)} className="research-primary"><Download className="w-4 h-4 mr-2" />Download all</Button>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3">
        {[[Download, 'Download', 'Save all files into one folder.'], [PackageCheck, 'Install', `Install ${result.engine || 'the engine'} on your computer or cluster.`], [Play, 'Run', command ? <>In that folder run <code className="rounded bg-research-soft px-1.5 py-0.5 font-mono text-xs">{command}</code></> : 'Follow README.md in the package.']]
          .map(([Icon, title, text], i) => (
            <li key={title} className="rounded-lg border border-research-border bg-research-card p-3">
              <p className="flex items-center gap-2 text-sm font-medium"><span className="font-mono text-xs text-research-accent">{String(i + 1).padStart(2, '0')}</span><Icon className="h-4 w-4 text-research-accent" />{title}</p>
              <p className="mt-1 text-xs text-research-muted">{text}</p>
            </li>
          ))}
      </ol>

      <div className="rounded-xl border border-research-border bg-research-card">
        <div role="tablist" aria-label="Files in this package" className="flex gap-1 overflow-x-auto no-scrollbar border-b border-research-border px-2 pt-2">
          {files.map((f, i) => (
            <button key={`${f.filename}-${i}`} role="tab" type="button" aria-selected={i === active} onClick={() => setActive(i)}
              className={`shrink-0 rounded-t-md border-b-2 px-3 py-2 text-left ${i === active ? 'border-research-accent bg-research-soft' : 'border-transparent hover:bg-research-soft/60'}`}>
              <span className={`block font-mono text-xs ${i === active ? 'text-research-accent font-medium' : 'text-research-text'}`}>{f.filename}</span>
              <span className="block text-[11px] text-research-muted">{kb(f.content)}</span>
            </button>
          ))}
        </div>
        <div className="p-3 sm:p-4">
          {file.description && <p className="mb-3 flex items-start gap-2 text-xs text-research-muted"><Terminal className="h-3.5 w-3.5 shrink-0 mt-0.5" />{file.description}</p>}
          <ScriptCodePanel key={`${result.engine}-${file.filename}-${active}`} file={file} engine={result.engine} simType={result.sim_type} simTypeLabel={simTypeLabel} linkedJobId={linkedJobId} canSave />
        </div>
      </div>

      <p className="text-xs text-research-muted">{result.method_note ? `${result.method_note}. ` : ''}Review geometry, paths, methods and engine compatibility before running. Preparing files does not run the engine.</p>
    </section>
  );
}
