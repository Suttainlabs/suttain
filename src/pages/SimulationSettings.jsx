import { useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import { motion } from 'framer-motion';

const UNIT_OPTIONS = [
  { value: 'si', label: 'SI Units (meters, kg, J)' },
  { value: 'angstrom', label: 'Angstrom (Å, amu, eV)' },
  { value: 'atomic', label: 'Atomic Units (Bohr, Hartree)' },
  { value: 'mixed', label: 'Mixed (depends on package)' },
];

const ENGINE_DEFAULTS = {
  ORCA: { basis: '6-31G*', functional: 'B3LYP', solvent: 'none' },
  Gaussian: { basis: 'def2-SVP', functional: 'B3LYP', solvent: 'pcm' },
  'Quantum ESPRESSO': { ecutwfc: '50', ecutrho: '500', k_points: '4 4 4' },
  VASP: { encut: '520', sigma: '0.1', algo: 'Fast' },
  GROMACS: { forcefield: 'amber99sb', water: 'tip3p', ensemble: 'NPT' },
};

export default function SimulationSettings() {
  const { user, isAuthLoading, refreshUser } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    preferred_units: 'angstrom',
    default_engine: 'ORCA',
    engine_settings: ENGINE_DEFAULTS.ORCA,
    script_directory: '/home/user/simulations',
    keep_intermediate_files: false,
    max_iterations: 100,
    convergence_criteria: '1e-6',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (user?.simulation_settings) {
      setSettings(prev => ({ ...prev, ...user.simulation_settings }));
    }
  }, [user]);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEngineChange = (engine) => {
    setSettings(prev => ({
      ...prev,
      default_engine: engine,
      engine_settings: ENGINE_DEFAULTS[engine] || {},
    }));
  };

  const handleEngineSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      engine_settings: { ...prev.engine_settings, [key]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await base44.auth.updateMe({ simulation_settings: settings });
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      if (refreshUser) refreshUser();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (user?.simulation_settings) {
      setSettings(user.simulation_settings);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <AuthGate featureName="Simulation Settings" featureDescription="Configure your default simulation preferences.">
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Simulation Settings</h1>
            <p className="text-slate-600">Configure your global defaults for computational simulations.</p>
          </div>

          {/* Status Messages */}
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                saveStatus.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {saveStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{saveStatus.message}</span>
            </motion.div>
          )}

          {/* Units Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Computational Units</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preferred Units
                </label>
                <Select value={settings.preferred_units} onValueChange={v => handleInputChange('preferred_units', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Engine Settings Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Default Engine & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Default Computational Engine
                </label>
                <Select value={settings.default_engine} onValueChange={handleEngineChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ENGINE_DEFAULTS).map(engine => (
                      <SelectItem key={engine} value={engine}>
                        {engine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                  {settings.default_engine} Default Parameters
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(settings.engine_settings || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <Input
                        type="text"
                        value={value || ''}
                        onChange={e => handleEngineSettingChange(key, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File System Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">File System & Paths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Default Script Directory
                </label>
                <Input
                  type="text"
                  value={settings.script_directory}
                  onChange={e => handleInputChange('script_directory', e.target.value)}
                  placeholder="/home/user/simulations"
                  className="text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default path where simulation scripts will be saved
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.keep_intermediate_files}
                    onChange={e => handleInputChange('keep_intermediate_files', e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Keep intermediate files after completion
                  </span>
                </label>
                <p className="text-xs text-slate-500 ml-6 mt-1">
                  Store geometry updates, frequency calculations, and checkpoint files
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Convergence Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Convergence Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Maximum Iterations
                </label>
                <Input
                  type="number"
                  value={settings.max_iterations}
                  onChange={e => handleInputChange('max_iterations', parseInt(e.target.value) || 0)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Convergence Criteria (energy threshold)
                </label>
                <Input
                  type="text"
                  value={settings.convergence_criteria}
                  onChange={e => handleInputChange('convergence_criteria', e.target.value)}
                  placeholder="1e-6"
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-violet-50 border border-violet-200 rounded-lg p-4">
            <p className="text-sm text-violet-900">
              <span className="font-semibold">💡 Tip:</span> These settings will be used as defaults when you create new simulations. You can override any setting for individual simulations.
            </p>
          </div>
        </motion.div>
      </div>
    </AuthGate>
  );
}