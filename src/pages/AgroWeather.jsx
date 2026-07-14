import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudFog, CloudLightning, CloudDrizzle, Loader2, AlertCircle, Droplets, Wind, Thermometer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';
import { LANGUAGE_NAMES } from '@/components/agro/translations';
import { WeatherAlertsPanel } from '@/components/agro/FarmPanels';

const WEATHER_CODES = {
  0: { label: 'Clear sky', icon: Sun },
  1: { label: 'Mainly clear', icon: Sun },
  2: { label: 'Partly cloudy', icon: CloudSun },
  3: { label: 'Overcast', icon: Cloud },
  45: { label: 'Fog', icon: CloudFog },
  48: { label: 'Rime fog', icon: CloudFog },
  51: { label: 'Light drizzle', icon: CloudDrizzle },
  53: { label: 'Moderate drizzle', icon: CloudDrizzle },
  55: { label: 'Dense drizzle', icon: CloudDrizzle },
  61: { label: 'Slight rain', icon: CloudRain },
  63: { label: 'Moderate rain', icon: CloudRain },
  65: { label: 'Heavy rain', icon: CloudRain },
  71: { label: 'Slight snow', icon: CloudSnow },
  73: { label: 'Moderate snow', icon: CloudSnow },
  75: { label: 'Heavy snow', icon: CloudSnow },
  80: { label: 'Rain showers', icon: CloudRain },
  81: { label: 'Moderate showers', icon: CloudRain },
  82: { label: 'Violent showers', icon: CloudRain },
  95: { label: 'Thunderstorm', icon: CloudLightning },
  96: { label: 'Thunderstorm, hail', icon: CloudLightning },
  99: { label: 'Thunderstorm, heavy hail', icon: CloudLightning },
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { label: 'Unknown', icon: Cloud };
}

