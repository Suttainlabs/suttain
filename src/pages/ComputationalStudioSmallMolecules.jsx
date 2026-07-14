import React, { useState, useContext } from 'react';
import { Atom } from 'lucide-react';
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
  { value: 'smiles', label: 'SMILES', placeholder: 'e.g. CCO' },
  { value: 'name', label: 'Compound Name', placeholder: 'e.g. ethanol' },
  { value: 'cid', label: 'PubChem CID', placeholder: 'e.g. 702' },
  { value: 'cas', label: 'CAS Number', placeholder: 'e.g. 64-17-5' },
  { value: 'file', label: 'File Upload', placeholder: '' },
];

const d = r => r?.data?.data || r?.data || r;

const TOOLS = [
  {
    id: 'lookup',
    label: 'PubChem and ChEMBL Lookup',
    description: 'Search PubChem and ChEMBL for compound identity, synonyms, and bioactivity data',
    source: 'PubChem + ChEMBL', sourceType: 'database',
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('comprehensiveChemicalSearch', { query: input, query_type: inputType }));
      return {
        source: 'PubChem + ChEMBL', sourceType: 'database', confidence: null,
        label: 'Compound identified',
        data: [['Name', res.name || res.iupac_name || input], ['CID', res.cid || res.pubchem_cid || 'N/A'], ['Molecular formula', res.molecular_formula || 'N/A'], ['SMILES', res.smiles || res.canonical_smiles || 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'properties',
    label: 'Molecular Properties and Descriptors',
    description: 'Compute physicochemical properties, drug-likeness, and molecular descriptors',
    source: 'In-browser computation', sourceType: 'computed',
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('getMolecularData', { query: input, query_type: inputType, compute_properties: true }));
      return {
        source: 'In-browser computation', sourceType: 'computed', confidence: null,
        label: 'Properties computed',
        data: [['MW', res.molecular_weight ? `${res.molecular_weight} g/mol` : 'N/A'], ['LogP', res.logp ?? 'N/A'], ['H-bond donors', res.hbd ?? 'N/A'], ['H-bond acceptors', res.hba ?? 'N/A'], ['TPSA', res.tpsa ? `${res.tpsa} A^2` : 'N/A'], ['Rotatable bonds', res.rotatable_bonds ?? 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'gfn2xtb',
    label: 'GFN2-xTB and PM7 Calculations',
    description: 'Run semi-empirical quantum chemistry calculations in-browser (GFN2-xTB and PM7)',
    source: 'In-browser GFN2-xTB', sourceType: 'computed', engine: 'GFN2-xTB',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('quantumChemistry', { smiles: input, method: 'gfn2xtb' }));
      return {
        source: 'In-browser GFN2-xTB', sourceType: 'computed', confidence: res.convergence ? 95 : null,
        label: 'Semi-empirical calculation complete',
        data: [['Method', res.method || 'GFN2-xTB'], ['Total energy', res.total_energy ? `${res.total_energy} Eh` : 'N/A'], ['HOMO', res.homo ? `${res.homo} eV` : 'N/A'], ['LUMO', res.lumo ? `${res.lumo} eV` : 'N/A'], ['Dipole', res.dipole ? `${res.dipole} D` : 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'comparison',
    label: 'Side-by-side Compound Comparison',
    description: 'Compare two compounds (enter two SMILES, one per line)',
    source: 'PubChem + in-browser', sourceType: 'database',
    handler: async ({ input }) => {
      const [s1, s2] = input.split('\n').map(s => s.trim()).filter(Boolean);
      if (!s1 || !s2) throw new Error('Enter two compounds, one per line');
      const [res1, res2] = await Promise.all([
        base44.functions.invoke('getMolecularData', { query: s1, query_type: 'smiles', compute_properties: true }),
        base44.functions.invoke('getMolecularData', { query: s2, query_type: 'smiles', compute_properties: true }),
      ]);
      const r1 = d(res1);
      const r2 = d(res2);
      return {
        source: 'PubChem + in-browser', sourceType: 'database', confidence: null,
        label: 'Compound comparison',
        data: [
          ['Compound A', s1], ['Compound B', s2],
          ['MW A vs B', `${r1.molecular_weight || '?'} vs ${r2.molecular_weight || '?'}`],
          ['LogP A vs B', `${r1.logp ?? '?'} vs ${r2.logp ?? '?'}`],
          ['TPSA A vs B', `${r1.tpsa ?? '?'} vs ${r2.tpsa ?? '?'}`],
        ],
        raw: { compound_a: r1, compound_b: r2 },
      };
    },
  },
];

const PIPELINE_STEPS = [
  { id: 'lookup', label: 'Compound Lookup', handler: TOOLS[0].handler },
  { id: 'properties', label: 'Property Computation', handler: TOOLS[1].handler },
  { id: 'gfn2xtb', label: 'GFN2-xTB Calculation', handler: TOOLS[2].handler },
  { id: 'hazard', label: 'Hazard Screening' },
];

const API_CODE = `import requests

# Look up a compound from PubChem
response = requests.post(
    "https://api.suttain.com/v1/compound",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "query": "CCO",
        "query_type": "smiles"
    }
)

data = response.json()
print(data)`;

export default function ComputationalStudioSmallMolecules() {
  const [activeMode, setActiveMode] = useState('single');
  const { user } = useContext(AuthContext);
  const isPro = user && (['pro', 'lifetime', 'pro_lifetime', 'academic'].includes(user.subscription_tier) || user.role === 'admin');

  const config = { inputTypes: INPUT_TYPES, tools: TOOLS, viewerMode: 'molecule', inputPlaceholder: 'Enter one SMILES per line' };

  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Small Molecules</h1>
              <p className="text-sm text-slate-500">PubChem and ChEMBL lookup, molecular properties, in-browser GFN2-xTB and PM7, and compound comparison</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <Studio3DViewer mode="molecule" height={300} />
        </div>

        <RunModeTabs active={activeMode} onChange={setActiveMode} />

        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter SMILES' }} isPro={isPro} />}

        <ApiCodeBlock code={API_CODE} filename="compound_lookup.py" title="Use via API" description="Query small molecules programmatically" />
      </div>
    </StudioLayout>
  );
}