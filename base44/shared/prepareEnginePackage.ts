import {findEngine} from './engineRegistry.ts';
import inputGeometry from './inputGeometry.ts';
import {elements,invalid} from './rowanInput.ts';
import molecularEngineTemplates from './molecularEngineTemplates.ts';
import periodicEngineTemplates from './periodicEngineTemplates.ts';
export default async function prepareEnginePackage(data) {
  const engine=findEngine(data.engine); if(!engine || engine.deployment!=='input_file') invalid('Select an input-file engine. Rowan and PubChem are hosted services.');
  if(engine.id!=='rdkit' && !engine.sim_types.includes(data.sim_type)) invalid(`${engine.label} does not support this workflow in the current input generator. See the engine reference for supported workflows.`);
  const inputs=data.inputs || {}, env=data.environmental_params || {};
  const method=inputs.engine_method || inputs.functional || inputs.method || engine.methods[0];
  const task=inputs.engine_task || inputs.task || (inputs.properties==='Dipole moment' ? 'Single-point energy' : inputs.properties) || engine.tasks[0];
  if(!engine.methods.includes(method) || !engine.tasks.includes(task)) invalid(`${engine.label} supports these prepared methods: ${engine.methods.join(', ')}; tasks: ${engine.tasks.join(', ')}. No substitute calculation is generated.`);
  const basis=String(inputs.basis_set || (engine.id==='gamess'?'6-31G*':'def2-SVP'));
  if(!/^[A-Za-z0-9+*()._-]{1,60}$/.test(basis)) invalid('Invalid basis set.');
  const solvent=['','none','vacuum','gas','gas_phase','Gas phase'].includes(env.solvent || '')?null:String(env.solvent).toLowerCase();
  if(solvent && !['water','ethanol','methanol','acetone','acetonitrile','benzene','toluene','dmso','dimethylsulfoxide','chloroform','hexane'].includes(solvent)) invalid('Choose a supported solvent.');
  const s={method,basis,task,solvent:solvent==='dimethylsulfoxide'?'dmso':solvent};
  let result,g;
  if(engine.id==='rdkit') {
    const smiles=String(inputs.smiles || inputs.molecule || inputs.system || '').match(/\(SMILES:\s*(.+)\)\s*$/i)?.[1] || String(inputs.smiles || inputs.molecule || inputs.system || '').replace(/^SMILES:\s*/i,'').trim();
    if(!smiles || smiles.length>2000 || /[\s\x00-\x1f]/.test(smiles)) invalid('RDKit needs explicit SMILES, not a compound name or XYZ file.');
    const action=method==='Descriptors'?"result = {'molecular_weight': Descriptors.MolWt(mol), 'logP': Crippen.MolLogP(mol), 'TPSA': Descriptors.TPSA(mol), 'HBD': Descriptors.NumHDonors(mol), 'HBA': Descriptors.NumHAcceptors(mol)}":method==='Morgan fingerprint'?"result = {'fingerprint': rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048).GetFingerprint(mol).ToBitString()}":"mol = Chem.AddHs(mol)\nparams = AllChem.ETKDGv3()\nparams.randomSeed = 42\nif AllChem.EmbedMolecule(mol, params) != 0: raise RuntimeError('Conformer embedding failed')\nwith Chem.SDWriter('conformer.sdf') as writer: writer.write(mol)\nresult = {'conformer_file': 'conformer.sdf', 'method': 'ETKDGv3'}";
    result={files:[{filename:'calculation.py',description:'Local RDKit cheminformatics; not a quantum calculation.',content:`import json\nfrom rdkit import Chem, rdBase\nfrom rdkit.Chem import Descriptors, Crippen, AllChem, rdFingerprintGenerator\nmol = Chem.MolFromSmiles(${JSON.stringify(smiles)})\nif mol is None: raise ValueError('Invalid SMILES')\n${action}\nresult['rdkit_version'] = rdBase.rdkitVersion\nwith open('result.json', 'w') as f: json.dump(result, f, indent=2)\nprint(json.dumps(result))\n`}],command:'python calculation.py > output.log 2>&1'};
  } else {
    g=await inputGeometry({...inputs,molecule:inputs.geometry_xyz || inputs.molecule || inputs.compound || inputs.system || inputs.material || inputs.surface});
    g.atoms=g.atoms.map(a=>({...a,symbol:elements[a.atomic_number]}));
    if(engine.active_space && method==='CASSCF') {
      s.active_electrons=Number(inputs.active_electrons);s.active_orbitals=Number(inputs.active_orbitals);
      const total=g.atoms.reduce((n,a)=>n+a.atomic_number,0)-g.charge;
      if(!Number.isInteger(s.active_electrons)||!Number.isInteger(s.active_orbitals)||s.active_electrons<1||s.active_electrons>total||s.active_orbitals<1||s.active_orbitals>30||s.active_electrons>2*s.active_orbitals||(total-s.active_electrons)%2!==0) invalid('Provide a valid active electron count and active orbital count for CASSCF.');
    }
    if(engine.periodic) {
      const cell=String(inputs.cell || '').trim().split(/[\s,]+/).map(Number);
      if(cell.length!==9 || cell.some(v=>!Number.isFinite(v)||Math.abs(v)>1000)) invalid('Supply all nine cell-vector components in angstroms. No cell is invented.');
      const det=cell[0]*(cell[4]*cell[8]-cell[5]*cell[7])-cell[1]*(cell[3]*cell[8]-cell[5]*cell[6])+cell[2]*(cell[3]*cell[7]-cell[4]*cell[6]);
      if(Math.abs(det)<1e-6) invalid('Cell vectors must span a nonzero volume.');
      s.cell=[cell.slice(0,3),cell.slice(3,6),cell.slice(6,9)];
      s.kpoints=String(inputs.kpoints || '1x1x1').replace(/Gamma only/i,'1x1x1').split(/[x\s]+/).map(Number);
      if(s.kpoints.length!==3 || s.kpoints.some(k=>!Number.isInteger(k)||k<1||k>20)) invalid('Choose a valid k-point mesh (three integers from 1 to 20).');
      s.pseudos=inputs.pseudopotentials?JSON.parse(inputs.pseudopotentials):{};
      if(engine.pseudo_required && [...new Set(g.atoms.map(a=>a.symbol))].some(symbol=>typeof s.pseudos[symbol]!=='string'|| !/^[A-Za-z0-9_.-]{1,120}$/.test(s.pseudos[symbol]))) invalid('Provide a pseudopotential filename for every element as a JSON mapping. Supply matching local datasets in ./pseudo.');
      result=periodicEngineTemplates(engine,s,g);
    } else result=molecularEngineTemplates(engine,s,g);
    result.files.unshift({filename:'geometry.xyz',content:`${g.atoms.length}\nUser/reference geometry; not optimized by Suttain\n${g.coordinates}\n`,description:'Input coordinates in angstroms, not a computed result.'});
  }
  const script=`#!/usr/bin/env bash\n#SBATCH --job-name=suttain-${engine.id}\n#SBATCH --nodes=1\n#SBATCH --ntasks=1\n#SBATCH --cpus-per-task=8\n#SBATCH --time=01:00:00\nset -euo pipefail\nexport OMP_NUM_THREADS=\"\${SLURM_CPUS_PER_TASK:-8}\"\n# Activate your environment and modules before running.\n${result.command}\n`;
  result.files.push({filename:'run.sh',content:script,description:'Run bash run.sh locally or sbatch run.sh after configuring your HPC environment.'});
  result.files.push({filename:'README.md',content:`# ${engine.label} local workflow\n\nNo calculation was executed by Suttain.\nMethod: ${method}\nTask: ${task}\nBasis: ${basis}\nVersion: ${engine.version}\nLicense: ${engine.license}\n\nInstall the engine (and ASE for ASE-driven packages), configure modules/environment, and review every input. Run bash run.sh or adjust the SLURM directives and run sbatch run.sh. Do not execute inputs you do not trust.\n${result.requirements || ''}\n${s.pseudos ? `Pseudopotential mapping: ${JSON.stringify(s.pseudos)}` : ''}\n\nOnly the stated method/task is prepared. No band-gap, adsorption-energy, advanced spectroscopy or MD result is implied by a single-point package. Environmental temperature, pressure, pH and classical forcefields are not applied to these quantum inputs.\n\nCitation: ${engine.citation}\nDocumentation: ${engine.docs_url}\nFor publication cite your installed software version, method, basis, solvent and datasets.\n`,description:'Execution instructions, limitations, license and citation.'});
  if(JSON.stringify(result.files).length>100000) invalid('Generated package is too large.');
  return {files:result.files,engine:engine.label,engine_id:engine.id,sim_type:data.sim_type,method,task,execution_mode:'local_pending',citations:[{title:engine.label,text:engine.citation,url:engine.docs_url}],summary:`${engine.label} input package prepared; awaiting execution on your computer or HPC.`,method_note:'Deterministic engine-specific preparation; no computed results or software-version claims are inferred.'};
}