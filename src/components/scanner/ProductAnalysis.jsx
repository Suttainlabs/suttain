import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Shield, Leaf, Beaker, CheckCircle, AlertTriangle, HelpCircle,
  ImageOff, ChevronLeft, ExternalLink, ChevronDown, TestTube, FlaskConical, ThumbsUp, MessageSquareWarning, Loader2, Sparkles,
  HeartPulse, Apple, Users, Baby, Home, Droplets,
  Lock, Info, Search, Bell, Pill
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from '@/api/base44Client';
import { analyzeAndCreateAlerts } from '../safety/safetyAlertUtils';
import ShareButton from '../shared/ShareButton';
import RiskExplanationModal from './RiskExplanationModal';
import useDoseAnalysis from './useDoseAnalysis';
import WhyThisScore from './WhyThisScore';
import PersonalRiskCard from './PersonalRiskCard';
import GuidedSteps from '@/components/consumer/GuidedSteps';
import {
  unwrapInvoke, errorMessage, normalizeCompliance, normalizeSustainability, normalizeHealth,
  InsightState, ComplianceView, SustainabilityView, HealthView
} from './ScanInsightPanels';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getRatingLabel = (score) => {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  if (score >= 70) return { label: 'Good', color: 'text-teal-600', bg: 'bg-teal-100' };
  if (score >= 50) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-100' };
  return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
};

const ScoreBar = ({ score, color }) => {
  const barColor = color || (score >= 85 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500');
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
    </div>
  );
};

// Circular score ring for hero metrics
// Ring colour uses the same thresholds as getRatingLabel so the colour and the word always agree.
const scoreColor = (score) => (score >= 85 ? '#10b981' : score >= 70 ? '#02988C' : score >= 50 ? '#f59e0b' : '#ef4444');

const ScoreRing = ({ score, size = 72, label, color }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = color || scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={ringColor} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill="#1e293b">
          {score}
        </text>
      </svg>
      {label && <span className="text-[11px] text-slate-500 font-medium text-center leading-tight">{label}</span>}
    </div>
  );
};

