import { base44 } from '@/api/base44Client';

export async function supplierVerification(payload) {
  return await base44.functions.invoke('supplierVerification', payload);
}