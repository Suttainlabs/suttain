import { base44 } from '@/api/base44Client';

export async function recordLoginResult(payload) {
  return base44.functions.invoke('recordLoginResult', payload);
}