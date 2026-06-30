import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, TrendingUp, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAgro } from './AgroContext';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AgroDashboardCharts({ farms }) {
  const { t } = useAgro();
  const [yields, setYields] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farms.length === 0) {
      setLoading(false);
      return;
    }
    const farmIds = farms.map(f => f.id);
    const loadData = async () => {
      setLoading(true);
      try {
        const [yieldLists, sessionLists, diagLists] = await Promise.all([
          Promise.all(farmIds.map(fid => base44.entities.CropYield.filter({ farm_id: fid }, '-harvest_date', 100))).then(r => r.flat()),
          Promise.all(farmIds.map(fid => base44.entities.AdvisorySession.filter({ farm_id: fid }, '-created_date', 100))).then(r => r.flat()),
          Promise.all(farmIds.map(fid => base44.entities.Diagnosis.filter({ farm_id: fid }, '-created_date', 100))).then(r => r.flat()),
        ]);
        setYields(yieldLists);
        setSessions(sessionLists);
        setDiagnoses(diagLists);
      } catch (err) {
        console.error('Dashboard chart load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [farms]);

  const last6Months = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_NAMES[d.getMonth()] });
    }
    return months;
  }, []);

  const yieldData = useMemo(() => {
    return last6Months.map(m => {
      const total = yields
        .filter(y => {
          const d = new Date(y.harvest_date);
          return `${d.getFullYear()}-${d.getMonth()}` === m.key;
        })
        .reduce((sum, y) => sum + (y.yield_amount || 0), 0);
      return { month: m.label, yield: total };
    });
  }, [yields, last6Months]);

  const sessionData = useMemo(() => {
    const allItems = [
      ...sessions.map(s => ({ date: s.created_date })),
      ...diagnoses.map(d => ({ date: d.created_date })),
    ];
    return last6Months.map(m => {
      const count = allItems.filter(item => {
        const d = new Date(item.date);
        return `${d.getFullYear()}-${d.getMonth()}` === m.key;
      }).length;
      return { month: m.label, sessions: count };
    });
  }, [sessions, diagnoses, last6Months]);

  const hasYield = yieldData.some(d => d.yield > 0);
  const hasSessions = sessionData.some(d => d.sessions > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#4A7C2A]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Monthly Yield */}
      <div className="bg-white rounded-2xl border border-[#D4C5B0] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#4A7C2A]" />
          <h3 className="text-sm font-bold text-[#2D5016]">{t('report_monthly_yield')}</h3>
        </div>
        {hasYield ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8B6F47' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8B6F47' }} width={36} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #D4C5B0', fontSize: '12px' }} />
              <Bar dataKey="yield" fill="#4A7C2A" radius={[4, 4, 0, 0]} name={t('report_yield')} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-8 h-8 text-[#D4C5B0] mb-2" />
            <p className="text-xs text-[#8B6F47]">{t('report_no_yield_data')}</p>
          </div>
        )}
      </div>

      {/* Session Frequency */}
      <div className="bg-white rounded-2xl border border-[#D4C5B0] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#5B7553]" />
          <h3 className="text-sm font-bold text-[#2D5016]">{t('report_monthly_sessions')}</h3>
        </div>
        {hasSessions ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B7553" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5B7553" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8B6F47' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8B6F47' }} allowDecimals={false} width={36} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #D4C5B0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="sessions" stroke="#5B7553" fill="url(#sessionGrad)" name={t('report_total_sessions')} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex flex-col items-center justify-center text-center">
            <Activity className="w-8 h-8 text-[#D4C5B0] mb-2" />
            <p className="text-xs text-[#8B6F47]">{t('report_no_session_data')}</p>
          </div>
        )}
      </div>
    </div>
  );
}