import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HeartPulse,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  CheckCircle,
  ShieldCheck,
  Baby,
  Wind,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const COMMON_ALLERGIES = [
  'Fragrance / Parfum',
  'Parabens',
  'Sulfates (SLS/SLES)',
  'Formaldehyde',
  'Methylisothiazolinone (MI)',
  'Lanolin',
  'Propylene Glycol',
  'Cocamidopropyl Betaine',
  'Phthalates',
  'Synthetic Dyes',
];

const SKIN_CONDITIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Sensitive Skin' },
  { value: 'eczema', label: 'Eczema-Prone' },
  { value: 'acne_prone', label: 'Acne-Prone' },
];

export default function MySafetyProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState(null);

  // Form state
  const [allergies, setAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [asthmaSensitive, setAsthmaSensitive] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [skinCondition, setSkinCondition] = useState('normal');
  const [avoidText, setAvoidText] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const profiles = await base44.entities.UserHealthProfile.filter({});
        if (mounted && profiles?.length > 0) {
          const p = profiles[0];
          setExistingId(p.id);
          setAllergies(p.allergies || []);
          setAsthmaSensitive(p.asthma_sensitive || false);
          setIsPregnant(p.life_stage === 'pregnant');
          setSkinCondition(p.skin_condition || 'normal');
          setAvoidText((p.avoid_ingredients || []).join('\n'));
        }
      } catch {
        // No profile yet — that's fine
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const toggleAllergy = (allergy) => {
    setAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies(prev => [...prev, trimmed]);
      setCustomAllergy('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const avoidIngredients = avoidText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      life_stage: isPregnant ? 'pregnant' : 'adult',
      allergies,
      asthma_sensitive: asthmaSensitive,
      skin_condition: skinCondition,
      avoid_ingredients: avoidIngredients,
    };

    try {
      if (existingId) {
        await base44.entities.UserHealthProfile.update(existingId, payload);
      } else {
        const created = await base44.entities.UserHealthProfile.create(payload);
        setExistingId(created.id);
      }
      toast({
        title: 'Safety profile saved',
        description: 'Your personalized risk alerts are now active on every scan.',
      });
      navigate('/BarcodeScanner');
    } catch {
      toast({
        title: 'Save failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/BarcodeScanner')} className="-ml-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
          <HeartPulse className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Safety Profile</h1>
          <p className="text-sm text-slate-500">Get personalized risk alerts on every product scan.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Allergies */}
        <Card className="bg-white/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGIES.map(a => (
                <button
                  key={a}
                  onClick={() => toggleAllergy(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    allergies.includes(a)
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {allergies.includes(a) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {a}
                </button>
              ))}
            </div>
            {/* Custom allergies */}
            {allergies.filter(a => !COMMON_ALLERGIES.includes(a)).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {allergies.filter(a => !COMMON_ALLERGIES.includes(a)).map(a => (
                  <Badge key={a} className="bg-teal-100 text-teal-800 pr-1">
                    {a}
                    <button onClick={() => toggleAllergy(a)} className="ml-1 p-0.5 rounded-full hover:bg-teal-200">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom allergy..."
                value={customAllergy}
                onChange={e => setCustomAllergy(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }}
                className="flex-1 h-9 px-3 text-sm rounded-lg border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
              />
              <Button size="sm" variant="outline" onClick={addCustomAllergy} disabled={!customAllergy.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Asthma & Pregnancy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white/80">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Wind className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Asthma Sensitivity</p>
                  <p className="text-xs text-slate-500">Flag asthma triggers</p>
                </div>
              </div>
              <Switch checked={asthmaSensitive} onCheckedChange={setAsthmaSensitive} />
            </CardContent>
          </Card>

          <Card className="bg-white/80">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Baby className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Pregnant</p>
                  <p className="text-xs text-slate-500">Show pregnancy warnings</p>
                </div>
              </div>
              <Switch checked={isPregnant} onCheckedChange={setIsPregnant} />
            </CardContent>
          </Card>
        </div>

        {/* Skin Condition */}
        <Card className="bg-white/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Skin Condition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={skinCondition} onValueChange={setSkinCondition}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your skin condition" />
              </SelectTrigger>
              <SelectContent>
                {SKIN_CONDITIONS.map(sc => (
                  <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Avoid ingredients */}
        <Card className="bg-white/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Other Ingredients I Avoid</CardTitle>
            <p className="text-xs text-slate-500">Enter one ingredient per line. We'll flag any matches on your scans.</p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={"e.g. Sodium benzoate\nPotassium sorbate\nPhenoxyethanol"}
              value={avoidText}
              onChange={e => setAvoidText(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Safety Profile'}
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400">
          Your profile is private and only used to personalize your scan results.
        </p>
      </div>
    </div>
  );
}