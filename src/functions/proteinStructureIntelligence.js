import { base44 } from '@/api/base44Client';

export async function proteinStructureIntelligence(payload) {
  return await base44.functions.invoke('proteinStructureIntelligence', payload);
}