import React, { useState } from "react";
import { Search, Loader2, CheckCircle2, X } from "lucide-react";

export default function PubChemSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      // Search by name first
      const nameUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query.trim())}/JSON`;
      const resp = await fetch(nameUrl);
      if (!resp.ok) throw new Error("Compound not found in PubChem. Try a different name or CAS number.");
      const data = await resp.json();
      const compound = data?.PC_Compounds?.[0];
      if (!compound) throw new Error("No compound data returned.");

      const cid = compound.id?.id?.cid;
      // Extract SMILES from props
      const props = compound.props || [];
      const smilesProp = props.find(p => p.urn?.label === "SMILES" && p.urn?.name === "Canonical");
      const formulaProp = props.find(p => p.urn?.label === "Molecular Formula");
      const mwProp = props.find(p => p.urn?.label === "Molecular Weight");
      const iupacProp = props.find(p => p.urn?.label === "IUPAC Name" && p.urn?.name === "Preferred");

      setResults({
        cid,
        name: query.trim(),
        smiles: smilesProp?.value?.sval || "",
        formula: formulaProp?.value?.sval || "",
        molecular_weight: mwProp?.value?.fval || mwProp?.value?.sval || "",
        iupac_name: iupacProp?.value?.sval || "",
      });
    } catch (err) {
      setError(err.message || "PubChem search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") search();
  };

  return (
    <section className="mb-8 pb-7 border-b border-research-border">
      <div className="flex items-start gap-3 mb-5">
        <div className="research-icon bg-research-soft"><Search className="h-5 w-5" strokeWidth={1.5} /></div>
        <div><h2 className="!text-lg mb-1">PubChem auto-fill</h2><p className="text-sm text-research-muted">Search by molecule name or CAS number to auto-populate the form.</p></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-research-muted" />
          <input aria-label="Molecule name or CAS number" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. caffeine, 58-08-2, aspirin..." className="simulation-control !pl-10" />
        </div>
        <button type="button" onClick={search} disabled={loading || !query.trim()} className="research-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Search
        </button>
      </div>
      {error && <div role="alert" className="mt-3 flex items-center gap-2 text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm"><X className="h-4 w-4 shrink-0" />{error}</div>}
      {results && (
        <div className="mt-4 bg-research-soft border border-research-border rounded-lg p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0"><p className="font-medium text-research-text">{results.name}</p>
              {results.iupac_name && <p className="text-sm text-research-muted break-words">{results.iupac_name}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {results.formula && <span className="research-label border border-research-border bg-research-card px-2 py-1 rounded">{results.formula}</span>}
                {results.molecular_weight && <span className="research-label border border-research-border bg-research-card px-2 py-1 rounded">MW: {results.molecular_weight}</span>}
                {results.cid && <span className="research-label border border-research-border bg-research-card px-2 py-1 rounded">CID: {results.cid}</span>}
              </div>
              {results.smiles && <p className="research-label mt-3 break-all">SMILES: {results.smiles.slice(0, 60)}{results.smiles.length > 60 ? '...' : ''}</p>}
            </div>
            <button type="button" onClick={() => onSelect(results)} className="research-secondary"><CheckCircle2 className="h-4 w-4" />Use this molecule</button>
          </div>
        </div>
      )}
    </section>
  );
}