import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { translations } from './translations';

const AgroContext = createContext();
export const useAgro = () => useContext(AgroContext);

export function AgroProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('agro_language') || 'en');
  const [activeFarmer, setActiveFarmerState] = useState(null);
  const [activeFarm, setActiveFarmState] = useState(null);
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

      const savedFarmId = localStorage.getItem('agro_active_farm');
      let restoredFarm = null;
      if (savedFarmId) {
        restoredFarm = farmList.find(f => f.id === savedFarmId);
        if (restoredFarm) setActiveFarmState(restoredFarm);
      }
      if (!restoredFarm && farmList.length > 0) {
        const activeFarmerId = restoredFarmer?.id || farmerList[0]?.id;
        const firstFarm = farmList.find(f => f.farmer_id === activeFarmerId) || farmList[0];
        if (firstFarm) {
          setActiveFarmState(firstFarm);
          localStorage.setItem('agro_active_farm', firstFarm.id);
        }
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

  const selectFarm = (farm) => {
    setActiveFarmState(farm);
    localStorage.setItem('agro_active_farm', farm.id);
  };

  return (
    <AgroContext.Provider value={{
      language, setLanguage, t,
      activeFarmer, activeFarm,
      farmers, farms,
      selectFarmer, selectFarm,
      loadData, loading
    }}>
      {children}
    </AgroContext.Provider>
  );
}