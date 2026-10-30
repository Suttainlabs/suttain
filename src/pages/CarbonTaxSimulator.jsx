import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Plus, Trash2, Download, FlaskConical, Package, ChevronDown, ExternalLink, Info, ArrowRight, Atom, Scale, ShieldCheck, Repeat } from 'lucide-react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import ConsumerWorkbench, { WorkbenchGrid, SetupRail, ResultsRail } from '@/components/consumer/ConsumerWorkbench';
import GuidedSteps from '@/components/consumer/GuidedSteps';
import {
  EPA_SOURCE, NAICS, ORIGINS, FUNCTIONS, INGREDIENT_NAMES, PACKAGING, PRICE_PRESETS,
  lookupIngredient, fetchFormula, computeLedger, suggestSwaps, carbonFraction, CO2_PER_C,
} from '@/data/carbonLedger';

let uid = 0;
const makeIngredient = (name = '', pct = '', price = '') => {
  const ref = lookupIngredient(name);
  return { id: ++uid, name, pct, price, fn: ref?.fn || 'Active', naics: ref ? ref.naics : '325998', origin: ref?.origin || 'mixed', indicative: ref?.indicative ?? null, pubchem: ref ? ref.pubchem : name || null, formula: null, cid: null, known: !!ref };
};
const makePack = (type = 'HDPE bottle', grams = 25, cost = '') => ({ id: ++uid, type, grams, cost });

const EXAMPLE = {
  product: { name: 'Gentle body wash', unitGrams: 250, unitsPerYear: 20000, unitPrice: 12, rinseOff: true },
  ingredients: [['water', 68, ''], ['sodium coco sulfate', 10, 6], ['cocamidopropyl betaine', 8, 3.5], ['glycerin', 5, 2.2], ['decyl glucoside', 4, 5], ['sodium chloride', 1.5, 0.4], ['fragrance', 1, 40], ['phenoxyethanol', 0.9, 9], ['citric acid', 0.3, 2], ['xanthan gum', 0.3, 12]],
  packaging: [['HDPE bottle', 22, 0.28], ['PP cap / pump / jar', 6, 0.12], ['Paper label', 2, 0.03]],
};

const STORE_KEY = 'suttain-carbon-ledger-v1';
const g = kg => (kg == null ? '—' : kg * 1000 >= 100 ? `${Math.round(kg * 1000)} g` : `${(kg * 1000).toFixed(1)} g`);
const pct = v => (v == null ? '—' : `${Math.round(v)}%`);
const money = (v, cur = '$') => `${cur}${v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(v < 1 ? 3 : 2)}`;

const METHOD = {
  epa: { label: 'EPA spend-based', cls: 'border-research-accent text-research-accent bg-research-soft' },
  indicative: { label: 'Indicative', cls: 'border-amber-300 text-amber-800 bg-amber-50' },
  zero: { label: 'No emissions counted', cls: 'border-research-border text-research-muted' },
  missing: { label: 'Needs a price', cls: 'border-red-300 text-red-700 bg-red-50' },
};
const Badge = ({ method }) => <span className={`inline-flex whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium ${METHOD[method].cls}`}>{METHOD[method].label}</span>;

function Kpi({ label, value, sub }) {
  return <div className="rounded-xl border border-research-border bg-research-card p-4 min-w-0"><p className="research-label mb-2">{label}</p><p className="text-2xl font-semibold tabular-nums text-research-text leading-none">{value}</p>{sub && <p className="mt-2 text-xs text-research-muted">{sub}</p>}</div>;
}

const inputCls = 'simulation-control !py-2 text-sm';

