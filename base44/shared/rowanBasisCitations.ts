// Basis Set Exchange is Rowan's designated basis-reference source.
// General H/C/N/O references; consult BSE for additional element-specific references.
const pople=['10.1063/1.1674902','10.1063/1.1677527'];
const dunning=['10.1063/1.456153'];
export const basisReferences = {
  'STO-3G':['10.1063/1.1672392'], '3-21G':['10.1021/ja00523a008'],
  '6-31G':pople, '6-31G*':[...pople,'10.1007/bf00533485'], '6-31G**':[...pople,'10.1007/bf00533485'],
  '6-311G*':['10.1063/1.438955'], '6-311G**':['10.1063/1.438955'],
  '6-311+G**':['10.1063/1.438955','10.1002/jcc.540040303'], '6-311++G**':['10.1063/1.438955','10.1002/jcc.540040303'],
  'cc-pVDZ':dunning,'cc-pVTZ':dunning,'cc-pVQZ':dunning,
  'aug-cc-pVDZ':[...dunning,'10.1063/1.462569'],'aug-cc-pVTZ':[...dunning,'10.1063/1.462569'],
  'def2-SVP':['10.1039/b508541a'],'def2-TZVP':['10.1039/b508541a'],'def2-TZVPP':['10.1039/b508541a'],'def2-QZVP':['10.1063/1.1627293'],
  'LANL2DZ':['10.1007/978-1-4757-0887-5'],'SDD':[]
};