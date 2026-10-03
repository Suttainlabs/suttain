import {invalid} from './rowanInput.ts';
const openmmFF = {'AMBER99SB-ILDN':['amber99sbildn.xml','tip3p.xml'],ff14SB:['amber14/protein.ff14SB.xml','amber14/tip3p.xml'],AMBER14SB:['amber14/protein.ff14SB.xml','amber14/tip3p.xml'],CHARMM36:['charmm36.xml','charmm36/water.xml']};
const gromacsFF = {'AMBER99SB-ILDN':'amber99sb-ildn','OPLS-AA':'oplsaa',GROMOS54A7:'gromos54a7',CHARMM36:'charmm36',CHARMM36m:'charmm36m',ff14SB:'amber14sb',AMBER14SB:'amber14sb'};
function number(value, fallback, min, max, label) {
  const n=Number(value ?? fallback);
  if(!Number.isFinite(n) || n<min || n>max) invalid(`${label} must be between ${min} and ${max}.`);
  return n;
}
export default function mdSettings(engine, inputs, env) {
  const openmm=engine.id==='openmm';
  const custom=env.custom_forcefield || {};
  const forcefield=String(custom.base_forcefield || env.forcefield || inputs.force_field || 'AMBER99SB-ILDN');
  const attachment=String(env.forcefield_file_name || custom.file_name || '');
  if(attachment && (!/^[A-Za-z0-9_.-]{1,120}$/.test(attachment) || !(openmm?/\.xml$/i:/\.top$/i).test(attachment))) invalid(openmm?'OpenMM requires an attached complete .xml forcefield.':'GROMACS requires an attached complete .top topology; standalone .itp files are not complete topologies.');
  if(!attachment && !(openmm?openmmFF:gromacsFF)[forcefield]) invalid(`${forcefield} is not mapped for ${engine.label}. Choose a supported forcefield or attach ${openmm?'a complete XML forcefield':'a complete TOP topology'}. No forcefield is substituted.`);
  const temperature=number(env.temperature,inputs.temperature || 300,1,2000,'Temperature (K)');
  const pressure=number(env.pressure,1,0.001,10000,'Pressure (bar)');
  const thermostat=env.thermostat || (openmm?'langevin':'vrescale');
  const barostat=env.barostat || (openmm?'monte_carlo':'parrinello_rahman');
  if(!(openmm?['langevin','andersen']:['vrescale','nose_hoover','berendsen','langevin']).includes(thermostat)) invalid(`Choose a supported ${engine.label} thermostat: ${openmm?'Langevin or Andersen':'velocity rescaling, Nose-Hoover, Berendsen or Langevin'}.`);
  if(!(openmm?['monte_carlo','none']:['parrinello_rahman','c_rescale','berendsen','none']).includes(barostat)) invalid(`Choose a supported ${engine.label} barostat: ${openmm?'Monte Carlo or none':'Parrinello-Rahman, C-Rescale, Berendsen or none'}.`);
  const npt=barostat!=='none';
  const boundary=env.boundary_conditions || 'periodic', box=env.box_type || 'cubic';
  if(!['periodic','vacuum'].includes(boundary)) invalid('These MD templates support periodic or vacuum boundaries only.');
  if(!openmm && boundary!=='periodic') invalid('The GROMACS MD template requires periodic boundaries. Use OpenMM for vacuum NVT dynamics.');
  if(npt && boundary!=='periodic') invalid('Pressure coupling (NPT) requires periodic boundaries. Select periodic boundaries or barostat none (NVT).');
  if(box!=='cubic') invalid('These MD templates currently support cubic boxes only; other box geometries are not silently substituted.');
  const solvent=env.solvent || 'water';
  if(!['none','water','tip3p'].includes(solvent)) invalid('These MD templates support explicit TIP3P water or no added solvent. Choose water, TIP3P, or none.');
  if(solvent!=='none' && boundary!=='periodic') invalid('Automatic water solvation requires periodic boundaries.');
  const pdb=String(inputs.pdb_content || (/^(ATOM  |HETATM|HEADER|CRYST1)/m.test(inputs.system || '') ? inputs.system : '')).trim();
  if(!pdb || pdb.length>24000 || !/^(ATOM  |HETATM)/m.test(pdb)) invalid('Provide PDB coordinate text (maximum 24 KB). A description, SMILES, or XYZ does not contain the MD residue topology.');
  if(pdb.split(/\r?\n/).filter(line=>/^(ATOM  |HETATM)/.test(line)).length>1000) invalid('The downloadable MD preparer accepts at most 1,000 input PDB atoms (solvent is added locally).');
  const timestep=number(inputs.md_timestep_fs,1,0.1,1,'Timestep (fs; flexible bonds)');
  if(custom.lj_parameters?.length && !attachment && !openmm && forcefield==='GROMOS54A7') invalid('GROMOS uses additional nonbonded conventions. Supply a validated native topology for LJ overrides rather than converting its interaction rules implicitly.');
  const duration=String(inputs.simulation_time || '1 ns');
  const parsed=duration.match(/^([0-9]+(?:\.[0-9]+)?)\s*(ps|ns|µs|us)$/);
  const steps=inputs.md_steps==null ? parsed ? Math.round(Number(parsed[1])*({ps:1000,ns:1000000,'µs':1000000000,us:1000000000}[parsed[2]])/timestep) : 10000 : Number(inputs.md_steps);
  if(!Number.isSafeInteger(steps)||steps<1||steps>1000000000) invalid('MD steps must be an integer between 1 and 1,000,000,000.');
  const padding=number(inputs.md_padding_nm,1.2,1.1,20,'Box padding (nm)');
  const overrides={};
  const rows={lj_parameters:[['atom_type'],['epsilon','sigma']],bond_parameters:[['atom1','atom2'],['k_bond','r0']],angle_parameters:[['atom1','atom2','atom3'],['k_angle','theta0']],dihedral_parameters:[['atom1','atom2','atom3','atom4'],['k_dihedral','n','delta']]};
  for(const [key,[types,values]] of Object.entries(rows)) {
    const list=custom[key] || [];
    if(!Array.isArray(list)||list.length>200) invalid('Custom forcefield tables must contain at most 200 rows each.');
    overrides[key]=list.map(row=> {
      const out={};
      for(const type of types) { if(!/^[A-Za-z0-9_.:+-]{1,60}$/.test(String(row[type] || ''))) invalid('Every custom parameter must specify an exact atom-type label.');out[type]=String(row[type]); }
      for(const v of values) { if(row[v]===''||row[v]==null||!Number.isFinite(Number(row[v]))) invalid('Custom parameter values must be finite numbers.');out[v]=Number(row[v]); }
      if(values.some(v=>!['theta0','delta'].includes(v)&&out[v]<0)||('sigma' in out&&out.sigma<=0)||('r0' in out&&out.r0<=0)||('theta0' in out&&(out.theta0<0||out.theta0>180))||('n' in out&&(!Number.isInteger(out.n)||out.n<1))) invalid('Invalid custom forcefield parameter range.');
      return out;
    });
  }
  const hasOverrides=Object.values(overrides).some(list=>list.length);
  let atomTypes=[];
  if(openmm && hasOverrides) {
    try {atomTypes=JSON.parse(inputs.md_atom_types || '[]');} catch {invalid('Atom-type mapping must be a JSON array of exact type labels.');}
    if(!Array.isArray(atomTypes)||!atomTypes.length||atomTypes.length>1000||atomTypes.some(t=>typeof t!=='string'||!/^[A-Za-z0-9_.:+-]{1,60}$/.test(t))) invalid('OpenMM custom overrides need one exact atom-type label for every input PDB atom. No atom types are guessed.');
  }
  return {temperature,pressure,thermostat,barostat,npt,boundary,solvent,forcefield,attachment,forcefield_files:attachment?[attachment]:(openmm?openmmFF[forcefield]:[]),gromacs_forcefield:gromacsFF[forcefield],pdb:pdb+'\n',steps,timestep,padding,overrides,hasOverrides,atomTypes};
}