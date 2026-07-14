import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, FileUp } from 'lucide-react';
import { USE_CASES, USE_CASE_ORDER } from './useCaseData';

const INPUT_TYPES = [
  { value: 'smiles', label: 'SMILES', placeholder: 'e.g. CC(C)(c1ccc(O)cc1)c1ccc(O)cc1' },
  { value: 'sequence', label: 'Protein Sequence', placeholder: 'e.g. MKTAYIAKQRQISFVKSHF...' },
  { value: 'pdb_id', label: 'PDB ID', placeholder: 'e.g. 1CRN' },
  { value: 'cas', label: 'CAS Number', placeholder: 'e.g. 80-05-7' },
  { value: 'file', label: 'File Upload', placeholder: '' },
];

export default function SingleRunForm() {
  const navigate = useNavigate();
  const [useCase, setUseCase] = useState('proteins');
  const [inputType, setInputType] = useState('smiles');
  const [inputValue, setInputValue] = useState('');
  const [fileName, setFileName] = useState('');

  const allActions = USE_CASE_ORDER.flatMap(key =>
    USE_CASES[key].actions.map(a => ({ ...a, useCaseKey: key }))
  );

  const handleRun = () => {
    const selectedUseCase = USE_CASES[useCase];
    const route = selectedUseCase.actions[0].route;
    const params = new URLSearchParams();
    if (inputValue) params.set('input', inputValue);
    if (inputType) params.set('type', inputType);
    navigate(`${route}?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Domain</label>
          <select value={useCase} onChange={e => setUseCase(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 bg-white">
            {USE_CASE_ORDER.map(key => (
              <option key={key} value={key}>{USE_CASES[key].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Input Type</label>
          <select value={inputType} onChange={e => { setInputType(e.target.value); setInputValue(''); setFileName(''); }}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400 bg-white">
            {INPUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Input</label>
        {inputType === 'file' ? (
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-violet-300 transition-colors">
            <FileUp className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">{fileName || 'Choose a file (PDB, SDF, MOL2, XYZ)'}</span>
            <input type="file" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
          </label>
        ) : (
          <textarea value={inputValue} onChange={e => setInputValue(e.target.value)}
            placeholder={INPUT_TYPES.find(t => t.value === inputType)?.placeholder}
            rows={3}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-violet-400 resize-none" />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Single runs are free for all users. Results include source labels and confidence where relevant.</p>
        <button onClick={handleRun} disabled={inputType !== 'file' && !inputValue}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#007850] text-white rounded-lg text-sm font-semibold hover:bg-[#005a3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
          <Play className="w-3.5 h-3.5" /> Run
        </button>
      </div>
    </div>
  );
}