import { sourceGet, sourceError } from './screeningHttp.ts';
export const accessionPattern = /^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9](?:[A-Z][A-Z0-9]{2}[0-9]){1,2})$/;
export async function resolveEvidenceTarget(input, options = {}) {
  const ref = String(input.target_chembl_id || input.target_ref).trim().toUpperCase(); let accession, chemblId, chemblFailure;
  if (/^CHEMBL\d+$/.test(ref)) {
    chemblId = ref;
    try {
      const data = await sourceGet(`https://www.ebi.ac.uk/chembl/api/data/target/${ref}.json`, options);
      if (data?.target_chembl_id !== ref) throw sourceError('ChEMBL target identity mismatch', 'malformed');
      if (data.target_type !== 'SINGLE PROTEIN' || data.target_components?.length !== 1) { const e = new Error('Select a single-protein target.'); e.status = 422; throw e; }
      accession = data.target_components[0].accession;
    } catch (e) {
      if (e.status === 422) throw e; chemblFailure = e.message;
      const data = await sourceGet(`https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent('xref:chembl-' + ref)}&format=json&size=2`, options);
      if (data.results?.length !== 1) { const e = new Error('ChEMBL is unavailable and no unique UniProt cross-reference was found. Select a UniProt target directly.'); e.status = 422; throw e; }
      accession = data.results[0].primaryAccession;
    }
  } else accession = String(input.target_uniprot_id || ref).trim().toUpperCase();
  if (!accessionPattern.test(accession || '')) { const e = new Error('Select an unambiguous ChEMBL or UniProt protein target, not a PDB structure.'); e.status = 422; throw e; }
  const u = await sourceGet(`https://rest.uniprot.org/uniprotkb/${accession}.json`, options);
  if (u.primaryAccession !== accession && !u.secondaryAccessions?.includes(accession)) throw sourceError('UniProt identity mismatch', 'malformed');
  const xrefs = u.uniProtKBCrossReferences || [], mapped = xrefs.filter(x => x.database === 'ChEMBL').map(x => x.id);
  if (chemblId && !mapped.includes(chemblId)) { const e = new Error('ChEMBL and UniProt identifiers do not have a verified cross-reference.'); e.status = 422; throw e; }
  if (input.target_uniprot_id && input.target_uniprot_id.toUpperCase() !== u.primaryAccession && !u.secondaryAccessions?.includes(input.target_uniprot_id.toUpperCase())) { const e = new Error('Selected target identifiers refer to different proteins.'); e.status = 422; throw e; }
  return { id: chemblId || (mapped.length === 1 ? mapped[0] : u.primaryAccession), chembl_id: chemblId || (mapped.length === 1 ? mapped[0] : null), uniprot_id: u.primaryAccession, gene_ids: xrefs.filter(x => x.database === 'GeneID').map(x => x.id), protein_accessions: [u.primaryAccession, ...xrefs.filter(x => x.database === 'RefSeq').map(x => x.id)], name: u.proteinDescription?.recommendedName?.fullName?.value || u.uniProtkbId || u.primaryAccession, organism: u.organism?.scientificName, match_basis: 'UniProt stable accession and curated cross-references; no name-based equivalence', chembl_unavailable: chemblFailure || null };
}