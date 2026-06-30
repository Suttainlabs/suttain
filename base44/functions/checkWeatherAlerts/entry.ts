import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import twilio from 'npm:twilio@5.3.0';

// WMO weather codes that indicate severe conditions (Open-Meteo)
const SEVERE_WEATHER_CODES = {
  65: 'Heavy rain expected',
  66: 'Freezing rain expected',
  67: 'Heavy freezing rain expected',
  75: 'Heavy snowfall expected',
  82: 'Violent rain showers expected',
  85: 'Heavy snow showers expected',
  86: 'Violent snow showers expected',
  95: 'Thunderstorm expected',
  96: 'Thunderstorm with hail expected',
  99: 'Thunderstorm with heavy hail expected',
};

// Additional thresholds for non-code-based severe conditions
const MAX_TEMP_THRESHOLD = 40;    // °C — extreme heat
const MIN_TEMP_THRESHOLD = -5;    // °C — extreme cold / frost risk
const MAX_WIND_THRESHOLD = 60;     // km/h — damaging winds
const MAX_PRECIP_THRESHOLD = 30;  // mm — heavy rainfall / flood risk

async function checkWeatherForFarmer(farmer) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${farmer.location_lat}&longitude=${farmer.location_lng}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&timezone=auto&forecast_days=2`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
  const data = await res.json();

  const alerts = [];

  if (data.daily) {
    for (let i = 0; i < data.daily.time.length; i++) {
      const dayLabel = i === 0 ? 'Today' : 'Tomorrow';
      const code = data.daily.weather_code[i];
      const maxTemp = data.daily.temperature_2m_max[i];
      const minTemp = data.daily.temperature_2m_min[i];
      const precip = data.daily.precipitation_sum[i];
      const wind = data.daily.wind_speed_10m_max[i];

      if (SEVERE_WEATHER_CODES[code]) {
        alerts.push(`${dayLabel}: ${SEVERE_WEATHER_CODES[code]}`);
      }
      if (maxTemp >= MAX_TEMP_THRESHOLD) {
        alerts.push(`${dayLabel}: Extreme heat (${Math.round(maxTemp)}C) — protect crops and livestock`);
      }
      if (minTemp <= MIN_TEMP_THRESHOLD) {
        alerts.push(`${dayLabel}: Frost/extreme cold (${Math.round(minTemp)}C) — cover sensitive crops`);
      }
      if (wind >= MAX_WIND_THRESHOLD) {
        alerts.push(`${dayLabel}: Damaging winds (${Math.round(wind)} km/h) — secure structures`);
      }
      if (precip >= MAX_PRECIP_THRESHOLD) {
        alerts.push(`${dayLabel}: Heavy rainfall (${precip}mm) — flood risk, improve drainage`);
      }
    }
  }

  return alerts;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled task — use service role to access all farmer records
    const farmers = await base44.asServiceRole.entities.Farmer.list('-created_date', 500);

    // Only farmers with both location and phone number
    const farmersToCheck = farmers.filter(
      (f) => f.location_lat != null && f.location_lng != null && f.phone_number && f.phone_number.trim()
    );

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const twilioClient = twilio(accountSid, authToken);
    const results = [];

    for (const farmer of farmersToCheck) {
      try {
        const alerts = await checkWeatherForFarmer(farmer);

        if (alerts.length === 0) continue;

        // Twilio requires E.164 format (+country code)
        let phone = farmer.phone_number.trim();
        if (!phone.startsWith('+')) {
          console.log(`Skipping ${farmer.name || farmer.id}: phone not in E.164 format (${phone})`);
          results.push({ farmer: farmer.name, skipped: 'Phone not E.164 format' });
          continue;
        }

        const message =
          `AgroPocket Weather Alert\n\n` +
          `Farmer: ${farmer.name}\n` +
          (farmer.location_name ? `Location: ${farmer.location_name}\n` : '') +
          `\n${alerts.join('\n')}\n\n` +
          `Take protective action for your crops and livestock. Open AgroPocket for detailed advice.`;

        const result = await twilioClient.messages.create({
          body: message,
          from: fromNumber,
          to: phone,
        });

        results.push({ farmer: farmer.name, phone, alertsCount: alerts.length, sid: result.sid });
        console.log(`Weather alert sent to ${farmer.name} (${phone}): ${result.sid}`);

        // Also create an in-app notification record for audit
        await base44.asServiceRole.entities.Notification.create({
          title: 'Severe Weather Alert',
          message: alerts.join('; '),
          type: 'safety',
          severity: 'warning',
          target_user: farmer.name,
          metadata: { farmer_id: farmer.id, alerts: alerts.join('; ') },
        });
      } catch (err) {
        console.error(`Failed for farmer ${farmer.name || farmer.id}:`, err.message);
        results.push({ farmer: farmer.name, error: err.message });
      }
    }

    return Response.json({
      checked: farmersToCheck.length,
      alerted: results.filter((r) => r.sid).length,
      results,
    });
  } catch (error) {
    console.error('checkWeatherAlerts error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});