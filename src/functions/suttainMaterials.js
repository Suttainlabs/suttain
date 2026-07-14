import { base44 } from '@/api/base44Client';

export async function suttainMaterials(payload) {
  return await base44.functions.invoke('suttainMaterials', payload);
}