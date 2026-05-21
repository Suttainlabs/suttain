import React, { useState } from "react";
import { FileText, Sparkles, ShieldCheck, Leaf, FlaskConical } from "lucide-react";
import SDSUploader from "../components/sds/SDSUploader";
import SDSResults from "../components/sds/SDSResults";

const features = [
  { icon: ShieldCheck, label: "Hazard Identification", desc: "Extracts all GHS hazard classes, H & P statements automatically" },
  { icon: Leaf, label: "Safer Alternatives", desc: "AI suggests lower-risk ingredient swaps with risk reduction estimates" },
  { icon: FlaskConical, label: "Formula Recommendations", desc: "Actionable steps to make your formulas cleaner and safer" },
  { icon: Sparkles, label: "One-Click Simulation", desc: "Send extracted ingredients directly to the Chemical Simulator" },
];

export default function SDSAnalyzer() {
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState(null);

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
            Upload any SDS PDF and instantly get AI-powered hazard analysis, safer ingredient alternatives, and formula recommendations.
          </p>
        </div>

        {/* Feature Pills */}
        {!result && (
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
        )}

        {/* Main Content */}
        {result ? (
          <SDSResults data={result} fileName={fileName} onReset={() => { setResult(null); setFileName(null); }} />
        ) : (
          <SDSUploader onResult={(data, name) => { setResult(data); setFileName(name); }} />
        )}
      </div>
    </div>
  );
}