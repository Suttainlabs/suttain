import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Camera, CloudSun, History as HistoryIcon, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';

function HistoryContent() {
  const { t, activeFarm } = useAgro();
  const [sessions, setSessions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!activeFarm) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      try {
        const [sessionList, diagnosisList] = await Promise.all([
          base44.entities.AdvisorySession.filter({ farm_id: activeFarm.id }, '-created_date', 50),
          base44.entities.Diagnosis.filter({ farm_id: activeFarm.id }, '-created_date', 50)
        ]);
        setSessions(sessionList);
        setDiagnoses(diagnosisList);
      } catch (err) {
        console.error('History load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeFarm]);

  if (!activeFarm) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AgroHeader title={t('advisory_history')} />
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

  const timeline = [
    ...sessions.map(s => ({
      id: s.id,
      type: s.session_type || 'chat',
      title: s.question,
      content: s.ai_response,
      photo: s.photo_url,
      date: s.created_date,
      sortDate: new Date(s.created_date)
    })),
    ...diagnoses.map(d => ({
      id: d.id,
      type: 'photo',
      title: d.crop ? `${d.crop} — ${d.diagnosis}` : d.diagnosis,
      content: d.recommended_action,
      photo: d.photo_url,
      confidence: d.confidence,
      date: d.created_date,
      sortDate: new Date(d.created_date)
    }))
  ].sort((a, b) => b.sortDate - a.sortDate);

  const filtered = filter === 'all' ? timeline : timeline.filter(item => item.type === filter);

  const typeIcons = { chat: MessageCircle, photo: Camera, weather: CloudSun };
  const typeLabels = { chat: t('session_chat'), photo: t('session_photo'), weather: t('session_weather') };
  const typeColors = { chat: '#4A7C2A', photo: '#8B6F47', weather: '#D4A017' };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'chat', label: t('session_chat') },
    { value: 'photo', label: t('session_photo') },
    { value: 'weather', label: t('session_weather') },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <AgroHeader title={t('advisory_history')} />

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] ${
              filter === f.value
                ? 'bg-[#4A7C2A] text-white'
                : 'bg-white border border-[#D4C5B0] text-[#5B7553] hover:bg-[#F0EBE0]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A7C2A]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-8 text-center">
          <HistoryIcon className="w-12 h-12 text-[#D4C5B0] mx-auto mb-3" />
          <p className="text-[#2D5016] font-semibold mb-1">{t('no_history')}</p>
          <p className="text-sm text-[#5B7553]">{t('no_history_desc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => {
            const Icon = typeIcons[item.type] || MessageCircle;
            const color = typeColors[item.type] || '#4A7C2A';
            return (
              <div key={`${item.type}-${item.id}-${idx}`} className="bg-white rounded-2xl border border-[#D4C5B0] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
                        {typeLabels[item.type]}
                      </span>
                      <span className="text-xs text-[#8B6F47]">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {item.photo && (
                      <img src={item.photo} alt="" className="w-20 h-20 rounded-lg object-cover mb-2" />
                    )}
                    <p className="text-sm font-semibold text-[#2D5016] mb-1">{item.title}</p>
                    {item.content && (
                      <p className="text-sm text-[#5B7553]">{item.content}</p>
                    )}
                    {item.confidence && (
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.confidence === 'high' ? 'bg-green-100 text-green-700' :
                        item.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {t('confidence')}: {item.confidence === 'high' ? t('confidence_high') : item.confidence === 'medium' ? t('confidence_medium') : t('confidence_low')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AgroHistory() {
  return <AgroProvider><HistoryContent /></AgroProvider>;
}