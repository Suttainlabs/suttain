import React from 'react';
import { Pill, FlaskConical, Atom, CheckCircle2 } from 'lucide-react';
import { SIMULATION_TEMPLATES } from '@/components/computational/simulationTemplates';

export default function SimulationPresets({ onSelectPreset, selectedId }) {
  const icons = { drug_discovery: Pill, molecular_dynamics: FlaskConical, dft: Atom };
  return (
    <section className="mb-8" aria-label="Simulation templates">
      <h2 className="font-heading font-medium text-foreground mb-1">Simulation templates</h2>
      <p className="text-sm text-muted-foreground mb-4">Choose a professional workflow to open its dedicated form with a starting configuration.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SIMULATION_TEMPLATES.map(preset => {
          const Icon = icons[preset.simType];
          const selected = selectedId === preset.id;
          return (
            <button key={preset.id} onClick={() => onSelectPreset(preset)} aria-pressed={selected}
              className={`text-left p-5 rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-primary bg-secondary' : 'border-border bg-card hover:border-primary'}`}>
              <div className="flex items-center justify-between mb-4"><Icon className="w-5 h-5 text-primary" />{selected && <CheckCircle2 className="w-4 h-4 text-primary" />}</div>
              <p className="text-sm text-muted-foreground mb-1">{preset.industry}</p>
              <h3 className="text-base font-medium text-foreground mb-2">{preset.label}</h3>
              <p className="text-sm text-muted-foreground">{preset.description}</p>
              <p className="text-xs text-primary mt-4">{selected ? 'Applied to form' : preset.engine}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}