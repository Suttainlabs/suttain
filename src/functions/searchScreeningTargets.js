import { base44 } from '@/api/base44Client';
export const searchScreeningTargets = payload => base44.functions.invoke('searchScreeningTargets', payload);