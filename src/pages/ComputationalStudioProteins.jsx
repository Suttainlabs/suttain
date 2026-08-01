import React, { useState, useContext } from 'react';
import { Microscope, Download, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import RunModeTabs from '@/components/studio/RunModeTabs';
import SingleRunPanel from '@/components/studio/SingleRunPanel';
import BatchPanel from '@/components/studio/BatchPanel';
import PipelinePanel from '@/components/studio/PipelinePanel';
import ApiCodeBlock from '@/components/studio/ApiCodeBlock';
import HazardEngineApiReference from '@/components/studio/HazardEngineApiReference';
import { SourcedBadge, TrustLabel, downloadTextFile, PLDDTLegend } from '@/components/studio/StudioShared';
import { computeProteinProperties, parsePDBAtoms } from '@/components/studio/proteinUtils';
import AuthContext from '@/components/auth/AuthContext';
import { RCSBLookupPanel, AlphaFoldLookupPanel, StructurePrepPanel, ProteinIntelligencePanel } from '@/components/studio/ProteinPanels';

const INPUT_TYPES = [
  { value: 'pdb_id', label: 'PDB ID', placeholder: 'e.g. 1CRN' },
  { value: 'uniprot', label: 'UniProt ID', placeholder: 'e.g. P69905' },
  { value: 'sequence', label: 'Protein Sequence', placeholder: 'MKTAYIAKQRQISFVKSHF...' },
  { value: 'chemical', label: 'Chemical Name or SMILES', placeholder: 'e.g. bisphenol A' },
  { value: 'file', label: 'File Upload', placeholder: '' },
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
    id: 'pdb',
    label: 'RCSB PDB Explorer',
    description: 'Look up and explore structures from the RCSB Protein Data Bank with real 3D visualization',
    source: 'RCSB PDB', sourceType: 'database', category: 'Structure Lookup',
    validate: ({ input, inputType }) => {
      if (inputType !== 'pdb_id') return null;
      const id = input.trim().toUpperCase();
      if (!/^[1-9][A-Z0-9]{3}$/.test(id)) return 'PDB ID must be 4 characters, starting with a digit (e.g. 1CRN, 4HHB)';
      return null;
    },
    handler: async ({ input }) => {
      const pdbId = input.trim().toUpperCase();
      const res = d(await base44.functions.invoke('structureTools', { action: 'rcsb_lookup', pdb_id: pdbId }));
      if (res.error) throw new Error(res.error);
      const meta = res.metadata || {};
      let atoms = [];
      if (res.pdbText) atoms = parsePDBAtoms(res.pdbText);
      return {
        source: 'RCSB PDB', sourceType: 'database', confidence: null,
        label: `Structure ${pdbId} loaded from RCSB`,
        atoms, pdbText: res.pdbText || '',
        data: [
          ['PDB ID', pdbId],
          ['Title', meta.title || 'N/A'],
          ['Resolution', meta.resolution ? `${meta.resolution} A` : 'N/A'],
          ['Method', (meta.methods || []).join(', ') || 'N/A'],
          ['Organism', meta.organism || 'N/A'],
          ['Atoms loaded', atoms.length || 'See PDB file'],
        ],
        raw: { pdbId, title: meta.title, atomCount: atoms.length },
      };
    },
    renderResult: (result) => (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="border-b md:border-b-0 md:border-r border-slate-200" style={{ minHeight: 350 }}>
            {result.atoms && result.atoms.length > 0
              ? <Studio3DViewer atoms={result.atoms} height={350} />
              : <div className="flex items-center justify-center h-[350px] text-sm text-slate-400">3D structure unavailable</div>}
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SourcedBadge />
              <TrustLabel source={result.source} type={result.sourceType} />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
            <DataTable data={result.data} />
            {result.pdbText && (
              <button onClick={() => downloadTextFile(`${result.raw.pdbId}.pdb`, result.pdbText, 'chemical/x-pdb')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download PDB file
              </button>
            )}
            <a href={`https://www.rcsb.org/structure/${result.raw.pdbId}`} target="_blank" rel="noopener noreferrer"
              className="mt-2 ml-2 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> View on RCSB
            </a>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'alphafold',
    label: 'AlphaFold Structure Prediction',
    description: 'Fetch AlphaFold predicted structure from EBI by UniProt accession with per-residue confidence',
    source: 'AlphaFold EBI', sourceType: 'external', engine: 'AlphaFold', category: 'Structure Lookup',
    validate: ({ input, inputType }) => {
      if (inputType !== 'uniprot') return null;
      const id = input.trim().toUpperCase();
      if (!/^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/.test(id)) {
        return 'Enter a valid UniProt accession (e.g. P69905, P00533)';
      }
      return null;
    },
    handler: async ({ input }) => {
      const uniprotId = input.trim().toUpperCase();
      const res = d(await base44.functions.invoke('alphafoldApi', { action: 'prediction', uniprotId }));
      if (res.error) throw new Error(res.error);
      const plddt = res.globalMetricValue || res.plddt;
      const modelUrl = res.pdbUrl || res.modelUrl || `https://alphafold.ebi.ac.uk/entry/${uniprotId}/AF-${uniprotId}-F1-model_v4.pdb`;
      let atoms = [];
      let pdbText = '';
      try {
        const pdbRes = await fetch(modelUrl);
        if (pdbRes.ok) {
          pdbText = await pdbRes.text();
          atoms = parsePDBAtoms(pdbText);
        }
      } catch (e) {
        // 3D may not load due to CORS
      }
      return {
        source: 'AlphaFold EBI', sourceType: 'external',
        confidence: plddt ? Math.round(parseFloat(plddt)) : null,
        label: `AlphaFold predicted structure for ${uniprotId}`,
        atoms, pdbText, modelUrl,
        data: [
          ['UniProt ID', res.uniprotAccession || uniprotId],
          ['Description', res.uniprotDescription || 'N/A'],
          ['Gene', res.gene || 'N/A'],
          ['Global pLDDT', plddt ? `${Math.round(parseFloat(plddt))}%` : 'N/A'],
          ['Model URL', modelUrl.slice(0, 60) + '...'],
          ['Atoms loaded', atoms.length || 'See model file'],
        ],
        raw: { uniprotId, plddt, modelUrl },
      };
    },
    renderResult: (result) => (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="border-b md:border-b-0 md:border-r border-slate-200" style={{ minHeight: 350 }}>
            {result.atoms && result.atoms.length > 0
              ? <Studio3DViewer atoms={result.atoms} height={350} />
              : <div className="flex items-center justify-center h-[350px] text-sm text-slate-400">3D structure unavailable</div>}
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SourcedBadge />
              <TrustLabel source={result.source} type={result.sourceType} />
            </div>
            {result.confidence != null && (
              <div className="mb-4">
                <div className="text-xs text-slate-400 mb-1">Global confidence (pLDDT)</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${result.confidence}%`, background: 'linear-gradient(90deg, #007850, #6B3FA0)' }} />
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-700">{result.confidence}%</span>
                </div>
              </div>
            )}
            <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
            <DataTable data={result.data} />
            <PLDDTLegend />
            {result.pdbText && (
              <button onClick={() => downloadTextFile(`AF-${result.raw.uniprotId}-model.pdb`, result.pdbText, 'chemical/x-pdb')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download model (PDB)
              </button>
            )}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'binding',
    label: 'Protein-Ligand Binding Analysis',
    description: 'Analyze chemical binding interactions with 10 toxicology target proteins using AlphaFold structures',
    source: 'AlphaFold + LLM analysis', sourceType: 'external', engine: 'AlphaFold', category: 'Analysis',
    validate: ({ input }) => {
      if (!input || input.trim().length < 2) return 'Enter a chemical name or SMILES to analyze binding.';
      return null;
    },
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('proteinStructureIntelligence', { chemical: input, context: 'protein binding analysis' }));
      if (res.error) throw new Error(res.error);
      return {
        source: 'AlphaFold + LLM analysis', sourceType: 'external',
        confidence: res.overall_protein_risk_score ? Math.round(res.overall_protein_risk_score) : null,
        label: `Chemical-protein binding profile for ${res.chemical || input}`,
        data: [
          ['Chemical', res.chemical || input],
          ['Chemical class', res.chemical_class || 'N/A'],
          ['Risk level', res.risk_level || 'N/A'],
          ['Proteins analyzed', res.proteins_queried || 10],
          ['Risk score', res.overall_protein_risk_score ? `${res.overall_protein_risk_score}/100` : 'N/A'],
          ['Endocrine disruptor', res.endocrine_disruption?.is_potential_disruptor ? 'Yes' : 'No'],
          ['CYP inhibitor', res.metabolic_interaction?.cyp_enzyme_inhibitor ? 'Yes' : 'No'],
        ],
        categories: [
          ...(res.endocrine_disruption?.is_potential_disruptor ? ['endocrine_disruptor'] : []),
          ...(res.carcinogenicity?.is_potential_carcinogen ? ['carcinogen_suspect'] : []),
        ],
        raw: res,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        {result.confidence != null && (
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-1">Overall protein risk score</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${result.confidence}%`, background: 'linear-gradient(90deg, #D4900A, #C42B2B)' }} />
              </div>
              <span className="font-mono font-bold text-sm text-slate-700">{result.confidence}/100</span>
            </div>
          </div>
        )}
        <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
        <DataTable data={result.data} />
        {result.raw?.protein_interactions && result.raw.protein_interactions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-2">Protein interactions</div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {result.raw.protein_interactions.map((pi, i) => (
                <div key={i} className="text-xs flex items-start gap-2 p-2 bg-slate-50 rounded">
                  <span className="font-mono font-bold text-slate-700 flex-shrink-0">{pi.gene}</span>
                  <div>
                    <span className="text-slate-600">{pi.binding_probability}</span>
                    {pi.interaction_type && <span className="text-slate-400"> - {pi.interaction_type}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ResultShell>
    ),
  },
  {
    id: 'properties',
    label: 'Developability Properties',
    description: 'Compute real physicochemical properties from an amino acid sequence (in-browser, no API needed)',
    source: 'Computed in-browser', sourceType: 'computed', category: 'Analysis',
    validate: ({ input }) => {
      if (!input || input.trim().length < 5) return 'Enter a protein sequence of at least 5 amino acids.';
      const seq = input.trim().toUpperCase();
      const valid = seq.split('').filter(a => 'ARNDCQEGHILKMFPSTWYV'.includes(a));
      if (valid.length < seq.length * 0.8) return 'Sequence contains too many unrecognized characters. Use single-letter amino acid codes.';
      return null;
    },
    handler: async ({ input }) => {
      const seq = input.trim().toUpperCase();
      const props = computeProteinProperties(seq);
      const compositionEntries = Object.entries(props.composition)
        .sort((a, b) => b[1] - a[1])
        .map(([aa, count]) => [aa, `${count} (${((count / props.length) * 100).toFixed(1)}%)`]);
      return {
        source: 'Computed in-browser', sourceType: 'computed', confidence: null,
        label: 'Protein developability properties computed',
        data: [
          ['Sequence length', `${props.length} residues`],
          ['Valid amino acids', `${props.validAAs} / ${props.length}`],
          ['Molecular weight', `${props.molecularWeight.toFixed(1)} Da`],
          ['Theoretical pI', props.pI.toFixed(2)],
          ['GRAVY hydrophobicity', props.gravy.toFixed(3)],
          ['Instability index', `${props.instabilityIndex.toFixed(1)} ${props.instabilityIndex > 40 ? '(unstable)' : '(stable)'}`],
          ['Aromatic residues', `${props.aromaticCount} (${(props.aromaticity * 100).toFixed(1)}%)`],
          ['Cysteines', props.cysteineCount],
          ['Prolines', props.prolineCount],
        ],
        composition: compositionEntries,
        raw: props,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
        <DataTable data={result.data} />
        {result.composition && result.composition.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-2">Amino acid composition</div>
            <div className="grid grid-cols-5 gap-2">
              {result.composition.slice(0, 20).map(([aa, info]) => {
                const count = parseInt(info);
                const pct = parseFloat(info.match(/[\d.]+/g)?.[1] || '0');
                const barHeight = Math.max(4, Math.min(60, pct * 4));
                return (
                  <div key={aa} className="flex flex-col items-center gap-1">
                    <div className="h-16 flex items-end">
                      <div className="w-4 rounded-t" style={{ height: barHeight, background: 'linear-gradient(180deg, #6B3FA0, #007850)' }} />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700">{aa}</span>
                    <span className="text-[10px] text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ResultShell>
    ),
  },
];

const PIPELINE_STEPS = [
  { id: 'pdb', label: 'RCSB PDB Lookup', handler: TOOLS[0].handler },
  { id: 'alphafold', label: 'AlphaFold Prediction', handler: TOOLS[1].handler },
  { id: 'binding', label: 'Binding Profile', handler: TOOLS[2].handler },
  { id: 'properties', label: 'Developability Properties', handler: TOOLS[3].handler },
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
              <p className="text-sm text-slate-500">AlphaFold prediction, RCSB PDB exploration, binding analysis, and developability properties</p>
            </div>
          </div>
          <SourcedBadge />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6"><Studio3DViewer mode="protein" height={300} /></div>
        <RunModeTabs active={activeMode} onChange={setActiveMode} />
        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter PDB ID or UniProt ID' }} isPro={isPro} />}

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Structure Lookup and Prep Tools</h2>
          <p className="text-sm text-slate-500 mb-4">Query RCSB PDB and AlphaFold DB, run structure preparation utilities, and analyze protein-chemical interactions. Full source transparency.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <RCSBLookupPanel />
            <AlphaFoldLookupPanel />
          </div>
          <div className="mt-4">
            <StructurePrepPanel />
          </div>
          <div className="mt-4">
            <ProteinIntelligencePanel />
          </div>
        </div>

        <ApiCodeBlock code={API_CODE} filename="protein_lookup.py" title="Use via API" description="Query protein structures programmatically" />

        <div className="border-t border-slate-200 pt-6">
          <HazardEngineApiReference />
        </div>
      </div>
    </StudioLayout>
  );
}