import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

async function lookupByBarcode(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,brands,ingredients_text,allergens_tags,additives_tags,nova_group,nutriscore_grade,image_url,nutriments`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Suttain/1.0' } });
  if (!res.ok) throw new Error(`Open Food Facts lookup failed (${res.status})`);
  const data = await res.json();
  if (data.status === 0 || !data.product) return null;
  const p = data.product;
  return {
    product_name: p.product_name || 'Unknown product',
    brand: p.brands || 'N/A',
    ingredients: p.ingredients_text || 'No ingredient data',
    allergens: p.allergens_tags || [],
    additives: p.additives_tags || [],
    nova_group: p.nova_group || null,
    nutriscore: p.nutriscore_grade || null,
    image_url: p.image_url || null,
    nutrition_per_100g: p.nutriments || {}
  };
}

async function searchByName(name) {
  const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(name)}&fields=product_name,brands,ingredients_text,allergens_tags,additives_tags,nova_group,nutriscore_grade,image_url,nutriments&pageSize=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Suttain/1.0' } });
  if (!res.ok) throw new Error(`Open Food Facts search failed (${res.status})`);
  const data = await res.json();
  const p = data?.products?.[0];
  if (!p) return null;
  return {
    product_name: p.product_name || 'Unknown product',
    brand: p.brands || 'N/A',
    ingredients: p.ingredients_text || 'No ingredient data',
    allergens: p.allergens_tags || [],
    additives: p.additives_tags || [],
    nova_group: p.nova_group || null,
    nutriscore: p.nutriscore_grade || null,
    image_url: p.image_url || null,
    nutrition_per_100g: p.nutriments || {}
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { barcode, name } = body;

    let product;
    if (barcode) {
      product = await lookupByBarcode(barcode);
    } else if (name) {
      product = await searchByName(name);
    } else {
      return Response.json({ error: 'barcode or name is required' }, { status: 400 });
    }

    if (!product) {
      return Response.json({ error: 'Product not found in the Open Food Facts database.' }, { status: 404 });
    }

    return Response.json({ source: 'Open Food Facts', ...product });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});