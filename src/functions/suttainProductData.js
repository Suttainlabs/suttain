import { base44 } from '@/api/base44Client';

export async function suttainProductData(payload) {
  return await base44.functions.invoke('suttainProductData', payload);
}