import React, { useState, useContext } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { base44 } from '@/api/base44Client';
import { FileText, Shield, Leaf, Globe, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORT_TYPES = [
  { id: 'sds', name: 'Safety Data Sheet (SDS)', description: 'GHS-compliant SDS with all 16 required sections, hazard pictograms, and emergency contacts.', pages: '4–6 pages', icon: Shield },
  { id: 'compliance', name: 'Compliance Letter', description: 'Market-specific regulatory compliance summary (e.g. EU REACH, FDA, TSCA).', pages: '2–3 pages', icon: Globe },
  { id: 'sustainability', name: 'Sustainability Report', description: 'Ingredient sourcing overview, biodegradability, carbon footprint, and improvement recommendations.', pages: '3–5 pages', icon: Leaf },
  { id: 'full', name: 'Full Analysis Report', description: 'All scores, flagged ingredients, alternatives, compliance summary, and sourcing recommendations in one document.', pages: '8–12 pages', icon: FileText },
];

const FORMATS = ['PDF', 'Word', 'Excel'];
const MARKETS = ['EU', 'USA', 'UK', 'Global'];

export default function ReportGenerator() {
  const { user } = useContext(AuthContext);
  const params = new URLSearchParams(window.location.search);
  const formulaName = params.get('formulaName') || '';

  const [selectedType, setSelectedType] = useState(null);
  const [format, setFormat] = useState('PDF');
  const [market, setMarket] = useState('EU');
  const [generating, setGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [reportContent, setReportContent] = useState(null);
  const [progress, setProgress] = useState(0);

  if (!user) return (
    <div className="min-h-screen bg-[#F0FAF5] flex items-center justify-center p-6">
      <AuthGate featureName="Report Generator" featureDescription="Sign in to generate compliance and sustainability reports." />
    </div>
  );

  const handleGenerate = async () => {
    if (!selectedType) return;
    setGenerating(true);
    setDownloadReady(false);
    setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + 8, 90)), 600);
    try {
      const result = await base44.functions.invoke('runConsumerLLM', {
        operation: 'reportGeneration',
        data: { selectedType, formulaName, market }
      });
      clearInterval(interval);
      setProgress(100);
      setReportContent(result);
      setDownloadReady(true);
    } catch {
      clearInterval(interval);
      setProgress(0);
      alert('Report generation failed. Please try again.');
    }
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!reportContent) return;
    const text = `${reportContent.title}\nGenerated: ${new Date().toLocaleDateString()}\n\n${reportContent.sections?.map(s => `## ${s.heading}\n${s.content}`).join('\n\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportContent.title?.replace(/\s+/g, '_') || 'report'}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F0FAF5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Report Generator</h1>
          <p className="text-slate-500 mt-1">Generate professional, regulator-ready documents in under 2 minutes.</p>
          {formulaName && <p className="text-sm text-[#02988C] font-semibold mt-1">Formula: {formulaName}</p>}
        </div>

        {generating && (
          <div className="mb-6">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#02988C] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Generating report... {progress}%</p>
          </div>
        )}

        {downloadReady && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800 text-sm">Report ready — click to download</span>
            </div>
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" /> Download {format}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Report type selector */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-bold text-slate-700">Select Report Type</h2>
            {REPORT_TYPES.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedType(r.id)}
                className={cn('w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all', selectedType === r.id ? 'border-[#02988C] bg-[#F0FAF5]' : 'border-slate-200 bg-white hover:border-slate-300')}
              >
                <r.icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', selectedType === r.id ? 'text-[#02988C]' : 'text-slate-400')} />
                <div>
                  <p className={cn('font-semibold text-sm', selectedType === r.id ? 'text-[#02988C]' : 'text-slate-800')}>{r.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{r.description}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{r.pages}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Preview + options */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-64">
              {selectedType ? (
                downloadReady && reportContent ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900">{reportContent.title}</h3>
                    {reportContent.sections?.slice(0, 3).map((s, i) => (
                      <div key={i}>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">{s.heading}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{s.content?.slice(0, 200)}...</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                    <div className="h-8 bg-slate-100 rounded w-1/2 mt-6" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-4/5" />
                    <p className="text-xs text-slate-400 text-center pt-4">Select a report type to preview its structure</p>
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Select a report type to see a preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Market</p>
                <div className="flex gap-2 flex-wrap">
                  {MARKETS.map(m => (
                    <button key={m} onClick={() => setMarket(m)} className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all', market === m ? 'bg-[#02988C] text-white border-[#02988C]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#02988C]/40')}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Export Format</p>
                <div className="flex gap-2">
                  {FORMATS.map(f => (
                    <button key={f} onClick={() => setFormat(f)} className={cn('px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-all', format === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300')}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedType || generating}
              className={cn('w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base transition-all', selectedType && !generating ? 'bg-[#02988C] text-white hover:bg-[#027d72] shadow-lg shadow-[#02988C]/25' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <>Generate &amp; Download <Download className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}