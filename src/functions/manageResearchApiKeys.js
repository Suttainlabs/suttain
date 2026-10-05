import { base44 } from '@/api/base44Client';
export const manageResearchApiKeys = payload => base44.functions.invoke('manageResearchApiKeys',payload);