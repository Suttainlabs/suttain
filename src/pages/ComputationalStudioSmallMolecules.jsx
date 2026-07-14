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

function pubchemUrl(input, inputType, endpoint) {
  const enc = encodeURIComponent(input.trim());
  if (endpoint === 'properties') {
    const props = 'MolecularWeight,XLogP,HBondDonorCount,HBondAcceptorCount,TPSA,RotatableBondCount';
    if (inputType === 'smiles') return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${enc}/property/${props}/JSON`;
    if (inputType === 'name') return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/property/${props}/JSON`;
    if (inputType === 'cid') return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${enc}/property/${props}/JSON`;
    return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/property/${props}/JSON`;
  }
  if (inputType === 'smiles') return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${enc}/JSON`;
  if (inputType === 'cid') return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${enc}/JSON`;
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${enc}/JSON`;
}

const TOOLS = [
  {
    id: 'lookup',
    label: 'PubChem and ChEMBL Lookup',
    description: 'Search PubChem for compound identity, synonyms, and structural data',
    source: 'PubChem', sourceType: 'database',
    handler: async ({ input, inputType }) => {
      const response = await fetch(pubchemUrl(input, inputType, 'full'));
      if (!response.ok) throw new Error(`PubChem lookup failed: ${response.status}`);
      const data = await response.json();
      const compound = data?.PC_Compounds?.[0];
      if (!compound) throw new Error('No compound found');
      const props = compound.props || [];
      const getProp = label => props.find(p => p.urn?.label === label)?.value;
      return {
        source: 'PubChem', sourceType: 'database', confidence: null,
        label: 'Compound identified',
        data: [
          ['CID', compound.id?.id?.cid || 'N/A'],
          ['Molecular formula', getProp('Molecular Formula')?.sval || 'N/A'],
          ['Molecular weight', getProp('Molecular Weight')?.fval || 'N/A'],
          ['IUPAC name', (getProp('IUPAC Name')?.sval || 'N/A').slice(0, 60)],
          ['XLogP', getProp('XLogP')?.fval || 'N/A'],
        ],
        raw: data,
      };
    },
  },
  {
    id: 'properties',
    label: 'Molecular Properties and Descriptors',
    description: 'Compute physicochemical properties and drug-likeness descriptors from PubChem',
    source: 'PubChem', sourceType: 'database',
    handler: async ({ input, inputType }) => {
      const response = await fetch(pubchemUrl(input, inputType, 'properties'));
      if (!response.ok) throw new Error(`PubChem properties failed: ${response.status}`);
      const data = await response.json();
      const p = data?.PropertyTable?.Properties?.[0];
      if (!p) throw new Error('No properties found');
      return {
        source: 'PubChem', sourceType: 'database', confidence: null,
        label: 'Molecular properties retrieved',
        data: [
          ['CID', p.CID || 'N/A'],
          ['MW', `${p.MolecularWeight || 'N/A'} g/mol`],
          ['XLogP', p.XLogP ?? 'N/A'],
          ['HBD', p.HBondDonorCount ?? 'N/A'],
          ['HBA', p.HBondAcceptorCount ?? 'N/A'],
          ['TPSA', p.TPSA ? `${p.TPSA} A^2` : 'N/A'],
          ['Rotatable bonds', p.RotatableBondCount ?? 'N/A'],
        ],
        raw: p,
      };
    },
  },
  {
    id: 'gfn2xtb',
    label: 'GFN2-xTB and PM7 Calculations',
    description: 'Run semi-empirical quantum chemistry calculations (GFN2-xTB, PM7)',
    source: 'In-browser GFN2-xTB', sourceType: 'computed', engine: 'GFN2-xTB',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('quantumChemistry', { molecule: input, method: 'gfn2xtb' }));
      if (res.error) throw new Error(res.error);
      return {
        source: 'In-browser GFN2-xTB', sourceType: 'computed',
        confidence: res.confidence === 'high' ? 90 : (res.confidence === 'medium' ? 70 : 50),
        label: 'Quantum chemistry calculation complete',
        data: [
          ['Method', res.method_label || 'GFN2-xTB'],
          ['Ground state energy', res.ground_state_energy ? `${res.ground_state_energy} ${res.energy_unit || 'Eh'}` : 'N/A'],
          ['Energy (eV)', res.energy_ev ? `${res.energy_ev} eV` : 'N/A'],
          ['Ansatz', res.ansatz || 'N/A'],
          ['Basis set', res.basis_set || 'N/A'],
          ['Qubits', res.n_qubits || 'N/A'],
          ['Mode', res.mode || 'N/A'],
        ],
        raw: res,
      };
    },
  },
  {
    id: 'comparison',
    label: 'Side-by-side Compound Comparison',
    description: 'Compare two compounds (enter two SMILES or names, one per line)',
    source: 'PubChem + in-browser', sourceType: 'database',
    handler: async ({ input, inputType }) => {
      const [s1, s2] = input.split('\n').map(s => s.trim()).filter(Boolean);
      if (!s1 || !s2) throw new Error('Enter two compounds, one per line');
      const [r1, r2] = await Promise.all([
        fetch(pubchemUrl(s1, inputType, 'properties')).then(r => r.json()),
        fetch(pubchemUrl(s2, inputType, 'properties')).then(r => r.json()),
      ]);
      const p1 = r1?.PropertyTable?.Properties?.[0] || {};
      const p2 = r2?.PropertyTable?.Properties?.[0] || {};
      return {
        source: 'PubChem + in-browser', sourceType: 'database', confidence: null,
        label: 'Compound comparison',
        data: [
          ['CID A vs B', `${p1.CID || '?'} vs ${p2.CID || '?'}`],
          ['MW A vs B', `${p1.MolecularWeight || '?'} vs ${p2.MolecularWeight || '?'}`],
          ['XLogP A vs B', `${p1.XLogP ?? '?'} vs ${p2.XLogP ?? '?'}`],
          ['HBD A vs B', `${p1.HBondDonorCount ?? '?'} vs ${p2.HBondDonorCount ?? '?'}`],
          ['HBA A vs B', `${p1.HBondAcceptorCount ?? '?'} vs ${p2.HBondAcceptorCount ?? '?'}`],
          ['TPSA A vs B', `${p1.TPSA ?? '?'} vs ${p2.TPSA ?? '?'}`],
        ],
        raw: { compound_a: p1, compound_b: p2 },
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
  const config = { inputTypes: INPUT_TYPES, tools: TOOLS, viewerMode: 'molecule', inputPlaceholder: 'Enter one SMILES or compound name per line' };

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
              <p className="text-sm text-slate-500">PubChem lookup, molecular properties, in-browser GFN2-xTB and PM7, and compound comparison</p>
            </div>
          </div>
          <SourcedBadge />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6"><Studio3DViewer mode="molecule" height={300} /></div>
        <RunModeTabs active={activeMode} onChange={setActiveMode} />
        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter SMILES' }} isPro={isPro} />}
        <ApiCodeBlock code={API_CODE} filename="compound_lookup.py" title="Use via API" description="Query small molecules programmatically" />
      </div>
    </StudioLayout>
  );
}