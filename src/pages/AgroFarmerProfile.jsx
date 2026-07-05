import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Plus, X, Save, Sprout } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AgroProvider, useAgro } from '@/components/agro/AgroContext';
import AgroHeader from '@/components/agro/AgroHeader';
import LocationMap from '@/components/agro/LocationMap';
import PhoneInputWithValidation from '@/components/agro/PhoneInputWithValidation';
import { LANGUAGES } from '@/components/agro/translations';

const COMMON_CROPS = ['Maize', 'Rice', 'Wheat', 'Tomatoes', 'Potatoes', 'Beans', 'Cassava', 'Bananas', 'Sorghum', 'Millet'];
const SOIL_TYPES = [
  { value: 'loam', label: 'Loam' },
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'silty', label: 'Silty' },
  { value: 'peat', label: 'Peat' },
  { value: 'chalk', label: 'Chalk' },
  { value: 'unknown', label: 'Unknown' },
];

function ProfileContent() {
  const { t, language, setLanguage, activeFarmer, activeFarm, loadData, selectFarm, loading } = useAgro();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewFarm = searchParams.get('new') === '1';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [lang, setLang] = useState(language);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [size, setSize] = useState('');
  const [crops, setCrops] = useState([]);
  const [cropInput, setCropInput] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');
  const [soilType, setSoilType] = useState('unknown');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeFarmer) {
      setName(activeFarmer.name || '');
      setPhone(activeFarmer.phone_number || '');
      setPostalCode(activeFarmer.postal_code || '');
      setLang(activeFarmer.language || 'en');
      setLat(activeFarmer.location_lat ?? null);
      setLng(activeFarmer.location_lng ?? null);
      setLocationName(activeFarmer.location_name || '');
    }
    // Only pre-fill farm fields when editing the existing active farm — not when creating a new one
    if (activeFarm && !isNewFarm) {
      setFarmName(activeFarm.farm_name || '');
      setSize(activeFarm.size_acres?.toString() || '');
      setCrops(activeFarm.crops || []);
      setPrimaryCrop(activeFarm.primary_crop || '');
      setSoilType(activeFarm.soil_type || 'unknown');
    }
  }, [activeFarmer, activeFarm, isNewFarm]);

  const handleGPS = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGettingLocation(false);
      },
      () => {
        setGettingLocation(false);
        alert('Could not get your location. Please search for your location on the map.');
      }
    );
  };

  const handlePositionChange = (newLat, newLng, newLocationName = null) => {
    setLat(newLat);
    setLng(newLng);
    if (newLocationName) setLocationName(newLocationName);
  };

  const addCrop = (crop) => {
    const trimmed = crop.trim();
    if (trimmed && !crops.includes(trimmed)) {
      setCrops([...crops, trimmed]);
      if (!primaryCrop) setPrimaryCrop(trimmed);
    }
    setCropInput('');
  };

  const removeCrop = (crop) => {
    const updated = crops.filter(c => c !== crop);
    setCrops(updated);
    if (primaryCrop === crop) setPrimaryCrop(updated[0] || '');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    setSaving(true);
    try {
      let farmerId = activeFarmer?.id;
      const farmerData = {
        name: name.trim(),
        phone_number: phone.trim(),
        postal_code: postalCode.trim(),
        language: lang,
        location_lat: lat,
        location_lng: lng,
        location_name: locationName.trim()
      };

      if (activeFarmer) {
        await base44.entities.Farmer.update(activeFarmer.id, farmerData);
      } else {
        const newFarmer = await base44.entities.Farmer.create(farmerData);
        farmerId = newFarmer.id;
      }

      const farmData = {
        farmer_id: farmerId,
        farmer_name: name.trim(),
        farm_name: farmName.trim(),
        size_acres: size ? parseFloat(size) : null,
        crops,
        primary_crop: primaryCrop,
        soil_type: soilType
      };

      // When "Add Farm" was clicked, always create a new farm record
      if (activeFarm && activeFarm.farmer_id === farmerId && !isNewFarm) {
        const updated = await base44.entities.Farm.update(activeFarm.id, farmData);
        selectFarm({ ...activeFarm, ...updated });
      } else {
        const newFarm = await base44.entities.Farm.create(farmData);
        selectFarm(newFarm);
      }

      await loadData();
      navigate('/AgroDashboard');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <AgroHeader title={t('edit_profile')} />
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-12 text-center">
          <div className="w-8 h-8 border-4 border-[#D4C5B0] border-t-[#4A7C2A] rounded-full animate-spin mx-auto" />
          <p className="text-[#5B7553] text-sm mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <AgroHeader title={isNewFarm ? (t('add_farm') || 'Add Farm') : (activeFarmer ? t('edit_profile') : t('create_profile'))} />

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#2D5016] mb-4 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#4A7C2A]" />
            {t('farmer_name')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('farmer_name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
                placeholder={t('farmer_name')}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">Postal / Zip Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
                placeholder="e.g. 10001, 110001, SW1A1AA"
              />
              <p className="mt-1 text-xs text-[#8B9D85]">Used to auto-detect your country code for phone validation.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('phone_number')}</label>
              <PhoneInputWithValidation
                phone={phone}
                onPhoneChange={setPhone}
                postalCode={postalCode}
                onValidityChange={setPhoneValid}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('preferred_language')}</label>
              <select
                value={lang}
                onChange={(e) => { setLang(e.target.value); setLanguage(e.target.value); }}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#2D5016] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#4A7C2A]" />
            {t('farm_location')}
          </h2>
          <div className="space-y-4">
            <button
              onClick={handleGPS}
              disabled={gettingLocation}
              className="w-full flex items-center justify-center gap-2 bg-[#4A7C2A] text-white font-semibold py-3 rounded-xl hover:bg-[#2D5016] transition-colors disabled:opacity-50 min-h-[44px]"
            >
              <MapPin className="w-5 h-5" />
              {gettingLocation ? t('getting_location') : t('use_gps')}
            </button>

            <LocationMap
              lat={lat}
              lng={lng}
              onPositionChange={handlePositionChange}
              t={t}
            />

            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('location_name')}</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
                placeholder={t('location_name')}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D4C5B0] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#2D5016] mb-4">{t('farm_details')}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('farm_name')}</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
                placeholder={t('farm_name')}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('farm_size')}</label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('crops_grown')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={cropInput}
                  onChange={(e) => setCropInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCrop(cropInput); } }}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
                  placeholder={t('crop_placeholder')}
                />
                <button
                  onClick={() => addCrop(cropInput)}
                  className="px-4 bg-[#4A7C2A] text-white rounded-lg hover:bg-[#2D5016] transition-colors min-h-[44px]"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_CROPS.filter(c => !crops.includes(c)).slice(0, 6).map(crop => (
                  <button
                    key={crop}
                    onClick={() => addCrop(crop)}
                    className="px-3 py-1.5 text-sm bg-[#F0EBE0] text-[#5B7553] rounded-full hover:bg-[#E5DDD0] transition-colors"
                  >
                    + {crop}
                  </button>
                ))}
              </div>
              {crops.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {crops.map(crop => (
                    <span key={crop} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#4A7C2A] text-white text-sm rounded-full">
                      {crop}
                      <button onClick={() => removeCrop(crop)} className="hover:text-white/80">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {crops.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('primary_crop')}</label>
                <select
                  value={primaryCrop}
                  onChange={(e) => setPrimaryCrop(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
                >
                  <option value="">—</option>
                  {crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-[#2D5016] mb-1 block">{t('soil_type')}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D4C5B0] text-[#2D5016] focus:outline-none focus:ring-2 focus:ring-[#4A7C2A] min-h-[44px]"
              >
                {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !phoneValid}
          className="w-full flex items-center justify-center gap-2 bg-[#4A7C2A] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2D5016] transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-5 h-5" />
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}

export default function AgroFarmerProfile() {
  return <AgroProvider><ProfileContent /></AgroProvider>;
}