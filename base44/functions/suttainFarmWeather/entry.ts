import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

async function geocode(place) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error(`Location not found: ${place}`);
  return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name, country: data.results[0].country };
}

async function getForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=5&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather forecast failed (${res.status})`);
  const data = await res.json();
  const d = data.daily;
  const forecast = [];
  for (let i = 0; i < d.time.length; i++) {
    forecast.push({
      date: d.time[i],
      temp_max: d.temperature_2m_max[i],
      temp_min: d.temperature_2m_min[i],
      rain_mm: d.precipitation_sum[i],
      rain_chance: d.precipitation_probability_max[i],
      wind_kph: d.wind_speed_10m_max[i]
    });
  }
  return forecast;
}

function deriveAlerts(forecast) {
  const alerts = [];
  for (const day of forecast) {
    if (day.rain_mm >= 25) {
      alerts.push({ date: day.date, type: 'heavy_rain', severity: 'warning', message: `Heavy rain expected: ${day.rain_mm}mm. Consider delaying irrigation or harvest.` });
    }
    if (day.wind_kph >= 40) {
      alerts.push({ date: day.date, type: 'high_wind', severity: 'warning', message: `Strong winds up to ${day.wind_kph} km/h. Secure structures and equipment.` });
    }
    if (day.temp_max >= 35) {
      alerts.push({ date: day.date, type: 'heat', severity: 'critical', message: `High temperature ${day.temp_max}C. Ensure adequate crop hydration and shade.` });
    }
    if (day.temp_min <= 2) {
      alerts.push({ date: day.date, type: 'frost', severity: 'critical', message: `Frost risk: overnight low of ${day.temp_min}C. Protect sensitive crops.` });
    }
  }
  return alerts;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { place, lat, lon } = body;

    let coords;
    if (typeof lat === 'number' && typeof lon === 'number') {
      coords = { lat, lon, name: `${lat},${lon}`, country: '' };
    } else if (place) {
      coords = await geocode(place);
    } else {
      return Response.json({ error: 'place or lat/lon is required' }, { status: 400 });
    }

    try {
      const forecast = await getForecast(coords.lat, coords.lon);
      const alerts = deriveAlerts(forecast);
      return Response.json({
        source: 'Open-Meteo',
        location: { name: coords.name, country: coords.country, lat: coords.lat, lon: coords.lon },
        forecast,
        alerts,
        rate_limited: false
      });
    } catch (err) {
      if (err.message.includes('429') || err.message.includes('rate')) {
        return Response.json({
          source: 'Open-Meteo',
          rate_limited: true,
          message: 'Weather data is temporarily unavailable due to rate limiting. Please try again in a few minutes.',
          location: { name: coords.name, country: coords.country, lat: coords.lat, lon: coords.lon },
          forecast: [],
          alerts: []
        });
      }
      throw err;
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});