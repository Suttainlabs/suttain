import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Database, Globe, FlaskConical, Loader2 } from 'lucide-react';
import ChemicalFormula from '@/components/shared/ChemicalFormula';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function ResultRow({ result, onSelect }) {
  return (
    <button
      onMouseDown={() => onSelect(result)}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
    >
      <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${result.source === 'database' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
        {result.source === 'database'
          ? <Database className="w-3.5 h-3.5 text-emerald-600" />
          : <Globe className="w-3.5 h-3.5 text-blue-500" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{result.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {result.cas_number && (
            <span className="text-[10px] font-mono text-slate-500">CAS {result.cas_number}</span>
          )}
          {result.molecular_formula && (
            <span className="text-[10px] font-mono text-slate-400">
              <ChemicalFormula formula={result.molecular_formula} />
            </span>
          )}
          {result.iupac_name && result.iupac_name !== result.name && (
            <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{result.iupac_name}</span>
          )}
        </div>
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 flex-shrink-0 ${result.source === 'database' ? 'text-emerald-600' : 'text-blue-500'}`}>
        {result.source === 'database' ? 'Local DB' : 'PubChem'}
      </span>
    </button>
  );
}

export default function ChemicalQuickSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const term = q.trim().toLowerCase();

      // 1. Query local Chemical entity — check name, iupac_name, cas_number, scientific_name
      let dbResults = [];
      try {
        const rows = await base44.entities.Chemical.filter({
          $or: [
            { name: { $regex: term, $options: 'i' } },
            { iupac_name: { $regex: term, $options: 'i' } },
            { cas_number: { $regex: term, $options: 'i' } },
            { scientific_name: { $regex: term, $options: 'i' } },
          ]
        }, '-created_date', 8);
        dbResults = (rows || []).map(r => ({
          id: r.id,
          name: r.name,
          iupac_name: r.iupac_name || r.scientific_name,
          cas_number: r.cas_number,
          molecular_formula: r.molecular_formula,
          source: 'database',
          raw: r,
        }));
      } catch (_) {}

      // 2. If fewer than 3 local results, supplement with PubChem autocomplete
      let pubchemResults = [];
      if (dbResults.length < 3) {
        try {
          const res = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(q.trim())}/JSON?limit=5`
          );
          if (res.ok) {
            const json = await res.json();
            const suggestions = json?.dictionary_terms?.compound || [];
            pubchemResults = suggestions
              .filter(s => !dbResults.some(d => d.name.toLowerCase() === s.toLowerCase()))
              .slice(0, 5 - dbResults.length)
              .map(s => ({ name: s, source: 'pubchem' }));
          }
        } catch (_) {}
      }

      setResults([...dbResults, ...pubchemResults]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search(debouncedQuery); }, [debouncedQuery, search]);

  const handleSelect = (result) => {
    setOpen(false);
    setQuery('');
    if (result.source === 'database' && result.id) {
      navigate(`${createPageUrl('IngredientDatabase')}?id=${result.id}`);
    } else {
      navigate(`${createPageUrl('MolecularIntelligence')}?q=${encodeURIComponent(result.name)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false);
      navigate(`${createPageUrl('MolecularIntelligence')}?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className={`flex items-center gap-2 bg-white border-2 rounded-2xl px-4 py-3 transition-all duration-200 shadow-sm ${open ? 'border-[#02988C] shadow-[#02988C]/10 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search by IUPAC name, CAS number, or chemical name..."
          className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none min-w-0"
        />
        {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" />}
        {query && !loading && (
          <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onMouseDown={() => { if (query.trim()) { navigate(`${createPageUrl('MolecularIntelligence')}?q=${encodeURIComponent(query.trim())}`); setQuery(''); setOpen(false); } }}
          className="flex-shrink-0 px-3 py-1 rounded-xl text-xs font-bold text-white transition-colors"
          style={{ background: '#02988C' }}
        >
          Search
        </button>
      </div>

      {/* Dropdown */}
      {open && (results.length > 0 || (query.length >= 2 && !loading)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <>
              {results.some(r => r.source === 'database') && (
                <div className="px-4 py-1.5 bg-emerald-50 border-b border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">From your chemical database</p>
                </div>
              )}
              {results.map((r, i) => (
                <ResultRow key={i} result={r} onSelect={handleSelect} />
              ))}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                <button
                  onMouseDown={() => { navigate(`${createPageUrl('MolecularIntelligence')}?q=${encodeURIComponent(query.trim())}`); setQuery(''); setOpen(false); }}
                  className="text-xs text-[#02988C] font-semibold hover:underline flex items-center gap-1"
                >
                  <FlaskConical className="w-3 h-3" />
                  Full molecular analysis for "{query}"
                </button>
              </div>
            </>
          ) : query.length >= 2 && !loading ? (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-slate-500 mb-2">No matches in local database.</p>
              <button
                onMouseDown={() => { navigate(`${createPageUrl('MolecularIntelligence')}?q=${encodeURIComponent(query.trim())}`); setQuery(''); setOpen(false); }}
                className="text-xs font-semibold text-[#02988C] hover:underline"
              >
                Run full molecular intelligence search
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}