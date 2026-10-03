import { base44 } from '@/api/base44Client';
export const runPubchemLookup = payload => base44.functions.invoke('runPubchemLookup', payload);