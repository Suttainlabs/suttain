import React, { useRef, useState } from 'react';
import { Search, Loader2, X, CheckCircle2 } from 'lucide-react';
import { comprehensiveChemicalSearch } from '@/functions/comprehensiveChemicalSearch';
import DatabaseSearchResult from '@/components/computational/DatabaseSearchResult';

const DATABASES = ['All', 'PubChem', 'ChEMBL', 'ChEBI', 'ChemSpider', 'Suttain DB'];
const EXAMPLES = ['caffeine', 'aspirin', '50-00-0', 'benzene'];

// Molecule search sized for a narrow setup rail: full-width field, database and button below,
// clear loading and empty states, and a confirmation once a molecule fills the form.
export default function DatabaseSearch({ onSelect, compact = false }) {
  const [query, setQuery] = useState('');
  const [database, setDatabase] = useState('All');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState(null);
  const inputRef = useRef(null);

  const run = async (q = query, db = database) => {
    const term = String(q || '').trim();
    if (!term || loading) return;
    setLoading(true); setResults(null); setError(''); setPicked(null);
    try {
      const response = await comprehensiveChemicalSearch({ query: term, database: db });
      const data = response?.data ?? response;
      if (data?.error) throw new Error(data.error);
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      const status = err?.response?.status;
      setError(status === 401 ? 'Please sign in again to search the databases.' : (err?.response?.data?.error || err.message || 'Search failed. Please try again.'));
    } finally { setLoading(false); }
  };
  const submit = e => { e.preventDefault(); run(); };
  const usable = (results || []).filter(r => r.smiles);
  const noStructure = (results || []).filter(r => !r.smiles);

  return (
    <section className={compact ? 'space-y-3' : 'mb-8 pb-7 border-b border-research-border space-y-3'} aria-label="Find a molecule">
      {!compact && <div className="flex items-start gap-3 mb-2"><div className="research-icon bg-research-soft"><Search className="h-5 w-5" /></div>
        <div><h2 className="!text-lg mb-1">Find a molecule</h2><p className="text-sm text-research-muted">Search by name or CAS number. The structure fills the form for you.</p></div></div>}

      <form onSubmit={submit} className="space-y-2">
        <label htmlFor="molecule-search" className="sr-only">Molecule name or CAS number</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-research-muted" aria-hidden="true" />
          <input id="molecule-search" ref={inputRef} type="search" enterKeyHint="search" autoComplete="off" maxLength={200}
            value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or CAS, e.g. caffeine or 58-08-2"
            className="simulation-control !h-12 !pl-10 !pr-10 w-full text-base" />
          {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setResults(null); setError(''); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-research-muted hover:bg-research-soft"><X className="h-4 w-4" /></button>}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <select aria-label="Database to search" disabled={loading} value={database} onChange={e => { setDatabase(e.target.value); if (results) run(query, e.target.value); }} className="simulation-control !h-11 min-w-0">
            {DATABASES.map(db => <option key={db} value={db}>{db === 'All' ? 'All databases' : db}</option>)}
          </select>
          <button type="submit" disabled={loading || !query.trim()} className="research-primary !h-11 !px-4 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{loading ? 'Searching' : 'Search'}
          </button>
        </div>
        {!results && !loading && !error && !picked && (
          <p className="text-xs text-research-muted">Try: {EXAMPLES.map((ex, i) => <React.Fragment key={ex}>{i > 0 && ', '}<button type="button" onClick={() => { setQuery(ex); run(ex); }} className="underline hover:text-research-accent">{ex}</button></React.Fragment>)}</p>
        )}
      </form>

      {loading && <p role="status" className="flex items-center gap-2 text-sm text-research-muted"><Loader2 className="h-4 w-4 animate-spin text-research-accent" />Searching {database === 'All' ? 'PubChem, ChEMBL, ChEBI and the Suttain library' : database}…</p>}
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {picked && <p role="status" className="flex items-start gap-2 rounded-lg border border-research-accent/40 bg-research-soft p-3 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-research-accent" /><span><span className="font-medium">{picked.name}</span> is filled in below{picked.source_db ? ` (from ${picked.source_db})` : ''}. Check it, then continue.</span></p>}
      {results?.length === 0 && <p className="text-sm text-research-muted">No matches in {database === 'All' ? 'the connected databases' : database}. Check the spelling, try the CAS number, or pick another database.</p>}

      {results?.length > 0 && (
        <div className="space-y-2" aria-live="polite">
          <p className="research-label">{usable.length} match{usable.length === 1 ? '' : 'es'} with a structure</p>
          {usable.map((compound, index) => <DatabaseSearchResult key={`${compound.source_db}-${compound.inchikey || index}`} compound={compound} best={index === 0}
            onSelect={c => { setResults(null); setPicked(c); onSelect(c); }} />)}
          {noStructure.length > 0 && <details className="text-xs text-research-muted"><summary className="cursor-pointer py-1">{noStructure.length} more without a structure (can't be simulated)</summary><ul className="mt-1 space-y-1 pl-3">{noStructure.map((c, i) => <li key={i}>{c.name}{c.source_db ? ` · ${c.source_db}` : ''}</li>)}</ul></details>}
        </div>
      )}
    </section>
  );
}
