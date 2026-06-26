import { base44 } from '@/api/base44Client';

export async function proteinStructureIntelligence(payload) {
  return base44.functions.invoke('proteinStructureIntelligence', payload);
}