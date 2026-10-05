import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { requireUser } from '../../shared/securityGuards.ts';
import apiSecurityTests from '../../shared/researchApiTests.ts';
export default async function(req) {
 try {
  const client=createClientFromRequest(req);await requireUser(client,true);
  return Response.json(await apiSecurityTests());
 } catch(error) {return Response.json({error:error.message},{status:error.status || 500});}
}