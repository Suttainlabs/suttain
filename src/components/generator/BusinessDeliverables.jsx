import React, { useState } from "react";
import { Download } from "lucide-react";
import { REGION_CHECKLIST, QC_CHECKS } from "./pathProfile";

const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

export default function BusinessDeliverables({ recipe, profile }) {
  const ingredients = recipe?.ingredients || [];
  const [costs, setCosts] = useState({}); // USD per kg, entered by the user
  const [qc, setQc] = useState({});
  const batchKg = profile.batch_kg || 0;
  const units = profile.units_per_batch || 1;
  const rows = ingredients.map(i => {
    const kg = (batchKg * (Number(i.percentage) || 0)) / 100;
    const perKg = Number(costs[i.chemical_name]) || 0;
    return { ...i, kg, perKg, cost: kg * perKg };
  });
  const materials = rows.reduce((s, r) => s + r.cost, 0);
  const unitCost = materials / units + (profile.packaging_cost || 0);
  const margin = profile.retail_price ? ((profile.retail_price - unitCost) / profile.retail_price) * 100 : 0;
  const priced = rows.every(r => r.perKg > 0);

  const exportCsv = () => {
    const lines = [['Section', 'Item', 'Value', 'Detail']];
    rows.forEach(r => lines.push(['Batch', r.chemical_name, `${r.kg.toFixed(3)} kg`, `${r.percentage}% · ${money(r.perKg)}/kg · ${money(r.cost)}`]));
    lines.push(['Cost', 'Materials per batch', money(materials), 'User-entered prices'], ['Cost', 'Cost per unit', money(unitCost), 'Includes packaging'], ['Cost', 'Gross margin', `${margin.toFixed(1)}%`, `At ${money(profile.retail_price)} retail`]);
    QC_CHECKS.forEach(c => lines.push(['QC record', c, qc[c] ? 'Checked' : 'Open', '']));
    REGION_CHECKLIST[profile.region].forEach(c => lines.push([`Checklist ${profile.region}`, c, 'To verify', '']));
    const blob = new Blob([lines.map(l => l.map(csvCell).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${(recipe.name || 'formula').replace(/\W+/g, '_')}_production.csv`; a.click();
  };

  return (
    <section className="mt-6 rounded-xl border border-research-border bg-research-card p-5" aria-label="Production package">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div><p className="research-label mb-1">Business formulation</p><h3>Production package · {batchKg} kg, {units} units, {profile.region}</h3></div>
        <button type="button" onClick={exportCsv} className="research-secondary"><Download className="h-4 w-4" />Export production file</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm keep-table">
          <thead><tr className="text-left text-research-muted border-b border-research-border"><th className="py-2 pr-3 font-normal">Ingredient (INCI)</th><th className="pr-3 font-normal">%</th><th className="pr-3 font-normal">Batch kg</th><th className="pr-3 font-normal">USD per kg</th><th className="font-normal">Batch cost</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.chemical_name} className="border-b border-research-border">
              <td className="py-2 pr-3">{r.chemical_name}</td><td className="pr-3">{r.percentage}</td><td className="pr-3">{r.kg.toFixed(3)}</td>
              <td className="pr-3"><input type="number" min="0" step="0.01" aria-label={`Price per kg for ${r.chemical_name}`} className="simulation-control w-28" value={costs[r.chemical_name] ?? ''} onChange={e => setCosts({ ...costs, [r.chemical_name]: e.target.value })} /></td>
              <td>{money(r.cost)}</td>
            </tr>))}</tbody>
        </table>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        {[['Materials per batch', money(materials)], ['Cost per unit', money(unitCost)], ['Gross margin', `${margin.toFixed(1)}%`]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-research-soft p-3"><p className="text-xs text-research-muted">{k}</p><p className="text-lg font-medium">{v}</p></div>))}
      </div>
      <p className="text-xs text-research-muted mt-2">{priced ? 'Estimate from your supplier prices.' : 'Enter supplier prices per kg; unpriced ingredients count as zero. Use the sourcing tab above for supplier quotes.'}</p>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className="mb-2">Batch quality-control record</h4>
          {QC_CHECKS.map(c => (
            <label key={c} className="flex items-center gap-2 text-sm py-1"><input type="checkbox" checked={!!qc[c]} onChange={e => setQc({ ...qc, [c]: e.target.checked })} />{c}</label>))}
        </div>
        <div>
          <h4 className="mb-2">{profile.region} market checklist</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">{REGION_CHECKLIST[profile.region].map(c => <li key={c}>{c}</li>)}</ul>
          <p className="text-xs text-research-muted mt-2">General obligations to verify, not a compliance determination. Confirm with a qualified safety assessor.</p>
        </div>
      </div>
    </section>
  );
}