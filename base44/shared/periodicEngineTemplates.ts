export default function periodicEngineTemplates(engine,s,g) {
  if(g.charge!==0 || g.multiplicity!==1) throw Object.assign(new Error('These periodic templates currently require neutral, closed-shell systems.'),{status:400});
  if(s.solvent) throw Object.assign(new Error('Periodic templates do not apply implicit solvent; select solvent none.'),{status:400});
  const common=`import json\nfrom ase.io import read, write\nfrom ase.optimize import BFGS\natoms = read('geometry.xyz')\natoms.set_cell(${JSON.stringify(s.cell)})\natoms.pbc = True\n`;
  const mesh=JSON.stringify(s.kpoints), pseudo=JSON.stringify(s.pseudos), xc=JSON.stringify(s.method);
  let setup;
  switch(engine.id) {
    case 'gpaw': setup=`from gpaw import GPAW, PW\natoms.calc = GPAW(mode=PW(500), xc=${xc}, kpts=${mesh}, txt='engine.log')\n`; break;
    case 'espresso': setup=`from ase.calculators.espresso import Espresso, EspressoProfile\natoms.calc = Espresso(profile=EspressoProfile(command='pw.x', pseudo_dir='./pseudo'), pseudopotentials=${pseudo}, kpts=${mesh}, input_data={'control': {'calculation': 'scf'}, 'system': {'ecutwfc': 60, 'input_dft': ${xc}}, 'electrons': {'conv_thr': 1e-8}})\n`; break;
    case 'abinit': setup=`from ase.calculators.abinit import Abinit, AbinitProfile\natoms.calc = Abinit(profile=AbinitProfile(command='abinit', pp_paths=['./pseudo']), xc=${xc}, ecut=500, kpts=${mesh}, pps='fhi')\n`; break;
    case 'siesta': setup=`from ase.calculators.siesta import Siesta, Species\nspecies = [Species(symbol=symbol, pseudopotential=filename) for symbol, filename in ${pseudo}.items()]\natoms.calc = Siesta(command='siesta < PREFIX.fdf > PREFIX.out', species=species, pseudo_path='./pseudo', xc=('GGA', 'PBE') if ${xc} == 'PBE' else ('LDA', 'CA'), basis_set='DZP', mesh_cutoff=300 * 13.605693, kpts=${mesh})\n`; break;
    case 'octopus': setup=`from ase.calculators.octopus import Octopus\natoms.calc = Octopus(command='octopus', Spacing='0.3*angstrom', CalculationMode='gs', XCFunctional='lda_x + lda_c_pz', KPointsGrid=${mesh})\n`; break;
    case 'cp2k': setup=`from ase.calculators.cp2k import CP2K\natoms.calc = CP2K(command='cp2k_shell', xc='PBE', basis_set='DZVP-MOLOPT-SR-GTH', pseudo_potential='GTH-PBE', cutoff=400 * 13.605693, inp='&FORCE_EVAL\\n &DFT\\n  BASIS_SET_FILE_NAME BASIS_MOLOPT\\n  POTENTIAL_FILE_NAME GTH_POTENTIALS\\n &END DFT\\n&END FORCE_EVAL')\n`; break;
    default: throw new Error('Unsupported periodic template.');
  }
  const content=common+setup+(s.task==='Geometry optimization'?"BFGS(atoms, trajectory='optimization.traj').run(fmax=0.05, steps=100)\n":'')+"energy = atoms.get_potential_energy()\nwrite('final.xyz', atoms)\nprint('SUTTAIN_ENERGY_EV', energy)\nwith open('result.json', 'w') as f: json.dump({'engine': "+JSON.stringify(engine.label)+", 'energy': energy, 'unit': 'eV', 'source': 'local ASE execution'}, f)\n";
  const note=engine.id==='abinit'?'ABINIT template uses ASE FHI pseudopotential discovery. Place FHI datasets (matching PBE/LDA and species) in ./pseudo; mapping is recorded in README, not converted.':engine.id==='siesta'?'Place matching .psf/.psml pseudopotentials in ./pseudo with filenames expected by ASE/SIESTA.':'Install the engine and all matching basis/pseudopotential/PAW datasets before execution.';
  return {files:[{filename:'calculation.py',content,description:`ASE-driven ${engine.label} ${s.task}; ${note}`}],command:'python calculation.py > output.log 2>&1',requirements:note};
}