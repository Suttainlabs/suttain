export const CANDIDATES = [
  { id: 'SUT-88291', score: 9.2, risk: 'low', sim: 62, drug: 'gefitinib-like', synth: 0.81 },
  { id: 'SUT-14027', score: 8.8, risk: 'moderate', sim: 41, drug: 'novel scaffold', synth: 0.64 },
  { id: 'SUT-55210', score: 8.1, risk: 'low', sim: 58, drug: 'erlotinib-like', synth: 0.77 },
  { id: 'SUT-90144', score: 7.4, risk: 'high', sim: 29, drug: 'novel scaffold', synth: 0.52 },
];
export const NAV = [['dashboard', 'Dashboard'], ['how', 'How it works'], ['new', 'New screening'], ['queue', 'Job queue'], ['candidates', 'Candidates'], ['shortlist', 'Shortlist']];
export const STEPS = ['Target', 'Library & method', 'Review & launch'];
export const LIBRARIES = { suttain_index: 'Suttain indexed library', chembl_bioactive: 'ChEMBL bioactive subset', user_upload: 'Your own library (.sdf, .csv)' };
export const METHODS = { docking_ml_rerank: 'Docking + ML re-ranking (recommended)', docking_only: 'Docking only', property_filter: 'Property filter only' };
export const WALKTHROUGH = [
  { view: 'new', step: 0, title: '1. Define a target', body: 'Search for the disease, gene, or protein you are investigating. Public protein structures, bioactivity records, and disease annotations help establish what a candidate compound would need to bind to.' },
  { view: 'new', step: 1, title: '2. Choose a library & method', body: 'Choose a compound library and a screening approach. In a real pipeline, docking models possible binding poses, ML re-ranking prioritizes predictions, and property filters provide a faster first pass. Here these are demonstration settings.' },
  { view: 'new', step: 2, title: '3. Review & launch', body: 'Confirm your target, library, and method before committing compute. Launching requires a connected real screening provider. Until one is connected, submission is blocked and no job is counted.' },
  { view: 'queue', title: '4. Track the job queue', body: 'The queue reads your saved real compute submissions and refreshes every 15 seconds. It does not simulate progress; it remains empty until a real screening provider accepts a job.' },
  { view: 'candidates', title: '5. Review ranked candidates', body: 'Compare example binding scores and ADMET risk labels, then sort or filter candidates. Real binding affinity and absorption, distribution, metabolism, excretion, and toxicity require validated models and laboratory testing; these example values are not predictions.' },
  { view: 'shortlist', title: '6. Shortlist & compare', body: 'Save illustrative candidates privately to your account, compare them side by side, and export a CSV. Your shortlist survives refresh. SDF export needs real molecular structures, and shortlist API access is not yet connected.' },
];
export const RISK_STYLE = { low: 'bg-secondary text-secondary-foreground', moderate: 'bg-muted text-foreground', high: 'bg-destructive/10 text-destructive' };
export function exportShortlist(items) {
  const columns = ['id', 'score', 'risk', 'sim', 'drug', 'synth'];
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [columns.join(','), ...items.map(item => columns.map(key => quote(item[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'suttain-demo-shortlist.csv'; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}