import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Search, Plus, FlaskConical, Leaf, DollarSign, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_ITEMS = 4;

// Property groups to compare for chemicals
const CHEM_GROUPS = [
  {
    label: 'Identity',
    icon: FlaskConical,
    fields: [
      { key: 'molecular_formula', label: 'Molecular Formula' },
      { key: 'molecular_weight', label: 'Molecular Weight (g/mol)' },
      { key: 'cas_number', label: 'CAS Number' },
      { key: 'chemical_type', label: 'Type' },
      { key: 'category', label: 'Category' },
    ],
  },
  {
    label: 'Safety',
    icon: AlertTriangle,
    fields: [
      { key: 'safety_level', label: 'Safety Level' },
      { key: 'toxicity_data.signal_word', label: 'Signal Word' },
      { key: 'toxicity_data.ld50_oral', label: 'LD50 Oral' },
      { key: 'toxicity_data.carcinogenicity', label: 'Carcinogenicity' },
    ],
  },
  {
    label: 'Environment',
    icon: Leaf,
    fields: [
      { key: 'environmental_data.biodegradability', label: 'Biodegradability' },
      { key: 'environmental_data.aquatic_toxicity', label: 'Aquatic Toxicity' },
      { key: 'environmental_data.global_warming_potential', label: 'GWP' },
      { key: 'environmental_data.persistence', label: 'Persistence' },
    ],
  },
  {
    label: 'Physical',
    icon: Zap,
    fields: [
      { key: 'physical_properties.melting_point', label: 'Melting Point (°C)' },
      { key: 'physical_properties.boiling_point', label: 'Boiling Point (°C)' },
      { key: 'physical_properties.density', label: 'Density (g/cm³)' },
      { key: 'physical_properties.solubility_water', label: 'Water Solubility' },
      { key: 'physical_properties.log_p', label: 'LogP' },
    ],
  },
];

