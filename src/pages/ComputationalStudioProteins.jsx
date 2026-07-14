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
  { value: 'chemical', label: 'Chemical Name or SMILES', placeholder: 'e.g. bisphenol A' },
  { value: 'file', label: 'File Upload', placeholder: '' },
];

const d = r => r?.data?.data || r?.data || r;

const TOOLS = [
  {
    id: 'alphafold',
    label: 'AlphaFold Structure Prediction',
    description: 'Fetch AlphaFold predicted structure from EBI by UniProt accession',
    source: 'AlphaFold EBI',
    sourceType: 'external',
    engine: 'AlphaFold',
    handler: async ({ input, inputType }) => {
      const uniprotId = inputType === 'uniprot' ? input.trim() : input.trim();
      const res = d(await base44.functions.invoke('alphafoldApi', { action: 'prediction', uniprotId }));
      if (res.error) throw new Error(res.error);
      const plddt = res.globalMetricValue || res.plddt;
      return {
        source: 'AlphaFold EBI', sourceType: 'external',
        confidence: plddt ? Math.round(parseFloat(plddt)) : null,
        label: 'Predicted protein structure',
        data: [
          ['UniProt ID', res.uniprotAccession || uniprotId],
          ['Gene', res.gene || 'N/A'],
          ['Description', res.uniprotDescription || 'N/A'],
          ['pLDDT', plddt ? `${Math.round(parseFloat(plddt))}%` : 'N/A'],
          ['Model', res.modelEntityId || 'N/A'],
        ],
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
      const pdbId = input.trim().toUpperCase();
      const response = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`);
      if (!response.ok) throw new Error(`PDB lookup failed: ${response.status}. Check the PDB ID.`);
      const data = await response.json();
      return {
        source: 'RCSB PDB', sourceType: 'database', confidence: null,
        label: 'PDB structure retrieved',
        data: [
          ['PDB ID', data.rcsb_id || pdbId],
          ['Title', data.struct?.title || 'N/A'],
          ['Resolution', data.rcsb_entry_info?.resolution_combined?.[0] ? `${data.rcsb_entry_info.resolution_combined[0]} A` : 'N/A'],
          ['Method', (data.rcsb_entry_info?.experimental_method || []).join(', ') || 'N/A'],
          ['Organism', data.rcsb_entry_info?.source_organism_taxonomy_names?.[0] || 'N/A'],
        ],
        raw: data,
      };
    },
  },
  {
    id: 'binding',
    label: 'Chemical-Protein Binding Profile',
    description: 'Analyze a chemical binding interactions with 10 toxicology target proteins using AlphaFold structures',
    source: 'AlphaFold + LLM analysis', sourceType: 'external',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('proteinStructureIntelligence', { chemical: input, context: 'protein binding analysis' }));
      if (res.error) throw new Error(res.error);
      return {
        source: 'AlphaFold + LLM analysis', sourceType: 'external',
        confidence: res.overall_protein_risk_score ? Math.round(res.overall_protein_risk_score) : null,
        label: 'Chemical-protein binding profile',
        data: [
          ['Chemical', res.chemical || input],
          ['Risk level', res.risk_level || 'N/A'],
          ['Proteins analyzed', res.proteins_queried || 10],
          ['Risk score', res.overall_protein_risk_score ? `${res.overall_protein_risk_score}/100` : 'N/A'],
        ],
        raw: res,
      };
    },
  },
  {
    id: 'properties',
    label: 'Protein Properties',
    description: 'Compute physicochemical properties from an amino acid sequence (in-browser)',
    source: 'In-browser computation', sourceType: 'computed',
    handler: async ({ input }) => {
      const seq = input.trim().toUpperCase();
      const aaW = { A:71.08,R:156.19,N:114.10,D:115.09,C:103.14,E:129.12,Q:128.13,G:57.05,H:137.14,I:113.16,L:113.16,K:128.17,M:131.19,F:147.18,P:97.12,S:87.08,T:101.10,W:186.21,Y:163.18,V:99.13 };
      const kd = { A:1.8,R:-4.5,N:-3.5,D:-3.5,C:2.5,E:-3.5,Q:-3.5,G:-0.4,H:-3.2,I:4.5,L:3.8,K:-3.9,M:1.9,F:2.8,P:-1.6,S:-0.8,T:-0.7,W:-0.9,Y:-1.3,V:4.2 };
      let mw = 18.02, gravy = 0, cnt = 0;
      const counts = {};
      for (const aa of seq) {
        if (aaW[aa]) { mw += aaW[aa]; counts[aa] = (counts[aa]||0)+1; }
        if (kd[aa] !== undefined) { gravy += kd[aa]; cnt++; }
      }
      return {
        source: 'In-browser computation', sourceType: 'computed', confidence: null,
        label: 'Protein properties computed',
        data: [
          ['Sequence length', `${seq.length} residues`],
          ['Molecular weight', `${mw.toFixed(1)} Da`],
          ['GRAVY score', cnt > 0 ? (gravy/cnt).toFixed(2) : 'N/A'],
          ['Aromatic residues', `${(counts.F||0)+(counts.W||0)+(counts.Y||0)}`],
          ['Cysteines', counts.C || 0],
          ['Prolines', counts.P || 0],
        ],
        raw: { sequence_length: seq.length, molecular_weight: mw, gravy: cnt > 0 ? gravy/cnt : null },
      };
    },
  },
];

const PIPELINE_STEPS = [
  { id: 'lookup', label: 'RCSB PDB Lookup', handler: TOOLS[1].handler },
  { id: 'predict', label: 'AlphaFold Prediction', handler: TOOLS[0].handler },
  { id: 'binding', label: 'Binding Profile', handler: TOOLS[2].handler },
  { id: 'properties', label: 'Protein Properties', handler: TOOLS[3].handler },
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
              <p className="text-sm text-slate-500">AlphaFold prediction, RCSB PDB exploration, binding analysis, and protein properties</p>
            </div>
          </div>
          <SourcedBadge />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6"><Studio3DViewer mode="protein" height={300} /></div>
        <RunModeTabs active={activeMode} onChange={setActiveMode} />
        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter PDB ID or UniProt ID' }} isPro={isPro} />}
        <ApiCodeBlock code={API_CODE} filename="protein_lookup.py" title="Use via API" description="Query protein structures programmatically" />
      </div>
    </StudioLayout>
  );
}