import { base44 } from '@/api/base44Client';

export async function suttainRegulatory(payload) {
  return await base44.functions.invoke('suttainRegulatory', payload);
}