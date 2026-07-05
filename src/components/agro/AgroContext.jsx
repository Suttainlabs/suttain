import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { translations } from './translations';

const AgroContext = createContext();
export const useAgro = () => useContext(AgroContext);

export function AgroProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('agro_language') || 'en');
  const [activeFarmer, setActiveFarmerState] = useState(null);
  const [activeFarmId, setActiveFarmIdState] = useState(() => localStorage.getItem('agro_active_farm'));
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('agro_language', lang);
  };

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [farmerList, farmList] = await Promise.all([
        base44.entities.Farmer.list('-created_date', 50),
        base44.entities.Farm.list('-created_date', 50)
      ]);
      setFarmers(farmerList);
      setFarms(farmList);

      const savedFarmerId = localStorage.getItem('agro_active_farmer');
      let restoredFarmer = null;
      if (savedFarmerId) {
        restoredFarmer = farmerList.find(f => f.id === savedFarmerId);
        if (restoredFarmer) {
          setActiveFarmerState(restoredFarmer);
          if (restoredFarmer.language) {
            setLanguageState(restoredFarmer.language);
            localStorage.setItem('agro_language', restoredFarmer.language);
          }
        }
      }
      if (!restoredFarmer && farmerList.length > 0) {
        const firstFarmer = farmerList[0];
        setActiveFarmerState(firstFarmer);
        localStorage.setItem('agro_active_farmer', firstFarmer.id);
        if (firstFarmer.language) {
          setLanguageState(firstFarmer.language);
          localStorage.setItem('agro_language', firstFarmer.language);
        }
      }

      const activeFarmerId = restoredFarmer?.id || farmerList[0]?.id;
      const savedFarmId = localStorage.getItem('agro_active_farm');
      let farmIdToActivate = null;
      if (savedFarmId && farmList.some(f => f.id === savedFarmId)) {
        farmIdToActivate = savedFarmId;
      } else if (farmList.length > 0) {
        const firstFarm = farmList.find(f => f.farmer_id === activeFarmerId) || farmList[0];
        farmIdToActivate = firstFarm?.id || null;
      }
      if (farmIdToActivate) {
        setActiveFarmIdState(farmIdToActivate);
        localStorage.setItem('agro_active_farm', farmIdToActivate);
      } else {
        setActiveFarmIdState(null);
        localStorage.removeItem('agro_active_farm');
      }
    } catch (err) {
      console.error('Failed to load agro data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectFarmer = (farmer) => {
    setActiveFarmerState(farmer);
    localStorage.setItem('agro_active_farmer', farmer.id);
    if (farmer.language) setLanguage(farmer.language);
  };

  // Derive activeFarm from activeFarmId + farms array
  const activeFarm = useMemo(() => {
    if (!activeFarmId || farms.length === 0) return null;
    return farms.find(f => f.id === activeFarmId) || null;
  }, [activeFarmId, farms]);

  // Farms belonging to the active farmer
  const activeFarmerFarms = useMemo(() => {
    if (!activeFarmer) return farms;
    return farms.filter(f => f.farmer_id === activeFarmer.id);
  }, [farms, activeFarmer]);

  const setActiveFarmId = useCallback((farmId) => {
    setActiveFarmIdState(farmId);
    if (farmId) {
      localStorage.setItem('agro_active_farm', farmId);
    } else {
      localStorage.removeItem('agro_active_farm');
    }
  }, []);

  // Legacy compat — delegates to setActiveFarmId
  const selectFarm = useCallback((farm) => {
    setActiveFarmId(farm?.id || null);
  }, [setActiveFarmId]);

  return (
    <AgroContext.Provider value={{
      language, setLanguage, t,
      activeFarmer, activeFarm, activeFarmId,
      farmers, farms, activeFarmerFarms,
      selectFarmer, selectFarm, setActiveFarmId,
      loadData, loading
    }}>
      {children}
    </AgroContext.Provider>
  );
}