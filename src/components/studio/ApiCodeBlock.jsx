import React, { useState } from 'react';
import { Copy, Check, FileText, MessageSquare } from 'lucide-react';

const PYTHON_CODE = `import requests

# Submit a hazard prediction job
response = requests.post(
    "https://api.suttain.com/v1/hazard-score",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "smiles": "CC(C)(c1ccc(O)cc1)c1ccc(O)cc1",
        "return_confidence": True
    }
)

data = response.json()
print(f"Label: {data['label']}")
print(f"Confidence: {data['confidence']}")
print(f"Categories: {data['categories']}")
print(f"Sources: {data['sources']}")`;

const ENDPOINTS = [
  { method: 'POST', path: '/v1/compound', desc: 'Compound lookup and properties' },
  { method: 'POST', path: '/v1/hazard-score', desc: 'Hazard prediction with confidence' },
  { method: 'POST', path: '/v1/interactions', desc: 'Chemical interaction checking' },
  { method: 'POST', path: '/v1/sustainability', desc: 'Sustainability profiling' },
  { method: 'POST', path: '/v1/formula', desc: 'Formula generation and analysis' },
];

export default function ApiCodeBlock() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">API</h3>
          <p className="text-sm text-slate-500">Submit jobs programmatically with the Suttain Research API</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Code block */}
        <div className="md:col-span-2">
          <div className="bg-[#0D2B22] rounded-2xl overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">hazard_prediction.py</span>
              </div>
              <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono">
              <code className="text-slate-300" dangerouslySetInnerHTML={{ __html: highlightPython(PYTHON_CODE) }} />
            </pre>
          </div>
        </div>

        {/* Endpoints + buttons */}
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Endpoints</div>
            {ENDPOINTS.map(ep => (
              <div key={ep.path} className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">{ep.method}</span>
                <div className="min-w-0">
                  <div className="text-xs font-mono text-slate-700 truncate">{ep.path}</div>
                  <div className="text-[11px] text-slate-400">{ep.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="/APIPortal" className="block w-full text-center px-4 py-2.5 bg-[#007850] text-white rounded-lg text-sm font-semibold hover:bg-[#005a3a] transition-colors">
            Documentation
          </a>
          <a href="/EnterpriseAPI" className="block w-full text-center px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            Get in touch
          </a>
        </div>
      </div>
    </div>
  );
}

function highlightPython(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(#[^\n]*)/g, '<span style="color:#5a9a7a">$1</span>')
    .replace(/("[^"]*")/g, '<span style="color:#7cc7a0">$1</span>')
    .replace(/\b(import|from|print|requests|True|False|None)\b/g, '<span style="color:#c792ea">$1</span>')
    .replace(/\b(response|data|headers|json)\b/g, '<span style="color:#82aaff">$1</span>');
}