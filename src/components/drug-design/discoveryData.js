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
  { view: 'new', step: 0, title: '1. Define a design target', body: 'Start Drug Design with the disease, gene, or protein you are investigating. Review public protein structures, bioactivity records, and disease annotations to establish the biological context.' },
  { view: 'new', step: 1, title: '2. Choose a library & method', body: 'Explore how a compound library and screening method shape a Drug Design study. Docking examines possible binding poses, ML re-ranking prioritizes candidates, and property filters narrow a search. These settings demonstrate the workflow without running calculations.' },
  { view: 'new', step: 2, title: '3. Review & launch', body: 'Review your target, library, and method before submitting a screening job. Real execution requires a connected screening provider; without one, submission remains unavailable and no job is counted.' },
  { view: 'queue', title: '4. Track screening submissions', body: 'Review your saved real screening jobs, refreshed every 15 seconds. Drug Design does not simulate job progress; this queue remains empty until a provider accepts a submission.' },
  { view: 'candidates', title: '5. Explore candidate trade-offs', body: 'Compare illustrative binding scores and ADMET labels, then sort or filter examples. These are not computed predictions. Binding affinity, pharmacokinetics, and toxicity require validated models and experimental testing.' },
  { view: 'shortlist', title: '6. Save a design shortlist', body: 'Save example candidates privately, compare their illustrative attributes, and export a CSV. Your shortlist persists across visits. SDF export requires real structures; shortlist API access is not connected.' },
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