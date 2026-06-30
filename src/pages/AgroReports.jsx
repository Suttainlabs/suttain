import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Loader2, AlertCircle, TrendingUp, Package, MessageCircle, Camera, CloudSun, Plus, Sprout, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ReportsContent() {
  const { t, farms, activeFarm, activeFarmer } = useAgro();
  const [yields, setYields] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);

  useEffect(() => {
    if (farms.length === 0) {
      setLoading(false);
      return;
    }
    const farmIds = farms.map(f => f.id);
    const loadData = async () => {
      setLoading(true);
      try {
        const [yieldList, sessionList, diagnosisList] = await Promise.all([
          Promise.all(farmIds.map(fid => base44.entities.CropYield.filter({ farm_id: fid }, '-harvest_date', 200))).then(r => r.flat()),
          Promise.all(farmIds.map(fid => base44.entities.AdvisorySession.filter({ farm_id: fid }, '-created_date', 200))).then(r => r.flat()),
          Promise.all(farmIds.map(fid => base44.entities.Diagnosis.filter({ farm_id: fid }, '-created_date', 200))).then(r => r.flat())
        ]);
        setYields(yieldList);
        setSessions(sessionList);
        setDiagnoses(diagnosisList);
      } catch (err) {
        console.error('Report data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [farms]);

  // Build last 12 months array
  const last12Months = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_NAMES[d.getMonth()], year: d.getFullYear() });
    }
    return months;
  }, []);

  // Monthly yield data for chart
  const monthlyYieldData = useMemo(() => {
    return last12Months.map(m => {
      const monthYields = yields.filter(y => {
        const d = new Date(y.harvest_date);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      });
      const total = monthYields.reduce((sum, y) => sum + (y.yield_amount || 0), 0);
      return { month: m.label, yield: total };
    });
  }, [yields, last12Months]);

  // Yield by crop breakdown
  const yieldByCrop = useMemo(() => {
    const map = {};
    yields.forEach(y => {
      const crop = y.crop || 'Unknown';
      if (!map[crop]) map[crop] = { crop, total: 0, count: 0 };
      map[crop].total += y.yield_amount || 0;
      map[crop].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [yields]);

  // Monthly session data for chart
  const monthlySessionData = useMemo(() => {
    const allItems = [
      ...sessions.map(s => ({ date: s.created_date, type: s.session_type || 'chat' })),
      ...diagnoses.map(d => ({ date: d.created_date, type: 'photo' }))
    ];
    return last12Months.map(m => {
      const monthItems = allItems.filter(item => {
        const d = new Date(item.date);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      });
      return {
        month: m.label,
        chat: monthItems.filter(i => i.type === 'chat').length,
        photo: monthItems.filter(i => i.type === 'photo').length,
        weather: monthItems.filter(i => i.type === 'weather').length,
      };
    });
  }, [sessions, diagnoses, last12Months]);

  // Summary stats
  const totalYield = yields.reduce((sum, y) => sum + (y.yield_amount || 0), 0);
  const yieldUnit = yields[0]?.yield_unit || 'kg';
  const totalSessions = sessions.length + diagnoses.length;
  const chatCount = sessions.filter(s => (s.session_type || 'chat') === 'chat').length;
  const photoCount = sessions.filter(s => s.session_type === 'photo').length + diagnoses.length;
  const weatherCount = sessions.filter(s => s.session_type === 'weather').length;

  const summaryCards = [
    { label: t('report_total_yield'), value: `${totalYield.toLocaleString()} ${yieldUnit}`, icon: Package, color: '#4A7C2A' },
    { label: t('report_total_sessions'), value: totalSessions, icon: MessageCircle, color: '#5B7553' },
    { label: t('report_total_diagnoses'), value: diagnoses.length, icon: Camera, color: '#8B6F47' },
    { label: t('report_active_farms'), value: farms.length, icon: Sprout, color: '#D4A017' },
  ];

  if (farms.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AgroHeader title={t('report_title')} />
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#2D5016] font-semibold mb-4">{t('no_farm_yet')}</p>
          <Link to="/AgroFarmerProfile" className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px]">
            <Plus className="w-5 h-5" />
            {t('create_first_farm')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <AgroHeader title={t('report_title')} showBack={false} />

      <div className="flex items-center justify-between mb-6">
        <p className="text-lg text-[#5B7553]">{t('report_subtitle')}</p>
        <button
          onClick={() => setShowLogForm(true)}
          className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#2D5016] transition-colors text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          {t('report_log_harvest')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A7C2A]" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {summaryCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#D4C5B0] p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: card.color + '20' }}>
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <p className="text-2xl font-bold text-[#2D5016]">{card.value}</p>
                  <p className="text-xs text-[#8B6F47] font-medium mt-0.5">{card.label}</p>
                </div>
              );
            })}
          </div>

          {/* Monthly Yield Chart */}
          <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#4A7C2A]" />
              <h2 className="text-lg font-bold text-[#2D5016]">{t('report_monthly_yield')}</h2>
            </div>
            {totalYield === 0 ? (
              <div className="py-12 text-center">
                <Package className="w-12 h-12 text-[#D4C5B0] mx-auto mb-3" />
                <p className="text-sm text-[#5B7553]">{t('report_no_yield_data')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyYieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8B6F47' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#8B6F47' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #D4C5B0', fontSize: '13px' }} />
                  <Bar dataKey="yield" fill="#4A7C2A" radius={[6, 6, 0, 0]} name={t('report_yield')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Yield by Crop */}
          {yieldByCrop.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-[#4A7C2A]" />
                <h2 className="text-lg font-bold text-[#2D5016]">{t('report_yield_by_crop')}</h2>
              </div>
              <div className="space-y-3">
                {yieldByCrop.map((item, i) => {
                  const maxTotal = yieldByCrop[0].total;
                  const pct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-[#2D5016] capitalize">{item.crop}</span>
                        <span className="text-sm text-[#5B7553]">{item.total.toLocaleString()} {yieldUnit} ({item.count} {item.count === 1 ? t('report_harvest') : t('report_harvests')})</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#F0EBE0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#4A7C2A' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Sessions Chart */}
          <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#5B7553]" />
              <h2 className="text-lg font-bold text-[#2D5016]">{t('report_monthly_sessions')}</h2>
            </div>
            {totalSessions === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="w-12 h-12 text-[#D4C5B0] mx-auto mb-3" />
                <p className="text-sm text-[#5B7553]">{t('report_no_session_data')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlySessionData}>
                  <defs>
                    <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A7C2A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4A7C2A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="photoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B6F47" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B6F47" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="weatherGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8B6F47' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#8B6F47' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #D4C5B0', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="chat" stackId="1" stroke="#4A7C2A" fill="url(#chatGrad)" name={t('session_chat')} />
                  <Area type="monotone" dataKey="photo" stackId="1" stroke="#8B6F47" fill="url(#photoGrad)" name={t('session_photo')} />
                  <Area type="monotone" dataKey="weather" stackId="1" stroke="#D4A017" fill="url(#weatherGrad)" name={t('session_weather')} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {showLogForm && (
        <LogHarvestModal
          farms={farms}
          activeFarm={activeFarm}
          activeFarmer={activeFarmer}
          t={t}
          onClose={() => setShowLogForm(false)}
          onSaved={() => { setShowLogForm(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function LogHarvestModal({ farms, activeFarm, activeFarmer, t, onClose, onSaved }) {
  const [crop, setCrop] = useState(activeFarm?.primary_crop || '');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('kg');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!crop || !amount || !date) {
      setError(t('report_fill_fields'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await base44.entities.CropYield.create({
        farm_id: activeFarm.id,
        farmer_id: activeFarmer?.id,
        crop,
        yield_amount: parseFloat(amount),
        yield_unit: unit,
        harvest_date: date,
        notes: notes || undefined
      });
      onSaved();
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#2D5016]">{t('report_log_harvest')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F0EBE0] min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5 text-[#5B7553]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeFarm && (
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('select_farm')}</label>
              <p className="text-sm text-[#5B7553] px-3 py-2 bg-[#F0EBE0] rounded-lg">{activeFarm.farm_name || activeFarm.primary_crop || 'Farm'}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('primary_crop')}</label>
            <input
              type="text"
              value={crop}
              onChange={e => setCrop(e.target.value)}
              placeholder={t('crop_placeholder')}
              className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('report_yield_amount')}</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                step="0.01"
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('report_yield_unit')}</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
              >
                <option value="kg">kg</option>
                <option value="tons">tons</option>
                <option value="bags">bags</option>
                <option value="bushels">bushels</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('report_harvest_date')}</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('report_notes')}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('report_notes_placeholder')}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#4A7C2A] text-white font-semibold px-4 py-3 rounded-xl hover:bg-[#2D5016] transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AgroReports() {
  return <AgroProvider><ReportsContent /></AgroProvider>;
}