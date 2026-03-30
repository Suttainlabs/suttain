import React, { useState, useEffect, useRef } from "react";
import { Search, X, FlaskConical, QrCode, Atom } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_ICONS = {
  formula: { icon: FlaskConical, color: "text-teal-600", bg: "bg-teal-50", label: "Formula" },
  scan: { icon: QrCode, color: "text-blue-600", bg: "bg-blue-50", label: "Scan" },
  chemical: { icon: Atom, color: "text-violet-600", bg: "bg-violet-50", label: "Chemical" },
};

export default function GlobalSearch({ user }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const q = query.toLowerCase();
        const searches = [];

        if (user) {
          searches.push(
            base44.entities.Formula.list("-updated_date", 50).then((items) =>
              items
                .filter((f) => f.name?.toLowerCase().includes(q) || f.product_type?.toLowerCase().includes(q))
                .slice(0, 4)
                .map((f) => ({ id: f.id, type: "formula", title: f.name, subtitle: f.product_type || "Formula", href: "generator" }))
            ),
            base44.entities.BarcodeHistory.list("-created_date", 50).then((items) =>
              items
                .filter((b) => b.product_name?.toLowerCase().includes(q) || b.barcode?.includes(q))
                .slice(0, 3)
                .map((b) => ({ id: b.id, type: "scan", title: b.product_name, subtitle: `Barcode: ${b.barcode}`, href: "BarcodeScanner" }))
            )
          );
        }

        searches.push(
          base44.entities.Chemical.list("-created_date", 100).then((items) =>
            items
              .filter((c) => c.name?.toLowerCase().includes(q) || c.scientific_name?.toLowerCase().includes(q))
              .slice(0, 4)
              .map((c) => ({ id: c.id, type: "chemical", title: c.name, subtitle: c.scientific_name || c.cas_number || "Chemical", href: "Simulator" }))
          )
        );

        const all = await Promise.all(searches);
        const combined = all.flat();
        setResults(combined);
        setIsOpen(combined.length > 0);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, user]);

  const handleSelect = (item) => {
    setQuery("");
    setIsOpen(false);
    navigate(createPageUrl(item.href));
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative hidden md:block w-64 lg:w-80">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search formulas, scans, chemicals…"
          className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-slate-500">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">No results found.</div>
            ) : (
              <ul>
                {results.map((item, idx) => {
                  const cat = CATEGORY_ICONS[item.type];
                  const Icon = cat.icon;
                  return (
                    <li key={`${item.type}-${item.id}-${idx}`}>
                      <button
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                          <Icon className={`w-4 h-4 ${cat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}