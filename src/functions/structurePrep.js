import { base44 } from '@/api/base44Client';

export async function structurePrep(payload) {
  return await base44.functions.invoke('structurePrep', payload);
}