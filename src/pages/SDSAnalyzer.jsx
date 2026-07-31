import React, { useState, useContext } from "react";
import { FileText, Sparkles, ShieldCheck, Leaf, FlaskConical, Search, Upload } from "lucide-react";
import SDSUploader from "../components/sds/SDSUploader";
import SDSResults from "../components/sds/SDSResults";
import SDSSearch from "../components/sds/SDSSearch";
import ResearchAccessGate from "../components/sds/ResearchAccessGate";
import AuthContext from "../components/auth/AuthContext";

const features = [
  { icon: ShieldCheck, label: "Hazard Identification", desc: "Extracts all GHS hazard classes, H & P statements automatically" },
  { icon: Leaf, label: "Safer Alternatives", desc: "AI suggests lower-risk ingredient swaps with risk reduction estimates" },
  { icon: FlaskConical, label: "Formula Recommendations", desc: "Actionable steps to make your formulas cleaner and safer" },
  { icon: Sparkles, label: "One-Click Simulation", desc: "Send extracted ingredients directly to the Chemical Simulator" },
];

const TABS = [
  { id: "search", label: "Search Database", icon: Search, desc: "115M+ compounds via PubChem" },
  { id: "upload", label: "Upload SDS File", icon: Upload, desc: "PDF or image" },
];

export default function SDSAnalyzer() {
  const { user } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [activeTab, setActiveTab] = useState("search");

  const hasResearchAccess =
    user?.role === "admin" || (user?.product_access || []).includes("research");

  if (!hasResearchAccess) {
    return <ResearchAccessGate />;
  }

  const handleResult = (data, name) => {
    setResult(data);
    setFileName(name);
  };

  const handleReset = () => {
    setResult(null);
    setFileName(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <SDSResults data={result} fileName={fileName} onReset={handleReset} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
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

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:border-teal-300 transition-colors">
              <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon className="w-5 h-5 text-teal-600" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">{label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-tight">{desc}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
              }`}>{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {activeTab === "search" ? (
            <SDSSearch onResult={handleResult} />
          ) : (
            <SDSUploader onResult={handleResult} />
          )}
        </div>
      </div>
    </div>
  );
}