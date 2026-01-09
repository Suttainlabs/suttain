import React, { useState, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { X, Save, Upload, AlertCircle, Plus, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { HEALTH_CONDITIONS } from './healthConditionsData';
import { sendFeatureUsageEmail } from '../shared/featureNotifications';
import AuthContext from '../auth/AuthContext';

const COMMON_ALLERGENS = [
  'Acetone', 'Alcohol', 'Ammonia', 'Balsam of Peru', 'Benzene', 'Benzoyl Peroxide',
  'BHA', 'BHT', 'Bleach', 'Borax', 'Boric Acid', 'Bronopol', 'Chlorine',
  'Coal Tar', 'Cocamide DEA', 'Coconut', 'Diazolidinyl Urea', 'Diethanolamine',
  'Dimethicone', 'DMDM Hydantoin', 'Ethanol', 'Ethylene Oxide', 'Fluoride',
  'Formaldehyde', 'Fragrance', 'Hydroquinone', 'Imidazolidinyl Urea',
  'Iodine', 'Isopropyl Alcohol', 'Lanolin', 'Latex', 'Lead', 'Mercury',
  'Methylisothiazolinone (MIT)', 'Methylchloroisothiazolinone (MCIT)', 'Mica',
  'Mineral Oil', 'Nickel', 'Oxybenzone', 'Parabens', 'PEG', 'Petrolatum',
  'Phenol', 'Phthalates', 'Polyethylene', 'Polyethylene Glycol', 'Propylene Glycol',
  'Quaternium-15', 'Resorcinol', 'Retinol', 'Salicylic Acid', 'Selenium Sulfide',
  'Silicone', 'Sodium Laureth Sulfate (SLES)', 'Sodium Lauryl Sulfate (SLS)',
  'Sulfates', 'Talc', 'TEA', 'Toluene', 'Triclosan', 'Triethanolamine',
  'Urea', 'Zinc Pyrithione'
].sort();

const COMMON_SENSITIVITIES = [
  'Acids', 'Alcohol-based products', 'Alkaline substances', 'Artificial colors',
  'Artificial fragrances', 'Bright light', 'Chemical fumes', 'Chlorinated water',
  'Cold exposure', 'Detergents', 'Drying agents', 'Dust', 'Essential oils',
  'Exfoliants', 'Extreme temperatures', 'Heat exposure', 'Heavy fragrances',
  'Hot water', 'Humidity', 'Perfumes', 'Physical exfoliation', 'Pollen',
  'Preservatives', 'Smoke', 'Strong odors', 'Sun exposure', 'Synthetic fabrics',
  'UV radiation', 'Volatile organic compounds', 'Wool'
].sort();

export default function ProfileSetupModal({ profile, onClose, onSave }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    profile_name: profile?.profile_name || '',
    is_default: profile?.is_default || false,
    health_conditions: profile?.health_conditions || [],
    allergies: profile?.allergies || [],
    custom_sensitivities: profile?.custom_sensitivities || [],
    notification_preferences: profile?.notification_preferences || {
      email_alerts: true,
      in_app_alerts: true,
      alert_severity: 'all'
    },
    medical_documents: profile?.medical_documents || []
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newSensitivity, setNewSensitivity] = useState('');
  const [healthConditionSearch, setHealthConditionSearch] = useState('');
  const [showAllergySuggestions, setShowAllergySuggestions] = useState(false);
  const [showSensitivitySuggestions, setShowSensitivitySuggestions] = useState(false);
  const [showConditionSuggestions, setShowConditionSuggestions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const allergyInputRef = useRef(null);
  const sensitivityInputRef = useRef(null);
  const conditionInputRef = useRef(null);

  const handleAddCondition = (condition = null) => {
    const conditionToAdd = condition || healthConditionSearch.trim();
    const currentConditions = Array.isArray(formData.health_conditions) 
      ? formData.health_conditions 
      : [];
    
    if (conditionToAdd && !currentConditions.includes(conditionToAdd)) {
      setFormData(prev => ({
        ...prev,
        health_conditions: [...currentConditions, conditionToAdd]
      }));
      setHealthConditionSearch('');
      setShowConditionSuggestions(false);
    }
  };

  const handleRemoveCondition = (index) => {
    const currentConditions = Array.isArray(formData.health_conditions) 
      ? formData.health_conditions 
      : [];
    
    setFormData(prev => ({
      ...prev,
      health_conditions: currentConditions.filter((_, i) => i !== index)
    }));
  };

  const handleAddAllergy = (allergen = null) => {
    const allergyToAdd = allergen || newAllergy.trim();
    if (allergyToAdd && !formData.allergies.includes(allergyToAdd)) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyToAdd]
      }));
      setNewAllergy('');
      setShowAllergySuggestions(false);
    }
  };

  const filteredAllergens = COMMON_ALLERGENS.filter(allergen => 
    allergen.toLowerCase().includes(newAllergy.toLowerCase()) &&
    !formData.allergies.includes(allergen)
  ).slice(0, 8);

  const filteredSensitivities = COMMON_SENSITIVITIES.filter(sensitivity => 
    sensitivity.toLowerCase().includes(newSensitivity.toLowerCase()) &&
    !formData.custom_sensitivities.includes(sensitivity)
  ).slice(0, 8);

  const currentConditionsArray = Array.isArray(formData.health_conditions) 
    ? formData.health_conditions 
    : [];

  const filteredConditions = HEALTH_CONDITIONS.filter(condition => 
    condition.toLowerCase().includes(healthConditionSearch.toLowerCase()) &&
    !currentConditionsArray.includes(condition)
  ).slice(0, 10);

  const handleRemoveAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleAddSensitivity = (sensitivity = null) => {
    const sensitivityToAdd = sensitivity || newSensitivity.trim();
    if (sensitivityToAdd && !formData.custom_sensitivities.includes(sensitivityToAdd)) {
      setFormData(prev => ({
        ...prev,
        custom_sensitivities: [...prev.custom_sensitivities, sensitivityToAdd]
      }));
      setNewSensitivity('');
      setShowSensitivitySuggestions(false);
    }
  };

  const handleRemoveSensitivity = (index) => {
    setFormData(prev => ({
      ...prev,
      custom_sensitivities: prev.custom_sensitivities.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploadedUrls.push(file_url);
      }
      setFormData(prev => ({
        ...prev,
        medical_documents: [...prev.medical_documents, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.profile_name.trim()) {
      alert('Please enter a profile name');
      return;
    }

    setIsSaving(true);
    try {
      if (profile?.id) {
        await base44.entities.SafetyProfile.update(profile.id, formData);
      } else {
        await base44.entities.SafetyProfile.create(formData);
      }
      
      // Send email notification
      if (user) {
        sendFeatureUsageEmail(user, 'safety_profile', {
          profileName: formData.profile_name,
          action: profile?.id ? 'updated' : 'created',
          conditionsCount: Array.isArray(formData.health_conditions) ? formData.health_conditions.length : 0,
          allergiesCount: formData.allergies?.length || 0
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {profile ? 'Edit Safety Profile' : 'Create Safety Profile'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            
            {/* Profile Name */}
            <div>
              <Label htmlFor="profile_name" className="text-sm font-semibold text-slate-900 mb-2 block">
                Profile Name *
              </Label>
              <Input
                id="profile_name"
                value={formData.profile_name}
                onChange={(e) => setFormData(prev => ({ ...prev, profile_name: e.target.value }))}
                placeholder="e.g., Jane - Pregnancy Mode"
                className="border-2"
              />
              <p className="text-xs text-slate-500 mt-1">Give your profile a descriptive name</p>
            </div>

            {/* Default Profile Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-sm font-semibold text-slate-900">Set as Default Profile</Label>
                <p className="text-xs text-slate-600">Use this profile by default for all alerts</p>
              </div>
              <Switch
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
              />
            </div>

            {/* Health Conditions */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                Health Conditions
              </Label>
              <p className="text-xs text-slate-500 mb-3">Search from 1000+ conditions (A-Z)</p>
              <div className="relative">
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      ref={conditionInputRef}
                      value={healthConditionSearch}
                      onChange={(e) => {
                        setHealthConditionSearch(e.target.value);
                        setShowConditionSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowConditionSuggestions(healthConditionSearch.length > 0)}
                      onBlur={() => setTimeout(() => setShowConditionSuggestions(false), 200)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCondition()}
                      placeholder="Search conditions (e.g., Asthma, Diabetes, Eczema)"
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => handleAddCondition()} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Suggestions Dropdown */}
                {showConditionSuggestions && filteredConditions.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border-2 border-slate-200 rounded-lg shadow-xl max-h-72 overflow-y-auto">
                    {filteredConditions.map((condition, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddCondition(condition)}
                        className="w-full text-left px-4 py-3 hover:bg-rose-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <span className="text-sm font-medium text-slate-900">{condition}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentConditionsArray.map((condition, index) => (
                  <Badge key={index} className="bg-rose-600 text-white pl-3 pr-2 py-1.5">
                    {condition}
                    <button
                      onClick={() => handleRemoveCondition(index)}
                      className="ml-2 text-white/80 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {currentConditionsArray.length === 0 && (
                <p className="text-xs text-slate-500 mt-2 italic">No conditions added yet. Search and select from 1000+ conditions.</p>
              )}
            </div>

            {/* Allergies */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                Specific Allergies
              </Label>
              <div className="relative">
                <div className="flex gap-2 mb-3">
                  <Input
                    ref={allergyInputRef}
                    value={newAllergy}
                    onChange={(e) => {
                      setNewAllergy(e.target.value);
                      setShowAllergySuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowAllergySuggestions(newAllergy.length > 0)}
                    onBlur={() => setTimeout(() => setShowAllergySuggestions(false), 200)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                    placeholder="Search allergens (e.g., Nickel, Fragrance, Parabens)"
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddAllergy()} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Suggestions Dropdown */}
                {showAllergySuggestions && filteredAllergens.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border-2 border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredAllergens.map((allergen, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddAllergy(allergen)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <span className="text-sm font-medium text-slate-900">{allergen}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1">
                    {allergy}
                    <button
                      onClick={() => handleRemoveAllergy(index)}
                      className="ml-2 text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Sensitivities */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                Custom Sensitivities
              </Label>
              <div className="relative">
                <div className="flex gap-2 mb-3">
                  <Input
                    ref={sensitivityInputRef}
                    value={newSensitivity}
                    onChange={(e) => {
                      setNewSensitivity(e.target.value);
                      setShowSensitivitySuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSensitivitySuggestions(newSensitivity.length > 0)}
                    onBlur={() => setTimeout(() => setShowSensitivitySuggestions(false), 200)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSensitivity()}
                    placeholder="Search sensitivities (e.g., Strong odors, Heat exposure)"
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddSensitivity()} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Suggestions Dropdown */}
                {showSensitivitySuggestions && filteredSensitivities.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border-2 border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredSensitivities.map((sensitivity, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddSensitivity(sensitivity)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <span className="text-sm font-medium text-slate-900">{sensitivity}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.custom_sensitivities.map((sensitivity, index) => (
                  <Badge key={index} variant="outline" className="pl-3 pr-2 py-1">
                    {sensitivity}
                    <button
                      onClick={() => handleRemoveSensitivity(index)}
                      className="ml-2 text-slate-500 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medical Documents */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-2 block">
                Medical Documents (Optional, Encrypted)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
                className="w-full border-2 border-dashed"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </>
                )}
              </Button>
              {formData.medical_documents.length > 0 && (
                <p className="text-xs text-slate-600 mt-2">
                  {formData.medical_documents.length} document(s) uploaded
                </p>
              )}
            </div>

            {/* Notification Preferences */}
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-3 block">
                Notification Preferences
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Email Alerts</span>
                    <p className="text-xs text-slate-500">Receive critical and high-severity alerts via email</p>
                  </div>
                  <Switch
                    checked={formData.notification_preferences.email_alerts}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          email_alerts: checked
                        }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">In-App Alerts</span>
                    <p className="text-xs text-slate-500">Show alerts within the Suttain platform</p>
                  </div>
                  <Switch
                    checked={formData.notification_preferences.in_app_alerts}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          in_app_alerts: checked
                        }
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Critical and high-severity alerts will be sent to your email for immediate attention. You'll receive detailed analysis and safer alternatives.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="hidden sm:flex items-start gap-2 text-xs text-slate-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Your health data is encrypted and stored securely</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}