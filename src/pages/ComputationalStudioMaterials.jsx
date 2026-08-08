import React, { useState, useContext } from 'react';
import { Boxes, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StudioLayout from '@/components/studio/StudioLayout';
import Studio3DViewer from '@/components/studio/Studio3DViewer';
import RunModeTabs from '@/components/studio/RunModeTabs';
import SingleRunPanel from '@/components/studio/SingleRunPanel';
import BatchPanel from '@/components/studio/BatchPanel';
import PipelinePanel from '@/components/studio/PipelinePanel';
import { SourcedBadge, TrustLabel, downloadTextFile } from '@/components/studio/StudioShared';
import AuthContext from '@/components/auth/AuthContext';
import { EngineInputPanel } from '@/components/studio/SmallMoleculePanels';
import MaterialsSearchPanel from '@/components/studio/MaterialsSearchPanel';

const INPUT_TYPES = [
  { value: 'formula', label: 'Chemical Formula', placeholder: 'e.g. Fe2O3 or Si' },
  { value: 'mp_id', label: 'Materials Project ID', placeholder: 'e.g. mp-1010' },
  { value: 'smiles', label: 'SMILES (molecular)', placeholder: 'e.g. CCO' },
  { value: 'file', label: 'CIF File Upload', placeholder: '' },
];

const d = r => r?.data?.data || r?.data || r;

function parseElements(formula) {
  const matches = formula.match(/[A-Z][a-z]?/g);
  return [...new Set(matches || [])];
}

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
    id: 'structure',
    label: 'Crystal Structure Builder',
    description: 'Build crystal structures from formula and lattice parameters using ASE-compatible tools',
    source: 'In-browser ASE and pymatgen', sourceType: 'computed',
    validate: ({ input }) => {
      if (!input || input.trim().length < 1) return 'Enter a chemical formula (e.g. Fe2O3, Si, NaCl).';
      return null;
    },
    handler: async ({ input }) => {
      const elements = parseElements(input);
      const structureType = elements.length >= 2 ? 'nacl' : 'diamond';
      const res = d(await base44.functions.invoke('structureTools', {
        action: 'build',
        build_params: { structure_type: structureType, lattice_constant: 5.43, elements },
      }));
      if (res.error) throw new Error(res.error);
      const atoms = (res.structure?.atoms || []).map(a => ({
        element: a.element,
        position: a.position,
      }));
      return {
        source: 'In-browser ASE and pymatgen', sourceType: 'computed', confidence: null,
        label: `${structureType} structure built for ${res.formula || input}`,
        atoms,
        data: [
          ['Formula', res.formula || input],
          ['Structure type', structureType],
          ['Atoms', atoms.length],
          ['Lattice', res.structure?.lattice?.a ? `${res.structure.lattice.a} A` : 'N/A'],
          ['Source', res.source || 'Built'],
        ],
        raw: res,
      };
    },
    renderResult: (result) => (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="border-b md:border-b-0 md:border-r border-slate-200" style={{ minHeight: 350 }}>
            {result.atoms && result.atoms.length > 0
              ? <Studio3DViewer atoms={result.atoms} height={350} />
              : <Studio3DViewer mode="crystal" height={350} />}
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SourcedBadge />
              <TrustLabel source={result.source} type={result.sourceType} />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
            <DataTable data={result.data} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'mp_props',
    label: 'Materials Search',
    description: 'Search the Crystallography Open Database (COD) and OPTIMADE providers for material structures',
    source: 'COD (OPTIMADE)', sourceType: 'database',
    validate: ({ input }) => {
      if (!input || input.trim().length < 1) return 'Enter a chemical formula (e.g. Fe2O3, SiO2).';
      return null;
    },
    handler: async ({ input }) => {
      const res = d(await base44.functions.invoke('materialsSearch', { formula: input }));
      if (res.error) throw new Error(res.error);
      const result = res.results?.[0];
      if (!result) throw new Error('No materials found for this formula. Try a different formula.');
      return {
        source: result.source || 'COD (OPTIMADE)', sourceType: 'database', confidence: null,
        label: `Material found: ${result.formula || input}`,
        data: [
          ['Formula', result.formula || input],
          ['Material ID', result.material_id || 'N/A'],
          ['Source', result.source || 'N/A'],
          ['Elements', (result.elements || []).join(', ') || 'N/A'],
          ['Band gap', result.band_gap != null ? `${result.band_gap} eV` : 'N/A'],
          ['Density', result.density != null ? `${result.density} g/cm3` : 'N/A'],
          ['Crystal system', result.crystal_system || 'N/A'],
          ['Description', result.plain_language || 'N/A'],
        ],
        raw: res,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
        <DataTable data={result.data} />
        {result.raw?.results?.length > 1 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 mb-2">All results ({result.raw.results.length})</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.raw.results.slice(0, 10).map((r, i) => (
                <div key={i} className="text-xs flex items-center gap-2 p-2 bg-slate-50 rounded">
                  <span className="font-mono text-slate-700">{r.formula}</span>
                  <span className="text-slate-400">{r.source}</span>
                  {r.band_gap != null && <span className="text-slate-400">band gap: {r.band_gap} eV</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </ResultShell>
    ),
  },
  {
    id: 'lammps',
    label: 'LAMMPS Input File Generation',
    description: 'Generate LAMMPS input files for external molecular dynamics execution',
    source: 'External input file (LAMMPS)', sourceType: 'external', engine: 'LAMMPS',
    validate: ({ input }) => {
      if (!input || input.trim().length < 1) return 'Enter a formula or material description.';
      return null;
    },
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('generateSimulationInputs', {
        sim_type: 'molecular_dynamics',
        engine: 'LAMMPS',
        inputs: { system: input, temperature: 300 },
        environmental_params: { temperature: 300 },
      }));
      if (res.error) throw new Error(res.error);
      const file = res.files?.[0];
      if (!file) throw new Error('No input file generated.');
      return {
        source: 'External input file (LAMMPS)', sourceType: 'external', confidence: null,
        label: 'LAMMPS input file generated for external execution',
        data: [
          ['Engine', 'LAMMPS'],
          ['File', file.filename],
          ['Description', file.description || 'N/A'],
          ['Run command', 'lmp -in lammps.in'],
          ['Note', 'This is an input file for external execution, not a computed result'],
        ],
        files: res.files,
        raw: res,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-700 font-semibold">
            Input file for external execution. Run on your own infrastructure with LAMMPS installed.
          </p>
        </div>
        <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
        <DataTable data={result.data} />
        <div className="mt-4 space-y-2">
          {result.files?.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-mono text-xs font-bold text-slate-700">{file.filename}</span>
              <button onClick={() => downloadTextFile(file.filename, file.content)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          ))}
        </div>
        {result.files?.[0]?.content && (
          <details className="mt-3">
            <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">Preview input file</summary>
            <pre className="mt-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto max-h-48">{result.files[0].content}</pre>
          </details>
        )}
      </ResultShell>
    ),
  },
  {
    id: 'qe',
    label: 'Quantum ESPRESSO Input File Generation',
    description: 'Generate Quantum ESPRESSO input files for external DFT execution',
    source: 'External input file (QE)', sourceType: 'external', engine: 'Quantum ESPRESSO',
    validate: ({ input }) => {
      if (!input || input.trim().length < 1) return 'Enter a formula or material description.';
      return null;
    },
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('generateSimulationInputs', {
        sim_type: 'dft',
        engine: 'Quantum ESPRESSO',
        inputs: { material: input, functional: 'PBE', property: 'Band gap' },
        environmental_params: {},
      }));
      if (res.error) throw new Error(res.error);
      const file = res.files?.[0];
      if (!file) throw new Error('No input file generated.');
      return {
        source: 'External input file (QE)', sourceType: 'external', confidence: null,
        label: 'Quantum ESPRESSO input file generated for external execution',
        data: [
          ['Engine', 'Quantum ESPRESSO'],
          ['File', file.filename],
          ['Description', file.description || 'N/A'],
          ['Run command', 'pw.x < qe_input.in > qe_output.out'],
          ['Note', 'This is an input file for external execution, not a computed result'],
        ],
        files: res.files,
        raw: res,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-700 font-semibold">
            Input file for external execution. Run on your own infrastructure with Quantum ESPRESSO installed.
          </p>
        </div>
        <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
        <DataTable data={result.data} />
        <div className="mt-4 space-y-2">
          {result.files?.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-mono text-xs font-bold text-slate-700">{file.filename}</span>
              <button onClick={() => downloadTextFile(file.filename, file.content)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          ))}
        </div>
        {result.files?.[0]?.content && (
          <details className="mt-3">
            <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">Preview input file</summary>
            <pre className="mt-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto max-h-48">{result.files[0].content}</pre>
          </details>
        )}
      </ResultShell>
    ),
  },
  {
    id: 'gromacs',
    label: 'GROMACS Input File Generation',
    description: 'Generate GROMACS input files for external molecular dynamics execution',
    source: 'External input file (GROMACS)', sourceType: 'external', engine: 'GROMACS',
    validate: ({ input }) => {
      if (!input || input.trim().length < 1) return 'Enter a system description (e.g. Protein in water).';
      return null;
    },
    handler: async ({ input, inputType }) => {
      const res = d(await base44.functions.invoke('generateSimulationInputs', {
        sim_type: 'molecular_dynamics',
        engine: 'GROMACS',
        inputs: { system: input, force_field: 'AMBER99SB-ILDN', temperature: 300, simulation_time: '100 ns' },
        environmental_params: { temperature: 300, forcefield: 'AMBER99SB-ILDN' },
      }));
      if (res.error) throw new Error(res.error);
      const file = res.files?.[0];
      if (!file) throw new Error('No input file generated.');
      return {
        source: 'External input file (GROMACS)', sourceType: 'external', confidence: null,
        label: 'GROMACS input file generated for external execution',
        data: [
          ['Engine', 'GROMACS'],
          ['File', file.filename],
          ['Description', file.description || 'N/A'],
          ['Run command', 'gmx grompp -f gromacs.mdp && gmx mdrun'],
          ['Note', 'This is an input file for external execution, not a computed result'],
        ],
        files: res.files,
        raw: res,
      };
    },
    renderResult: (result) => (
      <ResultShell result={result}>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-700 font-semibold">
            Input file for external execution. Run on your own infrastructure with GROMACS installed.
          </p>
        </div>
        <p className="text-sm font-bold text-slate-800 mb-3">{result.label}</p>
        <DataTable data={result.data} />
        <div className="mt-4 space-y-2">
          {result.files?.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-mono text-xs font-bold text-slate-700">{file.filename}</span>
              <button onClick={() => downloadTextFile(file.filename, file.content)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          ))}
        </div>
        {result.files?.[0]?.content && (
          <details className="mt-3">
            <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">Preview input file</summary>
            <pre className="mt-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto max-h-48">{result.files[0].content}</pre>
          </details>
        )}
      </ResultShell>
    ),
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

