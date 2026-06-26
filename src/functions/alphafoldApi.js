import { base44 } from '@/api/base44Client';

export async function alphafoldApi(payload) {
  return base44.functions.invoke('alphafoldApi', payload);
}