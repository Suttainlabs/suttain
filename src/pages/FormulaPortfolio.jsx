import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { FlaskConical, Plus, Search, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormulaPortfolio() {
  const { user } = useContext(AuthContext);
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) return;
    base44.entities.Formula.list('-updated_date', 50).then(res => {
      setFormulas(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Formula Portfolio" featureDescription="Sign in to manage your formula portfolio." />
    </div>
  );

  const filtered = formulas.filter(f => !query || (f.name || '').toLowerCase().includes(query.toLowerCase()));

  const handleDelete = async (id) => {
    setDeleting(id);
    await base44.entities.Formula.delete(id);
    setFormulas(prev => prev.filter(f => f.id !== id));
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Formula Portfolio</h1>
            <p className="text-slate-500 mt-1">{formulas.length} formula{formulas.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Link to="/FormulaBuilder" className="flex items-center gap-2 px-4 py-2.5 bg-[#02988C] text-white rounded-xl text-sm font-semibold hover:bg-[#027d72] transition-colors">
            <Plus className="w-4 h-4" /> New Formula
          </Link>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search formulas..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#02988C] outline-none" />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FlaskConical className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{query ? 'No formulas match your search.' : 'No formulas yet. Build your first formula.'}</p>
            {!query && <Link to="/FormulaBuilder" className="mt-4 inline-block px-5 py-2.5 bg-[#02988C] text-white text-sm font-semibold rounded-xl hover:bg-[#027d72] transition-colors">Start Building</Link>}
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-xl border border-slate-200 p-4 mb-3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0FAF5] flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-5 h-5 text-[#02988C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{f.name || 'Untitled Formula'}</p>
                  <p className="text-xs text-slate-400">{f.ingredients?.length || 0} ingredients · {f.updated_date ? new Date(f.updated_date).toLocaleDateString() : 'No date'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {f.safety_score !== undefined && f.safety_score !== null && (
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white', f.safety_score >= 75 ? 'bg-green-500' : f.safety_score >= 50 ? 'bg-amber-500' : 'bg-red-500')}>
                      {f.safety_score}
                    </div>
                  )}
                  <Link to={`/FormulaResults?id=${f.id}`} className="p-2 hover:bg-[#F0FAF5] rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <button onClick={() => handleDelete(f.id)} disabled={deleting === f.id} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-300 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}