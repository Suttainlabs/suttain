import gromacsOverrides from './gromacsOverrides.ts';
export default function gromacsMdTemplate(s) {
  const periodic=s.boundary==='periodic';
  const base=`cutoff-scheme = Verlet\npbc = ${periodic?'xyz':'no'}\nnstlist = 20\nrlist = 1.0\ncoulombtype = ${periodic?'PME':'Cut-off'}\nrcoulomb = 1.0\nvdwtype = Cut-off\nrvdw = 1.0\nconstraints = none\n${s.hasOverrides?'define = -DFLEXIBLE\n':''}`;
  const thermal=s.thermostat==='langevin'?`integrator = sd\ntcoupl = no\ntc-grps = System\ntau-t = 1.0\nref-t = ${s.temperature}\nld-seed = 42\n`:`integrator = md\ntcoupl = ${{vrescale:'v-rescale',nose_hoover:'Nose-Hoover',berendsen:'Berendsen'}[s.thermostat]}\ntc-grps = System\ntau-t = 1.0\nref-t = ${s.temperature}\n`;
  const em=`integrator = steep\nnsteps = 50000\nemtol = 1000\nemstep = 0.01\n${base}`;
  const nvt=`${base}${thermal}dt = ${s.timestep/1000}\nnsteps = 10000\npcoupl = no\ngen-vel = yes\ngen-temp = ${s.temperature}\ngen-seed = 42\n`;
  const npt=s.npt?`pcoupl = ${{parrinello_rahman:'Parrinello-Rahman',c_rescale:'C-rescale',berendsen:'Berendsen'}[s.barostat]}\npcoupltype = isotropic\ntau-p = 5.0\nref-p = ${s.pressure}\ncompressibility = 4.5e-5\n`:'pcoupl = no\n';
  const prod=`${base}${thermal}dt = ${s.timestep/1000}\nnsteps = ${s.steps}\n${npt}gen-vel = no\ncontinuation = yes\nnstxout-compressed = ${Math.min(1000,s.steps)}\nnstenergy = ${Math.min(1000,s.steps)}\nnstlog = ${Math.min(1000,s.steps)}\n`;
  const prepare=s.attachment?`test -s '${s.attachment}'\ncp '${s.attachment}' base.top\ngmx editconf -f input.pdb -o boxed.gro ${periodic?`-bt cubic -d ${s.padding}`:''}\n`:`gmx pdb2gmx -f input.pdb -o processed.gro -p base.top -ff '${s.gromacs_forcefield}' -water tip3p -ignh\ngmx editconf -f processed.gro -o boxed.gro ${periodic?`-bt cubic -d ${s.padding}`:''}\n`;
  const solvate=s.solvent!=='none'?'gmx solvate -cp boxed.gro -cs spc216.gro -o solvated.gro -p base.top\n':'cp boxed.gro solvated.gro\n';
  const custom=s.hasOverrides?'python apply_overrides.py baseline.top system.top\n':'cp baseline.top system.top\n';
  const run=`#!/usr/bin/env bash
set -euo pipefail
${prepare}${solvate}# Do not suppress topology warnings. Input must have a validated charge/protonation state.
gmx grompp -f em.mdp -c solvated.gro -p base.top -o preprocess.tpr -pp baseline.top
${custom}gmx grompp -f em.mdp -c solvated.gro -p system.top -o em.tpr
gmx mdrun -deffnm em
gmx grompp -f nvt.mdp -c em.gro -p system.top -o nvt.tpr
gmx mdrun -deffnm nvt
gmx grompp -f production.mdp -c nvt.gro -t nvt.cpt -p system.top -o production.tpr
gmx mdrun -deffnm production
`;
  return {files:[{filename:'em.mdp',content:em,description:'Energy minimization before MD.'},{filename:'nvt.mdp',content:nvt,description:'Fixed-volume equilibration at the selected temperature.'},{filename:'production.mdp',content:prod,description:`Production ${s.npt?'NPT':'NVT'} MD: actual temperature and pressure coupling targets.`},{filename:'prepare_and_run.sh',content:run,description:'Generate/use topology, apply custom parameters, minimize, equilibrate, and run production locally.'},{filename:'custom_parameters.json',content:JSON.stringify(s.overrides,null,2),description:'Exact atom-type parameter overrides in kJ/mol, nm and degrees.'},{filename:'apply_overrides.py',content:gromacsOverrides(),description:'Patch fully preprocessed topology and fail on unmatched/unsupported interactions.'}],command:'bash prepare_and_run.sh > output.log 2>&1',requirements:'Install GROMACS and Python 3 locally. AMBER99SB-ILDN, OPLS-AA and GROMOS54A7 are standard GROMACS distributions; CHARMM36/36m and AMBER14SB require installing matching .ff directories under the exact mapped names, or attach a complete .top. Supply complete PDB residues; unsupported ligands must already have a validated topology. Attached topologies must match the PDB atom order and include all referenced .itp files locally. Solvation adds explicit TIP3P water; ions/protonation are not automatically prepared. Unmatched custom atom types, nonharmonic interactions, or conflicting explicit pair/NBFIX values stop execution. Ten thousand NVT equilibration steps precede production. Review system-specific equilibration and compressibility (4.5e-5 bar^-1 is a water approximation).'};
}