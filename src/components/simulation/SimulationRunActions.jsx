import React from 'react';
import { Cpu, FileCode2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function SimulationRunActions({engine,isLookup,isRunning,generatingInputs,onRun,onGenerate,isMdEngine}) {
  return <div className="sticky bottom-0 z-20 bg-research-card border-t border-research-border pt-4 pb-3 lg:static space-y-3">
    <Button onClick={onRun} disabled={isRunning} className="research-primary h-auto w-full">
      {isRunning?<Loader2 className="h-4 w-4 animate-spin"/>:<Cpu className="h-4 w-4"/>}
      {isRunning?'Working…':engine==='Rowan'?'Run on Rowan':isLookup?'Look up compound':`Prepare ${engine} workflow`}
    </Button>
    {!isLookup && engine==='Rowan' && <Button onClick={onGenerate} disabled={isRunning} variant="outline" className="research-secondary h-auto w-full">{generatingInputs?<Loader2 className="h-4 w-4 animate-spin"/>:<FileCode2 className="h-4 w-4"/>}Generate input files</Button>}
    <p className="text-xs text-research-muted">{isLookup?'Retrieves existing compound data; no calculation runs.':engine==='Rowan'?'Supported quantum calculations · up to 25 Rowan credits per job.':isMdEngine?'Prepares MD files for local execution; no simulation runs here.':'Prepares input files for execution on your own computer or cluster.'}</p>
  </div>;
}