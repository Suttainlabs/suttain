export default function openmmOverrides() {
  return `import math
from openmm import NonbondedForce, HarmonicBondForce, HarmonicAngleForce, PeriodicTorsionForce, CustomNonbondedForce
from openmm import unit

def apply_overrides(system, topology, types, overrides):
    # Type labels are explicitly supplied in input PDB order, never inferred from element names.
    atoms = list(topology.atoms())
    if len(types) > len(atoms): raise ValueError('Atom-type mapping exceeds system atom count')
    labels = types + [None]*(len(atoms)-len(types))
    matches = {key: [0]*len(rows) for key, rows in overrides.items()}
    def matching(key, indices):
        names = tuple(labels[int(i)] for i in indices)
        for r, row in enumerate(overrides[key]):
            target = tuple(row[k] for k in (['atom_type'] if key=='lj_parameters' else ['atom1','atom2','atom3','atom4'][:len(indices)]))
            if names == target or names == target[::-1]:
                matches[key][r] += 1
                yield row
    lj = overrides['lj_parameters']
    if lj and any(isinstance(f, CustomNonbondedForce) for f in system.getForces()):
        raise ValueError('LJ overrides with a custom nonbonded force (including CHARMM NBFIX) need a native forcefield XML; refusing partial modification')
    for force in system.getForces():
        if isinstance(force, NonbondedForce):
            original = [force.getParticleParameters(i) for i in range(force.getNumParticles())]
            changed = set()
            for i in range(len(types)):
                for row in matching('lj_parameters',[i]):
                    q,s,e = force.getParticleParameters(i)
                    force.setParticleParameters(i,q,row['sigma']*unit.nanometer,row['epsilon']*unit.kilojoule_per_mole)
                    changed.add(i)
            for k in range(force.getNumExceptions()):
                i,j,q,s,e = force.getExceptionParameters(k)
                if (i in changed or j in changed) and e.value_in_unit(unit.kilojoule_per_mole)!=0:
                    old_s = (original[i][1]+original[j][1])/2
                    old_e = math.sqrt(original[i][2].value_in_unit(unit.kilojoule_per_mole)*original[j][2].value_in_unit(unit.kilojoule_per_mole))
                    if old_e<=0 or old_s.value_in_unit(unit.nanometer)<=0: raise ValueError('Cannot safely rescale this 1-4 LJ exception')
                    ai,aj = force.getParticleParameters(i), force.getParticleParameters(j)
                    new_s = (ai[1]+aj[1])/2
                    new_e = math.sqrt(ai[2].value_in_unit(unit.kilojoule_per_mole)*aj[2].value_in_unit(unit.kilojoule_per_mole))
                    force.setExceptionParameters(k,i,j,q,s*(new_s/old_s),e*(new_e/old_e))
        elif isinstance(force, HarmonicBondForce):
            for k in range(force.getNumBonds()):
                i,j,r0,kb = force.getBondParameters(k)
                for row in matching('bond_parameters',[i,j]):
                    force.setBondParameters(k,i,j,row['r0']*unit.nanometer,row['k_bond']*unit.kilojoule_per_mole/unit.nanometer**2)
        elif isinstance(force, HarmonicAngleForce):
            for k in range(force.getNumAngles()):
                i,j,l,theta,ka = force.getAngleParameters(k)
                for row in matching('angle_parameters',[i,j,l]):
                    force.setAngleParameters(k,i,j,l,math.radians(row['theta0'])*unit.radian,row['k_angle']*unit.kilojoule_per_mole/unit.radian**2)
        elif isinstance(force, PeriodicTorsionForce):
            for k in range(force.getNumTorsions()):
                i,j,l,m,n,phase,kt = force.getTorsionParameters(k)
                names = tuple(labels[int(a)] for a in [i,j,l,m])
                for r,row in enumerate(overrides['dihedral_parameters']):
                    target = tuple(row[a] for a in ['atom1','atom2','atom3','atom4'])
                    if (names==target or names==target[::-1]) and int(n)==row['n']:
                        matches['dihedral_parameters'][r]+=1
                        force.setTorsionParameters(k,i,j,l,m,row['n'],math.radians(row['delta'])*unit.radian,row['k_dihedral']*unit.kilojoule_per_mole)
    for key,counts in matches.items():
        for index,count in enumerate(counts):
            if not count: raise ValueError('Unmatched custom parameter: '+key+' row '+str(index+1)+'. Check atom types and existing periodicity; nothing will run.')
    return matches
`;
}