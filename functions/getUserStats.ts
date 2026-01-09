import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const userEmail = user.email;
    const filter = { created_by: userEmail };

    // Fetch records and count them using .length for reliability.
    // We only need the 'id' field to minimize data transfer.
    const [formulas, simulations, scans] = await Promise.all([
        base44.entities.Formula.filter(filter, null, null, false, ['id']).catch(() => []),
        base44.entities.Simulation.filter(filter, null, null, false, ['id']).catch(() => []),
        base44.entities.BarcodeHistory.filter(filter, null, null, false, ['id']).catch(() => [])
    ]);

    return new Response(JSON.stringify({
      totalFormulas: formulas.length,
      totalSimulations: simulations.length,
      totalScans: scans.length,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting user stats:', error.message);
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve user statistics.',
      totalFormulas: 0,
      totalSimulations: 0,
      totalScans: 0
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});