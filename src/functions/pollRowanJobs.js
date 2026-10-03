import { base44 } from '@/api/base44Client';
export const pollRowanJobs = payload => base44.functions.invoke('pollRowanJobs', payload);