import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Check, Bell, Globe, Save, Loader2, Settings, Shield, Mail, AlertTriangle, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const REGIONS = [
  { id: 'EU', name: 'European Union', flag: '🇪🇺', regulations: ['REACH', 'CLP'] },
  { id: 'USA_Prop65', name: 'USA - California', flag: '🇺🇸', regulations: ['Prop 65'] },
  { id: 'USA_TSCA', name: 'USA - Federal', flag: '🇺🇸', regulations: ['TSCA'] },
  { id: 'Canada', name: 'Canada', flag: '🇨🇦', regulations: ['WHMIS'] },
  { id: 'Global_GHS', name: 'Global', flag: '🌍', regulations: ['GHS'] },
];

const ComplianceSettings = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [defaultRegions, setDefaultRegions] = useState([]);
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    banned_ingredient_alerts: true,
    regulatory_updates: false
  });
  const [preferredStandard, setPreferredStandard] = useState('Global');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.compliance_preferences) {
        const prefs = currentUser.compliance_preferences;
        setDefaultRegions(prefs.default_regions || []);
        setNotifications(prefs.notification_settings || {
          email_alerts: true,
          banned_ingredient_alerts: true,
          regulatory_updates: false
        });
        setPreferredStandard(prefs.preferred_standards || 'Global');
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  };

  const toggleRegion = (regionId) => {
    setDefaultRegions(prev =>
      prev.includes(regionId) ? prev.filter(id => id !== regionId) : [...prev, regionId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await base44.auth.updateMe({
        compliance_preferences: {
          default_regions: defaultRegions,
          notification_settings: notifications,
          preferred_standards: preferredStandard
        }
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationOptions = [
    {
      key: 'email_alerts',
      icon: Mail,
      title: 'Email Alerts',
      description: 'Receive email notifications for compliance updates',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      key: 'banned_ingredient_alerts',
      icon: AlertTriangle,
      title: 'Banned Ingredient Alerts',
      description: 'Get notified when banned ingredients are detected',
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    {
      key: 'regulatory_updates',
      icon: FileText,
      title: 'Regulatory Updates',
      description: 'Stay informed about changes in regulations',
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Button variant="ghost" onClick={onBack} className="self-start hover:bg-white/80">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2">
                    <Check className="w-4 h-4 mr-2" />
                    Settings saved successfully!
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Compliance Settings</h1>
                    <p className="text-white/80 text-sm sm:text-base mt-1">Customize your compliance check experience</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Default Regions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Default Target Regions</h2>
                    <p className="text-sm text-slate-500">Pre-select regions for new compliance checks</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
                  {REGIONS.map((region, index) => {
                    const isSelected = defaultRegions.includes(region.id);
                    return (
                      <motion.div
                        key={region.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleRegion(region.id)}
                        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200'
                            : 'bg-white border-2 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{region.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {region.name}
                            </p>
                            <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                              {region.regulations.join(', ')}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-white/20' : 'border-2 border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {defaultRegions.length > 0 && (
                  <p className="text-xs text-slate-500 mt-4">
                    {defaultRegions.length} region{defaultRegions.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                    <p className="text-sm text-slate-500">Choose which alerts you want to receive</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {notificationOptions.map((option, index) => {
                    const Icon = option.icon;
                    const isEnabled = notifications[option.key];
                    return (
                      <motion.div
                        key={option.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                          isEnabled ? 'bg-gradient-to-r from-slate-50 to-slate-100' : 'bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${option.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${option.color}`} />
                          </div>
                          <div>
                            <Label className="font-semibold text-slate-900 cursor-pointer">{option.title}</Label>
                            <p className="text-sm text-slate-500">{option.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => setNotifications({...notifications, [option.key]: checked})}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferred Standards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Preferred Compliance Standard</h2>
                    <p className="text-sm text-slate-500">Set your primary compliance framework</p>
                  </div>
                </div>

                <Select value={preferredStandard} onValueChange={setPreferredStandard}>
                  <SelectTrigger className="w-full h-14 text-base border-2 border-slate-200 hover:border-indigo-300 focus:border-indigo-400 rounded-xl">
                    <SelectValue placeholder="Select standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US" className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🇺🇸</span>
                        <span>United States Standards</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EU" className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🇪🇺</span>
                        <span>European Union Standards</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Global" className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🌍</span>
                        <span>Global Standards (GHS)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-end gap-3"
          >
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 h-12 px-8"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Settings</>
              )}
            </Button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default ComplianceSettings;