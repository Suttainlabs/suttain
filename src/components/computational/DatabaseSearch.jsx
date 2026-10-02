import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { comprehensiveChemicalSearch } from '@/functions/comprehensiveChemicalSearch';
import DatabaseSearchResult from '@/components/computational/DatabaseSearchResult';
const DATABASES = ['All', 'PubChem', 'ChEMBL', 'ChEBI', 'ChemSpider', 'Suttain DB'];
export default function DatabaseSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [database, setDatabase] = useState('All');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const search = async event => {
    event.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true); setResults(null); setError('');
    try {
      const response = await comprehensiveChemicalSearch({ query: query.trim(), database });
      if (response.data.error) throw new Error(response.data.error);
      setResults(response.data.results || []);
    } catch (err) { setError(err.message || 'Search failed. Please try again.'); }
    finally { setLoading(false); }
  };
  return <section className="mb-8 pb-7 border-b border-research-border">
    <div className="flex items-start gap-3 mb-5"><div className="research-icon bg-research-soft"><Search className="h-5 w-5" /></div>
      <div><h2 className="!text-lg mb-1">Database auto-fill</h2><p className="text-sm text-research-muted">Search by molecule name or CAS number to populate the form.</p></div></div>
    <form onSubmit={search} className="flex flex-col sm:flex-row gap-3">
      <select aria-label="Search database" disabled={loading} value={database} onChange={e => { setDatabase(e.target.value); setResults(null); setError(''); }} className="simulation-control sm:!w-44">{DATABASES.map(db => <option key={db} value={db}>{db === 'All' ? 'All databases' : db}</option>)}</select>
      <input aria-label="Molecule name or CAS number" maxLength={200} value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. caffeine, 58-08-2, aspirin" className="simulation-control flex-1 min-w-0" />
      <button disabled={loading || !query.trim()} className="research-primary disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Search</button>
    </form>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {results?.length === 0 && <p className="mt-3 text-sm text-research-muted">No matches in {database === 'All' ? 'the integrated databases' : database}. Try another name or database.</p>}
    <div className="mt-4 space-y-3">{results?.map((compound, index) => <DatabaseSearchResult key={`${compound.source_db}-${index}`} compound={compound} onSelect={onSelect} />)}</div>
  </section>;
}