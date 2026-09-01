import React, { useState, useRef, useEffect } from "react";
import { Search, Loader2, FlaskConical, ExternalLink, ChevronRight, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchSDS } from "@/functions/searchSDS";
import { fetchSDSDetails } from "@/functions/fetchSDSDetails";

const POPULAR_CHEMICALS = [
  "Acetone", "Ethanol", "Sodium Hydroxide", "Sulfuric Acid", "Benzene",
  "Formaldehyde", "Hydrogen Peroxide", "Ammonia", "Chloroform", "Toluene",
  "Methanol", "Isopropanol", "Acetic Acid", "Sodium Hypochlorite", "Acetonitrile",
];

export default function SDSSearch({ onResult, initialQuery }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(null); // cid being analyzed
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef();

  // Auto-run search when arriving with a pre-filled query (e.g. from landing search)
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (q) => {
    const term = (q || query).trim();
    if (!term) return;
    setSearching(true);
    setError(null);
    setResults([]);
    setSearched(true);
    try {
      const res = await searchSDS({ query: term });
      setResults(res?.data?.results || []);
    } catch (e) {
      setError("Search failed: " + e.message);
    } finally {
      setSearching(false);
    }
  };

  const handleAnalyze = async (compound) => {
    setAnalyzing(compound.cid);
    setError(null);
    try {
      const res = await fetchSDSDetails({ cid: compound.cid, name: compound.name });
      const data = res?.data?.data;
      if (!data) throw new Error("No data returned");
      onResult(data, compound.name);
    } catch (e) {
      setError("Analysis failed: " + e.message);
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search by chemical name, CAS number, or product name..."
              className="pl-10 h-12 text-base border-slate-200 focus:border-teal-400 focus:ring-teal-400"
            />
          </div>
          <Button
            onClick={() => handleSearch()}
            disabled={!query.trim() || searching}
            className="h-12 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {/* Popular Chemicals */}
      {!searched && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Popular Chemicals</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CHEMICALS.map(chem => (
              <button
                key={chem}
                onClick={() => { setQuery(chem); handleSearch(chem); }}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-full text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
              >
                {chem}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Source Note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Powered by <strong>PubChem</strong>: over 115 million chemical substances. Search any chemical and get AI-powered SDS analysis, hazard classification, and simulation.</span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {searching && (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span>Searching PubChem database...</span>
        </div>
      )}

      {/* No Results */}
      {searched && !searching && results.length === 0 && !error && (
        <div className="text-center py-12 text-slate-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No compounds found for "{query}"</p>
          <p className="text-sm mt-1">Try a more common name, CAS number, or molecular formula</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 font-medium">{results.length} compound{results.length !== 1 ? "s" : ""} found</p>
          {results.map(compound => (
            <div
              key={compound.cid}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">{compound.name}</h3>
                    {compound.formula && (
                      <Badge variant="outline" className="text-xs font-mono text-slate-600 bg-slate-50">
                        {compound.formula}
                      </Badge>
                    )}
                    {compound.molecular_weight && (
                      <Badge variant="outline" className="text-xs text-slate-500">
                        MW: {compound.molecular_weight}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>CID: {compound.cid}</span>
                    {compound.inchikey && <span className="font-mono truncate max-w-xs">{compound.inchikey}</span>}
                    <a
                      href={compound.pubchem_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline flex items-center gap-1"
                      onClick={e => e.stopPropagation()}
                    >
                      PubChem <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAnalyze(compound)}
                  disabled={analyzing === compound.cid}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg shrink-0 min-w-[100px]"
                >
                  {analyzing === compound.cid ? (
                    <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Analyzing...</>
                  ) : (
                    <><FlaskConical className="w-3 h-3 mr-1.5" />Analyze SDS</>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}