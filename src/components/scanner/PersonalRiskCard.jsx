import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Shield, Search, Settings, ChevronRight } from 'lucide-react';

// ── Trigger lists for condition-based matching ──────────────────────────────

const ASTHMA_TRIGGERS = [
  'fragrance', 'parfum', 'perfume',
  'formaldehyde', 'dmdm hydantoin', 'quaternium-15', 'imidazolidinyl urea', 'diazolidinyl urea',
  'sodium lauryl sulfate', 'sls', 'sles',
  'ammonia', 'bleach', 'sodium hypochlorite',
  'ethanolamine', 'cocamide dea', 'cocamide tea', 'triethanolamine',
];

const PREGNANCY_CONCERNS = [
  'retinol', 'retinyl', 'retinoid', 'tretinoin', 'isotretinoin', 'retinoic acid', 'retinyl palmitate',
  'salicylic acid', 'bha',
  'hydroquinone',
  'phthalate', 'dibutyl phthalate', 'diethyl phthalate',
  'formaldehyde', 'toluene',
  'oxybenzone', 'octinoxate',
  'coal tar',
];

const SKIN_CONDITION_TRIGGERS = {
  sensitive: [
    'fragrance', 'parfum', 'perfume',
    'sodium lauryl sulfate', 'sls',
    'alcohol denat', 'denatured alcohol',
    'methylisothiazolinone', 'mi/',
    'paraben', 'methylparaben', 'propylparaben',
  ],
  eczema: [
    'fragrance', 'parfum', 'perfume',
    'sodium lauryl sulfate', 'sls',
    'cocamidopropyl betaine',
    'methylisothiazolinone',
    'propylene glycol',
    'lanolin',
  ],
  acne_prone: [
    'coconut oil', 'cocos nucifera oil',
    'cocoa butter', 'theobroma cacao',
    'mineral oil', 'paraffinum liquidum',
    'lanolin',
    'isopropyl myristate', 'isopropyl palmitate',
    'alginate', 'carrageenan',
    'wheat germ oil',
  ],
};

// ── Matching engine ─────────────────────────────────────────────────────────

const normalize = (str) => String(str || '').toLowerCase().trim();

function matchIngredients(ingredients, profile) {
  if (!ingredients?.length || !profile) return [];

  const flagged = [];
  const normNames = ingredients.map(i => normalize(i.name));
  const seen = new Set();

  const addFlag = (index, reason, explanation) => {
    const key = `${index}-${reason}`;
    if (seen.has(key)) return;
    seen.add(key);
    flagged.push({
      ingredient: ingredients[index].name,
      reason,
      explanation,
      safety: ingredients[index].safety,
    });
  };

  // 1. Allergies — direct user-specified
  if (profile.allergies?.length) {
    profile.allergies.forEach(allergy => {
      const norm = normalize(allergy);
      if (!norm) return;
      normNames.forEach((name, i) => {
        if (name.includes(norm) || norm.includes(name)) {
          addFlag(i, 'Allergy', `Matches your allergy: "${allergy}"`);
        }
      });
    });
  }

  // 2. Avoid ingredients — free-text user-specified
  if (profile.avoid_ingredients?.length) {
    profile.avoid_ingredients.forEach(avoid => {
      const norm = normalize(avoid);
      if (!norm) return;
      normNames.forEach((name, i) => {
        if (name.includes(norm) || norm.includes(name)) {
          addFlag(i, 'You avoid this', `You listed "${avoid}" as an ingredient to avoid`);
        }
      });
    });
  }

  // 3. Asthma triggers
  if (profile.asthma_sensitive) {
    ASTHMA_TRIGGERS.forEach(trigger => {
      normNames.forEach((name, i) => {
        if (name.includes(trigger)) {
          addFlag(i, 'Asthma trigger', `May trigger asthma symptoms`);
        }
      });
    });
  }

  // 4. Pregnancy concerns
  if (profile.life_stage === 'pregnant') {
    PREGNANCY_CONCERNS.forEach(concern => {
      normNames.forEach((name, i) => {
        if (name.includes(concern)) {
          addFlag(i, 'Pregnancy concern', `Not recommended during pregnancy`);
        }
      });
    });
  }

  // 5. Skin condition triggers
  const skinKey = profile.skin_condition;
  if (skinKey && SKIN_CONDITION_TRIGGERS[skinKey]) {
    SKIN_CONDITION_TRIGGERS[skinKey].forEach(trigger => {
      normNames.forEach((name, i) => {
        if (name.includes(trigger)) {
          addFlag(i, `${skinKey.replace('_', '-')} skin`, `May aggravate ${skinKey.replace('_', ' ')} skin`);
        }
      });
    });
  }

  return flagged;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function PersonalRiskCard({ product, healthProfile, onFindAlternatives }) {
  const flagged = useMemo(
    () => matchIngredients(product?.ingredients, healthProfile),
    [product?.ingredients, healthProfile]
  );

  if (flagged.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-red-400 bg-red-50 overflow-hidden"
      >
        {/* Header bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-red-100 border-b border-red-200">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-red-900 text-base sm:text-lg">Personal Risk Alert</h4>
            <p className="text-xs text-red-700">
              {flagged.length} ingredient{flagged.length > 1 ? 's' : ''} match your safety profile
            </p>
          </div>
          <Badge className="bg-red-600 text-white border-0 flex-shrink-0">
            <Shield className="w-3 h-3 mr-1 inline" /> High
          </Badge>
        </div>

        {/* Flagged ingredient list */}
        <div className="p-3 space-y-2">
          {flagged.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-red-200">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-red-900 text-sm">{f.ingredient}</span>
                <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px] flex-shrink-0">
                  {f.reason}
                </Badge>
              </div>
              <p className="text-xs text-red-600">{f.explanation}</p>
            </div>
          ))}
        </div>

        {/* Action buttons — large, mobile-friendly */}
        <div className="flex gap-2 p-3 pt-0">
          <Button
            size="sm"
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
            onClick={onFindAlternatives}
          >
            <Search className="w-4 h-4 mr-1.5" /> Find Alternatives
          </Button>
          <Button size="sm" variant="outline" className="h-11 border-red-300 text-red-700 hover:bg-red-50" asChild>
            <Link to="/MySafetyProfile">
              <Settings className="w-4 h-4 mr-1.5" /> Manage Profile
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  // Green "clear" card
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-emerald-900 text-base sm:text-lg">Clear for Your Profile</h4>
          <p className="text-xs text-emerald-700">No ingredients match your personal safety profile.</p>
        </div>
        <Badge className="bg-emerald-500 text-white border-0 flex-shrink-0">
          <CheckCircle className="w-3 h-3 mr-1 inline" /> Clear
        </Badge>
      </div>
      <div className="flex gap-2 px-3 pb-3">
        <Button size="sm" variant="outline" className="h-10 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={onFindAlternatives}>
          <Search className="w-4 h-4 mr-1.5" /> Find Alternatives
        </Button>
        <Button size="sm" variant="ghost" className="h-10 text-emerald-700 hover:bg-emerald-100" asChild>
          <Link to="/MySafetyProfile">
            Manage Profile <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}