export default function CarbonTaxSimulator() {
  const { user } = useContext(AuthContext);
  const saved = useMemo(() => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { return null; } }, []);
  const [product, setProduct] = useState(saved?.product || { name: '', unitGrams: 250, unitsPerYear: 10000, unitPrice: '', rinseOff: true });
  const [ingredients, setIngredients] = useState(() => (saved?.ingredients || []).map(i => ({ ...makeIngredient(i.name, i.pct, i.price), ...i, id: ++uid })));
  const [packaging, setPackaging] = useState(() => (saved?.packaging || []).map(p => ({ ...p, id: ++uid })));
  const [step, setStep] = useState('footprint');
  const [open, setOpen] = useState(null);
  const [newName, setNewName] = useState('');
  const [formulas, setFormulas] = useState(null);
  const [price, setPrice] = useState(82);
  const [passThrough, setPassThrough] = useState(100);
  const [rules, setRules] = useState({ euImport: false, euTonnes: '', ukImport: false, ukValue: '', revenueOver1B: false, salesCA: false, bigCombustion: false });

  // Persist the draft in this browser only.
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ product, ingredients: ingredients.map(({ id, formula, cid, ...rest }) => rest), packaging: packaging.map(({ id, ...rest }) => rest) })); } catch { /* storage unavailable */ }
  }, [product, ingredients, packaging]);

  // Molecular formulas from PubChem for single-molecule ingredients.
  useEffect(() => {
    ingredients.filter(i => i.pubchem && i.formula == null && i.origin !== 'none').forEach(i => {
      fetchFormula(i.pubchem).then(res => setIngredients(prev => prev.map(x => (x.id === i.id ? { ...x, formula: res?.formula || '', cid: res?.cid || null } : x))));
    });
  }, [ingredients]);

  const ledger = useMemo(() => computeLedger(product, ingredients, packaging), [product, ingredients, packaging]);
  const hasInput = ingredients.length > 0 && Number(product.unitGrams) > 0;

  if (!user) {
    return <div className="min-h-screen research-surface consumer-theme flex items-center justify-center p-6"><AuthGate featureName="Carbon Ledger" featureDescription="Sign in to build a sourced carbon ledger for your formula and packaging." /></div>;
  }

  const upd = (id, patch) => setIngredients(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));
  const addIngredient = name => {
    const n = String(name || '').trim(); if (!n) return;
    setIngredients(prev => [...prev, makeIngredient(n)]);
    setNewName('');
  };
  const loadExample = () => {
    setProduct(EXAMPLE.product);
    setIngredients(EXAMPLE.ingredients.map(([n, p, pr]) => makeIngredient(n, p, pr)));
    setPackaging(EXAMPLE.packaging.map(([t, gr, c]) => makePack(t, gr, c)));
    setStep('footprint');
  };
  const loadFormulas = async () => {
    try { setFormulas(await base44.entities.Formula.filter({ created_by: user.email }, '-created_date', 20)); } catch { setFormulas([]); }
  };
  const importFormula = f => {
    setProduct(p => ({ ...p, name: f.name || p.name }));
    setIngredients((f.ingredients || []).map(n => makeIngredient(String(n).replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase())));
    setFormulas(null);
  };
  const swap = (row, alt) => upd(row.id, { name: alt.name, fn: alt.fn, naics: alt.naics, origin: alt.origin, indicative: alt.indicative, pubchem: alt.pubchem, formula: null, cid: null, known: true, price: '' });

  const exportCsv = () => {
    const head = ['item', 'kind', 'pct_or_grams', 'price_or_cost', 'method', 'naics', 'kgCO2e_per_unit', 'carbon_fraction', 'fossil_C_g', 'bio_C_g', 'eol_CO2_g'];
    const lines = [
      ...ledger.rows.map(r => [r.name, 'ingredient', r.pct, r.price, r.method, r.naics || '', r.co2.toFixed(5), r.wC?.toFixed(4) ?? '', r.fossilC != null ? (r.fossilC * 1000).toFixed(3) : '', r.bioC != null ? (r.bioC * 1000).toFixed(3) : '', (r.eolCO2 * 1000).toFixed(3)]),
      ...ledger.pack.map(p => [p.type, 'packaging', p.grams, p.cost, p.method, p.naics || '', p.co2.toFixed(5), '', '', '', '']),
      ['TOTAL per unit', '', '', '', '', '', ledger.perUnit.toFixed(5), '', '', '', (ledger.eolCO2 * 1000).toFixed(3)],
    ];
    const csv = [head, ...lines].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
      + `\n\n"Spend-based factors: ${EPA_SOURCE.name}, ${EPA_SOURCE.unit}. ${EPA_SOURCE.url}"\n"Indicative values are unverified reference estimates. Molecular formulas from PubChem."`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${(product.name || 'carbon-ledger').replace(/\W+/g, '-').toLowerCase()}.csv`; a.click();
  };

  const STEPS = [
    { value: 'footprint', label: 'Footprint', intro: 'Cradle-to-gate CO2e of one unit: ingredients and packaging, plus fossil carbon released at end of life for rinse-off products. Each line shows which method produced it.' },
    { value: 'molecular', label: 'Molecular carbon', intro: 'Where the carbon in your formula comes from, worked out from each molecule’s formula and feedstock.' },
    { value: 'cost', label: 'Carbon cost', intro: 'What carbon would add to the cost of each unit at a price you choose. This is a scenario, not a tax bill.' },
    { value: 'rules', label: 'Rules that apply', intro: 'Which carbon rules actually reach a business like yours, based on a few questions.' },
    { value: 'reformulate', label: 'Reformulate', intro: 'Like-for-like swaps for your biggest hotspots, with the effect on your footprint before you commit.' },
  ];

  const hotspots = [...ledger.rows.map(r => ({ name: r.name, co2: r.co2 + r.eolCO2, kind: 'ing' })), ...ledger.pack.map(p => ({ name: p.type, co2: p.co2, kind: 'pack' }))]
    .filter(x => x.co2 > 0).sort((a, b) => b.co2 - a.co2).slice(0, 8).map(x => ({ ...x, grams: +(x.co2 * 1000).toFixed(2) }));

  return (
    <ConsumerWorkbench toolId="carbon" tag={product.name || null}>
      <WorkbenchGrid wide>
        {/* ── Setup ───────────────────────────────────────── */}
        <SetupRail label="Configuration" title="Build your carbon ledger">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadExample} className="research-secondary !min-h-9 !px-3 text-xs">Load example</button>
            <button type="button" onClick={loadFormulas} className="research-secondary !min-h-9 !px-3 text-xs">Import my formula</button>
            {(ingredients.length > 0 || packaging.length > 0) && <button type="button" onClick={() => { setIngredients([]); setPackaging([]); }} className="text-xs text-research-muted underline ml-auto">Clear</button>}
          </div>
          {formulas && <div className="rounded-lg border border-research-border p-2 max-h-48 overflow-y-auto">{formulas.length ? formulas.map(f => <button key={f.id} type="button" onClick={() => importFormula(f)} className="block w-full text-left rounded px-2 py-2 text-sm hover:bg-research-soft"><span className="font-medium">{f.name || 'Untitled formula'}</span><span className="block text-xs text-research-muted">{(f.ingredients || []).length} ingredients · add the percentages after importing</span></button>) : <p className="p-2 text-xs text-research-muted">No saved formulas yet. Build one in the <Link to="/generator" className="underline">Formula Generator</Link>.</p>}</div>}

          <fieldset className="space-y-3">
            <legend className="research-label mb-2">01 · Product</legend>
            <input aria-label="Product name" value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} placeholder="Product name" className={inputCls} />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-research-muted">Unit size (g)<input type="number" min="0" value={product.unitGrams} onChange={e => setProduct({ ...product, unitGrams: e.target.value })} className={`${inputCls} mt-1`} /></label>
              <label className="text-xs text-research-muted">Units per year<input type="number" min="0" value={product.unitsPerYear} onChange={e => setProduct({ ...product, unitsPerYear: e.target.value })} className={`${inputCls} mt-1`} /></label>
              <label className="text-xs text-research-muted">Retail price ($)<input type="number" min="0" step="0.01" value={product.unitPrice} onChange={e => setProduct({ ...product, unitPrice: e.target.value })} placeholder="optional" className={`${inputCls} mt-1`} /></label>
              <label className="text-xs text-research-muted">Use<select value={product.rinseOff ? 'rinse' : 'leave'} onChange={e => setProduct({ ...product, rinseOff: e.target.value === 'rinse' })} className={`${inputCls} mt-1`}><option value="rinse">Rinse-off / washed away</option><option value="leave">Leave-on</option></select></label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="research-label mb-2 flex w-full items-center justify-between"><span>02 · Formula (% w/w)</span><span className={`font-mono normal-case tracking-normal ${Math.abs(ledger.pctPct - 100) > 0.5 && ingredients.length ? 'text-red-700' : 'text-research-muted'}`}>{ledger.pctPct.toFixed(1)}%</span></legend>
            <ul className="space-y-2">
              {ingredients.map(i => (
                <li key={i.id} className="rounded-lg border border-research-border">
                  <div className="flex items-center gap-2 p-2">
                    <button type="button" onClick={() => setOpen(open === i.id ? null : i.id)} aria-expanded={open === i.id} className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-medium capitalize">{i.name}</span>
                      <span className="block truncate text-[11px] text-research-muted">{i.fn} · {ORIGINS[i.origin].label}{!i.known && ' · not in library'}</span>
                    </button>
                    <input aria-label={`${i.name} percent`} type="number" min="0" step="0.1" value={i.pct} onChange={e => upd(i.id, { pct: e.target.value })} placeholder="%" className="simulation-control !w-16 !py-1.5 text-sm text-right" />
                    <button type="button" onClick={() => setOpen(open === i.id ? null : i.id)} aria-label="Details" className="p-1 text-research-muted"><ChevronDown className={`h-4 w-4 transition-transform ${open === i.id ? 'rotate-180' : ''}`} /></button>
                  </div>
                  {open === i.id && (
                    <div className="grid grid-cols-2 gap-2 border-t border-research-border p-2">
                      <label className="text-[11px] text-research-muted">Price ($/kg)<input type="number" min="0" step="0.01" value={i.price} onChange={e => upd(i.id, { price: e.target.value })} placeholder="for EPA method" className={`${inputCls} mt-1`} /></label>
                      <label className="text-[11px] text-research-muted">Carbon origin<select value={i.origin} onChange={e => upd(i.id, { origin: e.target.value })} className={`${inputCls} mt-1`}>{Object.entries(ORIGINS).map(([k, o]) => <option key={k} value={k}>{o.label}</option>)}</select></label>
                      <label className="col-span-2 text-[11px] text-research-muted">EPA commodity<select value={i.naics || ''} onChange={e => upd(i.id, { naics: e.target.value || null })} className={`${inputCls} mt-1`}><option value="">None (no emissions)</option>{Object.entries(NAICS).map(([code, n]) => <option key={code} value={code}>{n.title} · {n.ef} kg/$</option>)}</select></label>
                      <label className="text-[11px] text-research-muted">Function<select value={i.fn} onChange={e => upd(i.id, { fn: e.target.value })} className={`${inputCls} mt-1`}>{FUNCTIONS.map(f => <option key={f}>{f}</option>)}</select></label>
                      <div className="flex items-end justify-end"><button type="button" onClick={() => setIngredients(prev => prev.filter(x => x.id !== i.id))} className="inline-flex items-center gap-1 text-xs text-red-700"><Trash2 className="h-3.5 w-3.5" />Remove</button></div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <input list="carbon-ingredients" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(newName); } }} placeholder="Add ingredient (INCI or common name)" className={inputCls} aria-label="Add ingredient" />
              <datalist id="carbon-ingredients">{INGREDIENT_NAMES.map(n => <option key={n} value={n} />)}</datalist>
              <button type="button" onClick={() => addIngredient(newName)} aria-label="Add ingredient" className="research-primary !min-h-10 !px-3"><Plus className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-[11px] text-research-muted">Add each ingredient’s purchase price to use the EPA method. Without a price, Suttain falls back to an indicative value where it has one.</p>
          </fieldset>

          <fieldset>
            <legend className="research-label mb-2">03 · Packaging per unit</legend>
            <ul className="space-y-2">
              {packaging.map(p => (
                <li key={p.id} className="grid grid-cols-[1fr_4rem_4.5rem_auto] gap-1.5 items-center">
                  <select aria-label="Packaging type" value={p.type} onChange={e => setPackaging(prev => prev.map(x => (x.id === p.id ? { ...x, type: e.target.value } : x)))} className="simulation-control !py-1.5 text-xs">{Object.keys(PACKAGING).map(t => <option key={t}>{t}</option>)}</select>
                  <input aria-label="Grams" type="number" min="0" value={p.grams} onChange={e => setPackaging(prev => prev.map(x => (x.id === p.id ? { ...x, grams: e.target.value } : x)))} placeholder="g" className="simulation-control !py-1.5 text-xs text-right" />
                  <input aria-label="Cost per unit ($)" type="number" min="0" step="0.01" value={p.cost} onChange={e => setPackaging(prev => prev.map(x => (x.id === p.id ? { ...x, cost: e.target.value } : x)))} placeholder="$/unit" className="simulation-control !py-1.5 text-xs text-right" />
                  <button type="button" onClick={() => setPackaging(prev => prev.filter(x => x.id !== p.id))} aria-label="Remove packaging" className="p-1 text-research-muted"><Trash2 className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setPackaging(prev => [...prev, makePack()])} className="mt-2 inline-flex items-center gap-1.5 text-sm text-research-accent"><Package className="h-4 w-4" />Add packaging</button>
          </fieldset>
        </SetupRail>

        {/* ── Results ─────────────────────────────────────── */}
        <ResultsRail hasOutput={hasInput} tag={hasInput ? `${g(ledger.perUnit)} CO2e per unit` : null}
          emptyText="Add your formula and packaging on the left, or load the example. Your ledger builds live as you type."
          emptyExtra={<button type="button" onClick={loadExample} className="research-primary mt-5">Load a body wash example</button>}>
          {hasInput && (
            <div className="rounded-xl border border-research-border bg-research-card p-4 sm:p-6">
              <GuidedSteps steps={STEPS} value={step} onChange={setStep} label="Carbon ledger steps">
                {step === 'footprint' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                      <Kpi label="Per unit" value={g(ledger.perUnit)} sub="kg CO2e shown in grams" />
                      <Kpi label="Per year" value={`${ledger.annualTonnes.toFixed(ledger.annualTonnes < 10 ? 2 : 0)} t`} sub={`${Number(product.unitsPerYear || 0).toLocaleString()} units`} />
                      <Kpi label="Packaging share" value={pct(ledger.perUnit ? (ledger.packCO2 / ledger.perUnit) * 100 : null)} sub={g(ledger.packCO2)} />
                      <Kpi label="EPA-sourced" value={pct(ledger.quality.epa * 100)} sub={ledger.quality.missing ? `${ledger.quality.missing} line(s) need a price` : 'of the footprint'} />
                    </div>
                    <div>
                      <p className="research-label mb-2">Data quality</p>
                      <div className="flex h-2.5 overflow-hidden rounded-full bg-research-soft" aria-label={`EPA ${pct(ledger.quality.epa * 100)}, indicative ${pct(ledger.quality.indicative * 100)}`}>
                        <div className="bg-research-accent" style={{ width: `${ledger.quality.epa * 100}%` }} />
                        <div className="bg-amber-400" style={{ width: `${ledger.quality.indicative * 100}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-research-muted">Green: {EPA_SOURCE.name}. Amber: indicative reference values (unverified). Add purchase prices to move lines to the EPA method.</p>
                    </div>
                    {hotspots.length > 0 && <div>
                      <p className="research-label mb-2">Hotspots (g CO2e per unit)</p>
                      <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={hotspots} layout="vertical" margin={{ left: 8, right: 16 }}><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} /><Tooltip formatter={v => [`${v} g CO2e`, 'Per unit']} /><Bar dataKey="grams" radius={[0, 3, 3, 0]}>{hotspots.map(h => <Cell key={h.name} fill={h.kind === 'pack' ? 'hsl(199 70% 42%)' : 'hsl(175 97% 30%)'} />)}</Bar></BarChart></ResponsiveContainer></div>
                    </div>}
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-research-border text-left text-xs text-research-muted"><th className="py-2 pr-3 font-medium">Line</th><th className="py-2 pr-3 font-medium">Method</th><th className="py-2 pr-3 font-medium text-right">g CO2e</th><th className="py-2 font-medium">Basis</th></tr></thead><tbody>
                      {ledger.rows.map(r => <tr key={r.id} className="border-b border-research-border"><td className="py-2 pr-3 capitalize">{r.name} <span className="text-xs text-research-muted">{r.pct || 0}%</span></td><td className="py-2 pr-3"><Badge method={r.method} /></td><td className="py-2 pr-3 text-right font-mono">{(r.co2 * 1000).toFixed(2)}</td><td className="py-2 text-xs text-research-muted">{r.method === 'epa' ? `${NAICS[r.naics].title} · ${r.ef} kg/$` : r.method === 'indicative' ? `${r.indicative} kg CO2e/kg (reference)` : r.method === 'zero' ? 'Water / no supply-chain factor' : 'Add $/kg'}</td></tr>)}
                      {ledger.pack.map(p => <tr key={p.id} className="border-b border-research-border"><td className="py-2 pr-3">{p.type} <span className="text-xs text-research-muted">{p.grams} g</span></td><td className="py-2 pr-3"><Badge method={p.method} /></td><td className="py-2 pr-3 text-right font-mono">{(p.co2 * 1000).toFixed(2)}</td><td className="py-2 text-xs text-research-muted">{p.method === 'epa' ? `${NAICS[p.naics].title} · ${p.ef} kg/$` : 'Indicative by mass'}</td></tr>)}
                      {ledger.eolCO2 > 0 && <tr className="border-b border-research-border"><td className="py-2 pr-3">End of life (fossil carbon)</td><td className="py-2 pr-3"><span className="text-[11px] text-research-muted">Stoichiometric</span></td><td className="py-2 pr-3 text-right font-mono">{(ledger.eolCO2 * 1000).toFixed(2)}</td><td className="py-2 text-xs text-research-muted">See Molecular carbon</td></tr>}
                    </tbody></table></div>
                    <p className="text-xs text-research-muted">EPA factors are in 2022 US dollars; your prices are used as entered, without adjusting for inflation. Manufacturing energy for your own filling, transport and retail are not included.</p>
                  </div>
                )}

                {step === 'molecular' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                      <Kpi label="Biobased carbon" value={pct(ledger.biobasedCarbonPct)} sub="share of formula carbon from plants or fermentation" />
                      <Kpi label="Fossil CO2 at end of life" value={product.rinseOff ? g(ledger.eolCO2) : 'Not counted'} sub={product.rinseOff ? 'per unit, if fully biodegraded' : 'leave-on product'} />
                      <Kpi label="Coverage" value={pct(ledger.carbonCoverage * 100)} sub="carbon-containing ingredients with a known formula" />
                    </div>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-research-border text-left text-xs text-research-muted"><th className="py-2 pr-3 font-medium">Ingredient</th><th className="py-2 pr-3 font-medium">Formula</th><th className="py-2 pr-3 font-medium text-right">Carbon %</th><th className="py-2 pr-3 font-medium">Origin</th><th className="py-2 pr-3 font-medium text-right">Fossil C</th><th className="py-2 font-medium text-right">Bio C</th></tr></thead><tbody>
                      {ledger.rows.map(r => <tr key={r.id} className="border-b border-research-border">
                        <td className="py-2 pr-3 capitalize">{r.name}</td>
                        <td className="py-2 pr-3 font-mono text-xs">{r.origin === 'none' ? '—' : r.formula === null ? '…' : r.formula ? (r.cid ? <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${r.cid}`} target="_blank" rel="noreferrer" className="underline hover:text-research-accent">{r.formula}</a> : r.formula) : <span className="font-sans text-research-muted">Mixture</span>}</td>
                        <td className="py-2 pr-3 text-right font-mono">{r.wC != null ? (r.wC * 100).toFixed(1) : '—'}</td>
                        <td className="py-2 pr-3 text-xs">{ORIGINS[r.origin].label}</td>
                        <td className="py-2 pr-3 text-right font-mono">{r.fossilC != null ? `${(r.fossilC * 1000).toFixed(2)} g` : '—'}</td>
                        <td className="py-2 text-right font-mono">{r.bioC != null ? `${(r.bioC * 1000).toFixed(2)} g` : '—'}</td>
                      </tr>)}
                    </tbody></table></div>
                    <div className="rounded-lg border border-research-border bg-research-soft p-4 text-sm space-y-2">
                      <p className="font-medium flex items-center gap-2"><Atom className="h-4 w-4 text-research-accent" />How this is calculated</p>
                      <p className="text-research-muted">Carbon mass fraction comes from each molecule’s formula (PubChem). The origin you set splits that carbon into fossil and biogenic. When a rinse-off product biodegrades, its fossil carbon ends up as CO2: grams of fossil carbon × {CO2_PER_C.toFixed(3)} (44.01/12.01). Biogenic carbon is treated as climate-neutral, which is the usual convention, and is reported separately.</p>
                      <p className="text-research-muted">Biobased carbon here is an estimate from feedstock, in the spirit of ISO 16620 and ASTM D6866. Making a biobased claim on a label needs a lab radiocarbon test. Mixtures such as oils, extracts, polymers and fragrance have no single formula and are left out of the carbon totals.</p>
                    </div>
                  </div>
                )}

                {step === 'cost' && (() => {
                  const perUnitCost = ledger.perUnit / 1000 * price * passThrough / 100;
                  const annual = perUnitCost * (Number(product.unitsPerYear) || 0);
                  const unitPrice = Number(product.unitPrice) || 0;
                  const cur = PRICE_PRESETS.find(p => p.value === price)?.currency || '$';
                  return (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">{PRICE_PRESETS.map(p => <button key={p.id} type="button" aria-pressed={price === p.value} onClick={() => setPrice(p.value)} className={`rounded-lg border px-3 py-2 text-left text-sm ${price === p.value ? 'border-research-accent bg-research-soft text-research-accent' : 'border-research-border'}`}><span className="font-medium">{p.label}</span><span className="block text-xs text-research-muted">{p.currency}{p.value}/t</span></button>)}</div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <label className="text-sm">Carbon price: <span className="font-mono">{cur}{price}/t</span><input type="range" min="0" max="250" step="1" value={price} onChange={e => setPrice(Number(e.target.value))} className="mt-2 w-full accent-[hsl(var(--research-accent))]" /></label>
                        <label className="text-sm">Passed on to you: <span className="font-mono">{passThrough}%</span><input type="range" min="0" max="100" step="5" value={passThrough} onChange={e => setPassThrough(Number(e.target.value))} className="mt-2 w-full accent-[hsl(var(--research-accent))]" /></label>
                      </div>
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                        <Kpi label="Added cost per unit" value={money(perUnitCost, cur)} />
                        <Kpi label="Per year" value={money(annual, cur)} sub={`${Number(product.unitsPerYear || 0).toLocaleString()} units`} />
                        <Kpi label="Share of retail price" value={unitPrice ? `${((perUnitCost / unitPrice) * 100).toFixed(2)}%` : '—'} sub={unitPrice ? `of $${unitPrice}` : 'add a retail price'} />
                      </div>
                      <p className="text-xs text-research-muted">{PRICE_PRESETS.find(p => p.value === price)?.note || 'Custom price.'}{PRICE_PRESETS.find(p => p.value === price)?.url && <> <a href={PRICE_PRESETS.find(p => p.value === price).url} target="_blank" rel="noreferrer" className="underline">Source</a>.</>} Carbon prices move daily; check before you rely on a figure.</p>
                      <div className="rounded-lg border border-research-border p-4 text-sm text-research-muted flex gap-2"><Info className="h-4 w-4 shrink-0 mt-0.5 text-research-accent" /><p>A brand is rarely charged a carbon tax on its products directly. Carbon reaches you through supplier prices, when suppliers in priced markets pass their costs on, or through border charges on specific imported goods. “Passed on” sets how much of that you would absorb. At 100% this is a worst-case view of your whole footprint.</p></div>
                    </div>
                  );
                })()}

                {step === 'rules' && (() => {
                  const euT = Number(rules.euTonnes) || 0;
                  const ukV = Number(rules.ukValue) || 0;
                  const verdicts = [
                    { name: 'EU Emissions Trading System', status: rules.bigCombustion ? 'Check' : 'Unlikely', why: rules.bigCombustion ? 'You run large combustion plant. The ETS covers installations (generally above 20 MW total rated thermal input), so confirm with your national authority.' : 'The EU ETS covers power plants and heavy-industry installations, not brands that formulate or fill products. You may feel it through supplier prices.' },
                    { name: 'EU CBAM (border charge)', status: !rules.euImport ? 'No' : euT > 50 ? 'Applies' : 'Below threshold', why: !rules.euImport ? 'You do not import CBAM goods into the EU.' : euT > 50 ? `Above the 50-tonne annual importer threshold. Importers must buy certificates for embedded emissions in 2026 imports; certificate sales start February 2027.` : 'Importers under 50 tonnes a year of CBAM goods are exempt. Exceed it at any point and the whole year’s imports count.' , scope: 'Covers cement, fertilisers, iron and steel, aluminium, electricity and hydrogen. Aluminium tubes or foil and steel cans may fall in scope: check the CN code of each item.' },
                    { name: 'UK CBAM (from 1 Jan 2027)', status: !rules.ukImport ? 'No' : ukV >= 50000 ? 'Will apply' : 'Below threshold', why: !rules.ukImport ? 'You do not import CBAM goods into the UK.' : ukV >= 50000 ? 'At or above the £50,000 registration threshold for CBAM goods over 12 months. The importer is liable.' : 'Below the £50,000 registration threshold for CBAM goods.', scope: 'Aluminium, cement, fertiliser, hydrogen, iron and steel (specific commodity codes).' },
                    { name: 'California SB 253 (emissions disclosure)', status: rules.revenueOver1B && rules.salesCA ? 'Applies' : 'No', why: rules.revenueOver1B && rules.salesCA ? 'US entity over $1bn global revenue doing business in California: Scope 1 and 2 report due 10 Nov 2026; Scope 3 expected from 2027.' : 'Applies only to US-formed entities with more than $1bn annual revenue doing business in California. As a supplier, you may still be asked for data by customers who are covered.' },
                  ];
                  const tone = s => (['Applies', 'Will apply'].includes(s) ? 'border-red-300 bg-red-50 text-red-800' : s === 'Check' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-research-border bg-research-soft text-research-accent');
                  const Q = ({ k, children }) => <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={rules[k]} onChange={e => setRules({ ...rules, [k]: e.target.checked })} className="mt-1" /><span>{children}</span></label>;
                  return (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-3 rounded-lg border border-research-border p-4">
                        <div className="space-y-2"><Q k="euImport">We import aluminium, steel or other CBAM goods (incl. packaging) into the EU</Q>{rules.euImport && <label className="block text-xs text-research-muted pl-6">Tonnes per year<input type="number" min="0" value={rules.euTonnes} onChange={e => setRules({ ...rules, euTonnes: e.target.value })} className={`${inputCls} mt-1`} /></label>}</div>
                        <div className="space-y-2"><Q k="ukImport">We import CBAM goods into the UK</Q>{rules.ukImport && <label className="block text-xs text-research-muted pl-6">Value per year (£)<input type="number" min="0" value={rules.ukValue} onChange={e => setRules({ ...rules, ukValue: e.target.value })} className={`${inputCls} mt-1`} /></label>}</div>
                        <Q k="revenueOver1B">Annual revenue above $1 billion (US entity)</Q>
                        <Q k="salesCA">We sell into California</Q>
                        <Q k="bigCombustion">We operate large boilers or furnaces ourselves</Q>
                      </div>
                      <ul className="space-y-3">{verdicts.map(v => <li key={v.name} className="rounded-lg border border-research-border p-4"><div className="flex flex-wrap items-center justify-between gap-2 mb-1"><p className="font-medium text-sm">{v.name}</p><span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone(v.status)}`}>{v.status}</span></div><p className="text-sm text-research-muted">{v.why}</p>{v.scope && <p className="text-xs text-research-muted mt-1">{v.scope}</p>}</li>)}</ul>
                      <p className="text-xs text-research-muted flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0" />Rules as checked in October 2026. This is a screening aid, not legal advice: confirm with a customs broker or adviser before you act.</p>
                    </div>
                  );
                })()}

                {step === 'reformulate' && (() => {
                  const ranked = [...ledger.rows].filter(r => r.co2 > 0).sort((a, b) => b.co2 - a.co2).slice(0, 4);
                  return (
                    <div className="space-y-4">
                      {ranked.map(r => {
                        const swaps = suggestSwaps(r);
                        return (
                          <div key={r.id} className="rounded-lg border border-research-border p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><p className="font-medium capitalize">{r.name} <span className="text-xs text-research-muted">· {r.fn} · {(r.co2 * 1000).toFixed(2)} g CO2e ({ledger.perUnit ? Math.round((r.co2 / ledger.perUnit) * 100) : 0}% of unit)</span></p></div>
                            {swaps.length ? <ul className="grid sm:grid-cols-3 gap-2">{swaps.map(s => <li key={s.name}><button type="button" onClick={() => swap(r, s)} className="w-full h-full rounded-lg border border-research-border p-3 text-left hover:border-research-accent"><span className="flex items-center gap-1.5 text-sm font-medium capitalize"><Repeat className="h-3.5 w-3.5 text-research-accent" />{s.name}</span><span className="block text-xs text-research-accent mt-1">−{s.reductionPct}% per kg (indicative)</span><span className="block text-[11px] text-research-muted">{ORIGINS[s.origin].label}{s.fossilChange < 0 ? ' · less fossil carbon' : s.fossilChange > 0 ? ' · more fossil carbon' : ''}</span></button></li>)}</ul> : <p className="text-sm text-research-muted">No lower-footprint {r.fn.toLowerCase()} in the reference library. Try reducing its percentage, or ask your supplier for a product carbon footprint.</p>}
                          </div>
                        );
                      })}
                      <div className="rounded-lg border border-research-border bg-research-soft p-4 text-sm"><p className="font-medium mb-1 flex items-center gap-2"><Scale className="h-4 w-4 text-research-accent" />Before you switch</p><p className="text-research-muted">Swaps are ranked by indicative values and keep the same function, not the same performance. Check the new mixture and rebuild the recipe before production.</p><div className="mt-3 flex flex-wrap gap-2"><Link to="/Simulator" className="research-secondary !min-h-9 text-xs inline-flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" />Check safety in Chemical Analysis</Link><Link to="/generator" className="research-secondary !min-h-9 text-xs inline-flex items-center gap-1.5">Rebuild in Formula Generator<ArrowRight className="h-3.5 w-3.5" /></Link></div></div>
                    </div>
                  );
                })()}
              </GuidedSteps>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-research-border pt-4">
                <p className="text-xs text-research-muted">Sources: <a href={EPA_SOURCE.url} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">{EPA_SOURCE.name}<ExternalLink className="h-3 w-3" /></a> · PubChem molecular formulas</p>
                <button type="button" onClick={exportCsv} className="research-secondary !min-h-9 text-xs inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5" />Export ledger (.csv)</button>
              </div>
            </div>
          )}
        </ResultsRail>
      </WorkbenchGrid>
    </ConsumerWorkbench>
  );
}
