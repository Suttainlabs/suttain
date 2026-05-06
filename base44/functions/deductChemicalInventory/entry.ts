import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Support both: direct call { simulation_id, chemicals[] }
        // and entity automation payload { event, data: { chemicals[], ... } }
        let chemicals = [];
        let simulation_id = null;

        if (body.event && body.data) {
            // Called from entity automation
            chemicals = body.data?.chemicals || [];
            simulation_id = body.event?.entity_id;
            console.log(`Automation triggered for simulation ${simulation_id}, chemicals:`, chemicals);
        } else {
            // Direct call
            chemicals = body.chemicals || [];
            simulation_id = body.simulation_id;
        }

        if (!chemicals || chemicals.length === 0) {
            console.log('No chemicals to deduct for simulation', simulation_id);
            return Response.json({ message: 'No chemicals to deduct', deducted: [] });
        }

        const deducted = [];
        const notFound = [];

        for (const chemicalName of chemicals) {
            const results = await base44.asServiceRole.entities.Chemical.filter({ name: chemicalName });

            if (!results || results.length === 0) {
                notFound.push(chemicalName);
                console.log(`Chemical not found in inventory: "${chemicalName}"`);
                continue;
            }

            const chemical = results[0];
            const currentStock = chemical.stock_quantity ?? 0;

            if (currentStock <= 0) {
                console.log(`Chemical "${chemicalName}" is already at 0 stock, skipping.`);
                notFound.push(`${chemicalName} (out of stock)`);
                continue;
            }

            const newStock = Math.max(0, currentStock - 1);
            await base44.asServiceRole.entities.Chemical.update(chemical.id, {
                stock_quantity: newStock
            });

            deducted.push({ name: chemicalName, previous: currentStock, new: newStock });
            console.log(`Deducted 1 unit of "${chemicalName}": ${currentStock} → ${newStock}`);
        }

        console.log(`Simulation ${simulation_id}: deducted ${deducted.length} chemicals, ${notFound.length} not found/out-of-stock.`);

        return Response.json({
            simulation_id,
            deducted,
            not_found: notFound,
            message: `Successfully deducted ${deducted.length} chemical(s).`
        });

    } catch (error) {
        console.error('deductChemicalInventory error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});