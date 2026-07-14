import React, { useState, useContext } from 'react';
import { ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import RunModeTabs from '@/components/studio/RunModeTabs';
import SingleRunPanel from '@/components/studio/SingleRunPanel';
import BatchPanel from '@/components/studio/BatchPanel';
import PipelinePanel from '@/components/studio/PipelinePanel';
import ApiCodeBlock from '@/components/studio/ApiCodeBlock';
import { SourcedBadge } from '@/components/studio/StudioShared';
import AuthContext from '@/components/auth/AuthContext';

const INPUT_TYPES = [
  { value: 'smiles', label: 'SMILES', placeholder: 'e.g. CC(C)(c1ccc(O)cc1)c1ccc(O)cc1' },
  { value: 'name', label: 'Compound Name', placeholder: 'e.g. bisphenol A' },
  { value: 'cas', label: 'CAS Number', placeholder: 'e.g. 80-05-7' },
];

const d = r => r?.data?.data || r?.data || r;

const TOOLS = [
  {
    id: 'hazard_predict',
    label: 'Hazard Prediction Engine',
    description: 'Run the Hazard Prediction Engine for binary classification with calibrated confidence, hazard categories, and source citations',
    source: 'EPA CompTox + ECHA', sourceType: 'database',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('hazardPrediction', { smiles: input }));
      if (res.error) throw new Error(res.error);
      const pred = res.prediction || {};
      const confidence = pred.confidence ? Math.round(parseFloat(pred.confidence)) : null;
      const label = pred.binary_result === 'hazardous' ? 'Hazardous' : (pred.binary_result === 'likely_safe' ? 'Likely safe' : (pred.binary_result || 'N/A'));
      const categories = (pred.hazard_categories || []).map(c => c.category || c);
      return {
        source: 'EPA CompTox + ECHA', sourceType: 'database', confidence,
        label,
        data: [
          ['Binary result', label],
          ['Compound', res.compound?.name || input],
          ['SMILES', res.compound?.smiles || input],
          ['Confidence label', pred.confidence_label || 'N/A'],
          ['GHS codes', (pred.hazard_categories || []).flatMap(c => c.ghs || []).join(', ') || 'See categories'],
        ],
        categories,
        raw: res,
      };
    },
  },
  {
    id: 'comprehensive',
    label: 'Comprehensive Hazard Profile',
    description: 'Deep hazard profile with regulatory status, environmental fate, and toxicity endpoints',
    source: 'EPA CompTox + ECHA + GHS', sourceType: 'database',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('getComprehensiveHazardProfile', { ingredientName: input }));
      if (res.error) throw new Error(res.error);
      return {
        source: 'EPA CompTox + ECHA + GHS', sourceType: 'database',
        confidence: null,
        label: 'Comprehensive hazard profile',
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
  },
];

const PIPELINE_STEPS = [
  { id: 'lookup', label: 'Compound Lookup' },
  { id: 'hazard', label: 'Hazard Prediction', handler: TOOLS[0].handler },
  { id: 'profile', label: 'Comprehensive Profile', handler: TOOLS[1].handler },
  { id: 'report', label: 'Report Generation' },
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
  const config = { inputTypes: INPUT_TYPES, tools: TOOLS, viewerMode: 'hazard', inputPlaceholder: 'Enter one SMILES per line' };

  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C42B2B, #D4900A)' }}>
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
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter SMILES' }} isPro={isPro} />}
        <ApiCodeBlock code={API_CODE} filename="hazard_prediction.py" title="Use via API" description="Run hazard predictions programmatically" />
      </div>
    </StudioLayout>
  );
}