// Property groups for formulas
const FORMULA_GROUPS = [
  {
    label: 'Overview',
    icon: FlaskConical,
    fields: [
      { key: 'product_type', label: 'Product Type' },
      { key: 'difficulty_level', label: 'Difficulty' },
      { key: 'ph_level', label: 'pH Level' },
      { key: 'shelf_life', label: 'Shelf Life' },
      { key: 'status', label: 'Status' },
    ],
  },
  {
    label: 'Ingredients',
    icon: Leaf,
    fields: [
      { key: '_ingredient_count', label: 'Ingredient Count', transform: (f) => f.ingredients?.length ?? '—' },
      { key: '_ingredient_names', label: 'Ingredients', transform: (f) => f.ingredients?.map(i => i.chemical_name).join(', ') || '—' },
    ],
  },
  {
    label: 'Safety / Cost',
    icon: DollarSign,
    fields: [
      { key: 'full_recipe_data.safety_score', label: 'Safety Score' },
      { key: 'full_recipe_data.sustainability_score', label: 'Sustainability Score' },
      { key: 'full_recipe_data.estimated_cost', label: 'Est. Cost' },
    ],
  },
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

function renderValue(val) {
  if (val == null || val === '' || val === undefined) return <span className="text-slate-300">—</span>;
  if (typeof val === 'boolean') return val ? '✓' : '✗';
  return String(val);
}

const SAFETY_COLORS = {
  safe: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  hazardous: 'bg-orange-100 text-orange-700',
  highly_hazardous: 'bg-red-100 text-red-700',
  unknown: 'bg-slate-100 text-slate-500',
};

function ItemCard({ item, onRemove, type }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex-1 min-w-0 relative">
      <button onClick={onRemove} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {type === 'chemical' ? 'Ingredient' : 'Formula'}
        </span>
      </div>
      <h3 className="font-bold text-slate-900 text-sm leading-tight truncate pr-4">{item.name}</h3>
      {type === 'chemical' && item.safety_level && (
        <span className={`mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${SAFETY_COLORS[item.safety_level] || SAFETY_COLORS.unknown}`}>
          {item.safety_level.replace('_', ' ')}
        </span>
      )}
      {type === 'formula' && item.product_type && (
        <span className="mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
          {item.product_type.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  );
}

function CompareTable({ items, groups, type }) {
  return (
    <div className="overflow-x-auto">
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <group.icon className="w-4 h-4 text-violet-500" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">{group.label}</h4>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-2 px-4 font-semibold text-slate-500 text-xs w-36">Property</th>
                  {items.map((item) => (
                    <th key={item.id} className="text-left py-2 px-4 font-semibold text-slate-800 text-xs">{item.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.fields.map((field, i) => {
                  const values = items.map((item) =>
                    field.transform ? field.transform(item) : getNestedValue(item, field.key)
                  );
                  const unique = new Set(values.map(String)).size > 1;
                  return (
                    <tr key={field.key} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">{field.label}</td>
                      {values.map((val, idx) => (
                        <td key={idx} className={`py-2 px-4 text-xs font-medium ${unique ? 'text-violet-700' : 'text-slate-700'}`}>
                          {renderValue(val)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchPanel({ type, selected, onAdd, allItems, isLoading, search, setSearch }) {
  const filtered = allItems.filter(
    (item) =>
      !selected.find((s) => s.id === item.id) &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={`Search ${type === 'chemical' ? 'ingredients' : 'formulas'}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>
      <div className="max-h-52 overflow-y-auto space-y-1">
        {isLoading ? (
          <div className="text-xs text-slate-400 text-center py-4">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-4">No results</div>
        ) : (
          filtered.slice(0, 20).map((item) => (
            <button
              key={item.id}
              onClick={() => onAdd(item)}
              disabled={selected.length >= MAX_ITEMS}
              className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-colors disabled:opacity-40"
            >
              <span className="font-medium text-slate-800 truncate">{item.name}</span>
              <Plus className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 ml-2" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function CompareIngredients() {
  const [type, setType] = useState('chemical');
  const [selected, setSelected] = useState([]);
  const [chemSearch, setChemSearch] = useState('');
  const [formulaSearch, setFormulaSearch] = useState('');

  const { data: chemicals = [], isLoading: loadingChem } = useQuery({
    queryKey: ['chemicals-compare'],
    queryFn: () => base44.entities.Chemical.list('name', 200),
  });

  const { data: formulas = [], isLoading: loadingFormula } = useQuery({
    queryKey: ['formulas-compare'],
    queryFn: () => base44.entities.Formula.list('name', 100),
  });

  const handleTypeChange = (val) => {
    setType(val);
    setSelected([]);
  };

  const addItem = (item) => {
    if (selected.length < MAX_ITEMS) setSelected((prev) => [...prev, item]);
  };

  const removeItem = (id) => setSelected((prev) => prev.filter((s) => s.id !== id));

  const groups = type === 'chemical' ? CHEM_GROUPS : FORMULA_GROUPS;
  const allItems = type === 'chemical' ? chemicals : formulas;
  const isLoading = type === 'chemical' ? loadingChem : loadingFormula;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Side-by-Side Comparison</h1>
          <p className="text-slate-500 text-sm">Select up to {MAX_ITEMS} ingredients or formulas to compare their properties.</p>
        </div>

        {/* Type Tabs */}
        <Tabs value={type} onValueChange={handleTypeChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="chemical">Ingredients</TabsTrigger>
            <TabsTrigger value="formula">Formulas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-24">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add to Compare
                <span className="ml-auto text-xs text-slate-400">{selected.length}/{MAX_ITEMS}</span>
              </h3>
              <SearchPanel
                type={type}
                selected={selected}
                onAdd={addItem}
                allItems={allItems}
                isLoading={isLoading}
                search={type === 'chemical' ? chemSearch : formulaSearch}
                setSearch={type === 'chemical' ? setChemSearch : setFormulaSearch}
              />
            </div>
          </div>

          {/* Comparison Area */}
          <div className="lg:col-span-3">
            {selected.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-xl text-center">
                <FlaskConical className="w-10 h-10 text-slate-200 mb-3" />
                <h3 className="text-base font-semibold text-slate-400 mb-1">Nothing to compare yet</h3>
                <p className="text-sm text-slate-400">Search and add {type === 'chemical' ? 'ingredients' : 'formulas'} from the panel on the left.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Item header cards */}
                <div className="flex gap-3 flex-wrap">
                  <AnimatePresence>
                    {selected.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex-1 min-w-[140px]"
                      >
                        <ItemCard item={item} type={type} onRemove={() => removeItem(item.id)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Comparison table */}
                {selected.length >= 2 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <CompareTable items={selected} groups={groups} type={type} />
                  </div>
                )}
                {selected.length === 1 && (
                  <div className="text-center text-sm text-slate-400 py-8 bg-white border border-dashed border-slate-300 rounded-xl">
                    Add at least one more item to see the comparison.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}