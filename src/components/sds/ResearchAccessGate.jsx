import React from "react";
import { Search, Upload, Lock, FileText } from "lucide-react";

// Locked UI shown to users without a paid Research plan.
// Mirrors the lock + upgrade-banner pattern used across gated tools.
export default function ResearchAccessGate({ title = "SDS Analyzer" }) {
  const lockedTabs = [
    { id: "search", label: "Search Database", icon: Search, desc: "115M+ compounds via PubChem" },
    { id: "upload", label: "Upload SDS File", icon: Upload, desc: "PDF or image" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F7F6F2" }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <FileText className="w-4 h-4" />
            From SDS to Action
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Safety Data Sheet <span className="gradient-text">Analyzer</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Search 115 million+ chemicals from PubChem or upload your own SDS — get instant AI hazard analysis and one-click simulation.
          </p>
        </div>

        {/* Locked Tab Switcher */}
        <div className="flex gap-2 mb-4 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
          {lockedTabs.map((tab, i) => (
            <div
              key={tab.id}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold ${
                i === 0
                  ? "text-white"
                  : "text-slate-500"
              }`}
              style={
                i === 0
                  ? { background: "linear-gradient(135deg, #1a7356 0%, #5c4d8e 100%)" }
                  : undefined
              }
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <Lock className="w-3.5 h-3.5 opacity-80" />
            </div>
          ))}
        </div>

        {/* Upgrade Banner */}
        <div
          className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
          style={{ background: "#F3EFFE" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Lock className="w-5 h-5 flex-shrink-0" style={{ color: "#5c4d8e" }} />
            <p className="text-sm font-medium text-slate-700 truncate">
              {title} is available on Suttain Core and Small business plans.
            </p>
          </div>
          <a
            href="/Pricing"
            className="flex-shrink-0 text-sm font-bold hover:underline"
            style={{ color: "#6b4ec7" }}
          >
            Upgrade
          </a>
        </div>
      </div>
    </div>
  );
}