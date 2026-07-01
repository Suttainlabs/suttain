import { base44 } from '@/api/base44Client';

export async function checkLoginAccess(payload) {
  return base44.functions.invoke('checkLoginAccess', payload);
}