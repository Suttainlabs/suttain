// Live lookups used by the Binding & ADME pickers. Both services allow browser (CORS) requests.

// UniProtKB: reviewed (Swiss-Prot) entries first, by protein name, gene or accession.
export async function searchProteins(q, signal) {
  const isAcc = /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/i.test(q);
  const query = isAcc ? `accession:${q.toUpperCase()}` : `(${q}) AND reviewed:true`;
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&fields=accession,protein_name,organism_name,length,gene_primary&size=25&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('UniProt search failed');
  const data = await res.json();
  return (data.results || []).map(r => {
    const name = r.proteinDescription?.recommendedName?.fullName?.value || r.proteinDescription?.submissionNames?.[0]?.fullName?.value || r.primaryAccession;
    const gene = r.genes?.[0]?.geneName?.value;
    return {
      id: r.primaryAccession,
      label: name,
      meta: [r.primaryAccession, gene && `gene ${gene}`, r.organism?.scientificName, r.sequence?.length && `${r.sequence.length} aa`].filter(Boolean).join(' · '),
      length: r.sequence?.length,
    };
  });
}

export async function fetchProteinSequence(accession) {
  const res = await fetch(`https://rest.uniprot.org/uniprotkb/${encodeURIComponent(accession)}.fasta`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Could not load ${accession} from UniProt.`);
  const fasta = await res.text();
  return fasta.split('\n').filter(l => !l.startsWith('>')).join('').trim();
}

// PubChem compound name autocomplete (about 119 million compounds).
export async function searchCompounds(q, signal) {
  const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(q)}/json?limit=25`, { signal });
  if (!res.ok) throw new Error('PubChem search failed');
  const data = await res.json();
  const terms = [...new Set((data.dictionary_terms?.compound || []).map(t => String(t)))];
  return terms.map(t => ({ id: t.toLowerCase(), label: t, meta: 'PubChem' }));
}

export async function fetchCompoundSmiles(name) {
  const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/SMILES,ConnectivitySMILES,MolecularFormula,MolecularWeight/JSON`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`PubChem has no structure for “${name}”.`);
  const p = (await res.json())?.PropertyTable?.Properties?.[0];
  const smiles = p?.SMILES || p?.ConnectivitySMILES;
  if (!smiles) throw new Error(`PubChem has no structure for “${name}”.`);
  return { smiles, formula: p.MolecularFormula, mw: p.MolecularWeight, cid: p.CID };
}

// Catch common mistakes before spending credits on a meaningless run.
const THREE_LETTER = /^(ala|arg|asn|asp|cys|gln|glu|gly|his|ile|leu|lys|met|phe|pro|ser|thr|trp|tyr|val)([\s-]+(ala|arg|asn|asp|cys|gln|glu|gly|his|ile|leu|lys|met|phe|pro|ser|thr|trp|tyr|val))*$/i;
export function checkSequence(raw) {
  const s = String(raw || '').trim();
  if (!s) return 'Enter a protein sequence, or search for a protein above.';
  if (THREE_LETTER.test(s)) return `“${s}” looks like three-letter amino-acid names. Enter a one-letter sequence (e.g. MKTAYIAKQR…) or search for a protein above.`;
  const seq = s.replace(/^>.*$/m, '').replace(/[\s\d]/g, '').toUpperCase();
  if (/[^ACDEFGHIKLMNPQRSTVWYXBZUO]/.test(seq)) return 'The sequence contains characters that are not amino-acid letters.';
  if (seq.length < 20) return `That is only ${seq.length} residues. Binding predictions need a real protein or domain (at least 20 residues). Search for a protein above.`;
  if (seq.length > 2900) return `That is ${seq.length.toLocaleString()} residues. The limit is 2,900: trim to the domain involved in binding.`;
  return '';
}
