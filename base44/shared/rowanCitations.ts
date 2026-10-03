// References from https://docs.rowansci.com/citations (accessed 2026-10-03).
import { basisReferences } from './rowanBasisCitations.ts';
const doi = id => `https://doi.org/${id}`;
const engines = {xtb:['https://xtb-docs.readthedocs.io/en/latest/xtbrelatedrefs.html'],gpu4pyscf:[doi('10.1021/acs.jpca.4c05876')],psi4:['https://psicode.org/psi4manual/4.0b5/introduction.html#citing-psifour']};
const methods = {b3lyp:['10.1103/PhysRevA.38.3098','10.1103/PhysRevB.37.785','10.1139/p80-159','10.1021/j100096a001'],pbe:['10.1103/PhysRevLett.77.3865'],pbe0:['10.1063/1.478522'],m062x:['10.1007/s00214-007-0310-x'],m06l:['10.1063/1.2370993'],camb3lyp:['10.1016/j.cplett.2004.06.011'],tpssh:['10.1063/1.1626543'],r2scan:['10.1021/acs.jpclett.0c02405'],gfn2_xtb:['10.1021/acs.jctc.8b01176'],hf:['10.1017/S0305004100011919','10.1007/BF01340294','10.1103/PhysRev.34.1293']};
export function resolveRowanCitations(settings, engine, date = new Date().toISOString().slice(0,10)) {
  const references = [], guidance = 'https://docs.rowansci.com/citations';
  const add = (category,label,urls,note) => {if(label) references.push({category,label,urls,note:note || ''});};
  add('Engine',engine,engines[String(engine).toLowerCase()] || [guidance+'#engines']);
  add('Method',settings.method,methods[settings.method]?.map(doi) || [guidance+'#functionals-potentials'],methods[settings.method] ? '' : 'Rowan’s published table does not list a separate reference for this method. Consult the engine documentation and Rowan guidance.');
  const basis = settings.basis_set?.name;
  add('Basis set',basis,[...(basisReferences[basis] || []).map(doi),'https://www.basissetexchange.org/'],'General basis references from Basis Set Exchange, as directed by Rowan. Additional element-specific or effective-core-potential references may apply; check the exact elements and basis version.');
  const solvent = settings.solvent_settings?.model;
  add('Solvent model',solvent,solvent === 'alpb' ? ['10.1021/acs.jctc.1c00471','10.1063/1.2177251'].map(doi) : [guidance+'#solvent-models'],solvent === 'cpcm' ? 'CPCM is not CPCM-X; Rowan’s citation table does not list a separate CPCM reference. Consult the engine documentation for the implementation used.' : '');
  if (settings.tasks?.some(task => task.startsWith('optimize'))) add('Optimization','Molecular optimization',['https://geometric.readthedocs.io/en/latest/citation.html']);
  return {attribution:`Rowan Scientific. https://www.rowansci.com (accessed ${date}).`,source:guidance,accessed:date,references};
}