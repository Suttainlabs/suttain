import React from 'react';
import {Button} from '@/components/ui/button';
import {Download,FileCode2} from 'lucide-react';
import ScriptCodePanel from '@/components/computational/ScriptCodePanel';
import {downloadScriptBundle} from '@/components/computational/scriptFiles';
export default function SimulationInputFiles({result,simTypeLabel,linkedJobId}) {
  if(!result?.files?.length)return null;
  return <section className="space-y-4 text-research-text">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-medium"><FileCode2 className="w-5 h-5 text-research-accent"/>Simulation input files</h2><Button size="sm" variant="outline" onClick={() => downloadScriptBundle(result)}><Download className="w-4 h-4 mr-2"/>Download all</Button></div>
    <p className="text-sm text-research-muted">{result.summary}</p>
    {result.files.map((file,index) => <ScriptCodePanel key={`${result.engine}-${file.filename}-${index}-${file.content}`} file={file} engine={result.engine} simType={result.sim_type} simTypeLabel={simTypeLabel} linkedJobId={linkedJobId} canSave/>)}
    <p className="text-xs text-research-muted">{result.method_note}. Review geometry, paths, methods, and engine compatibility before execution; generating input files does not run the selected engine.</p>
  </section>;
}