import React, { useState, useContext } from 'react';
import { Microscope } from 'lucide-react';
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
  { value: 'sequence', label: 'Protein Sequence', placeholder: 'MKTAYIAKQRQISFVKSHF...' },
  { value: 'uniprot', label: 'UniProt ID', placeholder: 'e.g. P00533' },
  { value: 'pdb_id', label: 'PDB ID', placeholder: 'e.g. 1CRN' },
  { value: 'file', label: 'File Upload', placeholder: '' },
];

const d = r => r?.data?.data || r?.data || r;

const TOOLS = [
  {
    id: 'alphafold',
    label: 'AlphaFold Structure Prediction',
    description: 'Predict 3D protein structure from sequence via EBI AlphaFold',
    source: 'AlphaFold EBI',
    sourceType: 'external',
    engine: 'AlphaFold',
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('alphafoldApi', {
        sequence: inputType === 'sequence' ? input : undefined,
        uniprot_id: inputType === 'uniprot' ? input : undefined,
      }));
      return {
        source: 'AlphaFold EBI', sourceType: 'external',
        confidence: res.plddt ? Math.round(parseFloat(res.plddt)) : (res.confidence ? Math.round(parseFloat(res.confidence)) : null),
        label: 'Predicted protein structure',
        data: [['Method', 'AlphaFold 4'], ['pLDDT', res.plddt ? `${res.plddt}%` : 'N/A'], ['Residues', res.sequence_length || res.residue_count || 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'pdb',
    label: 'RCSB PDB Explorer',
    description: 'Look up and explore structures from the RCSB Protein Data Bank',
    source: 'RCSB PDB', sourceType: 'database',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('structureTools', { pdb_id: input, action: 'lookup' }));
      return {
        source: 'RCSB PDB', sourceType: 'database', confidence: null,
        label: 'PDB structure retrieved',
        data: [['PDB ID', input], ['Title', res.title || res.structure?.title || 'N/A'], ['Resolution', res.resolution ? `${res.resolution} A` : 'N/A'], ['Method', res.method || res.experimental_method || 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'binding',
    label: 'Protein-Ligand Binding Analysis',
    description: 'Analyze binding sites and ligand interactions',
    source: 'In-browser analysis', sourceType: 'computed',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('structureTools', { pdb_id: input, action: 'binding_analysis' }));
      return {
        source: 'In-browser analysis', sourceType: 'computed',
        confidence: res.binding_confidence ? Math.round(parseFloat(res.binding_confidence) * 100) : null,
        label: 'Binding analysis complete',
        data: [['Binding sites', res.binding_sites || res.sites || 'N/A'], ['Ligands', res.ligands || 'N/A'], ['Interactions', res.interactions || 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'developability',
    label: 'Developability Properties',
    description: 'Assess developability metrics including aggregation liability and stability',
    source: 'In-browser computation', sourceType: 'computed',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('proteinStructureIntelligence', { sequence: input, analysis_type: 'developability' }));
      return {
        source: 'In-browser computation', sourceType: 'computed', confidence: null,
        label: 'Developability assessment',
        data: [['Sequence length', res.sequence_length || input.length], ['Molecular weight', res.molecular_weight ? `${res.molecular_weight} Da` : 'N/A'], ['pI', res.pI || res.isoelectric_point || 'N/A'], ['Aggregation liability', res.aggregation_liability || 'N/A']],
        raw: res,
      };
    },
  },
];

const PIPELINE_STEPS = [
  { id: 'lookup', label: 'PDB Lookup', handler: TOOLS[1].handler },
  { id: 'predict', label: 'AlphaFold Prediction', handler: TOOLS[0].handler },
  { id: 'binding', label: 'Binding Analysis', handler: TOOLS[2].handler },
  { id: 'developability', label: 'Developability', handler: TOOLS[3].handler },
];

const API_CODE = `import requests

# Look up a protein structure from RCSB PDB
response = requests.post(
    "https://api.suttain.com/v1/compound",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "query": "1CRN",
        "query_type": "pdb_id"
    }
)

data = response.json()
print(data)`;

export default function ComputationalStudioProteins() {
  const [activeMode, setActiveMode] = useState('single');
  const { user } = useContext(AuthContext);
  const isPro = user && (['pro', 'lifetime', 'pro_lifetime', 'academic'].includes(user.subscription_tier) || user.role === 'admin');

  const config = { inputTypes: INPUT_TYPES, tools: TOOLS, viewerMode: 'protein', inputPlaceholder: 'Enter one UniProt ID or PDB ID per line' };

  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Proteins</h1>
              <p className="text-sm text-slate-500">AlphaFold prediction, RCSB PDB exploration, binding analysis, and developability</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <Studio3DViewer mode="protein" height={300} />
        </div>

        <RunModeTabs active={activeMode} onChange={setActiveMode} />

        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter PDB ID or UniProt ID' }} isPro={isPro} />}

        <ApiCodeBlock code={API_CODE} filename="protein_lookup.py" title="Use via API" description="Query protein structures programmatically" />
      </div>
    </StudioLayout>
  );
}