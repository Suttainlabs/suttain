import React, { useState } from 'react';
import { Atom, ArrowLeftRight, FlaskConical, Download, Copy, Check } from 'lucide-react';
import { suttainCompute } from '@/functions/suttainCompute';
import { suttainScienceData } from '@/functions/suttainScienceData';
import { LoadingState, ErrorState, DataRow, SourceLabel } from '@/components/shared/FunctionResult';
import { StudioPanel, StudioButton, StudioInput } from '@/components/studio/StudioShared';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function LipinskiCard({ lipinski }) {
  if (!lipinski) return null;
  return (
    <div className={`mt-4 p-4 rounded-xl border ${lipinski.passes ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-sm font-semibold ${lipinski.passes ? 'text-green-700' : 'text-amber-700'}`}>
          Lipinski Rule of Five: {lipinski.passes ? 'PASS' : 'FAIL'}
        </span>
      </div>
      {lipinski.violations && lipinski.violations.length > 0 && (
        <ul className="text-xs text-amber-700 space-y-1">
          {lipinski.violations.map((v, i) => <li key={i}>- {v}</li>)}
        </ul>
      )}
      {lipinski.passes && <p className="text-xs text-green-600">All four criteria met. This compound is drug-like.</p>}
    </div>
  );
}

export function DescriptorsPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainCompute({ mode: 'descriptors', molecule: input.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <StudioPanel icon={Atom} iconColor="#0F6E56" title="Analyze Descriptors" subtitle="Physicochemical descriptors and drug-likeness from PubChem">
      <div className="flex flex-col sm:flex-row gap-2">
        <StudioInput value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} placeholder="e.g. aspirin or CCO" className="flex-1" />
        <StudioButton onClick={run} disabled={!input.trim()} loading={loading}>Analyze</StudioButton>
      </div>
      {loading && <LoadingState label="Fetching descriptors from PubChem..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
            <DataRow label="Formula" value={result.formula} />
            <DataRow label="Molecular Weight" value={result.molecular_weight} unit="g/mol" />
            <DataRow label="SMILES" value={result.smiles} />
            <DataRow label="IUPAC Name" value={result.iupac_name} />
            <DataRow label="logP" value={result.logp} />
            <DataRow label="TPSA" value={result.tpsa} />
            <DataRow label="H-bond Donors" value={result.h_bond_donors} />
            <DataRow label="H-bond Acceptors" value={result.h_bond_acceptors} />
            <DataRow label="Rotatable Bonds" value={result.rotatable_bonds} />
            <DataRow label="Heavy Atoms" value={result.heavy_atoms} />
            <DataRow label="Formal Charge" value={result.formal_charge} />
          </div>
          <LipinskiCard lipinski={result.lipinski} />
        </div>
      )}
    </StudioPanel>
  );
}

