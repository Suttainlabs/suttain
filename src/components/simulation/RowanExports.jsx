import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { xyzFile,sdfFile,downloadRowan,elements } from '@/components/simulation/rowanExports';
import { toCsv, pdfReport, downloadText, fileName } from '@/components/research/researchDownloads';

const HARTREE_KCAL = 627.509474;
const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);
function rowanCsv(dataset, result) {
  const m = dataset?.final_molecule;
  const energies = (dataset?.frames?.map(fr => fr.energy) || result.optimization_energies || []).map(num);
  const charges = m?.mulliken_charges ?? result.charges ?? [];
  const spins = m?.mulliken_spin_densities ?? result.spin_densities ?? [];
  const atoms = m?.atoms || [];
  const rows = [];
  energies.forEach((e, i) => rows.push(['optimization_step', i + 1, '', e, e != null && energies[0] != null ? ((e - energies[0]) * HARTREE_KCAL).toFixed(4) : '', '', '', '', '']));
  const n = Math.max(atoms.length, charges.length);
  for (let i = 0; i < n; i++) { const a = atoms[i]; rows.push(['atom', i + 1, a ? elements[a.atomic_number] : '', '', '', charges[i] ?? '', spins?.[i] ?? '', a ? a.position.map(v => v.toFixed(6)).join(' ') : '', '']); }
  const dip = m?.dipole ?? result.dipole;
  if (Array.isArray(dip)) rows.push(['dipole_debye', '', '', '', '', '', '', dip.join(' '), Math.hypot(...dip).toFixed(4)]);
  return toCsv(['record', 'index', 'element', 'energy_hartree', 'relative_energy_kcal_mol', 'mulliken_charge', 'spin_density', 'xyz_angstrom', 'dipole_magnitude_debye'], rows);
}
function rowanPdf(dataset, result) {
  const m = dataset?.final_molecule;
  const s = dataset?.settings || result.settings || {};
  const energy = m?.energy ?? result.energy;
  const dip = m?.dipole ?? result.dipole;
  const energies = (dataset?.frames?.map(fr => fr.energy) || result.optimization_energies || []).filter(v => typeof v === 'number');
  const refs = result.citations?.references || dataset?.citations?.references || [];
  const charges = m?.mulliken_charges ?? result.charges ?? [];
  const atoms = m?.atoms || [];
  return pdfReport({
    title: result.simType?.label || 'Quantum chemistry calculation',
    subtitle: `Rowan · ${s.level_of_theory || [s.method, s.basis_set?.name].filter(Boolean).join(' / ') || result.computational_approach || ''}`,
    meta: [['Molecule (SMILES)', dataset?.smiles || result.smiles || '—'], ['Level of theory', s.level_of_theory || '—'], ['Tasks', (s.tasks || []).join(', ') || '—'], ['Rowan job ID', result.provider_job_id], ['Engine', result.engine || 'Rowan']],
    sections: [
      { heading: 'Key results', rows: [
        ['Final electronic energy', energy != null ? `${Number(energy).toFixed(6)} Hartree` : 'Not reported'],
        ['Optimization steps', energies.length || '—'],
        ['Energy change over optimization', energies.length > 1 ? `${((energies.at(-1) - energies[0]) * HARTREE_KCAL).toFixed(2)} kcal/mol` : '—'],
        ['HOMO–LUMO gap', m?.homo_lumo_gap != null ? `${Number(m.homo_lumo_gap).toFixed(3)} eV` : 'Not reported'],
        ['Dipole moment', Array.isArray(dip) ? `${Math.hypot(...dip).toFixed(3)} D` : 'Not reported'],
        ['SCF converged', m?.scf_completed == null ? 'Not reported' : String(m.scf_completed)],
      ], note: '1 Hartree = 627.509 kcal/mol. Values are as returned by Rowan; no values are estimated by Suttain.' },
      ...(charges.length ? [{ heading: 'Atomic charges (Mulliken)', rows: charges.map((c, i) => [`${i + 1} ${atoms[i] ? elements[atoms[i].atomic_number] : ''}`, Number(c).toFixed(4)]), note: 'Mulliken charges depend on the basis set; compare only within one level of theory.' }] : []),
      ...(result.limitations ? [{ heading: 'Limitations', text: result.limitations }] : []),
    ],
    citations: [result.citations?.attribution, ...refs.map(ref => `${ref.category}: ${ref.label} ${(ref.urls || []).join(' ')}`)].filter(Boolean),
    footer: 'Computed quantum chemistry by Rowan. Review convergence and method suitability before drawing scientific conclusions.',
  });
}
export default function RowanExports({dataset,result}) {
  const [message,setMessage] = useState('');
  const molecule = dataset?.final_molecule,xyz = xyzFile(molecule),smiles=dataset?.smiles || result.smiles || molecule?.smiles;
  const json = dataset ? JSON.stringify({...dataset,settings:dataset.settings || result.settings,citations:dataset.citations || result.citations,result},null,2) : '';
  const copy = async (value,label) => {try {await navigator.clipboard.writeText(value);setMessage(`${label} copied.`);} catch {setMessage('Clipboard access was blocked. Use the download option.');}};
  const actions = [['Report (PDF)',!!(dataset || result.energy != null),() => rowanPdf(dataset,result).save(fileName('rowan-calculation',result.provider_job_id,'pdf'))],['Data (CSV)',!!(dataset || result.optimization_energies),() => downloadText(fileName('rowan-calculation',result.provider_job_id,'csv'),rowanCsv(dataset,result)+'\n','text/csv')],['Structure file (SDF)',!!xyz,() => downloadRowan(sdfFile(molecule,smiles),'sdf',result.provider_job_id)],['Download XYZ',!!xyz,() => downloadRowan(xyz,'xyz',result.provider_job_id)],['Copy XYZ',!!xyz,() => copy(xyz,'XYZ'),true],['Copy SMILES',!!smiles,() => copy(smiles,'SMILES'),true],['Download JSON',!!json,() => downloadRowan(json,'json',result.provider_job_id)]];
  return <div className="space-y-2"><div className="flex flex-wrap gap-2">{actions.map(([label,enabled,action,isCopy]) => <button key={label} disabled={!enabled} onClick={action} className="research-secondary !px-3 !py-2 disabled:opacity-50">{isCopy ? <Copy className="w-4 h-4"/> : <Download className="w-4 h-4"/>}{label}</button>)}</div><p className="text-xs text-research-muted">SDF preserves final coordinates without inferred bonds. SMILES is the input identifier, not a new connectivity determination.</p><p role="status" className="text-xs text-research-accent">{message}</p></div>;
}