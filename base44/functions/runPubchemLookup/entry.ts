import {createClientFromRequest} from 'npm:@base44/sdk@0.8.52';
import {requireUser,reserveSecurityAction} from '../../shared/securityGuards.ts';
import {reserveUsage} from '../../shared/usageEntitlements.ts';
import {findEngine} from '../../shared/engineRegistry.ts';
export default async function(req) {
  try {
    const base44=createClientFromRequest(req),user=await requireUser(base44),data=await req.json();
    if(JSON.stringify(data).length>6000) return Response.json({error:'Request too large.'},{status:400});
    const query=String(data.query || '').trim(), namespace=data.namespace || 'name', operation=data.operation || 'Properties';
    if(!query || query.length>1000 || !['name','smiles','cid'].includes(namespace) || !['Properties','Synonyms'].includes(operation) || (namespace==='cid' && !/^\d+$/.test(query))) return Response.json({error:'Provide a valid query, namespace and operation.'},{status:400});
    await reserveSecurityAction(base44,user,{channel:'pubchem_lookup',limit:30,hourly:true});
    const limited=await reserveUsage(base44,user,'research'); if(limited) return limited;
    const root='https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound';
    const suffix=operation==='Properties'?'property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,IsomericSMILES,XLogP,TPSA/JSON':'synonyms/JSON';
    const url=namespace==='smiles'?`${root}/smiles/${suffix}`:`${root}/${namespace}/${encodeURIComponent(query)}/${suffix}`;
    const response=await fetch(url,{...(namespace==='smiles'?{method:'POST',body:new URLSearchParams({smiles:query})}:{}),signal:AbortSignal.timeout(15000)});
    if(!response.ok) return Response.json({error:response.status===404?'No matching PubChem compound found.':`PubChem lookup unavailable (${response.status}).`},{status:response.status===404?404:502});
    const source=await response.json(); const properties=source.PropertyTable?.Properties?.[0], synonyms=source.InformationList?.Information?.[0],cid=properties?.CID || synonyms?.CID;
    if(!cid) return Response.json({error:'PubChem returned no compound record.'},{status:404});
    const engine=findEngine('pubchem'),result={engine:engine.label,engine_id:engine.id,execution_mode:'real',result_kind:'lookup',method:operation,source_cid:cid,retrieved_at:new Date().toISOString(),properties:properties || null,synonyms:(synonyms?.Synonym || []).slice(0,100),citations:[{title:'PubChem PUG-REST',text:engine.citation,url:engine.docs_url}],summary:'Source-backed compound lookup. This is not quantum chemistry, a fresh RDKit calculation, or a Rowan fallback.'};
    const hash=`pubchem-${crypto.randomUUID()}`,simType=String(data.sim_type || 'lookup').slice(0,60);
    const draft=await base44.entities.SimulationDraft.create({name:`PubChem: ${query.slice(0,80)}`,sim_type:simType,engine:engine.label,raw_inputs:{query,namespace,operation},status:'completed',run_id:hash});
    const job=await base44.entities.SimulationJob.create({draft_id:draft.id,job_hash:hash,job_name:draft.name,sim_type:simType,engine:engine.label,inputs:{query,namespace,operation},status:'completed',execution_mode:'real',provider_job_id:`pubchem:CID:${cid}`,result});
    return Response.json({...result,job_id:job.id});
  } catch(error) { return Response.json({error:error.message},{status:error.status || 500}); }
}