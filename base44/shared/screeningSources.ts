import { fetchChemblEvidence } from './screeningChemblEvidence.ts';
import { fetchBindingdbEvidence } from './screeningBindingdb.ts';
import { fetchPubchemEvidence } from './screeningPubchem.ts';
export const sourceNames = { chembl_bioactive: 'ChEMBL', bindingdb: 'BindingDB', pubchem: 'PubChem' };
export async function retrieveEvidence(target, input, options = {}, providers = [fetchChemblEvidence, fetchBindingdbEvidence, fetchPubchemEvidence]) {
  const keys = ['chembl_bioactive', 'bindingdb', 'pubchem']; const start = Math.max(0, keys.indexOf(input.library)); const statuses = keys.slice(0, start).map(k => ({ source: sourceNames[k], status: 'skipped', reason: 'User chose a later starting tier' }));
  for (let i = start; i < keys.length; i++) {
    try {
      if (i === 0 && target.chembl_unavailable) { const e = new Error(target.chembl_unavailable); e.sourceCode = 'unavailable'; throw e; }
      const data = await providers[i](target, input, options);
      if (!Array.isArray(data?.rows)) { const e = new Error('Malformed normalized source records'); e.sourceCode = 'malformed'; throw e; }
      statuses.push({ source: sourceNames[keys[i]], status: data.rows.length ? 'available' : 'empty', records_reviewed: data.reviewed, reason: data.rows.length ? 'Target-linked records retrieved' : 'Valid response with no eligible records; fallback intentionally stopped' });
      for (const k of keys.slice(i + 1)) statuses.push({ source: sourceNames[k], status: 'skipped', reason: 'Previous source returned a valid response' });
      return { ...data, library: keys[i], source: sourceNames[keys[i]], source_status: statuses };
    } catch (e) {
      if (!e.sourceCode) throw e;
      statuses.push({ source: sourceNames[keys[i]], status: 'unavailable', reason: e.message, failure_type: e.sourceCode });
    }
  }
  const e = new Error('No eligible source could be reached or mapped. ' + statuses.filter(s => s.status === 'unavailable').map(s => `${s.source}: ${s.reason}`).join('; ')); e.status = 502; e.sourceStatus = statuses; throw e;
}