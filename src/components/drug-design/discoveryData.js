export const CANDIDATES = [
  { id: 'SUT-88291', score: 9.2, risk: 'low', sim: 62, drug: 'gefitinib-like', synth: 0.81 },
  { id: 'SUT-14027', score: 8.8, risk: 'moderate', sim: 41, drug: 'novel scaffold', synth: 0.64 },
  { id: 'SUT-55210', score: 8.1, risk: 'low', sim: 58, drug: 'erlotinib-like', synth: 0.77 },
  { id: 'SUT-90144', score: 7.4, risk: 'high', sim: 29, drug: 'novel scaffold', synth: 0.52 },
];
export const NAV = [['dashboard', 'Dashboard'], ['how', 'How it works'], ['new', 'New screening'], ['queue', 'Job queue'], ['candidates', 'Candidates'], ['shortlist', 'Shortlist']];
export const STEPS = ['Target', 'Library & method', 'Review & launch'];
export const LIBRARIES = { chembl_bioactive: 'ChEMBL clinical-stage small molecules', suttain_index: 'Suttain indexed library', user_upload: 'Your own library (.sdf, .csv)' };
export const METHODS = { ligand_similarity: 'Ligand-based similarity (not docking)', property_filter: 'Estimated property filter only' };
export const WALKTHROUGH = [
  { view: 'new', step: 0, title: '1. Define a design target', body: 'Start Drug Design with the disease, gene, or protein you are investigating. Review public protein structures, bioactivity records, and disease annotations to establish the biological context.' },
  { view: 'new', step: 1, title: '2. Choose a library & method', body: 'Screen up to 250 clinical-stage ChEMBL small molecules. Choose similarity to known active ligands or estimated property filtering. Neither option performs docking or ML re-ranking.' },
  { view: 'new', step: 2, title: '3. Review & launch', body: 'Fetch live ChEMBL molecules and compute bounded JS molecular-graph calculations. The completed run and ranked candidates are saved; source failures are reported without invented results.' },
  { view: 'queue', title: '4. Review completed runs', body: 'See your latest 50 saved runs, actual processed counts and local execution receipts. Open a run to review its candidates and method details.' },
  { view: 'candidates', title: '5. Explore candidate trade-offs', body: 'Compare Tanimoto similarity, estimated LogP/TPSA, molecular weight and rule violations. Scores prioritize research, not binding affinity or validated ADMET. Unsupported structures and reference-compound matches are disclosed.' },
  { view: 'shortlist', title: '6. Save a design shortlist', body: 'Save computed candidates privately with structures, estimated properties and source-job references. Compare records across visits and export them as CSV; older illustrative records remain labeled.' },
];
export const RISK_STYLE = { low: 'bg-secondary text-secondary-foreground', moderate: 'bg-muted text-foreground', high: 'bg-destructive/10 text-destructive' };
export function exportShortlist(items) {
  const columns = ['id', 'drug', 'is_illustrative', 'source_job_id', 'target_chembl_id', 'smiles', 'binding_proxy_score', 'risk', 'molecular_weight', 'logp', 'tpsa', 'hbd', 'hba', 'rotatable_bonds', 'lipinski_violations', 'veber_violations', 'most_similar_known_ligand', 'reference_smiles', 'descriptor_method'];
  const quote = value => { const text = String(value ?? ''); return `"${(/^[=+@\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`; };
  const csv = [columns.join(','), ...items.map(item => columns.map(key => quote(item[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'suttain-screening-shortlist.csv'; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}