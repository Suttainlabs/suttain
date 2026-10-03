import { secrets } from 'base44:runtime';
import { elements } from './rowanInput.ts';
export async function rowanRequest(path, options = {}) {
  const key = secrets.get('ROWAN_API_KEY');
  if (!key) throw new Error('Rowan credentials are unavailable.');
  const response = await fetch(`https://api.rowansci.com${path}`, { ...options, headers: { 'X-API-Key':key, 'Content-Type':'application/json' }, signal:AbortSignal.timeout(25000) });
  const data = await response.json();
  if (!response.ok) { const error = new Error(typeof data.detail === 'string' ? data.detail.slice(0, 500) : `Rowan request failed (${response.status}).`); error.providerStatus = response.status; throw error; }
  return data;
}
export function moleculeXYZ(molecule) {
  if (!molecule?.atoms?.length) return null;
  return `${molecule.atoms.length}\nRowan computed geometry\n${molecule.atoms.map(a => `${elements[a.atomic_number]} ${a.position.join(' ')}`).join('\n')}`;
}
export async function syncRowanJob(client, job, service = false) {
  const entities = service ? client.asServiceRole.entities : client.entities;
  if (!job.provider_job_id || !['pending','running'].includes(job.status)) return job;
  const workflow = await rowanRequest(`/workflow/${encodeURIComponent(job.provider_job_id)}`);
  const state = workflow.object_status;
  let update = { status: state === 1 ? 'running' : 'pending' };
  if ([3,4,7].includes(state)) update = { status:'failed', error:'Rowan calculation failed or stopped. Inspect the provider workflow for details.' };
  if (state === 2) {
    const calculationId = workflow.object_data?.calculation_uuid;
    if (!calculationId) throw new Error('Rowan completed but the calculation result is not available yet.');
    const calculation = await rowanRequest(`/calculation/${encodeURIComponent(calculationId)}/stjames`);
    const molecules = calculation.molecules || [];
    const final = molecules[molecules.length - 1];
    if (!final?.atoms?.length) throw new Error('Rowan geometry is not available yet.');
    const charges = final.mulliken_charges ?? final.charges ?? null;
    const frequencies = final.vibrational_modes?.map(mode => mode.frequency) ?? final.frequencies ?? null;
    const frames = molecules.map(m => ({ xyz:moleculeXYZ(m), energy: m.energy ?? null }));
    const file = new File([JSON.stringify({ frames, final_molecule:final })], 'rowan-results.json', { type:'application/json' });
    const { file_uri } = await client.asServiceRole.integrations.Core.UploadPrivateFile({ file });
    const settings = workflow.object_data?.settings || job.result?.settings || {};
    const keyValues = [['Energy', final.energy, 'Hartree'], ['Dipole vector', final.dipole, 'Debye'], ['Vibrational frequencies', frequencies, 'cm⁻¹'], ['Partial charges', charges, 'e']].filter(([,value]) => value != null).map(([property,value,unit]) => ({property, value:Array.isArray(value) ? value.join(', ') : String(value), unit, interpretation:'Reported by Rowan; not an AI estimate.'}));
    update = { status:'completed', result:{ execution_mode:'real', provider_job_id:job.provider_job_id, calculation_uuid:calculationId, results_file_uri:file_uri, final_xyz:moleculeXYZ(final), settings, energy:final.energy ?? null, charges, dipole:final.dipole ?? null, frequencies, optimization_energies:frames.map(f => f.energy), frame_count:frames.length, system_overview:'Real quantum-chemistry calculation completed by Rowan.', computational_approach:`${settings.method} / ${settings.basis_set?.name || 'built-in basis'} using ${calculation.engine || settings.engine}.`, scientific_interpretation:'Review convergence and the provider workflow before drawing scientific conclusions. No safety conclusions are inferred from electronic energy.', predicted_results:{summary:'Computed provider output',key_values:keyValues}, limitations:'This is molecular quantum chemistry, not molecular dynamics. Optimization frames are geometry steps, not a time-resolved trajectory. Temperature, pressure, pH, ionic strength and classical forcefields are not applied by this calculation.', engine:calculation.engine || settings.engine, credits_charged:workflow.credits_charged, elapsed:calculation.elapsed } };
  }
  const updated = await entities.SimulationJob.update(job.id, update);
  if (job.draft_id) await entities.SimulationDraft.update(job.draft_id, { status:update.status === 'pending' ? 'running' : update.status, ...(update.result ? {result:update.result} : {}), ...(update.error ? {error:update.error} : {}) });
  return updated;
}
export async function verifyRowanSignature(raw, header) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map(p => p.trim().split('=')));
  const timestamp = parts.t, digest = parts.sha256;
  if (!/^\d+$/.test(timestamp || '') || !/^[a-f0-9]{64}$/.test(digest || '') || Math.abs(Date.now()/1000-Number(timestamp)) > 300) return false;
  const secret = secrets.get('ROWAN_WEBHOOK_SECRET');
  if (!secret) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['verify']);
  const prefix = encoder.encode(`${timestamp}.`), bytes = new Uint8Array(prefix.length + raw.length);
  bytes.set(prefix); bytes.set(raw,prefix.length);
  const signature = Uint8Array.from(digest.match(/.{2}/g), x => parseInt(x,16));
  return await crypto.subtle.verify('HMAC', key, signature, bytes);
}