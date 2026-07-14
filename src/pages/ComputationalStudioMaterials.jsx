import React, { useState, useContext } from 'react';
import { Boxes } from 'lucide-react';
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
  { value: 'formula', label: 'Chemical Formula', placeholder: 'e.g. Fe2O3' },
  { value: 'mp_id', label: 'Materials Project ID', placeholder: 'e.g. mp-1010' },
  { value: 'smiles', label: 'SMILES (molecular)', placeholder: 'e.g. CCO' },
  { value: 'file', label: 'CIF File Upload', placeholder: '' },
];

const d = r => r?.data?.data || r?.data || r;

const TOOLS = [
  {
    id: 'structure',
    label: 'Structure Building (ASE and pymatgen)',
    description: 'Build crystal and molecular structures using ASE and pymatgen',
    source: 'In-browser ASE and pymatgen', sourceType: 'computed',
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('generateSimulationInputs', { query: input, query_type: inputType, action: 'build' }));
      return {
        source: 'In-browser ASE and pymatgen', sourceType: 'computed', confidence: null,
        label: 'Structure built',
        data: [['Formula', res.formula || input], ['Space group', res.space_group || 'N/A'], ['Atoms', res.atom_count || 'N/A'], ['Volume', res.volume ? `${res.volume} A^3` : 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'mp_props',
    label: 'Materials Project Properties',
    description: 'Query the Materials Project database for computed material properties',
    source: 'Materials Project', sourceType: 'database',
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('materialsSearch', { formula: input }));
      return {
        source: 'Materials Project', sourceType: 'database', confidence: null,
        label: 'Material properties retrieved',
        data: [['Formula', res.formula || input], ['Band gap', res.band_gap ? `${res.band_gap} eV` : 'N/A'], ['Density', res.density ? `${res.density} g/cm^3` : 'N/A'], ['Formation energy', res.formation_energy_per_atom ? `${res.formation_energy_per_atom} eV/atom` : 'N/A']],
        raw: res,
      };
    },
  },
  {
    id: 'lammps',
    label: 'LAMMPS Input File Generation',
    description: 'Generate LAMMPS input files for external execution on your own infrastructure',
    source: 'External input file (LAMMPS)', sourceType: 'external', engine: 'LAMMPS',
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('generateSimulationInputs', { query: input, query_type: inputType, engine: 'LAMMPS' }));
      return {
        source: 'External input file (LAMMPS)', sourceType: 'external', confidence: null,
        label: 'LAMMPS input file generated',
        data: [['Engine', 'LAMMPS'], ['File format', res.file_format || 'LAMMPS data + in'], ['Atoms', res.atom_count || 'N/A'], ['Notes', 'Run on your own HPC or workstation']],
        raw: res,
      };
    },
  },
  {
    id: 'qe',
    label: 'Quantum ESPRESSO Input File Generation',
    description: 'Generate Quantum ESPRESSO input files for external DFT execution',
    source: 'External input file (QE)', sourceType: 'external', engine: 'Quantum ESPRESSO',
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('generateSimulationInputs', { query: input, query_type: inputType, engine: 'Quantum ESPRESSO' }));
      return {
        source: 'External input file (QE)', sourceType: 'external', confidence: null,
        label: 'Quantum ESPRESSO input file generated',
        data: [['Engine', 'Quantum ESPRESSO'], ['File format', res.file_format || 'QE .pwi'], ['Pseudopotentials', res.pseudopotentials || 'N/A'], ['Notes', 'Run on your own HPC or workstation']],
        raw: res,
      };
    },
  },
  {
    id: 'gromacs',
    label: 'GROMACS Input File Generation',
    description: 'Generate GROMACS input files for external molecular dynamics execution',
    source: 'External input file (GROMACS)', sourceType: 'external', engine: 'GROMACS',
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('generateSimulationInputs', { query: input, query_type: inputType, engine: 'GROMACS' }));
      return {
        source: 'External input file (GROMACS)', sourceType: 'external', confidence: null,
        label: 'GROMACS input file generated',
        data: [['Engine', 'GROMACS'], ['File format', res.file_format || 'GROMACS .gro + .top'], ['Forcefield', res.forcefield || 'N/A'], ['Notes', 'Run on your own HPC or workstation']],
        raw: res,
      };
    },
  },
];

const PIPELINE_STEPS = [
  { id: 'build', label: 'Structure Build', handler: TOOLS[0].handler },
  { id: 'props', label: 'Property Query', handler: TOOLS[1].handler },
  { id: 'lammps', label: 'LAMMPS Input', handler: TOOLS[2].handler },
  { id: 'qe', label: 'QE Input', handler: TOOLS[3].handler },
  { id: 'gromacs', label: 'GROMACS Input', handler: TOOLS[4].handler },
];

const API_CODE = `import requests

# Query a material from the Materials Project
response = requests.post(
    "https://api.suttain.com/v1/compound",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "query": "Fe2O3",
        "query_type": "formula"
    }
)

data = response.json()
print(data)`;

export default function ComputationalStudioMaterials() {
  const [activeMode, setActiveMode] = useState('single');
  const { user } = useContext(AuthContext);
  const isPro = user && (['pro', 'lifetime', 'pro_lifetime', 'academic'].includes(user.subscription_tier) || user.role === 'admin');

  const config = { inputTypes: INPUT_TYPES, tools: TOOLS, viewerMode: 'crystal', inputPlaceholder: 'Enter one formula or Materials Project ID per line' };

  return (
    <StudioLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Materials</h1>
              <p className="text-sm text-slate-500">Structure building, Materials Project properties, and input file generation for LAMMPS, Quantum ESPRESSO, and GROMACS</p>
            </div>
          </div>
          <SourcedBadge />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <Studio3DViewer mode="crystal" height={300} />
        </div>

        <RunModeTabs active={activeMode} onChange={setActiveMode} />

        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter formula or Materials Project ID' }} isPro={isPro} />}

        <ApiCodeBlock code={API_CODE} filename="materials_query.py" title="Use via API" description="Query materials programmatically" />
      </div>
    </StudioLayout>
  );
}