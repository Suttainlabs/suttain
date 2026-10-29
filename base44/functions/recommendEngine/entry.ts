// Recommends the best engine for a binding or ADME calculation, based on the user's goal and input.
// No compute is run and no credits are spent. Body: { task: 'binding'|'adme', goal?: string, input?: object }
import { operationClient } from '../../shared/researchApiContext.ts';
import { requireUser } from '../../shared/securityGuards.ts';
import { recommend, GOALS, CHAINS } from '../../shared/hostedProviders.ts';

export default async function (req) {
  try {
    const base44 = await operationClient(req, 'recommendEngine');
    await requireUser(base44);
    const data = await req.json();
    if (!data || JSON.stringify(data).length > 64000) return Response.json({ error: 'Request too large.' }, { status: 400 });
    if (!CHAINS[data.task]) return Response.json({ error: 'Choose binding or ADME.' }, { status: 400 });
    return Response.json({ ...recommend(data.task, data.input || {}, data.goal), goals: GOALS[data.task] });
  } catch (error) { return Response.json({ error: error.message }, { status: error.status || 500 }); }
}
