import React, { useState } from 'react';
import { Atom, ArrowLeftRight, FlaskConical, Microscope, Download, Copy, Check } from 'lucide-react';
import { suttainCompute } from '@/functions/suttainCompute';
import { suttainScienceData } from '@/functions/suttainScienceData';
import { LoadingState, ErrorState, ResultCard, DataRow, SourceLabel, ConfidenceBar } from '@/components/shared/FunctionResult';

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
        <span className={`text-sm font-bold ${lipinski.passes ? 'text-green-700' : 'text-amber-700'}`}>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Atom className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">Analyze Descriptors</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">Enter a molecule name or SMILES to get full physicochemical descriptors and drug-likeness assessment.</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="e.g. aspirin or CCO"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]"
        />
        <button onClick={run} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Analyze
        </button>
      </div>
      {loading && <LoadingState label="Fetching descriptors from PubChem..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <SourceLabel source={result.source} />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
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
    </div>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className="w-4 h-4 text-[#6B3FA0]" />
        <h3 className="font-bold text-slate-900 text-sm">Compare Two Molecules</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={molA} onChange={e => setMolA(e.target.value)} placeholder="Molecule A (name or SMILES)"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <input value={molB} onChange={e => setMolB(e.target.value)} placeholder="Molecule B (name or SMILES)"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
      </div>
      <button onClick={run} disabled={loading || !molA.trim() || !molB.trim()}
        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
        Compare
      </button>
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
    </div>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Atom className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">PubChem Molecule Lookup</h3>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Compound name or SMILES"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <button onClick={run} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Lookup
        </button>
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
    </div>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-[#6B3FA0]" />
        <h3 className="font-bold text-slate-900 text-sm">ChEMBL Lookup</h3>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="ChEMBL ID or compound name"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <button onClick={run} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Lookup
        </button>
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
    </div>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">Generate Engine Input</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input value={molecule} onChange={e => setMolecule(e.target.value)} placeholder="Molecule name or SMILES"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <select value={engine} onChange={e => setEngine(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850] bg-white">
          <option value="gromacs">GROMACS</option>
          <option value="quantum_espresso">Quantum ESPRESSO</option>
          <option value="lammps">LAMMPS</option>
        </select>
        <button onClick={run} disabled={loading || !molecule.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Generate
        </button>
      </div>
      {loading && <LoadingState label="Generating input file..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <SourceLabel source={result.source} />
            <button onClick={download}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
              <Download className="w-3 h-3" /> Download
            </button>
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
    </div>
  );
}