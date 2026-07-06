import React, { useState, useEffect } from 'react';
import { AlertTriangle, CloudRain, CloudLightning, ThermometerSun, Wind, Snowflake, Droplets, Mountain, Loader2, CheckCircle } from 'lucide-react';
import { useAgro } from './AgroContext';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50', border: 'border-red-300', icon: 'text-red-600', label: 'text-red-800' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-300', icon: 'text-amber-600', label: 'text-amber-800' },
  info: { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'text-blue-600', label: 'text-blue-800' },
};

export default function UrgentAlertsCard({ farm, farmer }) {
  const { t } = useAgro();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmer?.location_lat) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${farmer.location_lat}&longitude=${farmer.location_lng}` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
          `&current=weather_code,wind_speed_10m` +
          `&timezone=auto&forecast_days=3`
        );
        const data = await res.json();
        if (cancelled) return;

        const generated = [];
        const soil = farm?.soil_type || 'unknown';
        const todayIdx = 0;

        // Helper to get day label
        const dayLabel = (i) => i === 0 ? t('today') : new Date(data.daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });

        // Check each forecast day for critical conditions
        for (let i = 0; i < Math.min(3, data.daily.time.length); i++) {
          const code = data.daily.weather_code[i];
          const tMax = data.daily.temperature_2m_max[i];
          const tMin = data.daily.temperature_2m_min[i];
          const precip = data.daily.precipitation_sum[i];
          const precipProb = data.daily.precipitation_probability_max[i];
          const windMax = data.daily.wind_speed_10m_max[i];

          // Thunderstorm (codes 95-99)
          if (code >= 95) {
            generated.push({
              icon: CloudLightning,
              severity: 'critical',
              title: t('alert_thunderstorm'),
              detail: `${dayLabel(i)}: ${t('alert_thunderstorm_detail')}`,
            });
          }

          // Heavy rain (code 65, 82) or high precipitation sum
          if (code === 65 || code === 82 || precip >= 20) {
            generated.push({
              icon: CloudRain,
              severity: 'warning',
              title: t('alert_heavy_rain'),
              detail: `${dayLabel(i)}: ${precip.toFixed(1)}mm ${t('alert_expected')}`,
            });
            // Waterlogging risk for clay/peat soils
            if (soil === 'clay' || soil === 'peat') {
              generated.push({
                icon: Droplets,
                severity: 'warning',
                title: t('alert_waterlogging'),
                detail: `${dayLabel(i)}: ${t('alert_waterlogging_detail')}`,
              });
            }
            // Soil erosion risk for sandy soils
            if (soil === 'sandy') {
              generated.push({
                icon: Mountain,
                severity: 'warning',
                title: t('alert_soil_erosion'),
                detail: `${dayLabel(i)}: ${t('alert_soil_erosion_detail')}`,
              });
            }
          }

          // Extreme heat (max temp >= 35C)
          if (tMax >= 35) {
            generated.push({
              icon: ThermometerSun,
              severity: 'critical',
              title: t('alert_extreme_heat'),
              detail: `${dayLabel(i)}: ${Math.round(tMax)}°C ${t('alert_expected')}`,
            });
          }

          // Frost risk (min temp <= 2C)
          if (tMin <= 2) {
            generated.push({
              icon: Snowflake,
              severity: 'critical',
              title: t('alert_frost'),
              detail: `${dayLabel(i)}: ${Math.round(tMin)}°C ${t('alert_expected')}`,
            });
          }

          // High wind (max wind >= 40 km/h)
          if (windMax >= 40) {
            generated.push({
              icon: Wind,
              severity: 'warning',
              title: t('alert_high_wind'),
              detail: `${dayLabel(i)}: ${Math.round(windMax)} km/h ${t('alert_expected')}`,
            });
          }

          // Drought stress: no rain for 3 days + sandy soil
          if (i === 2 && soil === 'sandy') {
            const totalPrecip = data.daily.precipitation_sum.slice(0, 3).reduce((s, v) => s + (v || 0), 0);
            if (totalPrecip < 2) {
              generated.push({
                icon: Droplets,
                severity: 'warning',
                title: t('alert_drought'),
                detail: t('alert_drought_detail'),
              });
            }
          }
        }

        // Deduplicate by title+detail
        const seen = new Set();
        const deduped = generated.filter(a => {
          const key = a.title + a.detail;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!cancelled) setAlerts(deduped);
      } catch (err) {
        console.error('Alert fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAlerts();
    return () => { cancelled = true; };
  }, [farmer?.location_lat, farmer?.location_lng, farm?.id, farm?.soil_type]);

  if (!farmer?.location_lat) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 mb-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#4A7C2A]" />
        <span className="text-sm text-[#5B7553]">{t('alerts_loading')}</span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 mb-6 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-[#4A7C2A] flex-shrink-0" />
        <span className="text-sm text-[#2D5016] font-medium">{t('alerts_no_alerts')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-[#2D5016]">{t('alerts_title')}</h2>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, idx) => {
          const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.warning;
          const Icon = alert.icon;
          return (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${style.bg} border ${style.border}`}>
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
              <div>
                <p className={`text-sm font-bold ${style.label}`}>{alert.title}</p>
                <p className="text-xs text-slate-600">{alert.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}