import React, { useState } from 'react';
import { Microscope, Download, FlaskConical, Scissors, Grid3x3, ListOrdered, FileWarning } from 'lucide-react';
import { suttainScienceData } from '@/functions/suttainScienceData';
import { structurePrep } from '@/functions/structurePrep';
import { proteinStructureIntelligence } from '@/functions/proteinStructureIntelligence';
import { LoadingState, ErrorState, SourceLabel, ConfidenceBar, DataRow } from '@/components/shared/FunctionResult';

export function RCSBLookupPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainScienceData({ source: 'rcsb', query: input.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Microscope className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">Protein Structure Lookup (RCSB PDB)</h3>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="PDB ID (e.g. 1UBQ)"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <button onClick={run} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Lookup
        </button>
      </div>
      {loading && <LoadingState label="Querying RCSB PDB..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source="Source: RCSB PDB" />
          <div className="mt-3 space-y-1">
            <DataRow label="PDB ID" value={result.pdb_id} />
            <DataRow label="Title" value={result.title} />
            <DataRow label="Method" value={result.method} />
            <DataRow label="Resolution" value={result.resolution ? `${result.resolution} A` : 'N/A'} />
          </div>
          {result.download_url && (
            <a href={result.download_url} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50">
              <Download className="w-4 h-4" /> Download PDB File
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function AlphaFoldLookupPanel() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainScienceData({ source: 'alphafold', query: input.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-[#6B3FA0]" />
        <h3 className="font-bold text-slate-900 text-sm">AlphaFold Predicted Structure</h3>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="UniProt accession (e.g. P00533)"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <button onClick={run} disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Lookup
        </button>
      </div>
      {loading && <LoadingState label="Querying AlphaFold DB..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source="Source: AlphaFold DB" />
          <div className="mt-3 space-y-1">
            <DataRow label="UniProt" value={result.uniprot_accession} />
            <DataRow label="Gene" value={result.gene} />
            <DataRow label="Organism" value={result.organism} />
            <DataRow label="Model Version" value={result.model_version} />
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {result.pdb_download_url && (
              <a href={result.pdb_download_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" /> PDB
              </a>
            )}
            {result.cif_download_url && (
              <a href={result.cif_download_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50">
                <Download className="w-3.5 h-3.5" /> CIF
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function StructurePrepPanel() {
  const [pdbText, setPdbText] = useState('');
  const [residues, setResidues] = useState('');
  const [padding, setPadding] = useState('4');
  const [renumberStart, setRenumberStart] = useState('1');
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async (action) => {
    if (!pdbText.trim()) return;
    setLoading(action); setError(null); setResult(null);
    try {
      const payload = { action, pdb_text: pdbText };
      if (action === 'grid_params') {
        const resList = residues.trim() ? residues.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r)) : undefined;
        if (resList) payload.residues = resList;
        payload.padding = parseFloat(padding) || 4;
      }
      if (action === 'ligand_grid_params') payload.padding = parseFloat(padding) || 4;
      if (action === 'renumber') payload.start = parseInt(renumberStart) || 1;

      const res = await structurePrep(payload);
      if (res.error) throw new Error(res.error);
      setResult({ action, ...res });
    } catch (e) { setError(e.message); }
    finally { setLoading(null); }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const actions = [
    { id: 'grid_params', label: 'Binding-site Grid', icon: Grid3x3 },
    { id: 'ligand_grid_params', label: 'Ligand Grid', icon: Grid3x3 },
    { id: 'missing_residues', label: 'Missing Residues', icon: FileWarning },
    { id: 'split', label: 'Split Protein/Ligand', icon: Scissors },
    { id: 'renumber', label: 'Renumber', icon: ListOrdered },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Scissors className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">Structure Prep Utilities</h3>
      </div>
      <textarea
        value={pdbText}
        onChange={e => setPdbText(e.target.value)}
        placeholder="Paste PDB text here..."
        rows={6}
        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850] mb-3"
      />
      <div className="flex gap-2 mb-3 flex-wrap">
        <input value={residues} onChange={e => setResidues(e.target.value)} placeholder="Residues (comma-sep, optional)"
          className="flex-1 min-w-[120px] px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <input value={padding} onChange={e => setPadding(e.target.value)} placeholder="Pad (A)"
          className="w-20 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <input value={renumberStart} onChange={e => setRenumberStart(e.target.value)} placeholder="Start #"
          className="w-20 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {actions.map(a => (
          <button key={a.id} onClick={() => run(a.id)} disabled={!pdbText.trim() || loading !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50">
            <a.icon className="w-3 h-3" /> {a.label}
          </button>
        ))}
      </div>
      {loading && <LoadingState label={`Running ${loading}...`} />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          <div className="mt-3">
            {result.action === 'grid_params' && (
              <div className="space-y-1">
                <DataRow label="Center X" value={result.center?.x?.toFixed(2)} />
                <DataRow label="Center Y" value={result.center?.y?.toFixed(2)} />
                <DataRow label="Center Z" value={result.center?.z?.toFixed(2)} />
                <DataRow label="Size X" value={result.size?.x?.toFixed(2)} unit="A" />
                <DataRow label="Size Y" value={result.size?.y?.toFixed(2)} unit="A" />
                <DataRow label="Size Z" value={result.size?.z?.toFixed(2)} unit="A" />
              </div>
            )}
            {result.action === 'ligand_grid_params' && (
              <div className="space-y-1">
                <DataRow label="Center" value={`(${result.center?.x?.toFixed(1)}, ${result.center?.y?.toFixed(1)}, ${result.center?.z?.toFixed(1)})`} />
                <DataRow label="Ligand Atoms" value={result.ligand_atoms} />
              </div>
            )}
            {result.action === 'missing_residues' && (
              <div>
                <DataRow label="Total Missing" value={result.total_missing} />
                {result.missing_residues?.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {result.missing_residues.map((m, i) => (
                      <span key={i} className="inline-block mr-2 mb-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded">
                        {m.chain}:{m.resSeq}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {result.action === 'split' && (
              <div>
                <DataRow label="Protein Atoms" value={result.protein_atoms} />
                <DataRow label="Ligand Atoms" value={result.ligand_atoms} />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => downloadText('protein.pdb', result.protein_pdb)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ background: '#007850' }}>
                    <Download className="w-3 h-3" /> protein.pdb
                  </button>
                  <button onClick={() => downloadText('ligand.pdb', result.ligand_pdb)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ background: '#6B3FA0' }}>
                    <Download className="w-3 h-3" /> ligand.pdb
                  </button>
                </div>
              </div>
            )}
            {result.action === 'renumber' && (
              <div>
                <DataRow label="Start Residue" value={result.start_residue} />
                <button onClick={() => downloadText('renumbered.pdb', result.pdb_text)}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg" style={{ background: '#007850' }}>
                  <Download className="w-3 h-3" /> renumbered.pdb
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProteinIntelligencePanel() {
  const [chemical, setChemical] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!chemical.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await proteinStructureIntelligence({ chemical: chemical.trim(), context: context.trim() || undefined });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-[#6B3FA0]" />
        <h3 className="font-bold text-slate-900 text-sm">Protein Structure Intelligence (Premium)</h3>
        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">Pro</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">Requires login. Enter a chemical name or SMILES to analyze protein interactions, endocrine risk, and population-level safety.</p>
      <div className="space-y-2 mb-2">
        <input value={chemical} onChange={e => setChemical(e.target.value)} placeholder="Chemical name or SMILES"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <input value={context} onChange={e => setContext(e.target.value)} placeholder="Context (e.g. food, cosmetic) - optional"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
      </div>
      <button onClick={run} disabled={loading || !chemical.trim()}
        className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
        Analyze Protein Risk
      </button>
      {loading && <LoadingState label="Running protein structure intelligence..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4 space-y-4">
          <SourceLabel source="Source: AlphaFold + PubChem + AI analysis" />
          {result.overall_protein_risk_score != null && (
            <ConfidenceBar value={result.overall_protein_risk_score} label="Overall Protein Risk" />
          )}
          {result.risk_level && (
            <DataRow label="Risk Level" value={result.risk_level} />
          )}
          {result.plain_english_summary && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-1">Plain English Summary</p>
              <p className="text-sm text-slate-700">{result.plain_english_summary}</p>
            </div>
          )}
          {result.protein_interactions && result.protein_interactions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Protein Interactions</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Gene</th>
                      <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Binding Prob</th>
                      <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Type</th>
                      <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Hazard</th>
                      <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.protein_interactions.map((pi, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1.5 px-2 font-mono text-slate-700">{pi.gene || pi.target}</td>
                        <td className="py-1.5 px-2 text-slate-700">{pi.binding_probability || pi.probability}</td>
                        <td className="py-1.5 px-2 text-slate-700">{pi.interaction_type || pi.type}</td>
                        <td className="py-1.5 px-2 text-slate-700">{pi.hazard_category || pi.hazard}</td>
                        <td className="py-1.5 px-2 text-slate-700">{pi.evidence_strength || pi.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {result.alphafold_insight && (
            <div className="p-3 bg-violet-50 rounded-lg">
              <p className="text-xs font-semibold text-violet-600 mb-1">AlphaFold Insight</p>
              <p className="text-sm text-slate-700">{result.alphafold_insight}</p>
            </div>
          )}
          {result.population_warnings && result.population_warnings.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 mb-1">Population Warnings</p>
              <ul className="text-sm text-slate-700 space-y-1">
                {result.population_warnings.map((w, i) => <li key={i}>- {w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}