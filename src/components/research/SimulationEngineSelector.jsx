import React from 'react';
import { Info, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SimulationEngineSelector({ engines, selected, onSelect, tooltips }) {
  return (
    <section className="border-b border-research-border pb-7 mb-7">
      <p className="research-label mb-2">01 / Compute engine</p>
      <h2 className="!text-lg mb-4">Software / engine</h2>
      <TooltipProvider>
        <div role="group" aria-label="Choose compute engine" className="flex flex-wrap gap-2">
          {engines.map(engine => (
            <Tooltip key={engine}>
              <TooltipTrigger asChild>
                <button type="button" aria-pressed={selected === engine} onClick={() => onSelect(engine)} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm transition-colors ${selected === engine ? 'border-research-accent bg-research-soft text-research-accent' : 'border-research-border bg-research-card text-research-muted hover:border-research-accent'}`}>
                  {selected === engine && <Check className="h-4 w-4" />}{engine}{tooltips[engine] && <Info className="h-3.5 w-3.5 opacity-70" />}
                </button>
              </TooltipTrigger>
              {tooltips[engine] && <TooltipContent side="bottom" className="max-w-xs bg-research-text text-research-card text-xs">{tooltips[engine]}</TooltipContent>}
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </section>
  );
}