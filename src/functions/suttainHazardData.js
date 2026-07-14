import { base44 } from '@/api/base44Client';

export async function suttainHazardData(payload) {
  return await base44.functions.invoke('suttainHazardData', payload);
}