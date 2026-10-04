export default function CandidateProperties({ candidate: c }) {
  return <details className="text-xs mt-2">
    <summary className="cursor-pointer text-primary">Structure & estimated properties</summary>
    <div className="space-y-2 mt-3 max-w-lg text-muted-foreground">
      <p className="font-mono break-all">SMILES: {c.smiles || 'Not available'}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1">{[['MW (g/mol)', c.molecular_weight], ['LogP (est.)', c.logp], ['TPSA (est., Å²)', c.tpsa], ['H-bond donors (est.)', c.hbd], ['H-bond acceptors (est.)', c.hba], ['Rotatable bonds (est.)', c.rotatable_bonds], ['Lipinski violations (est.)', c.lipinski_violations], ['Veber violations (est.)', c.veber_violations]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="text-foreground">{value ?? 'Not calculated'}</dd></div>)}</dl>
      {c.most_similar_known_ligand && <p>Closest reference: <a className="underline text-primary" href={`https://www.ebi.ac.uk/chembl/explore/compound/${encodeURIComponent(c.most_similar_known_ligand)}`} target="_blank" rel="noreferrer">{c.most_similar_known_ligand}</a></p>}
      {c.reference_smiles && <p className="font-mono break-all">Reference SMILES: {c.reference_smiles}</p>}
    </div>
  </details>;
}