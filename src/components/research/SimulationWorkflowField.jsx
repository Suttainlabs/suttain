import React from 'react';
import { Upload, Pencil } from 'lucide-react';

const sentenceLabel = label => label.replace(/\b[A-Z][a-z]+\b/g, (word, index) => index === 0 ? word : word.toLowerCase());

export default function SimulationWorkflowField({ field, value, onChange, canUpload, canDraw, onUpload, onDraw }) {
  const id = `simulation-field-${field.key}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-research-text mb-2">{sentenceLabel(field.label)}</label>
      {field.type === 'select' ? (
        <select id={id} value={value || field.default || field.options[0]} onChange={event => onChange(event.target.value)} className="simulation-control">
          {value && !field.options.includes(value) && <option value={value}>{value}</option>}
          {field.options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <div className="flex flex-wrap gap-2">
          <input id={id} type="text" value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder={field.placeholder} className="simulation-control flex-1 basis-48 min-w-0" />
          {canUpload && <button type="button" onClick={onUpload} className="research-secondary !px-3 !py-2" aria-label={`Upload file for ${field.label}`}><Upload className="h-4 w-4" />Upload file</button>}
          {canDraw && <button type="button" onClick={onDraw} className="research-secondary !px-3 !py-2" aria-label={`Draw ${field.label}`}><Pencil className="h-4 w-4" />Draw</button>}
        </div>
      )}
    </div>
  );
}