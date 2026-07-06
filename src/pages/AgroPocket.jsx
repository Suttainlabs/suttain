import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Camera, CloudSun, History, Settings, Plus, Sprout, MapPin, BarChart3 } from 'lucide-react';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';
import AgroDashboardCharts from '@/components/agro/AgroDashboardCharts';
import FarmStatsSummary from '@/components/agro/FarmStatsSummary';
import UrgentAlertsCard from '@/components/agro/UrgentAlertsCard';

function HubContent() {
  const { t, loading, farmers, farms, activeFarmer, activeFarm, setActiveFarmId } = useAgro();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#D4C5B0] border-t-[#4A7C2A] rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    { to: '/AgroChat', icon: MessageCircle, title: t('feature_chat'), desc: t('feature_chat_desc'), color: '#4A7C2A' },
    { to: '/AgroPhotoDiagnosis', icon: Camera, title: t('feature_photo'), desc: t('feature_photo_desc'), color: '#8B6F47' },
    { to: '/AgroWeather', icon: CloudSun, title: t('feature_weather'), desc: t('feature_weather_desc'), color: '#D4A017' },
    { to: '/AgroHistory', icon: History, title: t('feature_history'), desc: t('feature_history_desc'), color: '#5B7553' },
    { to: '/AgroReports', icon: BarChart3, title: t('feature_reports'), desc: t('feature_reports_desc'), color: '#2D5016' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <AgroHeader title={t('app_title')} showBack={false} />
      <p className="text-lg text-[#5B7553] mb-6">{t('tagline')}</p>

      {farmers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-8 text-center">
          <Sprout className="w-16 h-16 text-[#4A7C2A] mx-auto mb-4" />
          <p className="text-lg font-semibold text-[#2D5016] mb-4">{t('no_farm_yet')}</p>
          <Link
            to="/AgroFarmerProfile"
            className="inline-flex items-center gap-2 bg-[#4A7C2A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2D5016] transition-colors min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            {t('create_first_farm')}
          </Link>
        </div>
      ) : (
        <>
          {activeFarm && (
            <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-[#4A7C2A]" />
                <h2 className="text-lg font-bold text-[#2D5016]">{t('farm_summary')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('location')}</p>
                  <p className="text-sm font-medium text-[#2D5016] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {activeFarmer?.location_name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('crops')}</p>
                  <p className="text-sm font-medium text-[#2D5016]">{activeFarm.crops?.join(', ') || activeFarm.primary_crop || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('size')}</p>
                  <p className="text-sm font-medium text-[#2D5016]">{activeFarm.size_acres ? `${activeFarm.size_acres} ${t('acres')}` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#8B6F47] uppercase tracking-wider mb-1">{t('soil')}</p>
                  <p className="text-sm font-medium text-[#2D5016] capitalize">{activeFarm.soil_type || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {activeFarm && <UrgentAlertsCard farm={activeFarm} farmer={activeFarmer} />}

          {activeFarm && <FarmStatsSummary farmId={activeFarm.id} />}

          {farms.length > 0 && <AgroDashboardCharts farms={activeFarm ? [activeFarm] : farms} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.to}
                  to={f.to}
                  className="bg-white rounded-2xl border border-[#D4C5B0] p-5 hover:border-[#4A7C2A] hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.color + '20' }}>
                      <Icon className="w-6 h-6" style={{ color: f.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D5016] mb-1">{f.title}</h3>
                      <p className="text-sm text-[#5B7553]">{f.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link
            to="/AgroFarmerProfile"
            className="inline-flex items-center gap-2 text-[#5B7553] hover:text-[#2D5016] font-medium text-sm min-h-[44px]"
          >
            <Settings className="w-4 h-4" />
            {t('feature_profile')}
          </Link>
        </>
      )}
    </div>
  );
}

export default function AgroPocket() {
  return <AgroProvider><HubContent /></AgroProvider>;
}