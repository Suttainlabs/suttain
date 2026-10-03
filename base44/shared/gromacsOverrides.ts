export default function gromacsOverrides() {
 return `import json, sys, re
with open('custom_parameters.json') as f: overrides=json.load(f)
lines=open(sys.argv[1]).readlines()
matched={k:[0]*len(v) for k,v in overrides.items()}
section=''; types={}; combination=2
for line in lines:
    clean=line.split(';')[0].strip()
    m=re.match(r'\\[\\s*(\\w+)\\s*\\]',clean)
    if m:
        section=m.group(1).lower()
        if section=='moleculetype': types={}
        continue
    fields=clean.split()
    if not fields or clean.startswith('#'): continue
    if section=='defaults': combination=int(fields[1])
    if section in ('pairtypes','nonbond_params') and overrides['lj_parameters']:
        labels={r['atom_type'] for r in overrides['lj_parameters']}
        if any(t in labels for t in fields[:2]): raise ValueError('LJ overrides intersect explicit pair/NBFIX parameters; supply a fully validated native topology instead')
# Operate on fully preprocessed topology, including explicit molecule interaction parameters.
section=''; types={}; output=[]
for line in lines:
    clean=line.split(';')[0].strip()
    m=re.match(r'\\[\\s*(\\w+)\\s*\\]',clean)
    if m:
        section=m.group(1).lower()
        if section=='moleculetype': types={}
        output.append(line); continue
    fields=clean.split()
    if not fields or clean.startswith('#'): output.append(line); continue
    if section=='atoms': types[fields[0]]=fields[1]
    if section=='atomtypes':
        for r,row in enumerate(overrides['lj_parameters']):
            if fields[0]==row['atom_type']:
                if combination==1:
                    fields[-2:]=[str(4*row['epsilon']*row['sigma']**6),str(4*row['epsilon']*row['sigma']**12)]
                else: fields[-2:]=[str(row['sigma']),str(row['epsilon'])]
                matched['lj_parameters'][r]+=1
    interactions={'bonds':('bond_parameters',2),'angles':('angle_parameters',3),'dihedrals':('dihedral_parameters',4)}
    if section in interactions:
        key,count=interactions[section]
        names=tuple(types.get(i) for i in fields[:count])
        function=int(fields[count])
        for r,row in enumerate(overrides[key]):
            target=tuple(row['atom'+str(i+1)] for i in range(count))
            if names!=target and names!=target[::-1]: continue
            if section=='bonds':
                if function!=1: raise ValueError('Bond overrides require existing harmonic function 1')
                fields=fields[:count+1]+[str(row['r0']),str(row['k_bond'])]
            elif section=='angles':
                if function!=1: raise ValueError('Angle overrides require existing harmonic function 1; Urey-Bradley angles need a native topology')
                fields=fields[:count+1]+[str(row['theta0']),str(row['k_angle'])]
            else:
                if function not in (1,9): raise ValueError('Torsion overrides require existing proper periodic function 1 or 9, not RB or improper torsions')
                if len(fields)<count+4: raise ValueError('Periodic torsion must have explicit phase, amplitude and periodicity in preprocessed topology')
                if int(float(fields[count+3]))!=row['n']: continue
                fields=fields[:count+1]+[str(row['delta']),str(row['k_dihedral']),str(row['n'])]
            matched[key][r]+=1
    if section=='pairs' and len(fields)>3 and overrides['lj_parameters']:
        labels={r['atom_type'] for r in overrides['lj_parameters']}
        if any(types.get(i) in labels for i in fields[:2]): raise ValueError('Explicit 1-4 pair values conflict with LJ overrides; supply a validated native topology')
    output.append(' '.join(fields)+'\\n')
for key,counts in matched.items():
    for r,count in enumerate(counts):
        if count==0: raise ValueError('Unmatched custom parameter: '+key+' row '+str(r+1)+'. Check exact topology atom types.')
with open(sys.argv[2],'w') as f: f.writelines(output)
with open('custom_parameter_matches.json','w') as f: json.dump(matched,f,indent=2)
`;
}