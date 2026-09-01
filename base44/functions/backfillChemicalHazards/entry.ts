import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { resolveHazardProfile, mapToDbSafetyLevel } from '../../shared/hazardProfiles.ts';

// Backfills the Chemical entity with explicit, sourced hazard classifications.
// Admin-only. Re-classifies every existing record using the curated hazard
// profile table, writing safety_level, data_source, and structured
// toxicity_data (GHS codes, signal word, primary hazards).
//
// Run against the Test database first (data_env=dev) before production.

export default async function (req) {
  const appId = Deno.env.get('BASE44_APP_ID');
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden, admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 500;
    const dryRun = body.dry_run === true;

    console.log(`[${appId}] backfillChemicalHazards: user=${user.email} limit=${limit} dryRun=${dryRun}`);

    // Fetch all chemicals (paginated)
    let allChemicals = [];
    let offset = 0;
    const pageSize = 200;
    while (true) {
      const batch = await base44.asServiceRole.entities.Chemical.list('-created_date', pageSize, offset);
      if (!batch || batch.length === 0) break;
      allChemicals = allChemicals.concat(batch);
      if (batch.length < pageSize || allChemicals.length >= limit) break;
      offset += batch.length;
    }
    allChemicals = allChemicals.slice(0, limit);

    console.log(`[${appId}] Fetched ${allChemicals.length} chemicals for classification`);

    let matched = 0;
    let unmatched = 0;
    let updated = 0;
    const updates = [];

    for (const chem of allChemicals) {
      const resolved = resolveHazardProfile(chem.name);
      if (!resolved.matched) {
        unmatched++;
        continue;
      }
      matched++;
      const profile = resolved.profile;
      const dbSafetyLevel = mapToDbSafetyLevel(profile);

      const toxicityData = {
        ...(chem.toxicity_data || {}),
        ghs_classification: profile.ghs_codes,
        signal_word: profile.signal_word,
        carcinogenicity: profile.hazard_class === 'carcinogen' ? 'Known human carcinogen (IARC Group 1)' : (chem.toxicity_data?.carcinogenicity || null),
      };

      const updateFields = {
        id: chem.id,
        safety_level: dbSafetyLevel,
        data_source: 'manual',
        toxicity_data: toxicityData,
      };

      if (profile.cas_number && !chem.cas_number) {
        updateFields.cas_number = profile.cas_number;
      }

      updates.push({ name: chem.name, fields: updateFields });
    }

    if (dryRun) {
      return Response.json({
        status: 'dry_run_complete',
        total_scanned: allChemicals.length,
        matched_curated: matched,
        unmatched: unmatched,
        would_update: updates.length,
        sample: updates.slice(0, 10).map(u => ({ id: u.fields.id, name: u.name, payload: { safety_level: u.fields.safety_level, data_source: u.fields.data_source, toxicity_data: u.fields.toxicity_data } })),
      });
    }

    // Apply updates in batches of up to 500 using bulkUpdate
    for (let i = 0; i < updates.length; i += 500) {
      const batch = updates.slice(i, i + 500).map(u => u.fields);
      await base44.asServiceRole.entities.Chemical.bulkUpdate(batch);
      updated += batch.length;
    }

    console.log(`[${appId}] Backfill complete: ${updated}/${allChemicals.length} chemicals updated`);

    return Response.json({
      status: 'success',
      total_scanned: allChemicals.length,
      matched_curated: matched,
      unmatched: unmatched,
      updated,
    });
  } catch (error) {
    console.error(`[${appId}] backfillChemicalHazards error:`, error.message);
    return Response.json({ error: 'Backfill failed', details: error.message }, { status: 500 });
  }
}