export function ComparePanel() {
  const [molA, setMolA] = useState('');
  const [molB, setMolB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!molA.trim() || !molB.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainCompute({ mode: 'compare', molecule: molA.trim(), molecule_b: molB.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const rows = result ? [
    ['Molecular Weight', 'molecular_weight', 'g/mol'],
    ['logP', 'logp', ''],
    ['TPSA', 'tpsa', ''],
    ['Drug-like', 'drug_like', ''],
  ] : [];

  return (
    <StudioPanel icon={ArrowLeftRight} iconColor="#534AB7" title="Compare Two Molecules" subtitle="Side-by-side properties from PubChem">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <StudioInput value={molA} onChange={e => setMolA(e.target.value)} placeholder="Molecule A (name or SMILES)" />
        <StudioInput value={molB} onChange={e => setMolB(e.target.value)} placeholder="Molecule B (name or SMILES)" />
      </div>
      <StudioButton onClick={run} disabled={!molA.trim() || !molB.trim()} loading={loading} className="w-full">Compare</StudioButton>
      {loading && <LoadingState label="Fetching both compounds from PubChem..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Property</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700 text-xs">{result.molecule_a.input}</th>
                  <th className="text-right py-2 px-3 font-semibold text-slate-700 text-xs">{result.molecule_b.input}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, key, unit]) => (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-500">{label}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{String(result.molecule_a[key])}{unit ? ` ${unit}` : ''}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">{String(result.molecule_b[key])}{unit ? ` ${unit}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StudioPanel>
  );
}

export function PubChemLookupPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainScienceData({ source: 'pubchem', query: input.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <StudioPanel icon={Atom} iconColor="#0F6E56" title="PubChem Molecule Lookup" subtitle="Identity, synonyms, and structural data">
      <div className="flex flex-col sm:flex-row gap-2">
        <StudioInput value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} placeholder="Compound name or SMILES" className="flex-1" />
        <StudioButton onClick={run} disabled={!input.trim()} loading={loading}>Lookup</StudioButton>
      </div>
      {loading && <LoadingState label="Querying PubChem..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
            {result.structure_image
              ? <img src={result.structure_image} alt="2D structure" className="max-w-full max-h-48" />
              : <span className="text-sm text-slate-400">No image available</span>}
          </div>
          <div>
            <SourceLabel source={`Source: PubChem (CID: ${result.cid})`} />
            <div className="mt-3 space-y-1">
              {result.properties && Object.entries(result.properties).map(([k, v]) => (
                <DataRow key={k} label={k.replace(/([A-Z])/g, ' $1').trim()} value={v} />
              ))}
            </div>
          </div>
        </div>
      )}
    </StudioPanel>
  );
}

export function ChEMBLLookupPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainScienceData({ source: 'chembl', query: input.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <StudioPanel icon={FlaskConical} iconColor="#534AB7" title="ChEMBL Lookup" subtitle="Bioactivity and drug candidate data">
      <div className="flex flex-col sm:flex-row gap-2">
        <StudioInput value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} placeholder="ChEMBL ID or compound name" className="flex-1" />
        <StudioButton onClick={run} disabled={!input.trim()} loading={loading}>Lookup</StudioButton>
      </div>
      {loading && <LoadingState label="Querying ChEMBL..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source="Source: ChEMBL" />
          <div className="mt-3 space-y-1">
            <DataRow label="ChEMBL ID" value={result.chembl_id} />
            <DataRow label="Preferred Name" value={result.preferred_name} />
            <DataRow label="Max Phase" value={result.max_phase} />
            <DataRow label="Molecule Type" value={result.molecule_type} />
          </div>
        </div>
      )}
    </StudioPanel>
  );
}

export function EngineInputPanel() {
  const [molecule, setMolecule] = useState('');
  const [engine, setEngine] = useState('gromacs');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!molecule.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainCompute({ mode: 'engine_input', molecule: molecule.trim(), engine });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const download = () => {
    const ext = engine === 'gromacs' ? 'top' : engine === 'quantum_espresso' ? 'in' : 'in';
    const blob = new Blob([result.input_file], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `suttain_${engine}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudioPanel icon={FlaskConical} iconColor="#0F6E56" title="Generate Engine Input" subtitle="GROMACS, Quantum ESPRESSO, or LAMMPS input files">
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <StudioInput value={molecule} onChange={e => setMolecule(e.target.value)} placeholder="Molecule name or SMILES" className="flex-1" />
        <select value={engine} onChange={e => setEngine(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F6E56] bg-white">
          <option value="gromacs">GROMACS</option>
          <option value="quantum_espresso">Quantum ESPRESSO</option>
          <option value="lammps">LAMMPS</option>
        </select>
        <StudioButton onClick={run} disabled={!molecule.trim()} loading={loading}>Generate</StudioButton>
      </div>
      {loading && <LoadingState label="Generating input file..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <SourceLabel source={result.source} />
            <StudioButton onClick={download} variant="primary">
              <Download className="w-3.5 h-3.5" /> Download
            </StudioButton>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-700 font-semibold">{result.honest_note}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 relative">
            <div className="absolute top-2 right-2"><CopyButton text={result.input_file} /></div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-64">{result.input_file}</pre>
          </div>
        </div>
      )}
    </StudioPanel>
  );
}