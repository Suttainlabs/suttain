import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

const TABS = [
  { id: "python", label: "Python", primary: true, install: "pip install suttain-sdk" },
  { id: "javascript", label: "JavaScript", install: "npm install @suttain/sdk" },
  { id: "r", label: "R", install: 'install.packages("suttain")' },
  { id: "curl", label: "cURL", install: "# No installation required" },
];

const CODE_SAMPLE = `from suttain import Client

client = Client(api_key="sk_live_...")

# Search 130M+ compounds
results = client.chemicals.search(
    query="aspirin",
    fields=["name", "cas", "toxicity"]
)

# Run a DFT simulation
job = client.simulations.run(
    smiles="CC(=O)OC1=CC=CC=C1C(=O)O",
    method="b3lyp",
    basis_set="6-31g*"
)
print(job.status)  # "queued"`;

export default function EnterpriseDevExperience() {
  const [activeTab, setActiveTab] = useState("python");
  const [copied, setCopied] = useState(false);

  const activeInstall = TABS.find((t) => t.id === activeTab)?.install || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeInstall).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-violet-500 uppercase mb-2">
            Developer Experience
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Native SDKs for Every Stack
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Install in seconds. Full type support. Auto-complete. Production-ready from day one.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex flex-wrap items-center gap-1 mb-4 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-violet-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.primary && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-violet-100 text-violet-600 uppercase tracking-wider">
                  Primary
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
              )}
            </button>
          ))}
        </div>

        {/* Install line + Copy */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 mb-4">
          <code className="flex-1 font-mono text-sm text-slate-700 overflow-x-auto">
            {activeInstall}
          </code>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code sample */}
        <pre className="bg-slate-900 text-slate-100 rounded-xl p-6 overflow-x-auto font-mono text-sm leading-relaxed">
          <code>{CODE_SAMPLE}</code>
        </pre>
      </div>
    </section>
  );
}