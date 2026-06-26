import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Scissors, Layers, Search, Hash, LayoutGrid, Target,
  Upload, FileText, Download, Copy, Check, Loader2, AlertCircle,
  Eye, ArrowRight, FlaskRound, Zap,
} from 'lucide-react';

// ── Mode configuration ──────────────────────────────────────────────

const MODE_CONFIG = {
  split: {
    title: 'Protein-Ligand Splitter',
    description: 'Split a complex PDB into separate protein and ligand files. Standard amino acids go to protein; non-standard non-water/ion molecules go to ligand.',
    icon: Scissors,
    color: '#3B82F6',
    inputs: ['pdb'],
  },
  merge: {
    title: 'Protein-Ligand Merger',
    description: 'Combine a separate protein PDB and ligand PDB into one complex with correct chain and atom serial records.',
    icon: Layers,
    color: '#8B5CF6',
    inputs: ['proteinPdb', 'ligandPdb'],
  },
  missing_residues: {
    title: 'Missing Residues Finder',
    description: 'Parse observed ATOM records and detect gaps in residue numbering per chain. Auto-flags missing ranges in any structure.',
    icon: Search,
    color: '#F59E0B',
    inputs: ['pdb'],
  },
  renumber: {
    title: 'Residue Renumbering Tool',
    description: 'Renumber residues to match a user-defined scheme. Each chain starts from the specified residue number.',
    icon: Hash,
    color: '#EC4899',
    inputs: ['pdb', 'startResidue'],
  },
  grid_params: {
    title: 'Grid Parameter Generator',
    description: 'Generate AutoDock Vina and AutoDock4 grid parameters from selected residues. Computes center from averaged atom coordinates plus padding.',
    icon: LayoutGrid,
    color: '#0D9E8E',
    inputs: ['pdb', 'residues', 'padding'],
  },
  ligand_grid_params: {
    title: 'Ligand-Based Grid Parameters',
    description: 'Auto-detect the co-crystallized ligand, find protein residues within 5 Å, and generate Vina + AutoDock4 grid params centered on the binding site.',
    icon: Target,
    color: '#EF4444',
    inputs: ['pdb'],
  },
};

// ── Shared PDB state (localStorage) ──────────────────────────────────

function getSharedPdb() {
  try {
    return {
      content: localStorage.getItem('suttain_active_pdb') || '',
      name: localStorage.getItem('suttain_active_pdb_name') || '',
    };
  } catch {
    return { content: '', name: '' };
  }
}

function setSharedPdb(content, name) {
  try {
    localStorage.setItem('suttain_active_pdb', content);
    localStorage.setItem('suttain_active_pdb_name', name);
  } catch {}
}

// ── Helpers ──────────────────────────────────────────────────────────

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'chemical/x-pdb' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatVinaParams(vina) {
  return [
    `center_x = ${vina.center_x}`,
    `center_y = ${vina.center_y}`,
    `center_z = ${vina.center_z}`,
    `size_x = ${vina.size_x}`,
    `size_y = ${vina.size_y}`,
    `size_z = ${vina.size_z}`,
  ].join('\n');
}

function formatAutodockParams(ad4) {
  return [
    `gridcenter = ${ad4.center_x} ${ad4.center_y} ${ad4.center_z}`,
    `npts = ${ad4.npts_x} ${ad4.npts_y} ${ad4.npts_z}`,
    `spacing = ${ad4.spacing}`,
  ].join('\n');
}

// ── Drag-and-drop upload area ───────────────────────────────────────

function PdbDropZone({ label, onFile, fileName }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onFile(e.target.result, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
        dragging
          ? 'border-[#0D9E8E] bg-[#0D9E8E]/10'
          : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdb,.ent,.txt"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {fileName ? (
        <div className="flex items-center justify-center gap-2">
          <FileText className="w-4 h-4 text-[#0D9E8E]" />
          <span className="text-xs font-semibold text-slate-300">{fileName}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <Upload className="w-5 h-5 text-slate-600" />
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-[10px] text-slate-700">Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  );
}

// ── Copy button ──────────────────────────────────────────────────────

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-[#0D9E8E]" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label || 'Copy'}
    </button>
  );
}

// ── Citation footer ─────────────────────────────────────────────────

function CitationFooter() {
  return (
    <div className="mt-4 pt-3 border-t border-slate-800">
      <p className="text-[10px] text-slate-600 leading-relaxed">
        PDB operations powered by Biopython algorithms. Cock et al., 2009,
        Bioinformatics 25(11):1422-3. BSD-3-Clause License — free for commercial use.
      </p>
    </div>
  );
}

// ── Main panel component ────────────────────────────────────────────

