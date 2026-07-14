import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const USDA_API_KEY = 'DEMO_KEY'; // Register USDA_API_KEY in dashboard settings for higher rate limits
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

function findNutrient(nutrients, names) {
  for (const n of nutrients) {
    const nutrientName = (n.nutrient?.name || n.nutrientName || '').toLowerCase();
    for (const target of names) {
      if (nutrientName === target.toLowerCase() || nutrientName.includes(target.toLowerCase())) {
        return n.amount ?? n.value;
      }
    }
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { query, fdc_id } = body;

    // Mode 1: Search foods
    if (query && !fdc_id) {
      const searchUrl = `${USDA_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=10`;
      const res = await fetch(searchUrl);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        return Response.json({ error: `USDA search failed (${res.status}): ${txt.substring(0, 200)}` }, { status: 502 });
      }
      const data = await res.json();
      const foods = (data.foods || []).map(f => {
        const nutrients = f.foodNutrients || [];
        return {
          fdc_id: f.fdcId,
          description: f.description,
          brand: f.brandOwner || '',
          data_type: f.dataType || '',
          kcal: findNutrient(nutrients, ['Energy']),
          protein_g: findNutrient(nutrients, ['Protein']),
          carbs_g: findNutrient(nutrients, ['Carbohydrate']),
          fat_g: findNutrient(nutrients, ['Total lipid', 'Total fat (lipid)'])
        };
      });
      return Response.json({
        source: 'USDA FoodData Central',
        query,
        results: foods
      });
    }

    // Mode 2: Get food detail by FDC ID
    if (fdc_id) {
      const detailUrl = `${USDA_BASE}/food/${fdc_id}?api_key=${USDA_API_KEY}`;
      const res = await fetch(detailUrl);
      if (!res.ok) {
        return Response.json({ error: `USDA detail failed (${res.status})` }, { status: 502 });
      }
      const f = await res.json();
      const nutrients = f.foodNutrients || [];
      return Response.json({
        source: 'USDA FoodData Central',
        fdc_id: f.fdcId,
        description: f.description,
        ingredients: f.ingredients || null,
        nutrition_per_100g: {
          energy_kcal: findNutrient(nutrients, ['Energy']),
          protein_g: findNutrient(nutrients, ['Protein']),
          carbs_g: findNutrient(nutrients, ['Carbohydrate']),
          sugars_g: findNutrient(nutrients, ['Sugars']),
          fat_g: findNutrient(nutrients, ['Total lipid', 'Total fat']),
          fiber_g: findNutrient(nutrients, ['Fiber']),
          sodium_mg: findNutrient(nutrients, ['Sodium']),
          calcium_mg: findNutrient(nutrients, ['Calcium']),
          iron_mg: findNutrient(nutrients, ['Iron'])
        }
      });
    }

    return Response.json({ error: 'Provide either query or fdc_id' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});