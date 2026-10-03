import { engineRegistry } from '../../shared/engineRegistry.ts';
export default async function(req) {
  try { return Response.json({engines:engineRegistry,notes:'Only listed template methods/tasks are implemented. Local packages are preparation, not executed calculations. Simmate is an external orchestration framework, not a connected compute provider.',simmate_url:'https://simmate.org/'}); }
  catch(error) { return Response.json({error:error.message},{status:500}); }
}