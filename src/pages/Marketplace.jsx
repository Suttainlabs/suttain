import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { Search, Star, CheckCircle2, Leaf, ExternalLink, Loader2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const CERTIFICATIONS = ['All', 'COSMOS', 'EcoCert', 'USDA Organic', 'ISO', 'Vegan'];
const CATEGORIES = ['All', 'Surfactants', 'Emollients', 'Preservatives', 'Fragrances', 'Emulsifiers'];

const SAMPLE_INGREDIENTS = [
  { id: 1, name: 'Cocamidopropyl Betaine', supplier: 'GreenChem Solutions', category: 'Surfactants', safety_score: 92, sustainability_score: 88, certifications: ['COSMOS', 'EcoCert'], price_range: '$12–$18/kg', availability: 'in_stock', description: 'A mild amphoteric surfactant derived from coconut oil. Excellent skin compatibility.', verified: true },
  { id: 2, name: 'Sodium Cocoyl Isethionate', supplier: 'EcoBio Ingredients', category: 'Surfactants', safety_score: 95, sustainability_score: 91, certifications: ['COSMOS', 'Vegan'], price_range: '$22–$30/kg', availability: 'in_stock', description: 'Ultra-mild coconut-derived surfactant. Ideal for solid bars and sensitive skin.', verified: true },
  { id: 3, name: 'Glycerin (Vegetable)', supplier: 'PureSource Labs', category: 'Emollients', safety_score: 98, sustainability_score: 85, certifications: ['USDA Organic', 'Vegan'], price_range: '$4–$8/kg', availability: 'in_stock', description: 'Natural humectant from vegetable sources. USDA certified organic.', verified: true },
  { id: 4, name: 'Phenoxyethanol', supplier: 'SafeChem Europe', category: 'Preservatives', safety_score: 78, sustainability_score: 72, certifications: ['ISO'], price_range: '$28–$35/kg', availability: 'on_request', description: 'Broad-spectrum preservative effective at low concentrations. EU-approved.', verified: false },
  { id: 5, name: 'Fractionated Coconut Oil', supplier: 'TropicNat Supplies', category: 'Emollients', safety_score: 97, sustainability_score: 80, certifications: ['COSMOS', 'EcoCert', 'Vegan'], price_range: '$9–$14/kg', availability: 'in_stock', description: 'Light, non-greasy carrier oil with excellent shelf stability.', verified: true },
  { id: 6, name: 'Xanthan Gum', supplier: 'BioPoly Ingredients', category: 'Emulsifiers', safety_score: 96, sustainability_score: 90, certifications: ['USDA Organic', 'COSMOS'], price_range: '$18–$25/kg', availability: 'in_stock', description: 'Natural thickener and stabiliser derived from fermentation.', verified: true },
];

export default function Marketplace() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [certFilter, setCertFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [ingredients, setIngredients] = useState(SAMPLE_INGREDIENTS);
  const [loading, setLoading] = useState(false);
  const [contactedId, setContactedId] = useState(null);

  const filtered = ingredients.filter(item => {
    const matchQuery = !query || item.name.toLowerCase().includes(query.toLowerCase()) || item.supplier.toLowerCase().includes(query.toLowerCase());
    const matchCert = certFilter === 'All' || item.certifications.includes(certFilter);
    const matchCat = catFilter === 'All' || item.category === catFilter;
    return matchQuery && matchCert && matchCat;
  });

  const handleContact = (id) => {
    setContactedId(id);
    setTimeout(() => setContactedId(null), 2000);
  };

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Marketplace" featureDescription="Sign in to browse verified sustainable ingredient suppliers." />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Sustainable Chemistry Marketplace</h1>
          <p className="text-slate-500 mt-1">Verified sustainable ingredients — filtered, rated, and ready to source.</p>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ingredients or suppliers..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#02988C] outline-none" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1"><Filter className="w-3.5 h-3.5" /> Certification:</div>
            {CERTIFICATIONS.map(c => (
              <button key={c} onClick={() => setCertFilter(c)} className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border transition-all', certFilter === c ? 'bg-[#02988C] text-white border-[#02988C]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#02988C]/40')}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1"><Filter className="w-3.5 h-3.5" /> Category:</div>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border transition-all', catFilter === c ? 'bg-[#9531F5] text-white border-[#9531F5]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#9531F5]/40')}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">{filtered.length} ingredient{filtered.length !== 1 ? 's' : ''} found</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-xs text-slate-400">{item.supplier}</p>
                    {item.verified && <CheckCircle2 className="w-3 h-3 text-[#02988C] flex-shrink-0" />}
                  </div>
                </div>
                <div className={cn('text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0', item.availability === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                  {item.availability === 'in_stock' ? 'In stock' : 'On request'}
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#F0FAF5] rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Safety</p>
                  <p className={cn('text-base font-bold', item.safety_score >= 90 ? 'text-green-600' : item.safety_score >= 75 ? 'text-amber-600' : 'text-red-600')}>{item.safety_score}</p>
                </div>
                <div className="bg-[#F0FAF5] rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Sustainability</p>
                  <p className={cn('text-base font-bold', item.sustainability_score >= 85 ? 'text-emerald-600' : 'text-amber-600')}>{item.sustainability_score}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {item.certifications.map(c => <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{c}</span>)}
                {!item.verified && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Unverified</span>}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">{item.price_range}</span>
                <button
                  onClick={() => handleContact(item.id)}
                  className={cn('text-xs px-3 py-1.5 rounded-lg font-semibold transition-all', contactedId === item.id ? 'bg-green-100 text-green-700' : 'bg-[#02988C] text-white hover:bg-[#027d72]')}
                >
                  {contactedId === item.id ? 'Request sent!' : 'Request Sample'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}