# Query a material from the Crystallography Open Database
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
  const config = { inputTypes: INPUT_TYPES, tools: TOOLS, viewerMode: 'crystal', inputPlaceholder: 'Enter one formula per line' };

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
              <p className="text-sm text-slate-500">Structure building, materials search, and input file generation for LAMMPS, Quantum ESPRESSO, and GROMACS</p>
            </div>
          </div>
          <SourcedBadge />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6"><Studio3DViewer mode="crystal" height={300} /></div>
        <RunModeTabs active={activeMode} onChange={setActiveMode} />
        {activeMode === 'single' && <SingleRunPanel config={config} />}
        {activeMode === 'batch' && <BatchPanel config={config} isPro={isPro} />}
        {activeMode === 'pipeline' && <PipelinePanel config={{ steps: PIPELINE_STEPS, inputTypes: INPUT_TYPES, inputPlaceholder: 'Enter formula' }} isPro={isPro} />}

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Materials Structure Search</h2>
          <p className="text-sm text-slate-500 mb-4">Search crystallographic databases for crystal structures with CIF downloads and Materials Project properties.</p>
          <MaterialsSearchPanel />
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Engine Input Generator</h2>
          <p className="text-sm text-slate-500 mb-4">Generate ready-to-run input files for external HPC engines. Full transparency: these run on your infrastructure, not in the browser.</p>
          <EngineInputPanel />
        </div>
      </div>
    </StudioLayout>
  );
}