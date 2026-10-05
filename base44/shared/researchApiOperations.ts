import { engineRegistry } from './engineRegistry.ts';
import { deny } from './securityGuards.ts';
const extra=[
 {name:'comprehensiveChemicalSearch',group:'Chemical data',example:{query:'aspirin',database:'PubChem'}},
 {name:'enhancedIngredientSearch',group:'Ingredients',example:{query:'glycerin',properties:[],excludeIngredients:[]}},
 {name:'getAccurateChemicalAnalysis',group:'Safety analysis',example:{chemicals:['bleach','ammonia'],persona:'researcher'}},
 {name:'suttainRegulatory',group:'Compliance / GHS',example:{query:'acetone'}},
 {name:'suttainScienceData',group:'Molecular research',example:{source:'rcsb',query:'1CRN'}},
 {name:'suttainCompute',group:'Molecular descriptors',example:{mode:'descriptors',molecule:'aspirin'}},
 {name:'searchScreeningTargets',group:'Drug discovery',example:{query:'EGFR'}},
 {name:'submitDrugDiscoveryJob',group:'Drug discovery',example:{target_ref:'CHEMBL203',target_label:'EGFR',library:'chembl_bioactive',method:'balanced_evidence',max_candidates:20}},
 {name:'pollRowanJobs',group:'Hosted job status',example:{job_id:'YOUR_JOB_ID'}},
 {name:'getResearchApiJob',group:'Saved API results',example:{kind:'simulation',job_id:'YOUR_JOB_ID'}},
 {name:'getComputeEngines',group:'Engine registry',example:{}},
 {name:'generateSimulationInputs',group:'Local engine preparation',example:engineRegistry.find(e=>e.id==='orca')?.example || {}}
];
export function apiCatalog() {return [...extra,...engineRegistry.map(e=>({name:e.endpoint,group:e.deployment==='input_file'?'Local engine preparation':'Hosted / source lookup',example:e.example}))].filter((e,i,all)=>e.name && all.findIndex(x=>x.name===e.name)===i);}
export async function dispatchApiOperation(name,input,client) {
  if(!apiCatalog().some(e=>e.name===name)) deny('Unknown API operation.',400);
  const response=await client.functions.invoke(name,input);
  return Response.json(response.data);
}
export function validateApiInput(operation,input) {
  if(!input || typeof input!=='object' || Array.isArray(input)) deny('input must be a JSON object.',400);
  if(operation==='getAccurateChemicalAnalysis' && (!Array.isArray(input.chemicals) || input.chemicals.length<2 || input.chemicals.length>10 || input.chemicals.some(c=>typeof c!=='string' || !c.trim() || c.length>150))) deny('Provide 2–10 chemical names, each up to 150 characters.',400);
  if(['suttainScienceData','suttainRegulatory'].includes(operation) && (typeof input.query!=='string' || !input.query.trim() || input.query.length>200)) deny('Provide a query up to 200 characters.',400);
  if(operation==='suttainCompute' && (typeof input.molecule!=='string' || !input.molecule.trim() || input.molecule.length>2000 || (input.molecule_b && (typeof input.molecule_b!=='string' || input.molecule_b.length>2000)))) deny('Provide bounded molecular inputs.',400);
  if(operation==='enhancedIngredientSearch' && ((input.query!==undefined && typeof input.query!=='string') || ['properties','excludeIngredients'].some(k=>input[k]!==undefined && (!Array.isArray(input[k]) || input[k].length>30 || input[k].some(x=>typeof x!=='string' || x.length>150))))) deny('Invalid ingredient search filters.',400);
}