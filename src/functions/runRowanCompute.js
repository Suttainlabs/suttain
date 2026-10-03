import { base44 } from '@/api/base44Client';
export const runRowanCompute = payload => base44.functions.invoke('runRowanCompute', payload);