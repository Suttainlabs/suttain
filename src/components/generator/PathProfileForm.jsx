import React from "react";
import { REGIONS } from "./pathProfile";

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="block text-sm font-medium text-research-text mb-1">{label}</span>
    {children}
    {hint && <span className="block text-xs text-research-muted mt-1">{hint}</span>}
  </label>
);
const cls = "simulation-control";

export default function PathProfileForm({ businessMode, individual, business, onIndividual, onBusiness }) {
  if (businessMode) {
    const set = (k, v) => onBusiness({ ...business, [k]: v });
    const num = (k) => (e) => set(k, Math.max(0, Number(e.target.value) || 0));
    return (
      <section className="rounded-xl border border-research-border bg-research-card p-5 mb-5">
        <h3 className="mb-1">Production context</h3>
        <p className="text-sm text-research-muted mb-4">Used for scale-up, costing, margins and the regional checklist.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Batch size (kg)"><input type="number" min="1" className={cls} value={business.batch_kg} onChange={num('batch_kg')} /></Field>
          <Field label="Units per batch"><input type="number" min="1" className={cls} value={business.units_per_batch} onChange={num('units_per_batch')} /></Field>
          <Field label="Target retail price per unit (USD)"><input type="number" min="0" step="0.01" className={cls} value={business.retail_price} onChange={num('retail_price')} /></Field>
          <Field label="Packaging cost per unit (USD)"><input type="number" min="0" step="0.01" className={cls} value={business.packaging_cost} onChange={num('packaging_cost')} /></Field>
          <Field label="Primary market">
            <select className={cls} value={business.region} onChange={e => set('region', e.target.value)}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select>
          </Field>
          <Field label="Sales channel">
            <select className={cls} value={business.channel} onChange={e => set('channel', e.target.value)}>
              <option value="direct">Direct to consumer</option><option value="wholesale">Wholesale or retail</option><option value="private_label">Private label</option>
            </select>
          </Field>
        </div>
      </section>
    );
  }
  const set = (k, v) => onIndividual({ ...individual, [k]: v });
  return (
    <section className="rounded-xl border border-research-border bg-research-card p-5 mb-5">
      <h3 className="mb-1">Your preferences</h3>
      <p className="text-sm text-research-muted mb-4">Your formula is tailored to these, and checked against them afterwards.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Budget">
          <select className={cls} value={individual.budget} onChange={e => set('budget', e.target.value)}>
            <option value="low">Under $20 to get started</option><option value="medium">$20 to $50</option><option value="high">Flexible</option>
          </select>
        </Field>
        <Field label="Scent">
          <select className={cls} value={individual.scent} onChange={e => set('scent', e.target.value)}>
            <option value="none">Fragrance-free</option><option value="light">Light and natural</option><option value="citrus">Citrus</option><option value="floral">Floral</option><option value="herbal">Herbal</option>
          </select>
        </Field>
        <Field label="Sensitivities or ingredients to avoid" hint="Separate with commas, e.g. coconut, lavender, nuts">
          <input className={cls} value={individual.sensitivities} onChange={e => set('sensitivities', e.target.value)} placeholder="coconut, lavender" />
        </Field>
        <Field label="Ingredients you already have" hint="We prefer these and leave them off your shopping list">
          <input className={cls} value={individual.on_hand} onChange={e => set('on_hand', e.target.value)} placeholder="olive oil, baking soda, vinegar" />
        </Field>
        <Field label="Equipment">
          <select className={cls} value={individual.equipment} onChange={e => set('equipment', e.target.value)}>
            <option value="kitchen">Kitchen tools only</option><option value="basic_lab">Some DIY gear (thermometer, pH strips)</option>
          </select>
        </Field>
      </div>
    </section>
  );
}