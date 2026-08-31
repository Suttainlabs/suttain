import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, X, Download, Loader2, ShieldAlert, Info,
  Printer, AlertTriangle, CheckCircle2, RefreshCw
} from "lucide-react";
import { jsPDF } from "jspdf";

// ── Risk level config ──────────────────────────────────────────────────────────
const RISK_LEVELS = {
  SAFE:      { label: "Safe",      color: "#22c55e", bg: "#dcfce7", text: "#166534", border: "#86efac", score: 0 },
  LOW:       { label: "Low",       color: "#84cc16", bg: "#ecfccb", text: "#3f6212", border: "#bef264", score: 20 },
  MODERATE:  { label: "Moderate",  color: "#f59e0b", bg: "#fef3c7", text: "#92400e", border: "#fcd34d", score: 50 },
  DANGEROUS: { label: "Dangerous", color: "#ef4444", bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", score: 80 },
  FATAL:     { label: "Fatal",     color: "#7f1d1d", bg: "#450a0a", text: "#fef2f2", border: "#991b1b", score: 100 },
  SELF:      { label: "—",         color: "#94a3b8", bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1", score: -1 },
  UNKNOWN:   { label: "?",         color: "#a78bfa", bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd", score: -2 },
};

// Pre-known pairs for instant display (subset of Simulator.jsx data)
const KNOWN_PAIRS = {
  "ammonia|sodium hypochlorite": "FATAL",
  "sodium hypochlorite|ammonia": "FATAL",
  "hydrogen chloride|sodium hypochlorite": "FATAL",
  "sodium hypochlorite|hydrogen chloride": "FATAL",
  "propan-2-ol|sodium hypochlorite": "DANGEROUS",
  "sodium hypochlorite|propan-2-ol": "DANGEROUS",
  "ethanoic acid|sodium hypochlorite": "DANGEROUS",
  "sodium hypochlorite|ethanoic acid": "DANGEROUS",
  "sodium hydrogen carbonate|sodium hypochlorite": "DANGEROUS",
  "sodium hypochlorite|sodium hydrogen carbonate": "DANGEROUS",
  "ethanoic acid|sodium hydrogen carbonate": "SAFE",
  "sodium hydrogen carbonate|ethanoic acid": "SAFE",
  "benzene|water": "LOW",
  "water|benzene": "LOW",
};

const COMMON_CHEMICALS = [
  "Sodium Hypochlorite (Bleach)",
  "Ammonia",
  "Hydrogen Chloride (HCl)",
  "Propan-2-ol (Isopropanol)",
  "Ethanoic Acid (Vinegar)",
  "Sodium Hydrogen Carbonate",
  "Hydrogen Peroxide",
  "Sodium Hydroxide",
  "Sulfuric Acid",
  "Acetone",
  "Benzene",
  "Ethanol",
  "Formaldehyde",
  "Chlorine Gas",
  "Water",
];

const normalize = (name) => name.toLowerCase()
  .replace(/\s*\(.*?\)/g, "")
  .trim()
  .replace(/sodium hypochlorite/i, "sodium hypochlorite")
  .replace(/bleach/i, "sodium hypochlorite");

const pairKey = (a, b) => `${normalize(a)}|${normalize(b)}`;

// ── Cell component ─────────────────────────────────────────────────────────────
function MatrixCell({ rowChem, colChem, riskData, isLoading, onClick }) {
  if (rowChem === colChem) {
    const cfg = RISK_LEVELS.SELF;
    return (
      <div className="w-full h-full flex items-center justify-center text-xs font-bold"
        style={{ background: cfg.bg, color: cfg.text }}>
        ●
      </div>
    );
  }

  const level = riskData?.level || "UNKNOWN";
  const cfg = RISK_LEVELS[level] || RISK_LEVELS.UNKNOWN;

  return (
    <motion.button
      whileHover={{ scale: 1.08, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(rowChem, colChem, riskData)}
      className="w-full h-full flex items-center justify-center text-[10px] font-bold rounded transition-all relative"
      style={{ background: cfg.bg, color: cfg.text, border: `2px solid ${cfg.border}` }}
      title={`${rowChem} + ${colChem}: ${cfg.label}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span className="leading-tight text-center px-0.5">{cfg.label}</span>
      )}
    </motion.button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function HazardInteractionMatrix() {
  const [chemicals, setChemicals] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const [matrixData, setMatrixData] = useState({});   // key → { level, summary, score }
  const [loadingPairs, setLoadingPairs] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const matrixRef = useRef(null);

  // ── Resolve a single pair ──────────────────────────────────────────────────
  const resolvePair = useCallback(async (a, b) => {
    const key = pairKey(a, b);
    const knownLevel = KNOWN_PAIRS[key];
    if (knownLevel) {
      return { level: knownLevel, summary: `Known ${knownLevel.toLowerCase()} combination.`, score: RISK_LEVELS[knownLevel]?.score ?? 50 };
    }

    // Ask AI
    const prompt = `You are a chemical safety expert. Evaluate the hazard when combining "${a}" and "${b}".
Return JSON with:
- level: one of SAFE, LOW, MODERATE, DANGEROUS, FATAL
- score: integer 0-100 (0=safe, 100=fatal)
- summary: one sentence describing the specific risk or safety of combining these two chemicals.`;

    try {
      const res = await base44.functions.invoke('runConsumerLLM', {
        operation: 'hazardMatrix',
        data: { chemicalA: a, chemicalB: b }
      });
      const level = (res.level || "UNKNOWN").toUpperCase();
      return { level: RISK_LEVELS[level] ? level : "UNKNOWN", score: res.score || 50, summary: res.summary || "" };
    } catch {
      return { level: "UNKNOWN", score: 50, summary: "Analysis failed — exercise caution." };
    }
  }, []);

  // ── Analyze all pairs ──────────────────────────────────────────────────────
  const analyzeAll = useCallback(async () => {
    setIsAnalyzing(true);
    const pairs = [];
    for (let i = 0; i < chemicals.length; i++) {
      for (let j = i + 1; j < chemicals.length; j++) {
        const k = pairKey(chemicals[i], chemicals[j]);
        if (!matrixData[k]) pairs.push([chemicals[i], chemicals[j]]);
      }
    }
    if (pairs.length === 0) { setIsAnalyzing(false); return; }

    setLoadingPairs(new Set(pairs.map(([a, b]) => pairKey(a, b))));

    // Batch: resolve in parallel (max 5 at a time)
    const batchSize = 5;
    const newData = { ...matrixData };
    for (let i = 0; i < pairs.length; i += batchSize) {
      const batch = pairs.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(([a, b]) => resolvePair(a, b)));
      batch.forEach(([a, b], idx) => {
        const k = pairKey(a, b);
        newData[k] = results[idx];
        newData[pairKey(b, a)] = results[idx]; // symmetric
      });
      setMatrixData({ ...newData });
      setLoadingPairs(prev => {
        const next = new Set(prev);
        batch.forEach(([a, b]) => next.delete(pairKey(a, b)));
        return next;
      });
    }
    setIsAnalyzing(false);
  }, [chemicals, matrixData, resolvePair]);

  // ── Add/remove chemical ────────────────────────────────────────────────────
  const filteredSuggestions = COMMON_CHEMICALS.filter(c =>
    !chemicals.includes(c) &&
    (inputValue === "" || c.toLowerCase().includes(inputValue.toLowerCase()))
  );

  const addChemical = (val) => {
    const v = (val || inputValue).trim();
    if (!v || chemicals.includes(v)) { setInputValue(""); setShowSuggestions(false); return; }
    setChemicals(prev => [...prev, v]);
    setInputValue("");
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const removeChemical = (name) => {
    setChemicals(prev => prev.filter(c => c !== name));
    setSelectedCell(null);
  };

  // ── Cell click ─────────────────────────────────────────────────────────────
  const handleCellClick = (row, col, data) => {
    if (row === col) return;
    setSelectedCell({ row, col, data });
  };

  // ── Export Safety Poster PDF ───────────────────────────────────────────────
  const exportPDF = async () => {
    setExportingPDF(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, W, H, "F");

      // Title bar
      doc.setFillColor(2, 152, 140); // suttain-teal
      doc.rect(0, 0, W, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("⚗ CHEMICAL HAZARD INTERACTION MATRIX", W / 2, 12, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Safety Poster · Generated by Suttain · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, W / 2, 22, { align: "center" });

      // Warning strip
      doc.setFillColor(239, 68, 68);
      doc.rect(0, 30, W, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("⚠  NEVER mix chemicals marked DANGEROUS or FATAL. Consult Safety Data Sheets before any combination. For professional lab use only.", W / 2, 35.5, { align: "center" });

      // Grid setup
      const margin = 15;
      const labelW = 55;
      const startY = 50;
      const availW = W - margin * 2 - labelW;
      const availH = H - startY - 50;
      const n = chemicals.length;
      const cellW = Math.min(availW / n, 38);
      const cellH = Math.min(availH / n, 14);
      const gridW = cellW * n;
      const gridH = cellH * n;
      const gridX = margin + labelW;
      const gridY = startY;

      // Column headers (rotated simulation via short labels)
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      chemicals.forEach((chem, ci) => {
        doc.setTextColor(200, 200, 220);
        const short = chem.replace(/\s*\(.*?\)/g, "").trim().substring(0, 18);
        doc.text(short, gridX + ci * cellW + cellW / 2, gridY - 3, { align: "center", maxWidth: cellW - 2 });
      });

      // Row headers + cells
      chemicals.forEach((rowChem, ri) => {
        // Row label
        const short = rowChem.replace(/\s*\(.*?\)/g, "").trim().substring(0, 22);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 200, 220);
        doc.text(short, margin + labelW - 3, gridY + ri * cellH + cellH / 2 + 2.5, { align: "right" });

        chemicals.forEach((colChem, ci) => {
          const x = gridX + ci * cellW;
          const y = gridY + ri * cellH;

          if (rowChem === colChem) {
            doc.setFillColor(30, 41, 59);
            doc.rect(x, y, cellW, cellH, "F");
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(9);
            doc.text("●", x + cellW / 2, y + cellH / 2 + 2, { align: "center" });
            return;
          }

          const key = pairKey(rowChem, colChem);
          const d = matrixData[key];
          const level = d?.level || "UNKNOWN";
          const cfg = RISK_LEVELS[level] || RISK_LEVELS.UNKNOWN;

          // Parse hex to RGB
          const hex = cfg.color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);

          doc.setFillColor(r, g, b);
          doc.rect(x, y, cellW, cellH, "F");

          // Text contrast
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          doc.setTextColor(brightness > 128 ? 30 : 255, brightness > 128 ? 30 : 255, brightness > 128 ? 30 : 255);
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "bold");
          doc.text(cfg.label, x + cellW / 2, y + cellH / 2 + 2, { align: "center" });
        });
      });

      // Grid border
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(0.3);
      doc.rect(gridX, gridY, cellW * n, cellH * n);

      // Legend
      const legendY = gridY + gridH + 12;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(200, 200, 220);
      doc.text("RISK LEGEND:", margin, legendY);
      let lx = margin + 30;
      Object.entries(RISK_LEVELS).filter(([k]) => !["SELF", "UNKNOWN"].includes(k)).forEach(([key, cfg]) => {
        const hex = cfg.color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        doc.setFillColor(r, g, b);
        doc.rect(lx, legendY - 5, 7, 5, "F");
        doc.setTextColor(200, 200, 220);
        doc.setFont("helvetica", "normal");
        doc.text(cfg.label, lx + 9, legendY - 1);
        lx += 35;
      });

      // Footer
      doc.setFillColor(2, 152, 140);
      doc.rect(0, H - 12, W, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Suttain Chemical Safety Platform · suttain.com · For Lab Display Only — Not a Substitute for Professional Safety Training", W / 2, H - 4.5, { align: "center" });

      doc.save(`suttain-hazard-matrix-${Date.now()}.pdf`);
    } finally {
      setExportingPDF(false);
    }
  };

  // ── Risk summary stats ─────────────────────────────────────────────────────
  const pairCount = (chemicals.length * (chemicals.length - 1)) / 2;
  const analysedCount = Object.keys(matrixData).length / 2;
  const fatalCount = Object.values(matrixData).filter(d => d.level === "FATAL").length / 2;
  const dangerCount = Object.values(matrixData).filter(d => d.level === "DANGEROUS").length / 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Hazard Interaction Matrix
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Select chemicals to see a 2D heatmap of combination risks</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={analyzeAll}
            disabled={isAnalyzing || chemicals.length < 2}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white gap-2"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isAnalyzing ? "Analyzing…" : "Analyze All Pairs"}
          </Button>
          <Button
            onClick={exportPDF}
            disabled={exportingPDF || analysedCount === 0}
            variant="outline"
            className="gap-2 border-slate-300"
          >
            {exportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Safety Poster
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {analysedCount > 0 && (
        <div className="flex flex-wrap gap-3">
          {fatalCount > 0 && (
            <Badge className="bg-red-900 text-red-100 gap-1">
              <AlertTriangle className="w-3 h-3" /> {Math.round(fatalCount)} Fatal pair{fatalCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {dangerCount > 0 && (
            <Badge className="bg-red-100 text-red-700 gap-1">
              <AlertTriangle className="w-3 h-3" /> {Math.round(dangerCount)} Dangerous pair{dangerCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {fatalCount === 0 && dangerCount === 0 && (
            <Badge className="bg-green-100 text-green-700 gap-1">
              <CheckCircle2 className="w-3 h-3" /> No fatal or dangerous pairs detected
            </Badge>
          )}
          <Badge className="bg-slate-100 text-slate-600">{Math.round(analysedCount)}/{pairCount} pairs analysed</Badge>
        </div>
      )}

      {/* Chemical Selector */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Chemicals in Matrix ({chemicals.length})</p>
          <div className="flex flex-wrap gap-2">
            {chemicals.map(chem => (
              <span key={chem} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                {chem}
                <button onClick={() => removeChemical(chem)} className="text-slate-400 hover:text-red-500 ml-1 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {/* Add chemical */}
          <div className="relative" ref={inputRef}>
            <div className="flex gap-2">
              <input
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => {
                  if (e.key === "Enter") addChemical();
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                placeholder="Type or pick a chemical…"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              />
              <Button size="sm" onClick={() => addChemical()} className="gap-1 bg-teal-600 hover:bg-teal-700 text-white shrink-0">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredSuggestions.map(c => (
                  <button
                    key={c}
                    onMouseDown={e => { e.preventDefault(); addChemical(c); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Grid */}
      {chemicals.length >= 2 && (
        <div ref={matrixRef} className="overflow-auto">
          <div className="min-w-max">
            {/* Column labels */}
            <div className="flex" style={{ paddingLeft: "120px" }}>
              {chemicals.map(chem => (
                <div key={chem} className="w-24 text-center text-[10px] font-semibold text-slate-500 px-1 pb-1 truncate" title={chem}>
                  {chem.replace(/\s*\(.*?\)/g, "").trim().substring(0, 14)}
                </div>
              ))}
            </div>
            {/* Rows */}
            {chemicals.map(rowChem => (
              <div key={rowChem} className="flex items-center mb-1">
                {/* Row label */}
                <div className="w-28 text-right pr-2 text-[10px] font-semibold text-slate-600 truncate flex-shrink-0" title={rowChem}>
                  {rowChem.replace(/\s*\(.*?\)/g, "").trim().substring(0, 16)}
                </div>
                {/* Cells */}
                {chemicals.map(colChem => {
                  const key = pairKey(rowChem, colChem);
                  const data = matrixData[key];
                  const loading = loadingPairs.has(key);
                  return (
                    <div key={colChem} className="w-24 h-9 mx-0.5 rounded overflow-hidden">
                      <MatrixCell
                        rowChem={rowChem}
                        colChem={colChem}
                        riskData={data}
                        isLoading={loading}
                        onClick={handleCellClick}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {chemicals.length < 2 && (
        <div className="text-center py-10 text-slate-400">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Add at least 2 chemicals to display the matrix</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Legend:</span>
        {Object.entries(RISK_LEVELS).filter(([k]) => !["SELF", "UNKNOWN"].includes(k)).map(([key, cfg]) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: RISK_LEVELS.UNKNOWN.bg, color: RISK_LEVELS.UNKNOWN.text, border: `1px solid ${RISK_LEVELS.UNKNOWN.border}` }}>
          Not analysed
        </span>
      </div>

      {/* Cell Detail Panel */}
      <AnimatePresence>
        {selectedCell && selectedCell.row !== selectedCell.col && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className={`border-2`} style={{
              borderColor: (RISK_LEVELS[selectedCell.data?.level] || RISK_LEVELS.UNKNOWN).border,
              background: (RISK_LEVELS[selectedCell.data?.level] || RISK_LEVELS.UNKNOWN).bg
            }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: (RISK_LEVELS[selectedCell.data?.level] || RISK_LEVELS.UNKNOWN).text }} />
                    <div>
                      <p className="font-bold text-sm" style={{ color: (RISK_LEVELS[selectedCell.data?.level] || RISK_LEVELS.UNKNOWN).text }}>
                        {selectedCell.row} + {selectedCell.col}
                      </p>
                      <Badge className="mt-1 mb-2 text-xs"
                        style={{
                          background: (RISK_LEVELS[selectedCell.data?.level] || RISK_LEVELS.UNKNOWN).color,
                          color: "#fff"
                        }}>
                        {(RISK_LEVELS[selectedCell.data?.level] || RISK_LEVELS.UNKNOWN).label} Risk
                      </Badge>
                      <p className="text-sm" style={{ color: (RISK_LEVELS[selectedCell.data?.level] || RISK_LEVELS.UNKNOWN).text }}>
                        {selectedCell.data?.summary || "No analysis available yet. Click 'Analyze All Pairs' to get AI-powered risk assessment."}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export info */}
      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <Printer className="w-3.5 h-3.5" />
        Export Safety Poster generates a printable A3 PDF heatmap suitable for lab display.
      </p>
    </div>
  );
}