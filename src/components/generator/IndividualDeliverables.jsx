import React from "react";
import { AlertTriangle, Check, ShoppingBasket, Wrench } from "lucide-react";
import { splitList, HOME_EQUIPMENT } from "./pathProfile";

const matches = (name, terms) => terms.find(t => name.toLowerCase().includes(t.toLowerCase()));

export default function IndividualDeliverables({ recipe, profile }) {
  const ingredients = recipe?.ingredients || [];
  const avoid = splitList(profile.sensitivities);
  const onHand = splitList(profile.on_hand);
  const flagged = ingredients.filter(i => matches(i.chemical_name || '', avoid));
  const toBuy = ingredients.filter(i => !matches(i.chemical_name || '', onHand));
  const have = ingredients.filter(i => matches(i.chemical_name || '', onHand));

  return (
    <section className="mt-6 rounded-xl border border-research-border bg-research-card p-5" aria-label="Made for you">
      <p className="research-label mb-1">Individual creator</p>
      <h3 className="mb-4">Made for you</h3>
      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <h4 className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-research-accent" />Sensitivity check</h4>
          {!avoid.length ? <p className="text-sm text-research-muted">No sensitivities entered.</p>
            : flagged.length ? <ul className="text-sm space-y-1">{flagged.map(i => <li key={i.chemical_name} className="text-destructive">{i.chemical_name} matches "{matches(i.chemical_name, avoid)}". Swap or remove it.</li>)}</ul>
            : <p className="text-sm flex gap-2"><Check className="h-4 w-4 text-research-accent mt-1" />No ingredient names match what you avoid. Patch test before first use.</p>}
          <p className="text-xs text-research-muted mt-2">Name matching only; check full labels of what you buy.</p>
        </div>
        <div>
          <h4 className="flex items-center gap-2 mb-2"><ShoppingBasket className="h-4 w-4 text-research-accent" />Shopping list</h4>
          <ul className="text-sm space-y-1">{toBuy.map(i => <li key={i.chemical_name}>{i.chemical_name} <span className="text-research-muted">· {i.percentage}%</span></li>)}</ul>
          {have.length > 0 && <p className="text-xs text-research-muted mt-2">Already have: {have.map(i => i.chemical_name).join(', ')}</p>}
        </div>
        <div>
          <h4 className="flex items-center gap-2 mb-2"><Wrench className="h-4 w-4 text-research-accent" />Equipment</h4>
          <ul className="text-sm space-y-1">{HOME_EQUIPMENT[profile.equipment || 'kitchen'].map(e => <li key={e}>{e}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}