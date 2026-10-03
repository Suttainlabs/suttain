import openmmOverrides from './openmmOverrides.ts';
export default function openmmMdTemplate(s) {
  const config={...s};delete config.pdb;
  const script=`import json
import openmm
from openmm import unit
from openmm.app import PDBFile, ForceField, Modeller, Simulation, PME, NoCutoff, DCDReporter, StateDataReporter
from apply_overrides import apply_overrides

with open('md_config.json') as f: cfg = json.load(f)
pdb = PDBFile('input.pdb')
forcefield = ForceField(*cfg['forcefield_files'])
modeller = Modeller(pdb.topology, pdb.positions)
# Prepare protonation and all missing atoms locally before running; no pH-dependent reconstruction is implied.
if cfg['hasOverrides'] and len(cfg['atomTypes']) != modeller.topology.getNumAtoms():
    raise ValueError('Supply one atom type for each input PDB atom in exact order')
if cfg['solvent'] != 'none':
    modeller.addSolvent(forcefield, model='tip3p', padding=cfg['padding']*unit.nanometer, neutralize=True, ionicStrength=0*unit.molar)
if cfg['boundary']=='periodic' and modeller.topology.getPeriodicBoxVectors() is None:
    raise ValueError('Periodic vacuum systems need CRYST1 box vectors in the PDB; no box is invented')
system = forcefield.createSystem(modeller.topology, nonbondedMethod=PME if cfg['boundary']=='periodic' else NoCutoff,
    nonbondedCutoff=1*unit.nanometer, constraints=None, rigidWater=False)
matched = apply_overrides(system, modeller.topology, cfg['atomTypes'], cfg['overrides']) if cfg['hasOverrides'] else {}
temperature = cfg['temperature']*unit.kelvin
if cfg['npt']:
    system.addForce(openmm.MonteCarloBarostat(cfg['pressure']*unit.bar, temperature, 25))
if cfg['thermostat']=='langevin':
    integrator = openmm.LangevinMiddleIntegrator(temperature, 1/unit.picosecond, cfg['timestep']*unit.femtosecond)
    integrator.setRandomNumberSeed(42)
else:
    system.addForce(openmm.AndersenThermostat(temperature, 1/unit.picosecond))
    integrator = openmm.VerletIntegrator(cfg['timestep']*unit.femtosecond)
simulation = Simulation(modeller.topology, system, integrator)
simulation.context.setPositions(modeller.positions)
simulation.minimizeEnergy()
simulation.context.setVelocitiesToTemperature(temperature,42)
# Equilibrate at fixed volume before activating pressure coupling.
# Disable the barostat during fixed-volume equilibration.
barostats = [f for f in system.getForces() if isinstance(f,openmm.MonteCarloBarostat)]
for f in barostats: f.setFrequency(0)
if barostats: simulation.context.reinitialize(preserveState=True)
simulation.step(10000)
for f in barostats: f.setFrequency(25)
if barostats:
    simulation.context.reinitialize(preserveState=True)
with open('prepared.pdb','w') as out: PDBFile.writeFile(modeller.topology,modeller.positions,out)
interval = max(1,min(1000,cfg['steps']))
simulation.reporters.append(DCDReporter('trajectory.dcd',interval))
simulation.reporters.append(StateDataReporter('thermodynamics.csv',interval,step=True,time=True,potentialEnergy=True,kineticEnergy=True,temperature=True,volume=cfg['boundary']=='periodic',separator=','))
simulation.step(cfg['steps'])
state = simulation.context.getState(getPositions=True,getEnergy=True)
with open('final.pdb','w') as out: PDBFile.writeFile(modeller.topology,state.getPositions(),out)
simulation.saveCheckpoint('checkpoint.chk')
with open('result.json','w') as out: json.dump({'engine':'OpenMM','version':openmm.__version__,'temperature_target_K':cfg['temperature'],'pressure_target_bar':cfg['pressure'] if cfg['npt'] else None,'ensemble':'NPT' if cfg['npt'] else 'NVT','production_steps':cfg['steps'],'custom_parameter_matches':matched,'potential_energy_kJ_mol':state.getPotentialEnergy().value_in_unit(unit.kilojoule_per_mole)},out,indent=2)
`;
  return {files:[{filename:'simulate.py',content:script,description:'Executable local OpenMM MD: thermostat, NPT barostat, and applied custom parameters.'},{filename:'md_config.json',content:JSON.stringify(config,null,2),description:'Actual engine targets, forcefield files and exact override tables.'},{filename:'apply_overrides.py',content:openmmOverrides(),description:'Apply LJ, harmonic bond/angle and periodic torsion overrides before creating the simulation context; unmatched parameters stop execution.'}],command:'python simulate.py > output.log 2>&1',requirements:'Install OpenMM in your local Python environment. Input PDB must have complete atoms/hydrogens and residue names supported by the forcefield; ligands require validated residue templates. Attached XML must include compatible water/ion parameters if solvation is requested. LJ overrides using CHARMM custom nonbonded/NBFIX terms are rejected; use a native XML instead. Flexible bonds use at most a 1 fs timestep. Ten thousand NVT equilibration steps precede production. Review equilibration adequacy for your system.'};
}