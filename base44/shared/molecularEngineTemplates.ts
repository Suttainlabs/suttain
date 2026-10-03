const file=(filename,content) => ({filename,content,description:'Engine-specific input generated from your supplied geometry and settings.'});
export default function molecularEngineTemplates(engine,s,g) {
  const {method,basis,task}=s, coord=g.coordinates, charge=g.charge, mult=g.multiplicity;
  const optimize=task==='Geometry optimization', freq=task==='Frequency analysis (IR/Raman)';
  const solvent=s.solvent;
  if(solvent && engine.id !== 'orca' && engine.id !== 'xtb') throw Object.assign(new Error(`${engine.label} preparation currently supports gas phase only; select solvent none. No solvent model is silently dropped.`),{status:400});
  let content, filename, command;
  switch(engine.id) {
    case 'orca': filename='calculation.inp'; content=`! ${method} ${basis} TightSCF ${optimize?'OPT':freq?'FREQ':'SP'}${solvent?` CPCM(${solvent})`:''}\n%pal nprocs 8 end\n%maxcore 1000\n* xyz ${charge} ${mult}\n${coord}\n*\n`; command='orca calculation.inp > output.log 2>&1'; break;
    case 'psi4': filename='calculation.dat'; content=`memory 4 GB\nset_num_threads(8)\nmolecule mol {\n${charge} ${mult}\n${coord}\nunits angstrom\nno_reorient\nno_com\n}\nset {\nbasis ${basis}\nreference ${mult===1?'rhf':'uhf'}\nscf_type df\n}\n${optimize?'optimize':freq?'frequency':'energy'}('${method.toLowerCase()}')\n`; command='psi4 calculation.dat output.log'; break;
    case 'pyscf': {
      filename='calculation.py'; const correlated=['MP2','CCSD','CCSD(T)'].includes(method);
      content=`from pyscf import gto, scf, dft, mp, cc, __version__\nprint('PySCF version:', __version__)\nmol = gto.M(atom=${JSON.stringify(coord)}, basis=${JSON.stringify(basis)}, charge=${charge}, spin=${mult-1}, unit='Angstrom', verbose=4)\nmf = ${method==='HF'||correlated?`scf.${mult===1?'RHF':'UHF'}`:`dft.${mult===1?'RKS':'UKS'}`}(mol)\n${method!=='HF'&&!correlated?`mf.xc = ${JSON.stringify(method)}\n`:''}mf.kernel()\nif not mf.converged: raise RuntimeError('SCF did not converge')\nenergy = mf.e_tot\n${method==='MP2'?'corr = mp.MP2(mf)\ncorr.kernel()\nenergy += corr.e_corr\n':['CCSD','CCSD(T)'].includes(method)?`corr = cc.CCSD(mf)\ncorr.kernel()\nif not corr.converged: raise RuntimeError('CCSD did not converge')\nenergy += corr.e_corr\n${method==='CCSD(T)'?'energy += corr.ccsd_t()\n':''}`:''}print('SUTTAIN_ENERGY_HARTREE', energy)\n`; command='python calculation.py > output.log 2>&1'; break;
    }
    case 'nwchem': {
      filename='calculation.nw'; const theory=method==='HF'?'scf':method==='MP2'?'mp2':'dft';
      content=`start suttain\ncharge ${charge}\ngeometry units angstrom noautoz\n${coord}\nend\nbasis\n* library ${basis}\nend\n${theory==='dft'?`dft\nxc ${method.toLowerCase()}\nmult ${mult}\nend`:`scf\n${mult===1?'singlet':`uhf\nnopen ${mult-1}`}\nend`}\ntask ${theory} ${optimize?'optimize':freq?'frequencies':'energy'}\n`; command='nwchem calculation.nw > output.log 2>&1'; break;
    }
    case 'gamess':
      if(basis!=='6-31G' && basis!=='6-31G*') throw Object.assign(new Error('This GAMESS template supports 6-31G or 6-31G*; choose one explicitly.'),{status:400});
      filename='calculation.inp'; content=` $CONTRL SCFTYP=${mult===1?'RHF':'UHF'} RUNTYP=${optimize?'OPTIMIZE':'ENERGY'} ICHARG=${charge} MULT=${mult}${method==='B3LYP'?' DFTTYP=B3LYP':method==='MP2'?' MPLEVL=2':''} $END\n $SYSTEM MWORDS=500 $END\n $BASIS GBASIS=N31 NGAUSS=6 NDFUNC=${basis.endsWith('*')?1:0} $END\n $DATA\nSuttain molecular input\nC1\n${g.atoms.map(a=>`${a.symbol} ${a.atomic_number}.0 ${a.position.join(' ')}`).join('\n')}\n $END\n`; command='rungms calculation.inp 00 8 > output.log 2>&1'; break;
    case 'openmolcas': {
      filename='calculation.input'; const active=method==='CASSCF';
      content=`&GATEWAY\nCoord=geometry.xyz\nBasis=${basis}\nGroup=Nosym\n&SEWARD\n${active?`&RASSCF\nCharge=${charge}\nSpin=${mult}\nNactel=${s.active_electrons} 0 0\nRas2=${s.active_orbitals}`:`&SCF\nCharge=${charge}\nSpin=${mult}${mult>1?'\nUHF':''}`}\n`; command='pymolcas calculation.input > output.log 2>&1'; break;
    }
    case 'bagel': {
      filename='calculation.json'; content=JSON.stringify({bagel:[{title:'molecule',basis,angstrom:true,geometry:g.atoms.map(a=>({atom:a.symbol,xyz:a.position})),charge},{title:method==='CASSCF'?'casscf':'hf',nspin:mult-1,...(method==='CASSCF'?{nact:s.active_orbitals,nclosed:(g.atoms.reduce((n,a)=>n+a.atomic_number,0)-charge-s.active_electrons)/2}: {})}]},null,2); command='BAGEL calculation.json > output.log 2>&1'; break;
    }
    case 'xtb': filename='xtb_settings.txt'; content=`Method ${method}\nCharge ${charge}\nUnpaired electrons ${mult-1}\nTask ${task}\n`; command=`xtb geometry.xyz --gfn ${method==='GFN2-xTB'?2:1} --chrg ${charge} --uhf ${mult-1}${optimize?' --opt':freq?' --hess':''}${solvent?` --alpb ${solvent}`:''} > output.log 2>&1`; break;
    default: throw new Error('Unsupported molecular template.');
  }
  return {files:[file(filename,content)],command};
}