// Letter grade badge
const GradeBadge = ({ score }) => {
  const grade =
    score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' :
    score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
  const color =
    score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-white font-extrabold text-base ${color}`}>
      {grade}
    </span>
  );
};

// Pro feature lock overlay
const ProLock = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
    <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
      <Lock className="w-7 h-7 text-violet-500" />
    </div>
    <p className="font-semibold text-slate-700">{label}</p>
    <p className="text-sm text-slate-500 max-w-xs">Upgrade to Suttain Pro to unlock this feature.</p>
    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white mt-1" asChild>
      <a href="/Pricing">Upgrade to Pro</a>
    </Button>
  </div>
);

// ── Ingredient item (enhanced with full good/bad ratings) ──────────────────
const IngredientItem = ({ ingredient, doseAnalysis, onLoadDose, doseLoading, doseError }) => {
  const safety = ingredient.safety ?? 50;
  const sustainability = ingredient.sustainability ?? 50;
  const { label: safetyLabel, color: safetyColor } = getRatingLabel(safety);
  const { label: ecoLabel, color: ecoColor } = getRatingLabel(sustainability);

  // Determine if this ingredient is "good" or "bad"
  const isGood = safety >= 70 && sustainability >= 60;
  const isBad = safety < 50 || sustainability < 40;

  return (
    <AccordionItem value={ingredient.name} className="border-b border-slate-200/80">
      <AccordionTrigger className="text-left font-medium text-slate-800 hover:no-underline py-3 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="truncate">{ingredient.name}</p>
            {isGood && (
              <Badge className="text-[11px] bg-emerald-100 text-emerald-700 border-emerald-200 px-1.5 py-0">
                ✓ Safe
              </Badge>
            )}
            {isBad && (
              <Badge className="text-[11px] bg-red-100 text-red-700 border-red-200 px-1.5 py-0">
                ⚠ Caution
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 font-normal">{ingredient.purpose}</p>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <GradeBadge score={safety} />
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Safety Score</p>
            <p className={`text-lg font-bold ${safetyColor}`}>{safety}%</p>
            <ScoreBar score={safety} />
            <p className={`text-xs mt-1 font-medium ${safetyColor}`}>{safetyLabel}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Eco Score</p>
            <p className={`text-lg font-bold ${ecoColor}`}>{sustainability}%</p>
            <ScoreBar score={sustainability} />
            <p className={`text-xs mt-1 font-medium ${ecoColor}`}>{ecoLabel}</p>
          </div>
        </div>

        <WhyThisScore
          ingredientName={ingredient.name}
          doseAnalysis={doseAnalysis}
          onLoad={onLoadDose}
          loading={doseLoading}
          error={doseError}
        />

        {ingredient.notes && <p className="text-xs text-slate-500 italic">{ingredient.notes}</p>}
      </AccordionContent>
    </AccordionItem>
  );
};

// ── "Would buy again" ─────────────────────────────────────────────────────
// There is no shared vote store yet, so this shows no community percentage (the old one was
// derived from the risk level, not from real votes). The user's own answer is kept on this device.
const CommunityScore = ({ product }) => {
  const key = `suttain_buy_again_${product.barcode || product.name}`;
  const read = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const [answer, setAnswer] = useState(read);
  useEffect(() => { setAnswer(read()); }, [key]);

  const handleVote = (vote) => {
    const v = vote ? 'yes' : 'no';
    setAnswer(v);
    try { localStorage.setItem(key, v); } catch {}
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-[#02988C]" />
        <span className="text-sm font-medium text-slate-700">Would you buy this again?</span>
      </div>
      {answer ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">You said <strong className="text-slate-700">{answer === 'yes' ? 'yes' : 'no'}</strong></span>
          <button type="button" className="text-xs text-[#02988C] hover:underline" onClick={() => { setAnswer(null); try { localStorage.removeItem(key); } catch {} }}>Change</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => handleVote(true)}>Yes</Button>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => handleVote(false)}>No</Button>
        </div>
      )}
    </div>
  );
};

// ── Product Category Badges ────────────────────────────────────────────────
const ProductCategoryBadges = ({ category }) => {
  const cat = (category || '').toLowerCase();
  const tags = [];
  if (/personal|skin|hair|care|beauty|cosmetic|shampoo|lotion|cream|soap|deodorant|toothpaste|cleanser|serum|moisturizer/.test(cat)) {
    tags.push({ icon: Droplets, label: 'Personal Care', color: 'bg-pink-100 text-pink-700' });
  }
  if (/household|clean|detergent|spray|laundry|dish|floor|surface|bleach|disinfect/.test(cat)) {
    tags.push({ icon: Home, label: 'Household', color: 'bg-blue-100 text-blue-700' });
  }
  if (/baby|infant|child|kid|toddler|newborn|diaper/.test(cat)) {
    tags.push({ icon: Baby, label: 'Baby Product', color: 'bg-purple-100 text-purple-700' });
  }
  if (/food|nutrition|drink|beverage|snack/.test(cat)) {
    tags.push({ icon: Apple, label: 'Food & Nutrition', color: 'bg-amber-100 text-amber-700' });
  }
  if (/prescription drug/.test(cat)) {
    tags.push({ icon: Pill, label: 'Rx Drug', color: 'bg-red-100 text-red-700' });
  } else if (/medicine|drug|otc|pharmaceutical|tablet|capsule|syrup/.test(cat)) {
    tags.push({ icon: Pill, label: 'Medicine / Drug', color: 'bg-rose-100 text-rose-700' });
  }
  if (/supplement|vitamin|mineral|herbal/.test(cat)) {
    tags.push({ icon: Leaf, label: 'Supplement', color: 'bg-green-100 text-green-700' });
  }
  if (/medical device|diagnostic|first aid/.test(cat)) {
    tags.push({ icon: HeartPulse, label: 'Medical Device', color: 'bg-blue-100 text-blue-700' });
  }
  if (tags.length === 0) {
    tags.push({ icon: Beaker, label: 'General Product', color: 'bg-slate-100 text-slate-700' });
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(({ icon: Icon, label, color }) => (
        <span key={label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${color}`}>
          <Icon className="w-3 h-3" />{label}
        </span>
      ))}
    </div>
  );
};

