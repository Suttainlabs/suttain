import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Leaf, Beaker, CheckCircle, AlertTriangle, HelpCircle, ImageOff, ChevronLeft, ExternalLink, ChevronDown, TestTube, FlaskConical, ListChecks, ShieldCheck, ThumbsUp, MessageSquareWarning, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from '@/api/base44Client';
import { analyzeAndCreateAlerts } from '../safety/safetyAlertUtils';


const ScoreBar = ({ score }) => {
  const getScoreColor = (s) => {
    if (s >= 85) return 'bg-[var(--suttain-teal)]';
    if (s >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${getScoreColor(score)}`}
        style={{ width: `${score}%` }}
      ></div>
    </div>
  );
};

const IngredientItem = ({ ingredient }) => {
    const getScoreColor = (score) => {
        if (score >= 85) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <AccordionItem value={ingredient.name} className="border-b border-slate-200/80">
            <AccordionTrigger className="text-left font-medium text-slate-800 hover:no-underline py-4">
                <div className="flex-1">
                    <p>{ingredient.name}</p>
                    <p className="text-xs text-slate-500 font-normal">{ingredient.purpose}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                     <span className={`text-xs font-semibold ${getScoreColor(ingredient.safety)}`}>{ingredient.safety}%</span>
                     <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
                <div className="text-sm space-y-2">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-600">Safety Score</span>
                            <span className={`font-semibold ${getScoreColor(ingredient.safety)}`}>{ingredient.safety}%</span>
                        </div>
                        <ScoreBar score={ingredient.safety} />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-600">Eco-Friendliness</span>
                            <span className={`font-semibold ${getScoreColor(ingredient.sustainability)}`}>{ingredient.sustainability}%</span>
                        </div>
                        <ScoreBar score={ingredient.sustainability} />
                    </div>
                </div>
                <p className="text-xs text-slate-500 italic">{ingredient.notes}</p>
            </AccordionContent>
        </AccordionItem>
    );
};

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
                message: message
            });
            toast({
                title: "Report Submitted",
                description: "Thank you for your feedback! We'll review the information.",
            });
            onClose();
            setMessage('');
        } catch (error) {
            console.error("Failed to submit report:", error);
            toast({
                title: "Submission Failed",
                description: "Could not submit your report. Please try again later.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>
                        Help us improve by reporting inaccuracies for "{product.name}".
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            placeholder="Please describe the issue (e.g., 'Ingredients are incorrect', 'Wrong product image')."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Report
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

    const handleConfirm = () => {
        setFeedbackGiven(true);
        toast({
            title: "Thank You!",
            description: "Your confirmation helps improve our data accuracy.",
        });
        // Here you could make an API call to a backend function to +1 this barcode's accuracy score
    };
    
    if (feedbackGiven) {
        return (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Thanks for your feedback!</p>
            </div>
        )
    }

    return (
        <>
            <ReportIssueModal isOpen={showModal} onClose={() => setShowModal(false)} product={product} user={user} />
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-700" />
                    <h4 className="font-semibold text-amber-800">Is this information correct?</h4>
                </div>
                <p className="text-sm text-amber-700">This data comes from an automated source and may have inaccuracies. Your feedback is valuable!</p>
                <div className="flex gap-2 pt-2">
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


export default function ProductAnalysis({ product, onClear, user }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [imageError, setImageError] = useState(false);
    const [similarProducts, setSimilarProducts] = useState(null);
    const [isFindingSimilar, setIsFindingSimilar] = useState(false);
    const [safetyAlert, setSafetyAlert] = useState(null);
    const [complianceData, setComplianceData] = useState(null);
    const [isLoadingCompliance, setIsLoadingCompliance] = useState(false);
    const [sustainabilityData, setSustainabilityData] = useState(null);
    const [isLoadingSustainability, setIsLoadingSustainability] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setImageError(false);
        setSimilarProducts(null);
        setSafetyAlert(null);
        setComplianceData(null);
        setSustainabilityData(null);
        checkSafetyProfile();
    }, [product]);

    const handleLoadCompliance = async () => {
        if (complianceData || isLoadingCompliance) return;
        setIsLoadingCompliance(true);
        try {
            const ingredients = product.ingredients?.map(i => i.name).join(', ') || 'unknown ingredients';
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a regulatory compliance expert. Analyze these product ingredients for global regulatory compliance:\n\nProduct: ${product.name}\nCategory: ${product.category}\nIngredients: ${ingredients}\n\nCheck compliance for EU, US FDA, and Canada regulations. Flag any restricted or banned substances.`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        overall_status: { type: 'string', enum: ['Compliant', 'Issues Found', 'Requires Review'] },
                        summary: { type: 'string' },
                        flagged_ingredients: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    region: { type: 'string' },
                                    issue: { type: 'string' },
                                    severity: { type: 'string', enum: ['low', 'medium', 'high'] }
                                }
                            }
                        },
                        recommendations: { type: 'array', items: { type: 'string' } }
                    }
                }
            });
            setComplianceData(result);
        } catch (e) {
            console.error('Compliance check failed:', e);
            setComplianceData({ overall_status: 'Requires Review', summary: 'Could not complete analysis. Please try again.', flagged_ingredients: [], recommendations: [] });
        } finally {
            setIsLoadingCompliance(false);
        }
    };

    const handleLoadSustainability = async () => {
        if (sustainabilityData || isLoadingSustainability) return;
        setIsLoadingSustainability(true);
        try {
            const ingredients = product.ingredients?.map(i => i.name).join(', ') || 'unknown ingredients';
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an environmental sustainability expert. Analyze the eco-impact of these product ingredients:\n\nProduct: ${product.name}\nCategory: ${product.category}\nIngredients: ${ingredients}\n\nAssess biodegradability, bioaccumulation, carbon footprint, and overall sustainability.`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        overall_score: { type: 'number' },
                        grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
                        biodegradability: { type: 'string' },
                        carbon_footprint: { type: 'string' },
                        summary: { type: 'string' },
                        eco_concerns: { type: 'array', items: { type: 'string' } },
                        green_positives: { type: 'array', items: { type: 'string' } },
                        improvement_tips: { type: 'array', items: { type: 'string' } }
                    }
                }
            });
            setSustainabilityData(result);
        } catch (e) {
            console.error('Sustainability analysis failed:', e);
            setSustainabilityData({ overall_score: 0, grade: 'C', summary: 'Could not complete analysis. Please try again.', eco_concerns: [], green_positives: [], improvement_tips: [] });
        } finally {
            setIsLoadingSustainability(false);
        }
    };

    const checkSafetyProfile = async () => {
        if (!user || !product.ingredients || product.ingredients.length === 0) return;

        try {
            const profiles = await base44.entities.SafetyProfile.filter({ is_default: true });
            if (profiles.length === 0) return;

            const defaultProfile = profiles[0];
            const ingredients = product.ingredients.map(i => i.name);

            const result = await analyzeAndCreateAlerts({
                productName: product.name,
                ingredients,
                alertType: 'product_scan',
                profileId: defaultProfile.id,
                userEmail: user.email,
                additionalContext: {
                    barcode: product.barcode,
                    brand: product.brand,
                    category: product.category
                }
            });

            if (result.shouldWarn) {
                setSafetyAlert(result.alert);
            }
        } catch (error) {
            console.error('Safety profile check failed:', error);
        }
    };

    const handleGoToGenerator = (ingredients) => {
        navigate(createPageUrl('generator'), {
            state: {
                ingredientsToLoad: ingredients.map(ing => ({ name: ing.name, percentage: ing.percentage }))
            }
        });
    };

    const handleFindSimilar = async () => {
        setIsFindingSimilar(true);
        setSimilarProducts(null);

        const prompt = `You are an expert product researcher. A user wants to find SIMILAR alternative products to replace or compare with the following product:

**Original Product:**
*   **Name:** ${product.name}
*   **Category:** ${product.category}
*   **Brand:** ${product.brand}
*   **Key Ingredients:** ${product.ingredients?.slice(0, 5).map(i => i.name).join(', ') || 'Not specified'}

**CRITICAL INSTRUCTION:** You MUST suggest products that are in the SAME category and serve the SAME purpose as the original product. 
- If it's an air freshener, suggest OTHER air fresheners (sprays, plugins, gels, natural alternatives like essential oil diffusers)
- If it's a cleaner, suggest OTHER cleaners
- If it's skincare, suggest OTHER skincare products
- If it's food, suggest OTHER similar food products

**Task:** Find 3 alternative products that:
1. Serve the EXACT same purpose as "${product.name}"
2. Are preferably more natural, eco-friendly, or have better safety ratings
3. Are real products available for purchase

For each product provide:
*   Product Name (real product name)
*   Brand
*   Main Category (must match: ${product.category})
*   Key Attributes (as a comma-separated string, e.g., "Natural, Non-toxic, Essential Oil Based")
*   Brief Description (1-2 sentences explaining why it's a good alternative)
*   A URL to purchase if available`;

        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        similar_products: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    product_name: { type: "string" },
                                    brand: { type: "string" },
                                    main_category: { type: "string" },
                                    key_attributes: { type: "string" },
                                    brief_description: { type: "string" },
                                    url: { type: "string", format: "uri", nullable: true }
                                },
                                required: ["product_name", "brand", "main_category", "key_attributes", "brief_description"]
                            }
                        }
                    },
                    required: ["similar_products"]
                }
            });
            
            if (result && result.similar_products) {
                setSimilarProducts(result.similar_products);
            } else {
                console.warn("AI did not return the expected 'similar_products' structure.", result);
                setSimilarProducts([]); // Set to empty to show a "not found" message
            }
        } catch (error) {
            console.error("Failed to find similar products:", error);
            setSimilarProducts([]); // Also set to empty on error
        } finally {
            setIsFindingSimilar(false);
        }
    };

    const getRiskBadge = (risk, hazards, allergens, ingredients) => {
        const config = {
            low: { label: "Low Risk", Icon: CheckCircle, color: "bg-emerald-100 text-emerald-800" },
            medium: { label: "Medium Risk", Icon: AlertTriangle, color: "bg-amber-100 text-amber-800" },
            high: { label: "High Risk", Icon: Shield, color: "bg-red-100 text-red-800" },
            unknown: { label: "Risk Unknown", Icon: HelpCircle, color: "bg-slate-100 text-slate-800" }
        };
        const { label, Icon, color } = config[risk] || config.unknown;
        
        // Find the major risk contributor
        let reason = '';
        const lowSafetyIngredients = ingredients?.filter(i => i.safety < 60) || [];
        const fragranceIngredient = ingredients?.find(i => 
            i.name.toLowerCase().includes('fragrance') || 
            i.name.toLowerCase().includes('parfum') ||
            i.name.toLowerCase().includes('perfume')
        );
        
        if (risk === 'high') {
            if (hazards?.length > 0) {
                reason = `Contains ${hazards[0]?.ingredient || 'hazardous chemicals'}`;
            } else if (lowSafetyIngredients.length > 0) {
                reason = `${lowSafetyIngredients[0].name} has low safety score`;
            } else {
                reason = 'Contains potentially harmful chemicals';
            }
        } else if (risk === 'medium') {
            if (fragranceIngredient) {
                reason = 'Contains undisclosed fragrance compounds';
            } else if (lowSafetyIngredients.length > 0) {
                reason = `${lowSafetyIngredients[0].name} needs caution`;
            } else if (allergens?.length > 0) {
                reason = `Contains ${allergens[0].replace('en:', '').replace(/-/g, ' ')}`;
            } else {
                reason = 'Some ingredients may cause sensitivity';
            }
        } else if (risk === 'low') {
            reason = 'Generally safe ingredients';
        }
        
        return (
            <div className="flex flex-col items-start gap-1">
                <Badge className={`border-transparent ${color} py-1.5 px-3 text-sm`}>
                    <Icon className="w-4 h-4 mr-1.5" />{label}
                </Badge>
                {reason && <span className="text-xs text-slate-500 ml-1">{reason}</span>}
            </div>
        );
    };

    const averageScores = React.useMemo(() => {
        if (!product.ingredients || product.ingredients.length === 0) {
            return { safety: 0, sustainability: 0 };
        }
        const total = product.ingredients.reduce((acc, ing) => {
            acc.safety += typeof ing.safety === 'number' ? ing.safety : 0;
            acc.sustainability += typeof ing.sustainability === 'number' ? ing.sustainability : 0;
            return acc;
        }, { safety: 0, sustainability: 0 });
        const count = product.ingredients.length;
        return {
            safety: Math.round(total.safety / count),
            sustainability: Math.round(total.sustainability / count)
        };
    }, [product.ingredients]);

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white/50 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-lg font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );

    const showFeedbackSection = product.source.includes('AI Estimation') || product.source === 'UPC Database' || product.source === 'Not Found';

    return (
    <motion.div
        key="analysis"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-full"
    >
      <Card className="w-full shadow-2xl border-0 bg-transparent">
        <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => onClear(null)} className="text-slate-600 hover:bg-slate-100">
                    <ChevronLeft className="w-5 h-5 mr-1" /> New Scan
                </Button>
                {product.source_url && (
                    <Button asChild variant="link" size="sm">
                       <a href={product.source_url} target="_blank" rel="noopener noreferrer">
                         Data Source <ExternalLink className="w-3 h-3 ml-1.5" />
                       </a>
                    </Button>
                )}
            </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-2xl shadow-lg border border-slate-200/80 flex items-center justify-center p-2">
              {product.imageUrl && !imageError ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; setImageError(true); }}
                />
              ) : null}
              {(!product.imageUrl || imageError) && (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl">
                    <ImageOff className="w-10 h-10 text-slate-400" />
                 </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{product.name}</h2>
              <p className="text-slate-500 mb-3">{product.brand} &bull; {product.category}</p>
              {getRiskBadge(product.riskAssessment?.overallRisk, product.hazards, product.allergens, product.ingredients)}
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full" onValueChange={(v) => { setActiveTab(v); if (v === 'compliance') handleLoadCompliance(); if (v === 'sustainability') handleLoadSustainability(); }}>
            <TabsList className="grid w-full grid-cols-6 bg-slate-100/80 rounded-xl">
                 <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--suttain-teal)] data-[state=active]:shadow-md">Overview</TabsTrigger>
                 <TabsTrigger value="ingredients" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--suttain-teal)] data-[state=active]:shadow-md">Ingredients</TabsTrigger>
                 <TabsTrigger value="safety" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--suttain-teal)] data-[state=active]:shadow-md">Safety</TabsTrigger>
                 <TabsTrigger value="compliance" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--suttain-teal)] data-[state=active]:shadow-md">Compliance</TabsTrigger>
                 <TabsTrigger value="sustainability" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--suttain-teal)] data-[state=active]:shadow-md">Eco</TabsTrigger>
                 <TabsTrigger value="diy" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--suttain-teal)] data-[state=active]:shadow-md">DIY</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-6 space-y-6">
                {safetyAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-2 rounded-xl ${
                      safetyAlert.severity === 'critical' ? 'bg-red-50 border-red-300' :
                      'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                        safetyAlert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`font-bold mb-1 ${
                          safetyAlert.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                        }`}>
                          Personalized Safety Alert
                        </h4>
                        <p className={`text-sm mb-2 ${
                          safetyAlert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          {safetyAlert.alert_message}
                        </p>
                        <Badge className={`${
                          safetyAlert.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'
                        } text-white`}>
                          Email sent to {user?.email}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}
                {showFeedbackSection && <FeedbackSection product={product} user={user} />}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={ListChecks} label="Ingredients" value={product.ingredients?.length || 0} color="bg-[var(--suttain-blue)]"/>
                    <StatCard icon={AlertTriangle} label="Hazards Found" value={product.hazards?.length || 0} color="bg-red-500" />
                    <StatCard icon={ShieldCheck} label="Avg. Safety" value={`${averageScores.safety}%`} color="bg-[var(--suttain-violet)]" />
                    <StatCard icon={Leaf} label="Avg. Eco Score" value={`${averageScores.sustainability}%`} color="bg-[var(--suttain-teal)]" />
                </div>
                 <Card className="bg-white/60">
                    <CardHeader>
                       <CardTitle className="text-base font-semibold">Analysis Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                         {product.analysisNotes?.map((note, i) => <li key={i}>{note}</li>)}
                       </ul>
                    </CardContent>
                 </Card>

                 {/* Find Similar Products Section */}
                <Card className="bg-white/60">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                           <Sparkles className="w-5 h-5 text-violet-500" />
                           Discover Alternatives
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!isFindingSimilar && !similarProducts && (
                             <div className="text-center">
                                <p className="text-sm text-slate-600 mb-4">Find other high-quality, natural products similar to this one.</p>
                                <Button onClick={handleFindSimilar}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Find Similar Products
                                </Button>
                            </div>
                        )}
                        {isFindingSimilar && (
                            <div className="flex items-center justify-center gap-2 text-slate-600 py-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <p>Searching for alternatives...</p>
                            </div>
                        )}
                        {similarProducts && (
                             <div className="space-y-4">
                                {similarProducts.length > 0 ? (
                                    similarProducts.map((p, i) => (
                                        <div key={i} className="p-4 border rounded-lg bg-slate-50/50">
                                            <h4 className="font-semibold text-slate-800">{p.product_name}</h4>
                                            <p className="text-sm text-slate-500 mb-2">{p.brand} &bull; {p.main_category}</p>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {p.key_attributes.split(',').map(attr => (
                                                    <Badge key={attr} variant="secondary" className="bg-violet-100 text-violet-800">{attr.trim()}</Badge>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-600 mb-3">{p.brief_description}</p>
                                            {p.url && p.url.startsWith('http') ? (
                                                 <a 
                                                    href={p.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-sm font-medium text-[var(--suttain-violet)] hover:underline"
                                                 >
                                                    View Product <ExternalLink className="w-3 h-3 ml-1.5" />
                                                 </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Search online for availability</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-4">Could not find any similar products at this time.</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="pt-6">
                 <Card className="bg-white/60">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Ingredients Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {product.ingredients && product.ingredients.length > 0 ? (
                           <Accordion type="single" collapsible className="w-full">
                               {product.ingredients.map((ing, i) => (
                                   <IngredientItem key={i} ingredient={ing} />
                               ))}
                           </Accordion>
                        ) : (
                           <p className="text-slate-500 text-center py-8">Ingredient information not available from this source.</p>
                        )}
                    </CardContent>
                 </Card>
            </TabsContent>

            <TabsContent value="safety" className="pt-6 space-y-6">
              <Card className="bg-white/60">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><Shield className="w-6 h-6 text-red-500" /> Safety Profile</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {product.hazards && product.hazards.length > 0 ? (
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
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-emerald-800">No common hazards were identified in the ingredients.</span>
                        </div>
                    )}
                    {/* Known Allergens Section - always show */}
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-2 mt-4">Known Allergens</h4>
                        {product.allergens && product.allergens.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {product.allergens.map(allergen => (
                                    <Badge key={allergen} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                                        {allergen.replace('en:', '').replace(/-/g, ' ').replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">
                                No specific allergens identified. Products with "Fragrance" or "Parfum" may contain undisclosed allergens - check product packaging if you have sensitivities.
                            </p>
                        )}
                    </div>
                 </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="pt-6 space-y-4">
              {isLoadingCompliance && (
                <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Running compliance checks across EU, US, and Canada regulations...</span>
                </div>
              )}
              {!isLoadingCompliance && complianceData && (
                <>
                  <Card className={`bg-white/60 border-2 ${
                    complianceData.overall_status === 'Compliant' ? 'border-emerald-200' :
                    complianceData.overall_status === 'Issues Found' ? 'border-red-200' : 'border-amber-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`text-sm px-3 py-1 ${
                          complianceData.overall_status === 'Compliant' ? 'bg-emerald-100 text-emerald-800' :
                          complianceData.overall_status === 'Issues Found' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {complianceData.overall_status === 'Compliant' ? <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1 inline" />}
                          {complianceData.overall_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{complianceData.summary}</p>
                    </CardContent>
                  </Card>

                  {complianceData.flagged_ingredients?.length > 0 && (
                    <Card className="bg-white/60">
                      <CardHeader><CardTitle className="text-base">Flagged Ingredients</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {complianceData.flagged_ingredients.map((f, i) => (
                          <div key={i} className={`p-3 rounded-lg border ${
                            f.severity === 'high' ? 'bg-red-50 border-red-200' :
                            f.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <p className="font-semibold text-sm text-slate-800">{f.name}</p>
                            <p className="text-xs text-slate-500">{f.region} &bull; {f.issue}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {complianceData.recommendations?.length > 0 && (
                    <Card className="bg-white/60">
                      <CardHeader><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {complianceData.recommendations.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-[var(--suttain-teal)] mt-0.5 flex-shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="sustainability" className="pt-6 space-y-4">
              {isLoadingSustainability && (
                <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing environmental impact...</span>
                </div>
              )}
              {!isLoadingSustainability && sustainabilityData && (
                <>
                  <Card className="bg-white/60">
                    <CardContent className="p-4 flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white font-bold ${
                        sustainabilityData.overall_score >= 70 ? 'bg-emerald-500' :
                        sustainabilityData.overall_score >= 45 ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                        <span className="text-3xl">{sustainabilityData.grade}</span>
                        <span className="text-xs opacity-80">{sustainabilityData.overall_score}/100</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-2">{sustainabilityData.summary}</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                          {sustainabilityData.biodegradability && <span>♻️ {sustainabilityData.biodegradability}</span>}
                          {sustainabilityData.carbon_footprint && <span>🌍 {sustainabilityData.carbon_footprint}</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {sustainabilityData.green_positives?.length > 0 && (
                    <Card className="bg-emerald-50/60 border border-emerald-200">
                      <CardHeader><CardTitle className="text-base text-emerald-800">Eco Positives</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5">
                          {sustainabilityData.green_positives.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                              <Leaf className="w-4 h-4 mt-0.5 flex-shrink-0" />{p}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {sustainabilityData.eco_concerns?.length > 0 && (
                    <Card className="bg-white/60">
                      <CardHeader><CardTitle className="text-base">Eco Concerns</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5">
                          {sustainabilityData.eco_concerns.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{c}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {sustainabilityData.improvement_tips?.length > 0 && (
                    <Card className="bg-white/60">
                      <CardHeader><CardTitle className="text-base">Improvement Tips</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5">
                          {sustainabilityData.improvement_tips.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-[var(--suttain-teal)] mt-0.5 flex-shrink-0" />{t}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="diy" className="pt-6 space-y-6">
                {product.diyFormulas && product.diyFormulas.length > 0 ? (
                    product.diyFormulas.map((formula, i) => (
                         <Card key={i} className="bg-white/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl"><FlaskConical className="w-6 h-6 text-[var(--suttain-violet)]" /> {formula.name}</CardTitle>
                                <p className="text-sm text-slate-500">{formula.description}</p>
                            </CardHeader>
                            <CardContent>
                                <h4 className="font-semibold text-slate-800 mb-2">Ingredients:</h4>
                                <ul className="list-disc list-inside text-slate-600 mb-4">
                                    {formula.ingredients.map((ing, j) => (
                                        <li key={j}>{ing.name} ({ing.percentage}%)</li>
                                    ))}
                                </ul>
                                <Button onClick={() => handleGoToGenerator(formula.ingredients)} className="w-full bg-[var(--suttain-violet)] hover:bg-[var(--suttain-violet)]/90 text-white">
                                    <TestTube className="w-4 h-4 mr-2" />
                                    Customize in Formula Generator
                                </Button>
                            </CardContent>
                         </Card>
                    ))
                ) : (
                    <Card className="bg-white/60">
                        <CardContent className="text-center py-12">
                             <Beaker className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-700">No DIY Alternatives Available</h3>
                            <p className="text-slate-500">We don't have a DIY alternative for this product category yet.</p>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}