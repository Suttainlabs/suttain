import {operationClient} from './researchApiContext.ts';
import {engineRegistry} from './engineRegistry.ts';
import {requireUser} from './securityGuards.ts';
export default function engineInputEndpoint(engine) {
  return async function(req) {
    try {
      const operation=engineRegistry.find(e=>e.label===engine)?.endpoint;
      const base44=await operationClient(req,operation);await requireUser(base44);
      const data=await req.json();
      if(!data || JSON.stringify(data).length>32000) return Response.json({error:'Invalid bounded input request.'},{status:400});
      const response=await base44.functions.invoke('generateSimulationInputs',{...data,engine});
      return Response.json(response.data);
    } catch(error) {return Response.json({error:error.response?.data?.error || error.message},{status:error.response?.status || error.status || 500});}
  };
}