function WeatherContent() {
  const { t, language, activeFarmer, activeFarm } = useAgro();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState(null);
  const [generatingAdvice, setGeneratingAdvice] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeFarm || !activeFarmer?.location_lat) {
      setLoading(false);
      return;
    }
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${activeFarmer.location_lat}&longitude=${activeFarmer.location_lng}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
          `&timezone=auto&forecast_days=7`
        );
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [activeFarm, activeFarmer]);

  const handleGetAdvice = async () => {
    if (!weather) return;
    setGeneratingAdvice(true);
    setError(null);
    try {
      const days = weather.daily.time.map((time, i) => {
        const date = new Date(time);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return `${dayName}: ${getWeatherInfo(weather.daily.weather_code[i]).label}, ${weather.daily.temperature_2m_min[i]}-${weather.daily.temperature_2m_max[i]}C, Rain: ${weather.daily.precipitation_sum[i]}mm (${weather.daily.precipitation_probability_max[i]}%), Wind: ${weather.daily.wind_speed_10m_max[i]}km/h`;
      }).join('\n');

      const prompt = `You are Suttain Farm, an AI weather advisory tool for farmers.

Farm context:
- Location: ${activeFarmer?.location_name || 'Not specified'}
- Crops: ${activeFarm?.crops?.join(', ') || 'Not specified'}
- Primary crop: ${activeFarm?.primary_crop || 'Not specified'}

Weather forecast for the next 7 days:
${days}

Instructions:
1. Provide 3 advisories in ${LANGUAGE_NAMES[language]} language:
   a. Irrigation advisory: Which days are best to irrigate? Should they irrigate now or wait for rain?
   b. Spraying advisory: Which days are best/worst for spraying? (Consider wind and rain)
   c. Harvest advisory: Is there a good harvest window in the forecast?
2. Be practical and specific. Reference actual days from the forecast.
3. Use simple, non-technical language.
4. Keep each advisory to 2-3 sentences.

Format your response as:
IRRIGATION: [advice]
SPRAYING: [advice]
HARVEST: [advice]`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const responseText = typeof response === 'string' ? response : (response?.response || String(response));

      const sections = { irrigation: '', spraying: '', harvest: '' };
      const irrMatch = responseText.match(/IRRIGATION:?\s*([\s\S]*?)(?=SPRAYING:|$)/i);
      const sprayMatch = responseText.match(/SPRAYING:?\s*([\s\S]*?)(?=HARVEST:|$)/i);
      const harvestMatch = responseText.match(/HARVEST:?\s*([\s\S]*?)$/i);
      if (irrMatch) sections.irrigation = irrMatch[1].trim();
      if (sprayMatch) sections.spraying = sprayMatch[1].trim();
      if (harvestMatch) sections.harvest = harvestMatch[1].trim();
      if (!sections.irrigation && !sections.spraying && !sections.harvest) {
        sections.irrigation = responseText;
      }
      setAdvice(sections);

      await base44.entities.AdvisorySession.create({
        farm_id: activeFarm.id,
        farmer_id: activeFarmer?.id,
        question: 'Weather advisory request',
        ai_response: responseText,
        session_type: 'weather',
        language
      });
    } catch (err) {
      console.error('Advice error:', err);
      setError(t('error') + ' ' + t('retry'));
    } finally {
      setGeneratingAdvice(false);
    }
  };

  if (!activeFarm) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AgroHeader title={t('weather_advisory')} />
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#2D5016] font-semibold mb-4">{t('no_farm_selected')}</p>
          <Link to="/AgroFarmerProfile" className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px]">
            {t('go_to_profile')}
          </Link>
        </div>
      </div>
    );
  }

  if (!activeFarmer?.location_lat) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AgroHeader title={t('weather_advisory')} />
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#2D5016] font-semibold mb-4">{t('set_location_first')}</p>
          <Link to="/AgroFarmerProfile" className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px]">
            {t('go_to_profile')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <AgroHeader title={t('weather_advisory')} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A7C2A]" />
          <span className="ml-2 text-[#5B7553]">{t('loading_weather')}</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : weather ? (
        <div className="space-y-4">
          {weather.current && (
            <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#2D5016] mb-4">{t('current_conditions')}</h2>
              <div className="flex items-center gap-4 mb-4">
                {(() => { const Info = getWeatherInfo(weather.current.weather_code).icon; return <Info className="w-12 h-12 text-[#4A7C2A]" />; })()}
                <div>
                  <p className="text-3xl font-bold text-[#2D5016]">{Math.round(weather.current.temperature_2m)}C</p>
                  <p className="text-sm text-[#5B7553]">{getWeatherInfo(weather.current.weather_code).label}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <Droplets className="w-5 h-5 text-[#4A7C2A] mx-auto mb-1" />
                  <p className="text-xs text-[#8B6F47]">{t('humidity')}</p>
                  <p className="text-sm font-semibold text-[#2D5016]">{weather.current.relative_humidity_2m}%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-5 h-5 text-[#4A7C2A] mx-auto mb-1" />
                  <p className="text-xs text-[#8B6F47]">{t('wind')}</p>
                  <p className="text-sm font-semibold text-[#2D5016]">{Math.round(weather.current.wind_speed_10m)} km/h</p>
                </div>
                <div className="text-center">
                  <Thermometer className="w-5 h-5 text-[#4A7C2A] mx-auto mb-1" />
                  <p className="text-xs text-[#8B6F47]">Feels</p>
                  <p className="text-sm font-semibold text-[#2D5016]">{Math.round(weather.current.apparent_temperature)}C</p>
                </div>
              </div>
            </div>
          )}

          {weather.daily && (
            <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#2D5016] mb-4">{t('forecast')}</h2>
              <div className="space-y-2">
                {weather.daily.time.map((time, i) => {
                  const Info = getWeatherInfo(weather.daily.weather_code[i]).icon;
                  const date = new Date(time);
                  const dayName = i === 0 ? t('today') : date.toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#F0EBE0] last:border-0">
                      <span className="text-sm font-medium text-[#2D5016] w-16">{dayName}</span>
                      <Info className="w-6 h-6 text-[#4A7C2A] flex-shrink-0" />
                      <span className="text-sm text-[#5B7553] flex-1 text-center hidden sm:block">{getWeatherInfo(weather.daily.weather_code[i]).label}</span>
                      <span className="text-sm text-[#2D5016] w-20 text-right">
                        {Math.round(weather.daily.temperature_2m_min[i])} - {Math.round(weather.daily.temperature_2m_max[i])}
                      </span>
                      <span className="text-xs text-[#4A7C2A] w-12 text-right flex items-center justify-end gap-0.5">
                        <CloudRain className="w-3 h-3" />
                        {weather.daily.precipitation_probability_max[i]}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!advice && (
            <button
              onClick={handleGetAdvice}
              disabled={generatingAdvice}
              className="w-full flex items-center justify-center gap-2 bg-[#4A7C2A] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D5016] transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {generatingAdvice ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{t('generating_advice')}</>
              ) : t('get_advice')}
            </button>
          )}

          {advice && (
            <div className="space-y-3">
              {advice.irrigation && (
                <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5">
                  <h3 className="font-bold text-[#2D5016] mb-2 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-[#4A7C2A]" />
                    {t('irrigate_advice')}
                  </h3>
                  <p className="text-sm text-[#2D5016] whitespace-pre-wrap">{advice.irrigation}</p>
                </div>
              )}
              {advice.spraying && (
                <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5">
                  <h3 className="font-bold text-[#2D5016] mb-2 flex items-center gap-2">
                    <Wind className="w-5 h-5 text-[#4A7C2A]" />
                    {t('spray_advice')}
                  </h3>
                  <p className="text-sm text-[#2D5016] whitespace-pre-wrap">{advice.spraying}</p>
                </div>
              )}
              {advice.harvest && (
                <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5">
                  <h3 className="font-bold text-[#2D5016] mb-2 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-[#D4A017]" />
                    {t('harvest_advice')}
                  </h3>
                  <p className="text-sm text-[#2D5016] whitespace-pre-wrap">{advice.harvest}</p>
                </div>
              )}
              <p className="text-xs text-[#8B6F47] px-1">{t('disclaimer')}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function AgroWeather() {
  return (
    <AgroProvider>
      <WeatherContent />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 border-t border-[#D4C5B0] mt-4">
        <WeatherAlertsPanel />
      </div>
    </AgroProvider>
  );
}