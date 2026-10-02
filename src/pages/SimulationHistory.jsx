import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthGate from "@/components/auth/AuthGate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History, Download, Trash2, Search, Copy, Check,
  FlaskConical, Cpu, ArrowLeft, FileText, Tag, Calendar, StickyNote
} from "lucide-react";
import { format } from "date-fns";

function ScriptModal({ record, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(record.script || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([record.script || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.title.replace(/\s+/g, "_")}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-base">{record.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {record.sim_source === "ai_generator" ? "AI Generator" : "Script Builder"} &middot;{" "}
              {format(new Date(record.created_date), "MMM d, yyyy HH:mm")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" className="gap-1.5 text-xs bg-[#007850] hover:bg-[#005f3e] text-white" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5" />
              Download .py
            </Button>
          </div>
        </div>

        {record.prompt && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Original Prompt</p>
            <p className="text-sm text-slate-700 leading-relaxed">{record.prompt}</p>
          </div>
        )}

        <div className="flex-1 overflow-auto p-5">
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {record.script || "No script content saved."}
          </pre>
        </div>

        {record.notes && (
          <div className="px-5 py-3 border-t border-slate-100 bg-amber-50">
            <p className="text-xs font-semibold text-amber-700 mb-0.5 flex items-center gap-1">
              <StickyNote className="w-3 h-3" /> Notes
            </p>
            <p className="text-xs text-amber-800">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ record, onView, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#00C896] hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            record.sim_source === "ai_generator"
              ? "bg-violet-100"
              : "bg-teal-100"
          }`}>
            {record.sim_source === "ai_generator"
              ? <Cpu className="w-4 h-4 text-violet-600" />
              : <FlaskConical className="w-4 h-4 text-teal-600" />
            }
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">{record.title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge className={`text-[10px] px-2 py-0 border-0 ${
                record.sim_source === "ai_generator"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-teal-100 text-teal-700"
              }`}>
                {record.sim_source === "ai_generator" ? "AI Generator" : "Script Builder"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(record.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {record.prompt && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{record.prompt}</p>
      )}

      {record.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {record.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          {format(new Date(record.created_date), "MMM d, yyyy")}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-3 gap-1"
            onClick={() => onView(record)}
          >
            <FileText className="w-3 h-3" />
            View Script
          </Button>
          <Button
            size="sm"
            className="text-xs h-7 px-3 gap-1 bg-[#007850] hover:bg-[#005f3e] text-white"
            onClick={() => {
              const blob = new Blob([record.script || ""], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${record.title.replace(/\s+/g, "_")}.py`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-3 h-3" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SimulationHistory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [viewingRecord, setViewingRecord] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["dwsim-history"],
    queryFn: () => base44.entities.DWSIMSimulationHistory.list("-created_date", 100),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DWSIMSimulationHistory.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dwsim-history"] }),
  });

  const filtered = records.filter(r => {
    const matchSearch =
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.prompt?.toLowerCase().includes(search.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchSource = filterSource === "all" || r.sim_source === filterSource;
    return matchSearch && matchSource;
  });

  return (
    <AuthGate featureName="Simulation History" featureDescription="View and manage your saved DWSIM simulation scripts.">
      <div className="min-h-screen" style={{ backgroundColor: "#EDF7F2" }}>
        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("DWSIMIntegration")} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-6 h-6 text-[#007850]" />
                  Simulation History
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Your saved DWSIM script generations, view, re-run, or download.
                </p>
              </div>
            </div>
            <Link to={createPageUrl("DWSIMIntegration")}>
              <Button className="bg-[#007850] hover:bg-[#005f3e] text-white text-sm gap-2">
                <FlaskConical className="w-4 h-4" />
                New Simulation
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, prompt, or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]"
              />
            </div>
            <div className="flex gap-2">
              {[
                { val: "all", label: "All" },
                { val: "ai_generator", label: "AI Generator" },
                { val: "script_builder", label: "Script Builder" },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setFilterSource(opt.val)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    filterSource === opt.val
                      ? "bg-[#007850] text-white border-[#007850]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#007850] hover:text-[#007850]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Saved", value: records.length, color: "text-slate-900" },
              { label: "AI Generated", value: records.filter(r => r.sim_source === "ai_generator").length, color: "text-violet-700" },
              { label: "Script Builder", value: records.filter(r => r.sim_source === "script_builder").length, color: "text-teal-700" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#007850] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 mb-1">
                {records.length === 0 ? "No simulations saved yet" : "No results found"}
              </p>
              <p className="text-slate-400 text-sm mb-5">
                {records.length === 0
                  ? "Generate a DWSIM script using the AI Generator or Script Builder to save it here."
                  : "Try a different search or filter."}
              </p>
              {records.length === 0 && (
                <Link to={createPageUrl("DWSIMIntegration")}>
                  <Button className="bg-[#007850] hover:bg-[#005f3e] text-white gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Start a Simulation
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map(record => (
                <HistoryCard
                  key={record.id}
                  record={record}
                  onView={setViewingRecord}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {viewingRecord && (
        <ScriptModal record={viewingRecord} onClose={() => setViewingRecord(null)} />
      )}
    </AuthGate>
  );
}