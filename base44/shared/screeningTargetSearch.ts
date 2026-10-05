import { sourceGet, validateRows } from './screeningHttp.ts';
import { accessionPattern } from './screeningTarget.ts';
export async function searchEvidenceTargets(query) {
  const options = { deadline: Date.now() + 10000 }, q = query.trim();
  const sources = ['ChEMBL', 'UniProt'];
  const results = await Promise.allSettled([
    sourceGet(`https://www.ebi.ac.uk/chembl/api/data/target/search?q=${encodeURIComponent(q)}&format=json&limit=5`, options).then(d => validateRows(d, 'targets').filter(t => t.target_type === 'SINGLE PROTEIN').slice(0, 3).map(t => ({ source: 'ChEMBL', chembl_id: t.target_chembl_id, target_class: t.target_type, name: t.pref_name, source_notes: ['ChEMBL'], organism: t.organism }))),
    sourceGet(`https://rest.uniprot.org/uniprotkb/search?${new URLSearchParams({ query: accessionPattern.test(q.toUpperCase()) ? `accession:${q.toUpperCase()}` : `(${q}) AND organism_id:9606`, fields: 'accession,protein_name,organism_name', format: 'json', size: '3' })}`, options).then(d => validateRows(d, 'results').map(t => ({ source: 'UniProt', uniprot_id: t.primaryAccession, name: t.proteinDescription?.recommendedName?.fullName?.value || t.uniProtkbId, organism: t.organism?.scientificName, source_notes: ['UniProt'] })))
  ]);
  return { matches: results.flatMap(r => r.status === 'fulfilled' ? r.value : []), unavailable: results.flatMap((r, i) => r.status === 'rejected' ? [sources[i]] : []) };
}