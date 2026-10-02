import { base44 } from '@/api/base44Client';
export const generateSimulationInputs = payload => base44.functions.invoke('generateSimulationInputs', payload);