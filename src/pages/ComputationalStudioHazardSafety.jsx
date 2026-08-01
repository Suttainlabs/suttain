import React, { useState, useContext } from 'react';
import { ShieldAlert, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import RunModeTabs from '@/components/studio/RunModeTabs';
import SingleRunPanel from '@/components/studio/SingleRunPanel';
import BatchPanel from '@/components/studio/BatchPanel';
import PipelinePanel from '@/components/studio/PipelinePanel';
import ApiCodeBlock from '@/components/studio/ApiCodeBlock';
import { SourcedBadge, TrustLabel, downloadTextFile } from '@/components/studio/StudioShared';
import AuthContext from '@/components/auth/AuthContext';

const INPUT_TYPES = [
  { value: 'smiles', label: 'SMILES', placeholder: 'e.g. CC(C)(c1ccc(O)cc1)c1ccc(O)cc1' },
  { value: 'name', label: 'Compound Name', placeholder: 'e.g. bisphenol A' },
  { value: 'cas', label: 'CAS Number', placeholder: 'e.g. 80-05-7' },
];

const d = r => r?.data?.data || r?.data || r;

function ResultShell({ result, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SourcedBadge />
          <TrustLabel source={result.source} type={result.sourceType} />
        </div>
        {children}
      </div>
    </div>
  );
}

function DataTable({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {data.map(([key, value], i) => (
        <div key={i} className="flex justify-between text-sm gap-2">
          <span className="text-slate-500">{key}</span>
          <span className="font-mono text-slate-800 text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}

const TOOLS = [
  {
    id: 'hazard_predict',
    label: 'Hazard Prediction Engine',
    description: 'Run the Hazard Prediction Engine for binary classification with calibrated confidence, hazard categories, and source citations',
    source: 'EPA CompTox + ECHA', sourceType: 'database',
    validate: ({ input }) => {
      if (!input || input.trim().length < 2) return 'Enter a SMILES string or compound name.';
      return null;
    },
    handler: async ({ input, inputType }) => {
      const isSmiles = inputType === 'smiles';
      const payload = isSmiles ? { smiles: input.trim(), mode: 'balanced' } : { query: input.trim(), mode: 'balanced' };
      const res = d(await base44.functions.invoke('hazardClassifier', payload));
      if (res.error) throw new Error(res.error);
      const pred = res.prediction || {};
      const confidence = pred.confidence ? Math.round(parseFloat(pred.confidence)) : null;
      const label = pred.binary_result === 'hazardous' ? 'Hazardous' : (pred.binary_result === 'likely_safe' ? 'Likely safe' : (pred.binary_result || 'N/A'));
      const categories = (pred.hazard_categories || []).map(c => typeof c === 'string' ? c : c.category);
      return {
        source: 'EPA CompTox + ECHA', sourceType: 'database', confidence,
        label,
        data: [
          ['Binary result', label],
          ['Compound', res.compound?.name || input],
          ['SMILES', (res.compound?.smiles || input).slice(0, 50)],
          ['Confidence label', pred.confidence_label || 'N/A'],
          ['GHS codes', (pred.hazard_categories || []).flatMap(c => c.ghs || []).join(', ') || 'See categories'],
        ],
        categories,
        citations: pred.citations || [],
        uncertainty: pred.uncertainty_statement || pred.false_negative_note || '',
        structuralAlerts: pred.structural_alerts || [],
        raw: res,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        <div className={`rounded-lg p-4 mb-4 ${result.label === 'Hazardous' ? 'bg-red-50 border border-red-200' : 'bg-teal-50 border border-teal-200'}`}>
          <p className={`text-lg font-bold ${result.label === 'Hazardous' ? 'text-red-700' : 'text-teal-700'}`}>
            {result.label}
          </p>
          {result.uncertainty && <p className="text-xs text-slate-500 mt-1">{result.uncertainty}</p>}
        </div>
        <DataTable data={result.data} />
        {result.categories && result.categories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-1">Hazard categories</div>
            <div className="flex flex-wrap gap-1">
              {result.categories.map((cat, i) => (
                <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-xs font-semibold">{cat}</span>
              ))}
            </div>
          </div>
        )}
        {result.structuralAlerts && result.structuralAlerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-2">Structural alerts</div>
            <div className="space-y-1">
              {result.structuralAlerts.map((alert, i) => (
                <div key={i} className="text-xs p-2 bg-slate-50 rounded">
                  <span className="font-semibold text-slate-700">{alert.alert_name}</span>
                  <span className="text-slate-500"> - {alert.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {result.citations && result.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-2">Source citations</div>
            <div className="space-y-1">
              {result.citations.map((cit, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold text-slate-700">{cit.source}</span>
                  {cit.reference && <span className="text-slate-500"> - {cit.reference}</span>}
                  {cit.url && <a href={cit.url} target="_blank" rel="noopener noreferrer" className="text-[#007850] hover:underline ml-1">link</a>}
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={() => downloadTextFile('hazard_prediction.json', JSON.stringify(result.raw, null, 2), 'application/json')}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Download full result
        </button>
      </ResultShell>
    ),
  },
  {
    id: 'comprehensive',
    label: 'Comprehensive Hazard Profile',
    description: 'Deep hazard profile with regulatory status, environmental fate, and toxicity endpoints',
    source: 'EPA CompTox + ECHA + GHS', sourceType: 'database',
    validate: ({ input }) => {
      if (!input || input.trim().length < 2) return 'Enter a compound name or SMILES.';
      return null;
    },
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('getComprehensiveHazardProfile', { ingredientName: input.trim() }));
      if (res.error) throw new Error(res.error);
      return {
        source: 'EPA CompTox + ECHA + GHS', sourceType: 'database',
        confidence: null,
        label: `Comprehensive hazard profile: ${res.ingredientName || input}`,
        data: [
          ['Ingredient', res.ingredientName || input],
          ['Found', res.found ? 'Yes' : 'No'],
          ['Risk level', res.riskLevel || 'unknown'],
          ['CAS', res.casNumber || 'N/A'],
          ['EPA tracked', res.epa?.isToxicReleaseTracked ? 'Yes' : 'No'],
          ['ECHA SVHC', res.echa?.isSVHC ? 'Yes' : 'No'],
          ['Flags', (res.summaryFlags || []).join('; ').slice(0, 80) || 'None'],
        ],
        categories: res.summaryFlags || [],
        raw: res,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        <div className={`rounded-lg p-3 mb-4 ${result.raw?.riskLevel === 'high' ? 'bg-red-50 border border-red-200' : result.raw?.riskLevel === 'low' ? 'bg-teal-50 border border-teal-200' : 'bg-amber-50 border border-amber-200'}`}>
          <p className="text-sm font-bold text-slate-800">Risk level: {result.raw?.riskLevel || 'unknown'}</p>
        </div>
        <DataTable data={result.data} />
        {result.raw?.epa && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-1">EPA details</div>
            <p className="text-xs text-slate-600">{result.raw.epa.note || 'No additional data'}</p>
          </div>
        )}
        {result.raw?.echa && (
          <div className="mt-2">
            <div className="text-xs text-slate-400 mb-1">ECHA details</div>
            <p className="text-xs text-slate-600">{result.raw.echa.note || 'No additional data'}</p>
          </div>
        )}
        <button onClick={() => downloadTextFile('hazard_profile.json', JSON.stringify(result.raw, null, 2), 'application/json')}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Download full profile
        </button>
      </ResultShell>
    ),
  },
];

const PIPELINE_STEPS = [
  { id: 'hazard', label: 'Hazard Prediction', handler: TOOLS[0].handler },
  { id: 'profile', label: 'Comprehensive Profile', handler: TOOLS[1].handler },
];

const API_CODE = `import requests

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

export default function ComputationalStudioHazardSafety() {
  const [activeMode, setActiveMode] = useState('single');
  const { user } = useContext(AuthContext);
  const isPro = user && (['pro', 'lifetime', 'pro_lifetime', 'academic'].includes(user.subscription_tier) || user.role === 'admin');
  const config = { inputTypes: INPUT_TYPES, tools: TOOLS, viewerMode: 'hazard', inputPlaceholder: 'Enter one SMILES or compound name per line' };

  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hazard and Safety</h1>
              <p className="text-sm text-slate-500">Validated hazard classification with calibrated confidence, hazard categories, and full source citations</p>
            </div>
          </div>
          <SourcedBadge />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6"><Studio3DViewer mode="hazard" height={300} /></div>
        <RunModeTabs active={activeMode} onChange={setActiveMode} />
        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter SMILES or compound name' }} isPro={isPro} />}
        <ApiCodeBlock code={API_CODE} filename="hazard_prediction.py" title="Use via API" description="Run hazard predictions programmatically" />
      </div>
    </StudioLayout>
  );
}