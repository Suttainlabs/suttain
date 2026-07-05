import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAgro } from './AgroContext';

export default function FarmStatsSummary({ farmId }) {
  const { t } = useAgro();
  const [totalYield, setTotalYield] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [yields, sessions, diagnoses] = await Promise.all([
          base44.entities.CropYield.filter({ farm_id: farmId }, '-harvest_date', 200),
          base44.entities.AdvisorySession.filter({ farm_id: farmId }, '-created_date', 200),
          base44.entities.Diagnosis.filter({ farm_id: farmId }, '-created_date', 200),
        ]);
        setTotalYield(yields.reduce((sum, y) => sum + (y.yield_amount || 0), 0));
        setTotalSessions(sessions.length + diagnoses.length);
      } catch (err) {
        console.error('Farm stats load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [farmId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[0, 1].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-[#D4C5B0] p-5 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#4A7C2A]" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: t('report_total_yield') || 'Total Yield', value: totalYield.toLocaleString() + ' kg', icon: BarChart3, color: '#4A7C2A' },
    { label: t('report_total_sessions') || 'Total Sessions', value: totalSessions.toString(), icon: Activity, color: '#5B7553' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-2xl border border-[#D4C5B0] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.color + '20' }}>
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-2xl font-bold text-[#2D5016]">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}