import { sourceGet } from './screeningHttp.ts';
import { fetchChemblEvidence } from './screeningChemblEvidence.ts';
import { fetchBindingdbEvidence } from './screeningBindingdb.ts';
import { fetchPubchemEvidence } from './screeningPubchem.ts';
import { retrieveEvidence } from './screeningSources.ts';
import { rankEvidence } from './screeningRanking.ts';
import { resolveEvidenceTarget } from './screeningTarget.ts';
import { measurement } from './screeningEvidence.ts';
const target = { id: 'CHEMBL203', chembl_id: 'CHEMBL203', uniprot_id: 'P00533', protein_accessions: ['P00533'], gene_ids: ['1956'] };
const input = { target_ref: 'P00533', library: 'chembl_bioactive', method: 'balanced_evidence', max_candidates: 25, admet_filter: 'none', affinity_type: 'IC50', evidence_quality: 'standard' };
function fixtures(provider, scenario) {
  const assay = { aid: { id: 1 }, name: 'Purified enzyme binding assay', activity_outcome_method: 2, target: [{ mol_id: { protein_accession: scenario === 'mismatched' ? 'P12345' : 'P00533' } }], results: [{ tid: 1, name: 'IC50', ac: true, unit: 5 }] };
  const csv = '"AID","SID","CID","Activity Outcome","Target Accession","Target GeneID","Activity Value [uM]","Activity Name","Assay Name","Assay Type","PubMed ID","RNAi"\n1,1,1,Active,P00533,1956,0.1,IC50,Binding,Confirmatory,123,\n';
  const c = { molecule_chembl_id: 'CHEMBL1', canonical_smiles: 'CCO', target_chembl_id: scenario === 'mismatched' ? 'CHEMBL999' : 'CHEMBL203', assay_chembl_id: 'CHEMBLA1', assay_type: 'B', standard_type: 'IC50', standard_value: '100', standard_units: 'nM', standard_relation: '=', document_pmid: '123' };
  const b = { monomerid: '1', smile: 'CCO', affinity_type: 'IC50', affinity: '100', pmid: '123', uniprot: scenario === 'mismatched' ? 'P12345' : 'P00533' };
  return async (url, options) => {
    if (scenario === 'timeout') return new Promise((resolve, reject) => { options.signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError'))); });
    if (scenario === 'unavailable') return new Response('Service unavailable', { status: 503 });
    if (scenario === 'malformed') return new Response('{bad json');
    const empty = scenario === 'empty', duplicate = scenario === 'duplicate', mixed = scenario === 'mixed';
    if (provider === 'ChEMBL') {
      if (String(url).includes('/assay?')) return Response.json({ assays: [{ assay_chembl_id: 'CHEMBLA1', target_chembl_id: 'CHEMBL203', confidence_score: 9, assay_type: 'B' }] });
      return Response.json({ activities: empty ? [] : duplicate ? [c, c] : mixed ? [c, { ...c, standard_type: 'Ki', standard_value: '20' }, { ...c, molecule_chembl_id: 'CHEMBL2', canonical_smiles: 'CCC', standard_relation: '>', standard_value: '10' }] : [c], page_meta: {} });
    }
    if (provider === 'BindingDB') return Response.json({ getLindsByUniprotsResponse: { affinities: empty ? [] : duplicate ? [b, b] : mixed ? [b, { ...b, affinity_type: 'Ki', affinity: '<20' }] : [b] } });
    if (String(url).includes('/aids/')) return Response.json({ IdentifierList: { AID: empty ? [] : [1] } });
    if (String(url).includes('/description/')) return Response.json({ PC_AssayContainer: [{ assay: { descr: assay } }] });
    if (String(url).includes('/concise/')) return new Response(duplicate ? csv + csv.split('\n')[1] + '\n' : csv);
    return Response.json({ PropertyTable: { Properties: [{ CID: 1, ConnectivitySMILES: 'CCO', InChIKey: 'FIXTURE-KEY' }] } });
  };
}
export async function runSourceTests() {
  const outcomes = [];
  const assert = (name, ok) => outcomes.push({ name, passed: !!ok });
  const providers = [['ChEMBL', fetchChemblEvidence], ['BindingDB', fetchBindingdbEvidence], ['PubChem', fetchPubchemEvidence]];
  for (const [name, provider] of providers) for (const scenario of ['success', 'unavailable', 'malformed', 'empty', 'timeout', 'mismatched', 'duplicate', 'mixed']) {
    try {
      const data = await provider(target, input, { fetcher: fixtures(name, scenario), timeout: 10 });
      const rank = rankEvidence(data.rows, input);
      const ok = scenario === 'empty' || scenario === 'mismatched' ? data.rows.length === 0 : scenario === 'duplicate' ? rank.duplicate_count === 1 && rank.candidates.length === 1 : scenario === 'mixed' ? name === 'PubChem' ? rank.candidates.every(c => c.measured_affinity === null) : rank.candidates.some(c => c.smiles === 'CCO' && c.measured_affinity?.type === 'IC50' && c.measured_affinity?.value_nm === 100) && rank.candidates.every(c => c.measured_affinity === null || (c.measured_affinity.type === 'IC50' && c.measured_affinity.relation === '=')) : scenario === 'success' && rank.candidates.length === 1;
      assert(`${name}: ${scenario}`, ok);
    } catch (e) { assert(`${name}: ${scenario}`, ['unavailable', 'malformed', 'timeout'].includes(scenario) && !!e.sourceCode); }
  }
  let calls = 0;
  const empty = async () => { calls++; return { rows: [], reviewed: 0 }; };
  const unavailable = async () => { const e = new Error('Unavailable'); e.sourceCode = 'unavailable'; throw e; };
  const fallback = await retrieveEvidence(target, input, {}, [unavailable, empty, empty]);
  assert('Unavailable falls back; valid empty stops chain', calls === 1 && fallback.library === 'bindingdb' && fallback.source_status[2].status === 'skipped');
  const rows = [{ id: 'a', name: 'a', smiles: 'CCO', evidence: [measurement('IC50', 100, 'nM'), measurement('Ki', 1, 'nM')] }, { id: 'b', name: 'b', smiles: 'CCC', evidence: [measurement('IC50', 1, 'uM')] }];
  const ranked = rankEvidence(rows, { ...input, method: 'measured_potency' });
  assert('Potency keeps endpoints separate and normalizes units', ranked.candidates[0]?.id === 'a' && ranked.candidates[1]?.measured_affinity?.value_nm === 1000);
  const single = rankEvidence([rows[0]], input).candidates[0];
  assert('Self-reference does not generate perfect similarity', single.binding_proxy_score === null);
  assert('Invalid SMILES excluded', rankEvidence([{ ...rows[0], smiles: 'C1(' }], input).skipped_count === 1);
  assert('Missing potency is not fabricated', rankEvidence([{ ...rows[0], evidence: [measurement('IC50', 10, 'nM', '>')] }], { ...input, method: 'measured_potency' }).candidates.length === 0);
  try { await resolveEvidenceTarget({ target_ref: 'CHEMBL203', target_uniprot_id: 'P12345' }, { fetcher: async url => String(url).includes('chembl') ? Response.json({ target_chembl_id: 'CHEMBL203', target_type: 'SINGLE PROTEIN', target_components: [{ accession: 'P00533' }] }) : Response.json({ primaryAccession: 'P00533', uniProtKBCrossReferences: [{ database: 'ChEMBL', id: 'CHEMBL203' }] }) }); assert('Mismatched target identifiers rejected', false); } catch (e) { assert('Mismatched target identifiers rejected', e.status === 422); }
  assert('Candidate execution bound enforced', rankEvidence(Array.from({ length: 300 }, (_, i) => ({ ...rows[0], id: String(i), smiles: i % 2 ? 'CCO' : 'CCC', inchikey: `key-${i}` })), { ...input, max_candidates: 250 }).compounds_screened === 250);
  try { await sourceGet('https://example.test/', { fetcher: async () => new Response('{"wrong":1}') }); assert('HTTP valid JSON transport accepted', true); } catch { assert('HTTP valid JSON transport accepted', false); }
  return { passed: outcomes.filter(t => t.passed).length, total: outcomes.length, outcomes };
}