/**
 * FileImportPanel: File upload supporting PDB, mmCIF, SDF, MOL2, XYZ, VMD, PSE, DCD
 */
import React, { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

const ACCEPTED_FORMATS = [
  { ext: 'pdb', label: 'PDB', format: 'pdb' },
  { ext: 'cif', label: 'mmCIF', format: 'mmcif' },
  { ext: 'sdf', label: 'SDF', format: 'sdf' },
  { ext: 'mol2', label: 'MOL2', format: 'mol2' },
  { ext: 'xyz', label: 'XYZ', format: 'xyz' },
  { ext: 'mol', label: 'MOL', format: 'mol' },
];

export default function FileImportPanel({ onFileLoaded }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadedFile, setLoadedFile] = useState(null);
  const [error, setError] = useState('');

  const processFile = (file) => {
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    const fmt = ACCEPTED_FORMATS.find(f => f.ext === ext);

    if (!fmt) {
      // Handle VMD/PSE/trajectory with a message
      if (['vmd', 'pse', 'dcd', 'xtc', 'trr'].includes(ext)) {
        setLoadedFile({ name: file.name, ext, note: 'Trajectory/session file detected, loading into trajectory player.' });
        onFileLoaded?.({ data: null, format: ext, name: file.name, isTraj: true });
        return;
      }
      setError(`Unsupported format: .${ext}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLoadedFile({ name: file.name, ext, format: fmt.format });
      onFileLoaded?.({ data: e.target.result, format: fmt.format, name: file.name });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
          <Upload className="w-4 h-4 text-teal-400" />
          Import Structure
        </h3>
        <p className="text-xs text-slate-500">
          Supports PDB, mmCIF, SDF, MOL2, XYZ, VMD state (.vmd), PyMOL (.pse), and MD trajectories (DCD, XTC, TRR)
        </p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-teal-500 bg-teal-900/20' : 'border-slate-600 hover:border-slate-500'
        }`}
      >
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Drop file here or click to browse</p>
        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {ACCEPTED_FORMATS.map(f => (
            <span key={f.ext} className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">.{f.ext}</span>
          ))}
          <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">.vmd</span>
          <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">.pse</span>
          <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">.dcd/.xtc/.trr</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdb,.cif,.sdf,.mol2,.xyz,.mol,.vmd,.pse,.dcd,.xtc,.trr"
          onChange={e => e.target.files[0] && processFile(e.target.files[0])}
        />
      </div>

      {loadedFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-teal-900/30 border border-teal-700 rounded-lg">
          <FileText className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-teal-300 font-medium truncate">{loadedFile.name}</p>
            {loadedFile.note && <p className="text-xs text-slate-400">{loadedFile.note}</p>}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}