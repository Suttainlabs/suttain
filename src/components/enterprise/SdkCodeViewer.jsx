import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

const SDK_TABS = [
  {
    name: "Python",
    badge: "Primary",
    accent: "#00A8C8",
    install: "pip install suttain-sdk",
    snippet: `from suttain import Client

client = Client(api_key="sk_live_...")

# Search 115M+ compounds
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
print(job.status)  # "queued"`,
  },
  {
    name: "JavaScript",
    badge: "Node / Browser",
    accent: "#007850",
    install: "npm install @suttain/sdk",
    snippet: `import { SuttainClient } from "@suttain/sdk";

const client = new SuttainClient({ apiKey: process.env.SUTTAIN_KEY });

// Search 115M+ compounds
const results = await client.chemicals.search({
  query: "aspirin",
  fields: ["name", "cas", "toxicity"],
});

// Run a DFT simulation
const job = await client.simulations.run({
  smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
  method: "b3lyp",
  basisSet: "6-31g*",
});
console.log(job.status); // "queued"`,
  },
  {
    name: "R",
    badge: "CRAN",
    accent: "#6B3FA0",
    install: 'install.packages("suttain")',
    snippet: `library(suttain)

client <- suttain_client(api_key = "sk_live_...")

# Search 115M+ compounds
results <- client$chemicals$search(
  query = "aspirin",
  fields = c("name", "cas", "toxicity")
)

# Run a DFT simulation
job <- client$simulations$run(
  smiles = "CC(=O)OC1=CC=CC=C1C(=O)O",
  method = "b3lyp",
  basis_set = "6-31g*"
)
print(job$status)  # "queued"`,
  },
  {
    name: "cURL",
    badge: "Any",
    accent: "#64748b",
    install: "# No install required",
    snippet: `# Search 115M+ compounds
curl -X POST https://api.suttain.com/v1/chemicals/search \\
  -H "Authorization: Bearer $SUTTAIN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "query": "aspirin", "fields": ["name","cas","toxicity"] }'

# Run a DFT simulation
curl -X POST https://api.suttain.com/v1/simulations/run \\
  -H "Authorization: Bearer $SUTTAIN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "smiles": "CC(=O)OC1=CC=CC=C1C(=O)O", "method": "b3lyp" }'`,
  },
];

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

export default function SdkCodeViewer() {
  const [active, setActive] = useState(0);
  const tab = SDK_TABS[active];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Language tabs */}
      <div className="flex items-center gap-1 px-3 pt-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
        {SDK_TABS.map((t, i) => {
          const isActive = i === active;
          return (
            <button
              key={t.name}
              onClick={() => setActive(i)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
                isActive
                  ? "text-slate-900 bg-slate-50"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/60"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? t.accent : "#cbd5e1" }}
              />
              {t.name}
              {isActive && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ backgroundColor: t.accent }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Install row */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <Terminal className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <code className="text-sm font-mono text-slate-700 truncate">
            {tab.install}
          </code>
        </div>
        <CopyButton text={tab.install} label="install command" />
      </div>

      {/* Code block */}
      <div className="relative bg-[#0F172A]">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {tab.badge}
          </span>
          <CopyButton text={tab.snippet} label="code snippet" />
        </div>
        <pre className="px-5 pb-6 pt-1 overflow-x-auto no-scrollbar">
          <code className="text-sm font-mono leading-relaxed text-slate-300 whitespace-pre">
            {tab.snippet}
          </code>
        </pre>
      </div>
    </div>
  );
}