export const CANDIDATES = [
  { id: 'SUT-88291', score: 9.2, risk: 'low', sim: 62, drug: 'gefitinib-like', synth: 0.81 },
  { id: 'SUT-14027', score: 8.8, risk: 'moderate', sim: 41, drug: 'novel scaffold', synth: 0.64 },
  { id: 'SUT-55210', score: 8.1, risk: 'low', sim: 58, drug: 'erlotinib-like', synth: 0.77 },
  { id: 'SUT-90144', score: 7.4, risk: 'high', sim: 29, drug: 'novel scaffold', synth: 0.52 },
];
export const NAV = [['dashboard', 'Dashboard'], ['how', 'How it works'], ['new', 'New screening'], ['queue', 'Job queue'], ['candidates', 'Candidates'], ['shortlist', 'Shortlist']];
export const STEPS = ['Target', 'Library & method', 'Review & launch'];
export const LIBRARIES = { chembl_bioactive: 'ChEMBL → BindingDB → PubChem (recommended)', bindingdb: 'BindingDB → PubChem fallback', pubchem: 'PubChem quality-filtered bioassays' };
export const METHODS = { ligand_similarity: 'Fast ligand similarity (not docking)', measured_potency: 'Measured potency (one endpoint)', balanced_evidence: 'Balanced evidence (heuristic score)' };
export const WALKTHROUGH = [
  { view: 'new', step: 0, title: '1. Define a design target', body: 'Start Drug Design with the disease, gene, or protein you are investigating. Review public protein structures, bioactivity records, and disease annotations to establish the biological context.' },
  { view: 'new', step: 1, title: '2. Choose a library & method', body: 'Choose the ChEMBL → BindingDB → PubChem source chain and screen up to 250 target-linked compounds. Rank by non-self similarity, exact measured potency, or a transparent balanced heuristic; none performs docking.' },
  { view: 'new', step: 2, title: '3. Review & launch', body: 'Retrieve bounded target-linked assay records. Fall back only when a source is unavailable, never when a valid response is empty. Saved results disclose source status, measurements, estimates and skipped structures.' },
  { view: 'queue', title: '4. Review completed runs', body: 'See your latest 50 saved runs, actual processed counts and local execution receipts. Open a run to review its candidates and method details.' },
  { view: 'candidates', title: '5. Explore candidate trade-offs', body: 'Compare Tanimoto similarity, estimated LogP/TPSA, molecular weight and rule violations. Scores prioritize research, not binding affinity or validated ADMET. Unsupported structures and reference-compound matches are disclosed.' },
  { view: 'shortlist', title: '6. Save a design shortlist', body: 'Save computed candidates privately with structures, estimated properties and source-job references. Compare records across visits and export them as CSV; older illustrative records remain labeled.' },
];
export const RISK_STYLE = { low: 'bg-secondary text-secondary-foreground', moderate: 'bg-muted text-foreground', high: 'bg-destructive/10 text-destructive' };
export function exportShortlist(items) {
  const columns = ['id', 'drug', 'is_illustrative', 'source_job_id', 'target_chembl_id', 'smiles', 'binding_proxy_score', 'risk', 'molecular_weight', 'logp', 'tpsa', 'hbd', 'hba', 'rotatable_bonds', 'lipinski_violations', 'veber_violations', 'most_similar_known_ligand', 'reference_smiles', 'descriptor_method', 'target_uniprot_id', 'source', 'source_url', 'ranking_method', 'ranking_score', 'measured_affinity', 'evidence', 'score_components', 'screening_provenance'];
  const quote = value => { const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? ''); return `"${(/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`; };
  const csv = [columns.join(','), ...items.map(item => columns.map(key => quote(item[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'suttain-screening-shortlist.csv'; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}