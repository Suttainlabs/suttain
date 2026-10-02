import { base44 } from '@/api/base44Client';
export const submitDrugDiscoveryJob = payload => base44.functions.invoke('submitDrugDiscoveryJob', payload);