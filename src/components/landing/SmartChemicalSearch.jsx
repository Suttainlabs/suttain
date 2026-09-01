import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, TestTube, Atom, QrCode, FlaskConical, FileText, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ACTIONS = [
  { key: "simulator", label: "Chemical Simulator", icon: TestTube, route: "/Simulator", param: "chemical", color: "#02988C" },
  { key: "generator", label: "Formula Generator", icon: Atom, route: "/generator", param: "chemical", color: "#02988C" },
  { key: "scanner", label: "Product Scanner", icon: QrCode, route: "/BarcodeScanner", param: "q", color: "#02988C" },
  { key: "analysis", label: "Molecule Analysis", icon: FlaskConical, route: "/MoleculeAnalysis", param: "q", color: "#9531F5" },
  { key: "sds", label: "SDS Analyzer", icon: FileText, route: "/SDSAnalyzer", param: "q", color: "#9531F5" },
];

export default function SmartChemicalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [selected, setSelected] = useState(null);

  const containerRef = useRef(null);
  const reqIdRef = useRef(0);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback((query) => {
    const myId = ++reqIdRef.current;
    setLoading(true);
    base44.functions.invoke("chemicalAutocomplete", { query })
      .then((res) => {
        if (myId !== reqIdRef.current) return;
        const data = res?.data || res;
        const list = data?.suggestions || [];
        setSuggestions(list);
        setOpen(list.length > 0);
        setHighlight(-1);
      })
      .catch(() => {
        if (myId !== reqIdRef.current) return;
        setSuggestions([]);
        setOpen(false);
      })
      .finally(() => {
        if (myId === reqIdRef.current) setLoading(false);
      });
  }, []);

  const onChange = (e) => {
    const val = e.target.value;
    setQ(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(val.trim()), 250);
  };

  const pickSuggestion = (item) => {
    setQ(item.name);
    setSelected(item);
    setOpen(false);
    setSuggestions([]);
  };

  const runAction = (action) => {
    const name = selected ? selected.name : q.trim();
    if (!name) return;
    const url = `${action.route}?${action.param}=${encodeURIComponent(name)}`;
    navigate(url);
  };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter" && q.trim()) {
        e.preventDefault();
        if (!selected) navigate(`/MoleculeAnalysis?q=${encodeURIComponent(q.trim())}`);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0) pickSuggestion(suggestions[highlight]);
      else if (suggestions[0]) pickSuggestion(suggestions[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Click-outside to close
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-[520px] mx-auto">
      {/* Search container */}
      <div className="relative flex gap-2 bg-white border-[1.5px] border-[#0A1F1D] rounded-[9px] p-1.5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a988e] pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search a chemical, or scan a product barcode"
          aria-label="Search chemicals"
          aria-expanded={open}
          aria-autocomplete="list"
          className="flex-1 border-none bg-transparent pl-9 pr-2 py-2.5 text-[15px] text-[#0A1F1D] placeholder:text-[#9a988e] outline-none min-w-0"
        />
        {q && !loading && (
          <button
            type="button"
            onClick={() => { setQ(""); setSelected(null); setSuggestions([]); setOpen(false); }}
            className="absolute right-[92px] top-1/2 -translate-y-1/2 text-[#9a988e] hover:text-[#0A1F1D] p-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-[92px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#02988C] animate-spin" />
        )}
        <button
          type="button"
          onClick={() => q.trim() && navigate(`/MoleculeAnalysis?q=${encodeURIComponent(q.trim())}`)}
          disabled={!q.trim()}
          className="bg-[#02988C] text-white rounded-md px-5 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#027A70] flex items-center"
        >
          Search
        </button>
      </div>

      {/* Suggestion dropdown */}
      {open && suggestions.length > 0 && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-[9px] shadow-[0_8px_24px_rgba(10,31,29,0.10)] overflow-hidden max-h-[320px] overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              type="button"
              role="option"
              aria-selected={highlight === i}
              onClick={() => pickSuggestion(s)}
              onMouseEnter={() => setHighlight(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                highlight === i ? "bg-[#F0FDFA]" : "bg-white hover:bg-[#F0FDFA]"
              } ${i > 0 ? "border-t border-[#F3F4F6]" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[14px] text-[#0A1F1D] truncate">{s.name}</div>
                {s.scientific_name && s.scientific_name !== s.name && (
                  <div className="text-[12px] text-[#6B7280] truncate">{s.scientific_name}</div>
                )}
              </div>
              {s.molecular_formula && (
                <span className="font-mono text-[11px] text-[#4B5563] flex-shrink-0">{s.molecular_formula}</span>
              )}
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  background: s.source_db === "PubChem" ? "#EEF6FF" : "#F0FDFA",
                  color: s.source_db === "PubChem" ? "#2563EB" : "#02988C",
                }}
              >
                {s.source_db || "Built-in"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Action menu: appears when a chemical is selected */}
      {selected && (
        <div className="mt-3 bg-[#F7F6F2] border border-[#E5E7EB] rounded-[9px] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="text-[12px] text-[#6B7280] mb-0.5">Selected chemical</p>
              <p className="font-medium text-[15px] text-[#0A1F1D] truncate">
                {selected.name}
                {selected.scientific_name && selected.scientific_name !== selected.name && (
                  <span className="text-[#6B7280] font-normal"> · {selected.scientific_name}</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setSelected(null); setQ(""); }}
              className="text-[#9a988e] hover:text-[#0A1F1D] p-1 flex-shrink-0"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[12px] text-[#6B7280] mb-2.5">What do you want to do with it?</p>
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => runAction(a)}
                className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#0A1F1D] hover:border-[#02988C] hover:bg-white transition-colors"
              >
                <a.icon className="w-4 h-4" style={{ color: a.color }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}