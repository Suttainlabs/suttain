import { base44 } from '@/api/base44Client';

export async function suttainFarmWeather(payload) {
  return await base44.functions.invoke('suttainFarmWeather', payload);
}