// ── Report / Feedback ─────────────────────────────────────────────────────
const ReportIssueModal = ({ isOpen, onClose, product, user }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.ContactSubmission.create({
        name: user?.full_name || 'Anonymous User',
        email: user?.email,
        subject: `Issue Report for Barcode: ${product.barcode} (${product.name})`,
        message
      });
      toast({ title: "Report Submitted", description: "Thank you! We'll review the information." });
      onClose(); setMessage('');
    } catch { toast({ title: "Submission Failed", variant: "destructive" }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>Help us improve by reporting inaccuracies for "{product.name}".</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Textarea placeholder="Please describe the issue (e.g., 'Ingredients are incorrect', 'Wrong product image')." value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FeedbackSection = ({ product, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setFeedbackGiven(true);
    try {
      await base44.entities.ContactSubmission.create({
        name: user?.full_name || 'Anonymous User',
        email: user?.email || 'anonymous@unknown.com',
        subject: `✅ Accuracy Confirmed: ${product.barcode} (${product.name})`,
        message: `User confirmed that product info for "${product.name}" is accurate.`
      });
    } catch {}
    // feedbackGiven=true already hides the section immediately
  };

  if (feedbackGiven) {
    return null;
  }

  return (
    <>
      <ReportIssueModal isOpen={showModal} onClose={() => setShowModal(false)} product={product} user={user} />
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-700" />
          <h4 className="font-semibold text-amber-800">Is this information correct?</h4>
        </div>
        <p className="text-sm text-amber-700">This data comes from an automated source and may have inaccuracies.</p>
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={handleConfirm}>
            <ThumbsUp className="w-4 h-4 mr-2" /> Yes, it's correct
          </Button>
          <Button size="sm" variant="outline" className="bg-white" onClick={() => setShowModal(true)}>
            <MessageSquareWarning className="w-4 h-4 mr-2" /> Report an issue
          </Button>
        </div>
      </div>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
export default function ProductAnalysis({ product, onClear, user }) {
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageSrc, setImageSrc] = useState(null);
  const [similarProducts, setSimilarProducts] = useState(null);
  const [isFindingSimilar, setIsFindingSimilar] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [isLoadingCompliance, setIsLoadingCompliance] = useState(false);
  const [sustainabilityData, setSustainabilityData] = useState(null);
  const [isLoadingSustainability, setIsLoadingSustainability] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [complianceError, setComplianceError] = useState(null);
  const [sustainabilityError, setSustainabilityError] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [healthProfile, setHealthProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profilePromptDismissed, setProfilePromptDismissed] = useState(
    typeof localStorage !== 'undefined' && localStorage.getItem('safety_profile_prompt_dismissed') === 'true'
  );
  const navigate = useNavigate();
  const doseAnalysis = useDoseAnalysis(product);

  const isPro = user?.subscription_plan === 'pro' || user?.subscription_plan === 'enterprise'
    || user?.subscription_plan === 'lifetime' || user?.is_lifetime === true
    || user?.trial_active === true || user?.subscription_status === 'trialing';

  useEffect(() => {
    setImageError(false);
    // Try product image first, then fall back to Open Food Facts by barcode
    const src = product.imageUrl
      || (product.barcode ? `https://images.openfoodfacts.org/images/products/${product.barcode}/front_en.jpg` : null);
    setImageSrc(src);
    setSimilarProducts(null);
    setSafetyAlert(null);
    setComplianceData(null);
    setSustainabilityData(null);
    setHealthData(null);
    setComplianceError(null);
    setSustainabilityError(null);
    setHealthError(null);
    checkSafetyProfile();
  }, [product]);

  // Load user's health profile for personal risk assessment
  useEffect(() => {
    let mounted = true;
    const loadHealthProfile = async () => {
      if (!user) { setIsLoadingProfile(false); return; }
      try {
        const profiles = await base44.entities.UserHealthProfile.filter({});
        if (mounted) {
          setHealthProfile(profiles?.[0] || null);
          setIsLoadingProfile(false);
        }
      } catch {
        if (mounted) setIsLoadingProfile(false);
      }
    };
    loadHealthProfile();
    return () => { mounted = false; };
  }, [user]);

  // Determine if profile has meaningful data
  const hasActiveProfile = healthProfile && (
    (healthProfile.allergies?.length > 0) ||
    (healthProfile.avoid_ingredients?.length > 0) ||
    healthProfile.asthma_sensitive === true ||
    (healthProfile.skin_condition && healthProfile.skin_condition !== 'normal') ||
    healthProfile.life_stage === 'pregnant'
  );

  const isFood = /food|nutrition|drink|beverage|snack|supplement|vitamin/i.test(product.category || '');
  const ingredientText = product.ingredients?.map(i => i.name).join(', ') || 'unknown ingredients';

  // Runs one AI-backed step. On failure it shows an error with Retry instead of inventing values.
  const runInsight = async ({ operation, data, normalize, setData, setLoading, setError }) => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('runConsumerLLM', { operation, data });
      setData(normalize(unwrapInvoke(res)));
    } catch (err) {
      setError(errorMessage(err));
    } finally { setLoading(false); }
  };

  const handleLoadCompliance = (force = false) => {
    if (isLoadingCompliance || (!force && complianceData)) return;
    runInsight({
      operation: 'productCompliance',
      data: { productName: product.name, category: product.category, ingredients: ingredientText },
      normalize: normalizeCompliance, setData: setComplianceData, setLoading: setIsLoadingCompliance, setError: setComplianceError,
    });
  };

  const handleLoadHealth = (force = false) => {
    if (isLoadingHealth || (!force && healthData)) return;
    runInsight({
      operation: 'productHealth',
      data: {
        productName: product.name, brand: product.brand, category: product.category, ingredients: ingredientText,
        nutritionFacts: product.nutritionFacts ? JSON.stringify(product.nutritionFacts) : 'not available'
      },
      normalize: normalizeHealth, setData: setHealthData, setLoading: setIsLoadingHealth, setError: setHealthError,
    });
  };

  const handleLoadSustainability = (force = false) => {
    if (isLoadingSustainability || (!force && sustainabilityData)) return;
    runInsight({
      operation: 'productSustainability',
      data: { productName: product.name, category: product.category, ingredients: ingredientText },
      normalize: normalizeSustainability, setData: setSustainabilityData, setLoading: setIsLoadingSustainability, setError: setSustainabilityError,
    });
  };

  const checkSafetyProfile = async () => {
    if (!user || !product.ingredients || product.ingredients.length === 0) return;
    try {
      const profiles = await base44.entities.SafetyProfile.filter({ is_default: true });
      if (profiles.length === 0) return;
      const result = await analyzeAndCreateAlerts({
        productName: product.name,
        ingredients: product.ingredients.map(i => i.name),
        alertType: 'product_scan',
        profileId: profiles[0].id,
        userEmail: user.email,
        additionalContext: { barcode: product.barcode, brand: product.brand, category: product.category }
      });
      if (result.shouldWarn) {
        setSafetyAlert(result.alert);

      }
    } catch {}
  };

  // Hand the scanned product to the Formula Generator, which starts generating a safer homemade version in Individual mode.
  const handleGoToGenerator = (recipe) => {
    const flagged = [
      ...(product.hazards || []),
      ...(product.allergens || []),
      ...(product.ingredients || []).filter(i => ['high', 'moderate'].includes(String(i.safety).toLowerCase()) || (Array.isArray(i.concerns) && i.concerns.length)).map(i => i.name),
    ].map(String).filter(Boolean);
    navigate(createPageUrl('generator'), { state: { fromScan: {
      name: product.name || 'Scanned product', brand: product.brand || '', category: product.category || '',
      ingredients: (product.ingredients || []).map(i => i.name).filter(Boolean),
      avoid: flagged,
      recipe: recipe?.length ? recipe.map(ing => ({ name: ing.name, percentage: ing.percentage })) : null,
    } } });
  };

  const handleFindSimilar = async () => {
    setIsFindingSimilar(true); setSimilarProducts(null);
    try {
      const result = await base44.functions.invoke('runConsumerLLM', {
        operation: 'findSimilarProducts',
        data: { productName: product.name, category: product.category, brand: product.brand, ingredients: product.ingredients?.slice(0, 5).map(i => i.name) }
      });
      setSimilarProducts(unwrapInvoke(result)?.similar_products || []);
    } catch { setSimilarProducts([]); }
    finally { setIsFindingSimilar(false); }
  };

  const averageScores = React.useMemo(() => {
    if (!product.ingredients?.length) return { safety: 0, sustainability: 0 };
    const total = product.ingredients.reduce((acc, ing) => {
      acc.safety += typeof ing.safety === 'number' ? ing.safety : 0;
      acc.sustainability += typeof ing.sustainability === 'number' ? ing.sustainability : 0;
      return acc;
    }, { safety: 0, sustainability: 0 });
    return {
      safety: Math.round(total.safety / product.ingredients.length),
      sustainability: Math.round(total.sustainability / product.ingredients.length)
    };
  }, [product.ingredients]);

  // Overall product score = weighted average of safety + sustainability + (inverse of hazards penalty)
  const overallScore = Math.round(
    averageScores.safety * 0.5 +
    averageScores.sustainability * 0.3 +
    Math.max(0, 100 - (product.hazards?.length || 0) * 15) * 0.2
  );

  // One verdict that accounts for both the ingredient score and the hazard level, so the page
  // never says "Good" in green next to a "Medium Risk" warning without explanation.
  const riskLevel = product.riskAssessment?.overallRisk;
  const verdict = (() => {
    const base = getRatingLabel(overallScore);
    if (riskLevel === 'high') return { label: 'Use with care', color: 'text-red-700', bg: 'bg-red-100' };
    if (riskLevel === 'medium' && overallScore >= 70) return { label: `${base.label}, some cautions`, color: 'text-amber-800', bg: 'bg-amber-100' };
    return base;
  })();

  const getRiskBadge = (risk) => {
    const config = {
      low: { label: "Low Risk", Icon: CheckCircle, color: "bg-emerald-100 text-emerald-800" },
      medium: { label: "Medium Risk", Icon: AlertTriangle, color: "bg-amber-100 text-amber-800" },
      high: { label: "High Risk", Icon: Shield, color: "bg-red-100 text-red-800" },
      unknown: { label: "Risk Unknown", Icon: HelpCircle, color: "bg-slate-100 text-slate-800" }
    };
    const { label, Icon, color } = config[risk] || config.unknown;
    return (
      <button
        type="button"
        onClick={() => setShowRiskModal(true)}
        className="inline-flex items-center group"
        aria-label={`Risk level: ${label}. Tap to learn what this means.`}
      >
        <Badge className={`border-transparent ${color} py-1.5 px-3 text-sm cursor-pointer hover:opacity-80 transition-opacity`}>
          <Icon className="w-4 h-4 mr-1.5 inline" />{label}
        </Badge>
        <HelpCircle className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </button>
    );
  };

  const scanSteps = [
    { value: 'overview', label: 'Overview', intro: 'The overall score, average safety and eco ratings, and any hazards found.' },
    { value: 'ingredients', label: "What's inside", intro: 'Every listed ingredient, its role in the product and its rating.' },
    { value: 'safety', label: 'Safety', intro: 'Hazards and safety considerations for the ingredients in this product.' },
    { value: 'compliance', label: 'Compliance', intro: 'Regulatory notes across the EU, US and Canada.' },
    { value: 'sustainability', label: 'Environmental impact', intro: 'How the ingredients score for environmental impact.' },
    { value: 'health', label: 'Health notes', intro: isFood ? 'Health and nutrition context for this product.' : 'Skin, sensitivity and safe-use notes for this product.' },
    ...(product.isMedicine ? [] : [{ value: 'diy', label: 'Make it yourself', intro: 'Simple alternatives you can make, with safety notes.' }]),
  ];
  const changeTab = (v) => {
    setActiveTab(v);
    if (v === 'compliance') handleLoadCompliance();
    if (v === 'sustainability') handleLoadSustainability();
    if (v === 'health') handleLoadHealth();
  };

  const showFeedbackSection = product.source?.includes('AI Estimation') || product.source === 'UPC Database' || product.source === 'Not Found';

  return (
    <motion.div
      key="analysis"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full"
    >
      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 px-1">
            <Button variant="ghost" size="sm" onClick={() => onClear(null)} className="text-slate-600 hover:bg-slate-100 -ml-2">
              <ChevronLeft className="w-4 h-4 mr-1" /> New Scan
            </Button>
            <div className="flex items-center gap-1">
              <ShareButton
                text={`I scanned "${product.name}" by ${product.brand} on Suttain.\n\nOverall Score: ${overallScore}/100 | Safety: ${averageScores.safety}% | Eco: ${averageScores.sustainability}% | Hazards: ${product.hazards?.length || 0}\n\nAnalyze your own products at suttain.com`}
                url="https://suttain.com/BarcodeScanner"
                label="Share"
              />
              {product.source_url && (
                <Button asChild variant="link" size="sm" className="text-xs px-2">
                  <a href={product.source_url} target="_blank" rel="noopener noreferrer">
                    Data Source <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Product hero: single row on mobile */}
          <div className="flex items-start gap-3 mb-4">
            {/* Image */}
            <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-xl shadow border border-slate-200/80 flex items-center justify-center p-1.5">
              {imageSrc && !imageError ? (
                <img
                  src={imageSrc} alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
                  <ImageOff className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <ProductCategoryBadges category={product.category} />
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 mt-0.5 leading-tight">{product.name}</h2>
              <p className="text-xs text-slate-500 mb-1.5 truncate">{product.brand} {product.category ? `\u2022 ${product.category}` : ''}</p>
              {getRiskBadge(product.riskAssessment?.overallRisk)}
            </div>

            {/* Score ring */}
            <div className="flex-shrink-0 flex flex-col items-center gap-0.5 p-2 bg-white rounded-xl shadow border border-slate-100">
              <ScoreRing score={overallScore} size={64} />
              <span className="text-[11px] font-semibold text-slate-500 leading-tight">Ingredient score</span>
              <Badge className={`text-[11px] px-1.5 py-0 text-center ${verdict.bg} ${verdict.color} border-0`}>
                {verdict.label}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          {/* Guided results: same step-by-step presentation as Atomistic Simulation */}
          <Tabs value={activeTab} onValueChange={changeTab} className="w-full">
            <GuidedSteps steps={scanSteps} value={activeTab} onChange={changeTab} label="Product analysis steps">

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="pt-4 space-y-4">
              {safetyAlert && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-2 rounded-xl ${safetyAlert.severity === 'critical' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${safetyAlert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                    <div>
                      <h4 className={`font-bold mb-1 ${safetyAlert.severity === 'critical' ? 'text-red-900' : 'text-amber-900'}`}>Personalized Safety Alert</h4>
                      <p className={`text-sm mb-2 ${safetyAlert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>{safetyAlert.alert_message}</p>
                      <Badge className={`${safetyAlert.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'} text-white`}>Email sent to {user?.email}</Badge>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Personal Risk Card, shown first if profile is active */}
              {hasActiveProfile && (
                <PersonalRiskCard
                  product={product}
                  healthProfile={healthProfile}
                  onFindAlternatives={handleFindSimilar}
                />
              )}
              {/* First-scan prompt: shown if no profile and not dismissed */}
              {!hasActiveProfile && !isLoadingProfile && !profilePromptDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-teal-50 border-2 border-teal-300 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <HeartPulse className="w-5 h-5 flex-shrink-0 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-teal-900 mb-1">Set up your safety profile</h4>
                      <p className="text-sm text-teal-700 mb-3">Get personalized warnings based on your allergies, skin condition, and sensitivities.</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" asChild>
                          <Link to="/MySafetyProfile">Set Up Profile</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-teal-300 text-teal-700 hover:bg-teal-50"
                          onClick={() => {
                            setProfilePromptDismissed(true);
                            localStorage.setItem('safety_profile_prompt_dismissed', 'true');
                          }}
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Medicine / Drug disclaimer */}
              {product.isMedicine && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Pill className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-900 mb-1">Medicine / Drug Product</h4>
                      <p className="text-sm text-rose-800">
                        This is a pharmaceutical or medical product. This analysis is <strong>for informational purposes only</strong> and does not constitute medical advice.
                        Always consult a licensed healthcare professional or pharmacist before use.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {showFeedbackSection && <FeedbackSection product={product} user={user} />}

              {/* Score rings row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <ScoreRing score={averageScores.safety} size={64} color="#10b981" />
                  <span className="text-[11px] text-slate-500 font-medium text-center">Avg. Safety</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <ScoreRing score={averageScores.sustainability} size={64} color="#06b6d4" />
                  <span className="text-[11px] text-slate-500 font-medium text-center">Avg. Eco</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex flex-col items-center justify-center w-16 h-16">
                    <span className={`text-2xl font-extrabold ${product.hazards?.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {product.hazards?.length || 0}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium text-center">Hazards</span>
                </div>
              </div>

              {/* Community score */}
              <CommunityScore product={product} />

              {/* Methodology transparency card */}
              <Card className="bg-blue-50/60 border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">How We Rate Products</p>
                      <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
                        <li>Ingredient score blends average ingredient safety (50%), eco rating (30%) and hazards found (20%)</li>
                        <li>The risk level is assessed separately, so a well-scored product can still carry cautions</li>
                        <li>Reference data from public sources such as PubChem, EU CosIng and FDA</li>
                        <li>Compliance, environmental and health steps are AI-assisted and labelled as such</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis notes */}
              {product.analysisNotes?.length > 0 && (
                <Card className="bg-white/60">
                  <CardHeader><CardTitle className="text-base font-semibold">Analysis Notes</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                      {product.analysisNotes.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Find similar */}
              <Card className="bg-white/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-500" />Discover Alternatives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isFindingSimilar && !similarProducts && (
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-4">Find cleaner, more natural alternatives to this product.</p>
                      <Button onClick={handleFindSimilar}><Sparkles className="w-4 h-4 mr-2" />Find Similar Products</Button>
                    </div>
                  )}
                  {isFindingSimilar && (
                    <div className="flex items-center justify-center gap-2 text-slate-600 py-4">
                      <Loader2 className="w-5 h-5 animate-spin" /><p>Searching for alternatives...</p>
                    </div>
                  )}
                  {similarProducts && (
                    <div className="space-y-4">
                      {similarProducts.length > 0 ? similarProducts.map((p, i) => (
                        <div key={i} className="p-4 border rounded-lg bg-slate-50/50">
                          <h4 className="font-semibold text-slate-800">{p.product_name}</h4>
                          <p className="text-sm text-slate-500 mb-2">{p.brand} &bull; {p.main_category}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {p.key_attributes?.split(',').map(attr => (
                              <Badge key={attr} variant="secondary" className="bg-violet-100 text-violet-800">{attr.trim()}</Badge>
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{p.brief_description}</p>
                          {p.url?.startsWith('http') ? (
                            <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-[var(--suttain-violet)] hover:underline">
                              View Product <ExternalLink className="w-3 h-3 ml-1.5" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Search online for availability</span>
                          )}
                        </div>
                      )) : <p className="text-center text-slate-500 py-4">Could not find any similar products at this time.</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* INGREDIENTS TAB */}
            <TabsContent value="ingredients" className="pt-4 space-y-3">
              {/* Ingredient preference alert (Pro) */}
              {!isPro && (
                <Card className="bg-violet-50 border border-violet-200">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-violet-800">Custom Ingredient Preference Alerts</p>
                        <p className="text-xs text-violet-600">Get notified when products contain ingredients you prefer to avoid.</p>
                      </div>
                    </div>
                    <Badge className="bg-violet-600 text-white text-[11px] shrink-0">PRO</Badge>
                  </CardContent>
                </Card>
              )}

              {/* Dose-aware positioning copy */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 rounded-xl border border-teal-200">
                <FlaskConical className="w-4 h-4 text-[var(--suttain-teal)] flex-shrink-0" />
                <p className="text-xs text-teal-800 font-medium">We weigh the amount, not just the presence.</p>
              </div>

              {/* Stats bar */}
              {product.ingredients?.length > 0 && (() => {
                const good = product.ingredients.filter(i => (i.safety ?? 50) >= 70).length;
                const caution = product.ingredients.filter(i => (i.safety ?? 50) < 50).length;
                const neutral = product.ingredients.length - good - caution;
                return (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <p className="text-xl font-bold text-emerald-700">{good}</p>
                      <p className="text-[11px] text-emerald-600">Good</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-xl font-bold text-amber-700">{neutral}</p>
                      <p className="text-[11px] text-amber-600">Neutral</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-xl font-bold text-red-700">{caution}</p>
                      <p className="text-[11px] text-red-600">Caution</p>
                    </div>
                  </div>
                );
              })()}

              <Card className="bg-white/60">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center justify-between">
                    <span>Ingredients Breakdown</span>
                    <span className="text-sm font-normal text-slate-500">{product.ingredients?.length || 0} total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.ingredients?.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {product.ingredients.map((ing, i) => (
                        <IngredientItem
                          key={i}
                          ingredient={ing}
                          doseAnalysis={doseAnalysis.getAnalysis(ing.name)}
                          onLoadDose={doseAnalysis.load}
                          doseLoading={doseAnalysis.loading}
                          doseError={doseAnalysis.error}
                        />
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-slate-500 text-center py-8">Ingredient information not available from this source.</p>
                  )}
                </CardContent>
              </Card>

              {/* Search by ingredients (Pro) */}
              {!isPro && (
                <Card className="bg-white/60 border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-semibold text-slate-700">Search by Ingredients</span>
                      </div>
                      <Badge className="bg-violet-600 text-white text-[11px]">PRO</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Find all products in our database containing a specific ingredient.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* SAFETY TAB */}
            <TabsContent value="safety" className="pt-4 space-y-4">
              <Card className="bg-white/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl"><Shield className="w-6 h-6 text-red-500" /> Safety Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.hazards?.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Potential Hazards</h4>
                      <ul className="space-y-2">
                        {product.hazards.map((hazard, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm p-3 bg-red-50/70 border border-red-200/50 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-red-800">{hazard.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm p-3 bg-emerald-50/70 border border-emerald-200/50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-emerald-800">No common hazards identified.</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2 mt-4">Known Allergens</h4>
                    {product.allergens?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {product.allergens.map(allergen => (
                          <Badge key={allergen} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                            {allergen.replace('en:', '').replace(/-/g, ' ').replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No specific allergens identified. Products with "Fragrance" may contain undisclosed allergens.</p>
                    )}
                  </div>

                  {/* Personalized analysis note */}
                  {user && (
                    <div className="flex items-start gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <HeartPulse className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-teal-700">
                        <strong>Personalized analysis active.</strong> Safety alerts are tailored to your health profile and sensitivities.
                        <a href="/PersonalizedSafety" className="underline ml-1">Manage Profile →</a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* COMPLIANCE TAB */}
            <TabsContent value="compliance" className="pt-4">
              <InsightState
                loading={isLoadingCompliance} error={complianceError} hasData={!!complianceData}
                onRun={() => handleLoadCompliance(true)}
                loadingText="Checking ingredients against EU, US and Canada rules..."
                idleText="Screen this product's ingredients against EU, US and Canadian rules."
              >
                {complianceData && <ComplianceView data={complianceData} />}
              </InsightState>
            </TabsContent>

            {/* SUSTAINABILITY TAB */}
            <TabsContent value="sustainability" className="pt-4">
              <InsightState
                loading={isLoadingSustainability} error={sustainabilityError} hasData={!!sustainabilityData}
                onRun={() => handleLoadSustainability(true)}
                loadingText="Estimating environmental impact..."
                idleText="Estimate how this product's ingredients affect the environment."
              >
                {sustainabilityData && <SustainabilityView data={sustainabilityData} ingredientEcoAvg={averageScores.sustainability} />}
              </InsightState>
            </TabsContent>

            {/* HEALTH TAB */}
            <TabsContent value="health" className="pt-4">
              <InsightState
                loading={isLoadingHealth} error={healthError} hasData={!!healthData}
                onRun={() => handleLoadHealth(true)}
                loadingText={isFood ? 'Reviewing nutrition and health notes...' : 'Reviewing skin and sensitivity notes...'}
                idleText="Get health and safe-use notes for this product."
              >
                {healthData && <HealthView data={healthData} isFood={isFood} />}
              </InsightState>
            </TabsContent>

            {/* DIY TAB */}
            <TabsContent value="diy" className="pt-4 space-y-4">
              <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #01544E 0%, #02786F 60%, #02988C 100%)' }}>
                <p className="text-base font-semibold !text-white">Make a safer version of this product</p>
                <p className="mt-1 text-sm text-white/90">Opens the Formula Generator in Individual mode and starts building a homemade version straight away, avoiding the ingredients flagged in this scan.</p>
                <Button onClick={() => handleGoToGenerator(null)} className="mt-4 w-full sm:w-auto bg-white text-[#01544E] hover:bg-white/90">
                  <TestTube className="w-4 h-4 mr-2" />Make it with Formula Generator
                </Button>
              </div>
              {product.diyFormulas?.length > 0 ? (
                product.diyFormulas.map((formula, i) => (
                  <Card key={i} className="bg-white/60">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl"><FlaskConical className="w-6 h-6 text-[var(--suttain-violet)]" /> {formula.name}</CardTitle>
                      <p className="text-sm text-slate-500">{formula.description}</p>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold text-slate-800 mb-2">Ingredients:</h4>
                      <ul className="list-disc list-inside text-slate-600 mb-4">
                        {formula.ingredients.map((ing, j) => <li key={j}>{ing.name} ({ing.percentage}%)</li>)}
                      </ul>
                      <Button onClick={() => handleGoToGenerator(formula.ingredients)} className="w-full bg-[var(--suttain-violet)] hover:bg-[var(--suttain-violet)]/90 text-white">
                        <TestTube className="w-4 h-4 mr-2" />Make this recipe in Formula Generator
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/60">
                  <CardContent className="text-center py-12">
                    <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700">No DIY Alternatives Available</h3>
                    <p className="text-slate-500">There's no ready-made recipe for this product yet. Use the button above to generate one.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            </GuidedSteps>
          </Tabs>
        </CardContent>
      </Card>

      <RiskExplanationModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        currentRisk={product.riskAssessment?.overallRisk}
        product={product}
      />
    </motion.div>
  );
}