async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Suggestion source unavailable');
  return response.json();
}
export default async function fetchTargetSuggestions(query, signal) {
  const text = query.trim();
  const words = text.replace(/[^\p{L}\p{N}\s-]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return { items: [], unavailable: [] };
  const chemblParams = new URLSearchParams({ q: text, format: 'json', limit: '4' });
  const uniprotParams = new URLSearchParams({ query: `(${words.map(word => `${word}*`).join(' AND ')}) AND organism_id:9606`, fields: 'accession,protein_name,organism_name,gene_names', format: 'json', size: '4' });
  const results = await Promise.allSettled([
    getJson(`https://www.ebi.ac.uk/chembl/api/data/target/search?${chemblParams}`, signal),
    getJson(`https://rest.uniprot.org/uniprotkb/search?${uniprotParams}`, signal)
  ]);
  const chembl = results[0].status === 'fulfilled' ? (results[0].value.targets || []).map(t => ({ id: t.target_chembl_id, name: t.pref_name, organism: t.organism, source: 'ChEMBL', query: t.pref_name })) : [];
  const uniprot = results[1].status === 'fulfilled' ? (results[1].value.results || []).map(t => {
    const name = t.proteinDescription?.recommendedName?.fullName?.value || t.proteinDescription?.submissionNames?.[0]?.fullName?.value;
    return { id: t.primaryAccession, name, organism: t.organism?.scientificName, source: 'UniProt', query: t.genes?.[0]?.geneName?.value || name };
  }) : [];
  return { items: [...chembl, ...uniprot].filter(t => t.id && t.name), unavailable: results.flatMap((result, i) => result.status === 'rejected' ? [['ChEMBL', 'UniProt'][i]] : []) };
}