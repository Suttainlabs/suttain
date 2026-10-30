import React from 'react';
import { Upload, Pencil } from 'lucide-react';

const sentenceLabel = label => label.replace(/\b[A-Z][a-z]+\b/g, (word, index) => index === 0 ? word : word.toLowerCase());

export default function SimulationWorkflowField({ field, value, onChange, canUpload, canDraw, onUpload, onDraw }) {
  const id = `simulation-field-${field.key}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-research-text mb-2">{field.keepLabel ? field.label : sentenceLabel(field.label)}</label>
      {field.type === 'select' ? (
        <select id={id} value={value || field.default || field.options[0]} onChange={event => onChange(event.target.value)} className="simulation-control">
          {value && !field.options.includes(value) && <option value={value}>{value}</option>}
          {field.options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <div className="space-y-2">
          {field.multiline || String(value ?? '').includes('\n')
            ? <textarea id={id} rows={field.rows || 5} spellCheck={false} value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder={field.placeholder} className="simulation-control w-full min-w-0 font-mono text-xs leading-relaxed" />
            : <input id={id} type="text" value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder={field.placeholder} className="simulation-control w-full min-w-0" />}
          {field.hint && <p className="text-xs text-research-muted">{field.hint}</p>}
          {(canUpload || canDraw) && <div className={`grid gap-2 ${canUpload && canDraw ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {canUpload && <button type="button" onClick={onUpload} className="research-secondary !px-3 !py-2 justify-center" aria-label={`Upload file for ${field.label}`}><Upload className="h-4 w-4" />Upload file</button>}
            {canDraw && <button type="button" onClick={onDraw} className="research-secondary !px-3 !py-2 justify-center" aria-label={`Draw ${field.label}`}><Pencil className="h-4 w-4" />Draw</button>}
          </div>}
        </div>
      )}
    </div>
  );
}