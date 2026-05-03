import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Copy, CheckCircle2, Download, Activity, Cpu, BookOpen } from "lucide-react";

export default function QueueResultsModal({ job, onClose }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("analysis");
  const result = job.result || {};

  const handleCopy = () => {
    if (result.bash_script) {
      navigator.clipboard.writeText(result.bash_script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result.bash_script) return;
    const ext = job.engine === "VASP" ? "INCAR" : job.engine === "Quantum ESPRESSO" ? "in" : "sh";
    const blob = new Blob([result.bash_script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job.job_name.replace(/\s+/g, "_")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-green-100 text-green-700 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </Badge>
              <span className="text-xs text-slate-400">{job.sim_type_label} · {job.engine}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{job.job_name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {[
            { id: "analysis", label: "Analysis", icon: Activity },
            { id: "script", label: "Script", icon: Cpu },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        <div className="p-6 pt-4 space-y-4">

          {tab === "analysis" && (
            <>
              {result.system_overview && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-600" /> System Overview
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.system_overview}</p>
                </div>
              )}

              {result.predicted_results?.key_values?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" /> Predicted Results
                  </h3>
                  {result.predicted_results.summary && (
                    <p className="text-xs text-slate-500 mb-3">{result.predicted_results.summary}</p>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {["Property", "Value", "Unit", "Interpretation"].map(h => (
                            <th key={h} className="text-left px-3 py-2 font-semibold text-slate-500 uppercase text-[10px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.predicted_results.key_values.map((row, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2 font-medium text-slate-800">{row.property}</td>
                            <td className="px-3 py-2 font-mono text-violet-700 font-bold">{row.value}</td>
                            <td className="px-3 py-2 text-slate-400">{row.unit}</td>
                            <td className="px-3 py-2 text-slate-500">{row.interpretation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.scientific_interpretation && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Scientific Interpretation</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.scientific_interpretation}</p>
                </div>
              )}

              {result.next_steps?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Next Steps</h3>
                  <ul className="space-y-1.5">
                    {result.next_steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {tab === "script" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-700">{job.engine} Script</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={handleDownload} className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </div>
              <pre className="bg-slate-900 text-green-300 rounded-xl p-4 overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-80">
                {result.bash_script || "No script generated."}
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}