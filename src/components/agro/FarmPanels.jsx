import React, { useState } from 'react';
import { CloudRain, MessageCircle, Send, AlertTriangle, Wind, Droplets, Thermometer } from 'lucide-react';
import { suttainFarmWeather } from '@/functions/suttainFarmWeather';
import { suttainIntelligence } from '@/functions/suttainIntelligence';
import { LoadingState, ErrorState, SourceLabel } from '@/components/shared/FunctionResult';

export function WeatherAlertsPanel() {
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!place.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainFarmWeather({ place: place.trim() });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <CloudRain className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">Weather Alerts</h3>
      </div>
      <div className="flex gap-2">
        <input value={place} onChange={e => setPlace(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="City or place name"
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
        <button onClick={run} disabled={loading || !place.trim()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
          Get Forecast
        </button>
      </div>
      {loading && <LoadingState label="Fetching weather data..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          {result.rate_limited ? (
            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">{result.message}</p>
            </div>
          ) : (
            <>
              {result.location && (
                <p className="text-xs text-slate-500 mt-2 mb-3">
                  Location: {result.location.name}{result.location.country ? `, ${result.location.country}` : ''}
                </p>
              )}
              {result.alerts && result.alerts.length > 0 && (
                <div className="mb-3 space-y-2">
                  {result.alerts.map((a, i) => (
                    <div key={i} className={`p-3 rounded-lg flex items-start gap-2 ${a.severity === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                      <div>
                        <p className={`text-xs font-bold ${a.severity === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>{a.date} - {a.type}</p>
                        <p className="text-sm text-slate-700">{a.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {result.forecast && result.forecast.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 font-semibold text-slate-500">Date</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-500">High</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-500">Low</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-500">Rain</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-500">Chance</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-500">Wind</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.forecast.map((d, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-2 px-2 text-slate-700">{d.date}</td>
                          <td className="py-2 px-2 text-right text-slate-700">{d.temp_max}C</td>
                          <td className="py-2 px-2 text-right text-slate-700">{d.temp_min}C</td>
                          <td className="py-2 px-2 text-right text-slate-700">{d.rain_mm}mm</td>
                          <td className="py-2 px-2 text-right text-slate-700">{d.rain_chance}%</td>
                          <td className="py-2 px-2 text-right text-slate-700">{d.wind_kph}km/h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function AgronomistChatPanel() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!question.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await suttainIntelligence({ task: 'farm_agronomist', input: question.trim(), context: context.trim() || undefined });
      if (res.error) throw new Error(res.error);
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const r = result?.result;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-[#007850]" />
        <h3 className="font-bold text-slate-900 text-sm">AI Chat Agronomist</h3>
      </div>
      <div className="space-y-2 mb-2">
        <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a farming question..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850] resize-none" />
        <input value={context} onChange={e => setContext(e.target.value)} placeholder="Crop or region (optional)"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#007850]" />
      </div>
      <button onClick={run} disabled={loading || !question.trim()}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #007850, #6B3FA0)' }}>
        <Send className="w-3.5 h-3.5" /> Ask Agronomist
      </button>
      {loading && <LoadingState label="Consulting AI agronomist..." />}
      {error && <ErrorState message={error} />}
      {result && (
        <div className="mt-4">
          <SourceLabel source={result.source} />
          {result.blocked ? (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-semibold">{r?.message || 'Blocked by safety guard.'}</p>
            </div>
          ) : (
            <div className="mt-3 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{typeof r === 'string' ? r : r?.answer || r?.summary || JSON.stringify(r)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}