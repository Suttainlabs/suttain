export function measurement(type, value, units, relation = '=', extra = {}) {
  const scale = { nM: 1, uM: 1000, 'µM': 1000, mM: 1000000, M: 1000000000 }[units];
  const numeric = Number(value);
  if (!['Ki', 'Kd', 'IC50', 'EC50', 'AC50'].includes(type) || !Number.isFinite(numeric) || numeric <= 0 || !scale || !['=', '<', '>', '<=', '>=', 'reported'].includes(relation)) return null;
  return { type, value: numeric, units, relation, value_nm: numeric * scale, ...extra };
}
export function normalizeEvidence(rows) {
  const found = new Map(); let duplicates = 0;
  for (const row of rows) {
    if (!row.id || typeof row.smiles !== 'string' || !row.smiles.trim() || row.smiles.length > 2000) continue;
    const key = row.inchikey ? `inchi:${row.inchikey}` : row.canonical_smiles ? `canonical:${row.canonical_smiles}` : `exact:${row.smiles}`;
    if (!found.has(key)) found.set(key, { ...row, evidence: [], deduplication_basis: row.inchikey ? 'InChIKey' : row.canonical_smiles ? 'Provider canonical SMILES' : 'Exact SMILES (not graph canonicalization)' }); else duplicates++;
    const item = found.get(key);
    for (const e of row.evidence || []) if (!item.evidence.some(old => JSON.stringify(old) === JSON.stringify(e))) item.evidence.push(e);
  }
  return { rows: [...found.values()], duplicates };
}
export function qualifiesEvidence(e, quality = 'standard') { return ['Ki', 'Kd', 'IC50'].includes(e.type) && e.relation === '=' && e.value_nm <= 10000 && (quality !== 'strict' || !!e.pmid || !!e.doi); }
export function bestMeasurement(row, affinityType = 'IC50', quality = 'standard') { return (row.evidence || []).filter(e => e.type === affinityType && qualifiesEvidence(e, quality)).sort((a, b) => a.value_nm - b.value_nm)[0] || null; }