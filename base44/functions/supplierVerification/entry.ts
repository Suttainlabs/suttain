import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    const text = await req.text();
    if (text.length > 100000) return Response.json({ error: 'Request too large' }, { status: 413 });
    let body;
    try { body = JSON.parse(text); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
    const { token, action = 'preview' } = body || {};
    // The invitation's unguessable bearer token authorizes this public flow.
    // Never accept a record ID or return the underlying entity to the caller.
    if (typeof token !== 'string' || !/^[a-f0-9]{32}$/.test(token)) {
      return Response.json({ error: 'Invalid verification token' }, { status: 400 });
    }
    if (!['preview', 'submit'].includes(action)) return Response.json({ error: 'Invalid action' }, { status: 400 });
    const base44 = createClientFromRequest(req);
    const records = await base44.asServiceRole.entities.SupplierVerification.filter({ token }, '-created_date', 2);
    const record = records.length === 1 ? records[0] : null;
    const now = new Date().toISOString();
    if (!record || !record.expires_at || !Number.isFinite(Date.parse(record.expires_at)) || Date.parse(record.expires_at) <= Date.now()) {
      return Response.json({ error: 'Verification request not found or expired' }, { status: 404 });
    }
    if (record.status !== 'pending') return Response.json({ error: 'This verification request is no longer open' }, { status: 409 });
    const ingredients = record.ingredients_to_verify || [];
    if (action === 'preview') {
      return Response.json({ formula_name: record.formula_name, ingredients_to_verify: ingredients });
    }
    const { submitted_data, supplier_notes = '', document_urls = [] } = body;
    if (!submitted_data || typeof submitted_data !== 'object' || Array.isArray(submitted_data)
        || Object.keys(submitted_data).some(name => !ingredients.includes(name))
        || typeof supplier_notes !== 'string' || supplier_notes.length > 10000
        || !Array.isArray(document_urls) || document_urls.length > 20
        || document_urls.some(url => typeof url !== 'string' || url.length > 2048 || !/^https:\/\//.test(url))) {
      return Response.json({ error: 'Invalid submission' }, { status: 400 });
    }
    const entries = [];
    for (const name of ingredients) {
      const value = Object.hasOwn(submitted_data, name) ? submitted_data[name] : { confirmed: false };
      if (!value || typeof value !== 'object' || Array.isArray(value) || typeof value.confirmed !== 'boolean') {
        return Response.json({ error: 'Invalid ingredient confirmation' }, { status: 400 });
      }
      const entry = { confirmed: value.confirmed };
      for (const field of ['grade', 'origin', 'notes']) {
        const input = value[field] ?? '';
        if (typeof input !== 'string' || input.length > 2000) return Response.json({ error: 'Invalid ingredient details' }, { status: 400 });
        entry[field] = input;
      }
      entries.push([name, entry]);
    }
    if (!entries.some(([, value]) => value.confirmed)) return Response.json({ error: 'Confirm at least one ingredient' }, { status: 400 });
    // Conditional write prevents a concurrent/replayed request from changing a submission.
    await base44.asServiceRole.entities.SupplierVerification.updateMany(
      { id: record.id, token, status: 'pending', expires_at: { $gt: now } },
      { $set: { status: 'submitted', submitted_data: Object.fromEntries(entries), supplier_notes, document_urls } }
    );
    return Response.json({ success: true });
  } catch (error) {
    console.error('supplierVerification failed:', error.message);
    return Response.json({ error: 'Unable to process verification request' }, { status: 500 });
  }
}