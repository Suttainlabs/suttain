import { base44 } from '@/api/base44Client';
export const comprehensiveChemicalSearch = (payload) => base44.functions.invoke('comprehensiveChemicalSearch', payload);