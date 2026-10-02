import { base44 } from '@/api/base44Client';
export const getDrugDiscoveryMetrics = payload => base44.functions.invoke('getDrugDiscoveryMetrics', payload);