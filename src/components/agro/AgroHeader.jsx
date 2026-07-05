import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Plus } from 'lucide-react';
import { useAgro } from './AgroContext';
import { LANGUAGES } from './translations';

export default function AgroHeader({ title, showBack = true }) {
  const { t, language, setLanguage, farms, activeFarm, activeFarmId, setActiveFarmId, activeFarmerFarms } = useAgro();
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      {showBack && (
        <button
          onClick={() => navigate('/AgroDashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B7553] hover:text-[#2D5016] mb-3 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016]">{title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Farm Selector — persistent when farms exist */}
          {farms.length > 0 && (
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B7553] pointer-events-none" />
              <select
                value={activeFarmId || ''}
                onChange={(e) => setActiveFarmId(e.target.value || null)}
                className="pl-8 pr-3 py-2 text-sm font-medium rounded-lg border border-[#D4C5B0] bg-white text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px] appearance-none cursor-pointer max-w-[200px]"
              >
                {activeFarmerFarms.map(farm => (
                  <option key={farm.id} value={farm.id}>
                    {farm.farm_name || farm.primary_crop || 'Farm'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add Farm shortcut */}
          {farms.length > 0 && (
            <Link
              to="/AgroFarmerProfile"
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-[#4A7C2A] text-[#4A7C2A] hover:bg-[#4A7C2A] hover:text-white transition-colors min-h-[44px]"
              title={t('add_farm') || 'Add Farm'}
            >
              <Plus className="w-4 h-4" />
            </Link>
          )}

          {/* Language Selector */}
          <div className="relative">
            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B7553] pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm font-medium rounded-lg border border-[#D4C5B0] bg-white text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px] appearance-none cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}