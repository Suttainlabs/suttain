import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, GitCompare, Loader2, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";

export default function SimulationHistoryPanel({ currentResults, currentInputs, simTypeId, engine }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [simTypeId]);

  useEffect(() => {
    if (currentResults) saveRun();
  }, [currentResults]);

  const loadHistory = async () => {
    try {
      const records = await base44.entities.DWSIMSimulationHistory.filter(
        { sim_source: "script_builder" },
        "-created_date",
        30
      );
      // Filter to this sim type via tags
      const filtered = records.filter(r => r.tags?.includes(simTypeId));
      setHistory(filtered);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const saveRun = async () => {
    if (!currentResults) return;
    const molName = currentInputs?.molecule || currentInputs?.system || currentInputs?.compound || currentInputs?.ligand || "Unknown";
    try {
      await base44.entities.DWSIMSimulationHistory.create({
        title: `${molName}: ${engine}`,
        sim_source: "script_builder",
        prompt: JSON.stringify(currentInputs),
        config: {
          engine,
          sim_type: simTypeId,
          key_values: currentResults.predicted_results?.key_values || [],
          system_overview: currentResults.system_overview,
          scientific_interpretation: currentResults.scientific_interpretation,
        },
        tags: [simTypeId],
        notes: currentResults.predicted_results?.summary || "",
      });
      await loadHistory();
    } catch {}
  };

  const parseConfig = (record) => {
    try { return record.config || {}; } catch { return {}; }
  };

  const getKeyValue = (config, property) => {
    const kv = config?.key_values?.find(k => k.property?.toLowerCase().includes(property.toLowerCase()));
    return kv ? `${kv.value} ${kv.unit || ""}`.trim() : ":";
  };

  const CompareIcon = ({ a, b }) => {
    if (!a || !b || a === ":" || b === ":") return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    const numA = parseFloat(a); const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return null;
    if (numA > numB) return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
    if (numA < numB) return <TrendingDown className="w-3.5 h-3.5 text-green-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  if (loading) return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5 flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading history...
      </CardContent>
    </Card>
  );

  const configA = compareA ? parseConfig(compareA) : null;
  const configB = compareB ? parseConfig(compareB) : null;

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <History className="w-4 h-4 text-indigo-600" />
              Simulation History
              {history.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </h3>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {expanded && (
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No previous runs saved for this simulation type. Run a simulation to start building history.</p>
              ) : (
                <>
                  <p className="text-xs text-slate-500">Select two runs to compare side by side.</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {history.map(record => {
                      const cfg = parseConfig(record);
                      const isA = compareA?.id === record.id;
                      const isB = compareB?.id === record.id;
                      return (
                        <div
                          key={record.id}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isA ? "border-violet-500 bg-violet-50" :
                            isB ? "border-teal-500 bg-teal-50" :
                            "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 text-xs truncate">{record.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {new Date(record.created_date).toLocaleDateString()} · {cfg.engine || "Unknown engine"}
                              </p>
                              {record.notes && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{record.notes}</p>}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => setCompareA(isA ? null : record)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                  isA ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => setCompareB(isB ? null : record)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                  isB ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                                }`}
                              >
                                B
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {compareA && compareB && (
                    <Button
                      onClick={() => setShowComparison(!showComparison)}
                      className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                      size="sm"
                    >
                      <GitCompare className="w-4 h-4" />
                      {showComparison ? "Hide" : "View"} Side-by-Side Comparison
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showComparison && compareA && compareB && configA && configB && (
        <Card className="border-violet-200 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm mb-4">
              <GitCompare className="w-4 h-4 text-violet-600" />
              Comparison: A vs B
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold w-1/3">Metric</th>
                    <th className="text-left px-3 py-2 text-violet-700 font-semibold w-1/3">
                      A: {compareA.title}
                    </th>
                    <th className="text-left px-3 py-2 text-teal-700 font-semibold w-1/3">
                      B: {compareB.title}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-700">Engine</td>
                    <td className="px-3 py-2 text-slate-600">{configA.engine || ":"}</td>
                    <td className="px-3 py-2 text-slate-600">{configB.engine || ":"}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-700">Run Date</td>
                    <td className="px-3 py-2 text-slate-600">{new Date(compareA.created_date).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-slate-600">{new Date(compareB.created_date).toLocaleDateString()}</td>
                  </tr>
                  {(configA.key_values || configB.key_values) && (
                    [...new Set([
                      ...(configA.key_values || []).map(k => k.property),
                      ...(configB.key_values || []).map(k => k.property),
                    ])].slice(0, 8).map(prop => {
                      const valA = getKeyValue(configA, prop);
                      const valB = getKeyValue(configB, prop);
                      const diff = valA !== valB;
                      return (
                        <tr key={prop} className={`border-b border-slate-100 ${diff ? "bg-amber-50" : ""}`}>
                          <td className="px-3 py-2 font-medium text-slate-700">{prop}</td>
                          <td className="px-3 py-2 font-mono text-violet-700 font-bold">{valA}</td>
                          <td className="px-3 py-2 font-mono text-teal-700 font-bold flex items-center gap-1">
                            {valB}
                            <CompareIcon a={valB} b={valA} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}