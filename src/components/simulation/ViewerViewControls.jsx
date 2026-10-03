import React, { useId } from 'react';
export default function ViewerViewControls({ representation, onRepresentation, representations, colorScheme, onColorScheme, colors, onReset }) {
  const id = useId();
  return <div className="space-y-4 text-sm">
    <div><label htmlFor={`${id}-representation`} className="block mb-1 font-medium">Representation</label><select id={`${id}-representation`} value={representation} onChange={event => onRepresentation(event.target.value)} className="w-full min-h-11 rounded-md border border-border bg-background text-foreground px-3">{representations.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    <div><label htmlFor={`${id}-color`} className="block mb-1 font-medium">Color scheme</label><select id={`${id}-color`} value={colorScheme} onChange={event => onColorScheme(event.target.value)} className="w-full min-h-11 rounded-md border border-border bg-background text-foreground px-3">{colors.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    <button type="button" onClick={onReset} className="w-full min-h-11 rounded-md border border-border px-3 text-foreground hover:bg-muted">Reset view</button>
  </div>;
}