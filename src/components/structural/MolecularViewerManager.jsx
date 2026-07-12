import React, { useState, useEffect } from 'react';
import { Box } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Viewer3Dmol from './Viewer3Dmol';
import ViewerNGL from './ViewerNGL';

const ENGINES = [
  { value: '3dmol', label: '3Dmol.js' },
  { value: 'ngl', label: 'NGL Viewer' },
];

export default function MolecularViewerManager({ pdbUrl }) {
  const [engine, setEngine] = useState('3dmol');
  const [settingsId, setSettingsId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load saved engine preference from ViewerSettings entity
  useEffect(() => {
    base44.entities.ViewerSettings.list()
      .then(data => {
        if (data?.[0]?.preferred_engine) {
          setEngine(data[0].preferred_engine);
          setSettingsId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Persist engine selection so it auto-applies across all structure viewers
  const handleEngineChange = async (newEngine) => {
    setEngine(newEngine);
    try {
      if (settingsId) {
        await base44.entities.ViewerSettings.update(settingsId, { preferred_engine: newEngine });
      } else {
        const created = await base44.entities.ViewerSettings.create({ preferred_engine: newEngine });
        setSettingsId(created.id);
      }
    } catch (e) {
      console.error('Failed to save viewer preference:', e);
    }
  };

  if (!loaded) return null;

  return (
    <div>
      {/* Engine switcher */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800">3D Structure Viewer</h3>
        <div className="flex items-center gap-2">
          <Box className="w-3.5 h-3.5 text-slate-400" />
          <Select value={engine} onValueChange={handleEngineChange}>
            <SelectTrigger className="w-[160px] h-8 text-xs border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENGINES.map(e => (
                <SelectItem key={e.value} value={e.value} className="text-xs">
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active viewer engine */}
      {engine === '3dmol' && <Viewer3Dmol pdbUrl={pdbUrl} />}
      {engine === 'ngl' && <ViewerNGL pdbUrl={pdbUrl} />}
    </div>
  );
}