export default function StructurePrepPanel({
  mode,
  pdbContent: propPdbContent,
  pdbName: propPdbName,
  onResult,
  onUseParams,
}) {
  const config = MODE_CONFIG[mode];
  const [activePdb, setActivePdb] = useState(propPdbContent || '');
  const [activePdbName, setActivePdbName] = useState(propPdbName || '');
  const [ligandPdb, setLigandPdb] = useState('');
  const [ligandPdbName, setLigandPdbName] = useState('');
  const [residues, setResidues] = useState('');
  const [padding, setPadding] = useState('5.0');
  const [startResidue, setStartResidue] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [sharedPdb, setSharedPdb] = useState({ content: '', name: '' });

  useEffect(() => {
    setSharedPdb(getSharedPdb());
  }, []);

  useEffect(() => {
    if (propPdbContent) {
      setActivePdb(propPdbContent);
      setActivePdbName(propPdbName || 'loaded.pdb');
    }
  }, [propPdbContent, propPdbName]);

  const handlePdbFile = (content, name) => {
    setActivePdb(content);
    setActivePdbName(name);
    setSharedPdb(content, name);
    setResult(null);
    setError('');
  };

  const handleLigandFile = (content, name) => {
    setLigandPdb(content);
    setLigandPdbName(name);
    setResult(null);
    setError('');
  };

  const useSharedPdb = () => {
    if (sharedPdb.content) {
      setActivePdb(sharedPdb.content);
      setActivePdbName(sharedPdb.name || 'shared.pdb');
      setResult(null);
      setError('');
    }
  };

  const handleRun = async () => {
    setError('');
    setResult(null);

    if (!activePdb && mode !== 'merge') {
      setError('Please upload a PDB file first.');
      return;
    }
    if (mode === 'merge' && (!activePdb || !ligandPdb)) {
      setError('Please upload both protein and ligand PDB files.');
      return;
    }
    if (mode === 'grid_params' && !residues.trim()) {
      setError('Please enter residue numbers (comma-separated).');
      return;
    }

    setLoading(true);
    try {
      const payload = { action: mode };
      if (mode === 'merge') {
        payload.proteinPdb = activePdb;
        payload.ligandPdb = ligandPdb;
      } else {
        payload.pdbContent = activePdb;
      }
      if (mode === 'grid_params') {
        payload.residues = residues;
        payload.padding = parseFloat(padding) || 5.0;
      }
      if (mode === 'renumber') {
        payload.startResidue = parseInt(startResidue) || 1;
      }

      const res = await base44.functions.invoke('structurePrep', payload);
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to process structure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewIn3D = (pdbContent, name) => {
    if (onResult) {
      onResult(pdbContent, name);
    }
  };

  const handleUseParams = () => {
    if (!result?.vina) return;
    try {
      localStorage.setItem('suttain_docking_params', JSON.stringify({
        vina: result.vina,
        autodock4: result.autodock4,
        source: mode,
      }));
    } catch {}
    if (onUseParams) {
      onUseParams({ vina: result.vina, autodock4: result.autodock4 });
    }
  };

  const Icon = config.icon;
  const hasShared = sharedPdb.content && !activePdb;

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${config.color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: config.color }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white leading-tight">{config.title}</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{config.description}</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        {/* Use shared PDB button */}
        {hasShared && (
          <button
            onClick={useSharedPdb}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0D9E8E]/10 border border-[#0D9E8E]/30 text-[#0D9E8E] text-xs font-semibold hover:bg-[#0D9E8E]/20 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Use loaded structure: {sharedPdb.name}
          </button>
        )}

        {/* PDB upload (or protein PDB for merge) */}
        {config.inputs.includes('pdb') && (
          <PdbDropZone
            label={mode === 'merge' ? 'Drop protein PDB here' : 'Drop PDB file here'}
            onFile={handlePdbFile}
            fileName={activePdbName}
          />
        )}

        {/* Ligand PDB upload (merge only) */}
        {config.inputs.includes('ligandPdb') && (
          <PdbDropZone
            label="Drop ligand PDB here"
            onFile={handleLigandFile}
            fileName={ligandPdbName}
          />
        )}

        {/* Residue numbers (grid_params only) */}
        {config.inputs.includes('residues') && (
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
              Residue Numbers (comma-separated)
            </label>
            <input
              value={residues}
              onChange={(e) => setResidues(e.target.value)}
              placeholder="e.g. 45, 46, 47, 88, 92"
              className="w-full bg-slate-800 border border-slate-700 focus:border-[#0D9E8E] text-white placeholder-slate-600 text-xs px-3 py-2 rounded-lg outline-none transition-colors"
            />
          </div>
        )}

        {/* Padding (grid_params only) */}
        {config.inputs.includes('padding') && (
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
              Padding (Å)
            </label>
            <input
              type="number"
              step="0.5"
              value={padding}
              onChange={(e) => setPadding(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-[#0D9E8E] text-white text-xs px-3 py-2 rounded-lg outline-none transition-colors"
            />
          </div>
        )}

        {/* Start residue (renumber only) */}
        {config.inputs.includes('startResidue') && (
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
              Start Residue Number
            </label>
            <input
              type="number"
              value={startResidue}
              onChange={(e) => setStartResidue(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-[#0D9E8E] text-white text-xs px-3 py-2 rounded-lg outline-none transition-colors"
            />
          </div>
        )}

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D9E8E] hover:bg-[#0B8A7E] text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Run {config.title.split(' ')[0]}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !result.error && (
        <div className="mt-4 space-y-3">
          {/* Split results */}
          {mode === 'split' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Check className="w-3 h-3 text-[#0D9E8E]" />
                Protein: {result.proteinAtomCount} atoms · Ligand: {result.ligandAtomCount} atoms
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => downloadFile(result.proteinPdb, 'protein.pdb')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
                  >
                    <Download className="w-3 h-3" /> protein.pdb
                  </button>
                  {onResult && (
                    <button
                      onClick={() => handleViewIn3D(result.proteinPdb, 'protein.pdb')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9E8E]/10 hover:bg-[#0D9E8E]/20 text-[11px] font-semibold text-[#0D9E8E] transition-colors"
                    >
                      <Eye className="w-3 h-3" /> View 3D
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {result.ligandPdb ? (
                    <>
                      <button
                        onClick={() => downloadFile(result.ligandPdb, 'ligand.pdb')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
                      >
                        <Download className="w-3 h-3" /> ligand.pdb
                      </button>
                      {onResult && (
                        <button
                          onClick={() => handleViewIn3D(result.ligandPdb, 'ligand.pdb')}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9E8E]/10 hover:bg-[#0D9E8E]/20 text-[11px] font-semibold text-[#0D9E8E] transition-colors"
                        >
                          <Eye className="w-3 h-3" /> View 3D
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-[10px] text-slate-600 text-center py-2">No ligand atoms detected</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Merge results */}
          {mode === 'merge' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Check className="w-3 h-3 text-[#0D9E8E]" />
                Merged complex: {result.totalAtoms} atoms
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(result.mergedPdb, 'complex.pdb')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
                >
                  <Download className="w-3 h-3" /> complex.pdb
                </button>
                {onResult && (
                  <button
                    onClick={() => handleViewIn3D(result.mergedPdb, 'complex.pdb')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9E8E]/10 hover:bg-[#0D9E8E]/20 text-[11px] font-semibold text-[#0D9E8E] transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View 3D
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Missing residues results */}
          {mode === 'missing_residues' && (
            <div className="space-y-2">
              {result.chains.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-3">No residue numbering data found.</p>
              ) : (
                result.chains.map((c) => (
                  <div key={c.chain} className="bg-slate-800/60 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">Chain {c.chain}</span>
                      <span className="text-[10px] text-slate-600">
                        {c.observedCount} observed · range {c.range}
                      </span>
                    </div>
                    {c.missing.length === 0 ? (
                      <p className="text-[10px] text-[#0D9E8E]">No gaps detected</p>
                    ) : (
                      <div className="space-y-1">
                        {c.missing.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono font-bold">
                              {m.start === m.end ? m.start : `${m.start}-${m.end}`}
                            </span>
                            <span className="text-slate-600">{m.count} residue{m.count > 1 ? 's' : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Renumber results */}
          {mode === 'renumber' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Check className="w-3 h-3 text-[#0D9E8E]" />
                Renumbered from residue {result.startResidue} · chains: {result.chains.join(', ')}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(result.renumberedPdb, 'renumbered.pdb')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
                >
                  <Download className="w-3 h-3" /> renumbered.pdb
                </button>
                {onResult && (
                  <button
                    onClick={() => handleViewIn3D(result.renumberedPdb, 'renumbered.pdb')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0D9E8E]/10 hover:bg-[#0D9E8E]/20 text-[11px] font-semibold text-[#0D9E8E] transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View 3D
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grid params results (grid_params + ligand_grid_params) */}
          {(mode === 'grid_params' || mode === 'ligand_grid_params') && result.vina && (
            <div className="space-y-3">
              {/* Ligand info (ligand_grid_params only) */}
              {mode === 'ligand_grid_params' && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Check className="w-3 h-3 text-[#0D9E8E]" />
                  Ligand: {result.ligandNames.join(', ')} · {result.ligandAtomCount} atoms ·
                  {' '}{result.nearbyResidueCount} residues within 5 Å
                </div>
              )}

              {/* Vina params */}
              <div className="bg-slate-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    AutoDock Vina
                  </span>
                  <CopyButton text={formatVinaParams(result.vina)} label="Copy Vina" />
                </div>
                <pre className="text-[10px] font-mono text-slate-300 leading-relaxed">
{formatVinaParams(result.vina)}
                </pre>
              </div>

              {/* AutoDock4 params */}
              <div className="bg-slate-800/60 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    AutoDock4
                  </span>
                  <CopyButton text={formatAutodockParams(result.autodock4)} label="Copy AD4" />
                </div>
                <pre className="text-[10px] font-mono text-slate-300 leading-relaxed">
{formatAutodockParams(result.autodock4)}
                </pre>
              </div>

              {/* Use these params button */}
              <button
                onClick={handleUseParams}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#0D9E8E] to-[#3B82F6] text-white text-xs font-bold transition-colors hover:opacity-90 active:scale-[0.98]"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Use these params in docking
              </button>
            </div>
          )}
        </div>
      )}

      <CitationFooter />
    </div>
  );
}