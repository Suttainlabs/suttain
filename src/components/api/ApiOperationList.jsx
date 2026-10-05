import React from 'react';
const operations=[
 ['comprehensiveChemicalSearch','Chemical search',{query:'aspirin',database:'PubChem'}],
 ['enhancedIngredientSearch','Ingredient search',{query:'glycerin',properties:[],excludeIngredients:[]}],
 ['getAccurateChemicalAnalysis','Safety analysis',{chemicals:['bleach','ammonia'],persona:'researcher'}],
 ['suttainRegulatory','Published GHS classification',{query:'acetone'}],
 ['suttainScienceData','Scientific source lookup',{source:'rcsb',query:'1CRN'}],
 ['suttainCompute','Molecular descriptors',{mode:'descriptors',molecule:'aspirin'}],
 ['searchScreeningTargets','Target search',{query:'EGFR'}],
 ['submitDrugDiscoveryJob','Evidence screening',{target_ref:'CHEMBL203',target_label:'EGFR',library:'chembl_bioactive',method:'balanced_evidence',max_candidates:20}],
 ['pollRowanJobs','Hosted calculation status',{job_id:'YOUR_JOB_ID'}],
 ['getResearchApiJob','Read saved results',{kind:'screening',job_id:'YOUR_JOB_ID'}],
 ['getComputeEngines','Live engine registry',{}]
];
export default function ApiOperationList({engines}) {
 const engineNames=engines.map(e=>e.endpoint).filter(Boolean);
 return <div className="space-y-3"><h3>Operation reference</h3><p className="text-sm text-muted-foreground">All operations below use the same key-authenticated entry point. Requests can only read saved jobs belonging to the key’s subscribing owner. Screening prioritizes source-backed evidence; it does not perform docking or validate a drug.</p>{operations.map(([name,label,input])=><details key={name} className="rounded-lg border border-border p-4"><summary className="cursor-pointer text-sm font-medium">{label}<span className="block font-mono text-xs text-muted-foreground break-all">{name}</span></summary><pre className="mt-3 rounded-lg bg-muted p-3 overflow-x-auto text-xs">{JSON.stringify({operation:name,input},null,2)}</pre>{name==='suttainScienceData' && <p className="text-xs text-muted-foreground mt-3">Sources: pubchem, chembl, rcsb, alphafold. AlphaFold is a published model lookup, not fresh protein prediction.</p>}{name==='getResearchApiJob' && <p className="text-xs text-muted-foreground mt-3">Use kind: simulation or screening. job_id is returned by the submission/preparation operation.</p>}</details>)}<div className="rounded-lg bg-muted p-4"><h3 className="text-base">Engine operations</h3><p className="text-sm text-muted-foreground mt-2">The engine reference below provides supported tasks, inputs, and examples for each operation.</p><p className="font-mono text-xs text-muted-foreground mt-3 break-words">{engineNames.join(' · ') || 'Loading engine operations…'} · generateSimulationInputs</p></div></div>;
}