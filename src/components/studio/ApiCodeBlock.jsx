import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

const DEFAULT_ENDPOINTS = [
  { method: 'POST', path: '/v1/compound', desc: 'Compound lookup and properties' },
  { method: 'POST', path: '/v1/hazard-score', desc: 'Hazard prediction with confidence' },
  { method: 'POST', path: '/v1/interactions', desc: 'Chemical interaction checking' },
  { method: 'POST', path: '/v1/sustainability', desc: 'Sustainability profiling' },
  { method: 'POST', path: '/v1/formula', desc: 'Formula generation and analysis' },
];

export default function ApiCodeBlock({ code, filename = 'example.py', title = 'Use via API', description = 'Submit jobs programmatically with the Suttain Research API' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="bg-[#0D2B22] rounded-2xl overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">{filename}</span>
              </div>
              <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono">
              <code className="text-slate-300" dangerouslySetInnerHTML={{ __html: highlightPython(code) }} />
            </pre>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Endpoints</div>
            {DEFAULT_ENDPOINTS.map(ep => (
              <div key={ep.path} className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">{ep.method}</span>
                <div className="min-w-0">
                  <div className="text-xs font-mono text-slate-700 truncate">{ep.path}</div>
                  <div className="text-[11px] text-slate-400">{ep.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="/APIPortal" className="block w-full text-center px-4 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors" style={{ background: '#007850' }}>
            Documentation
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