import React from 'react';

const basisGroups = [
  { label: 'Minimal basis sets', options: ['STO-3G', '3-21G'] },
  { label: 'Pople basis sets', options: ['6-31G', '6-31G*', '6-31G**', '6-311G*', '6-311G**', '6-311+G**', '6-311++G**'] },
  { label: 'Correlation-consistent basis sets', options: ['cc-pVDZ', 'cc-pVTZ', 'cc-pVQZ', 'aug-cc-pVDZ', 'aug-cc-pVTZ'] },
  { label: 'Karlsruhe def2 basis sets', options: ['def2-SVP', 'def2-TZVP', 'def2-TZVPP', 'def2-QZVP'] },
  { label: 'Effective core potential basis sets', options: ['LANL2DZ', 'SDD'] },
];

export default function BasisSetSelect({ id = 'engine-basis', engineId, value, onChange }) {
  const groups = engineId === 'gamess'
    ? [{ label: 'Supported GAMESS basis sets', options: ['6-31G', '6-31G*'] }]
    : basisGroups;
  const selected = value || (engineId === 'gamess' ? '6-31G*' : 'def2-SVP');
  const listed = groups.some(group => group.options.includes(selected));
  return (
    <select id={id} className="simulation-control" value={selected} onChange={event => onChange(event.target.value)}>
      {!listed && <option value={selected}>{selected} (current selection)</option>}
      {groups.map(group => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map(basis => <option key={basis} value={basis}>{basis}</option>)}
        </optgroup>
      ))}
    </select>
  );
}