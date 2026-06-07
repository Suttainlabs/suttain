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
    <div className="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
      <p className="text-xs font-bold text-indigo-800 mb-2 uppercase tracking-wide">PubChem Auto-fill</p>
      <p className="text-xs text-indigo-600 mb-3">Search by molecule name or CAS number to auto-populate the form.</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. caffeine, 58-08-2, aspirin..."
            className="w-full pl-9 pr-3 py-2 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Search
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
          <X className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {results && (
        <div className="mt-3 bg-white border border-indigo-200 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-slate-800 text-sm">{results.name}</p>
              {results.iupac_name && <p className="text-xs text-slate-500">{results.iupac_name}</p>}
              <div className="flex flex-wrap gap-2 mt-1.5">
                {results.formula && <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{results.formula}</span>}
                {results.molecular_weight && <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">MW: {results.molecular_weight}</span>}
                {results.cid && <span className="text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">CID: {results.cid}</span>}
              </div>
              {results.smiles && (
                <p className="text-[10px] font-mono text-slate-500 mt-1.5 break-all">SMILES: {results.smiles.slice(0, 60)}{results.smiles.length > 60 ? "..." : ""}</p>
              )}
            </div>
            <button
              onClick={() => onSelect(results)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex-shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Use this molecule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}