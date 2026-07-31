import React, { useState } from "react";
import { Terminal, Copy, CheckCheck } from "lucide-react";

const PY_SNIPPET = `import suttain

client = suttain.Client(api_key="sk_suttain_...")

result = client.compound.lookup(
    q="Bisphenol A",
    include=["hazard", "toxicology", "regulatory"]
)

print(result.hazard.hazard_score)   # 78
print(result.hazard.confidence)     # 91
print(result.hazard.source)         # "EPA CompTox"`;

const JS_SNIPPET = `import { SuttainClient } from '@suttain/sdk';

const client = new SuttainClient({ apiKey: 'sk_suttain_...' });

const result = await client.compound.lookup({
  q: 'Bisphenol A',
  include: ['hazard', 'toxicology', 'regulatory'],
});

console.log(result.hazard.hazardScore);  // 78
console.log(result.hazard.source);       // "EPA CompTox"`;

export default function ApiCodeSample() {
  const [lang, setLang] = useState("python");
  const [copied, setCopied] = useState(false);
  const code = lang === "python" ? PY_SNIPPET : JS_SNIPPET;

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-api-accent" />
          <span className="text-sm font-medium text-slate-700">SDK example</span>
        </div>
        <div className="flex items-center gap-1">
          {["python", "javascript"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
                lang === l ? "bg-api-accent-light text-api-accent" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {l === "python" ? "Python" : "JavaScript"}
            </button>
          ))}
          <button onClick={copy} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-api-accent" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <pre className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-x-auto leading-relaxed text-left">
        {code}
      </pre>
    </div>
  );
}