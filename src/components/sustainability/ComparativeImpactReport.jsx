import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, Minus, Leaf, AlertTriangle, Lightbulb, Download } from 'lucide-react';
import { motion } from 'framer-motion';

// Industry average benchmarks per category (0-100 scale)
const INDUSTRY_BENCHMARKS = {
  all_purpose_cleaner: {
    biodegradability: 62, renewable_content: 45, carbon_footprint: 50, water_efficiency: 55, toxicity_safety: 58, packaging_score: 48,
  },
  facial_moisturizer: {
    biodegradability: 70, renewable_content: 65, carbon_footprint: 60, water_efficiency: 50, toxicity_safety: 72, packaging_score: 55,
  },
  hand_soap: {
    biodegradability: 68, renewable_content: 55, carbon_footprint: 52, water_efficiency: 60, toxicity_safety: 65, packaging_score: 58,
  },
  household_cleaner: {
    biodegradability: 55, renewable_content: 40, carbon_footprint: 48, water_efficiency: 52, toxicity_safety: 50, packaging_score: 45,
  },
  skincare_product: {
    biodegradability: 72, renewable_content: 68, carbon_footprint: 62, water_efficiency: 55, toxicity_safety: 75, packaging_score: 60,
  },
  hair_care: {
    biodegradability: 65, renewable_content: 58, carbon_footprint: 55, water_efficiency: 62, toxicity_safety: 68, packaging_score: 52,
  },
  body_wash: {
    biodegradability: 67, renewable_content: 56, carbon_footprint: 54, water_efficiency: 65, toxicity_safety: 70, packaging_score: 57,
  },
};

const DEFAULT_BENCHMARK = {
  biodegradability: 63, renewable_content: 55, carbon_footprint: 54, water_efficiency: 57, toxicity_safety: 64, packaging_score: 52,
};

const METRIC_LABELS = {
  biodegradability: 'Biodegradability',
  renewable_content: 'Renewable Content',
  carbon_footprint: 'Carbon Footprint',
  water_efficiency: 'Water Efficiency',
  toxicity_safety: 'Safety/Toxicity',
  packaging_score: 'Packaging',
};

// Derive eco scores from formula ingredients heuristically
function deriveScores(formula) {
  const ingredients = formula?.ingredients || [];
  const count = ingredients.length || 1;

  const naturalKeywords = ['water', 'aloe', 'coconut', 'jojoba', 'shea', 'vitamin', 'glycerin', 'honey', 'lavender', 'tea tree', 'argan', 'olive', 'citric'];
  const syntheticKeywords = ['sodium lauryl', 'parabens', 'phthalate', 'formaldehyde', 'triclosan', 'bha', 'bht', 'petrolatum', 'mineral oil'];

  let naturalCount = 0;
  let syntheticCount = 0;

  ingredients.forEach(ing => {
    const name = (ing.chemical_name || '').toLowerCase();
    if (naturalKeywords.some(k => name.includes(k))) naturalCount++;
    if (syntheticKeywords.some(k => name.includes(k))) syntheticCount++;
  });

  const naturalRatio = naturalCount / count;
  const syntheticPenalty = Math.min(syntheticCount / count, 1);

  return {
    biodegradability: Math.round(40 + naturalRatio * 50 - syntheticPenalty * 20),
    renewable_content: Math.round(35 + naturalRatio * 55 - syntheticPenalty * 15),
    carbon_footprint: Math.round(45 + naturalRatio * 40 - syntheticPenalty * 20),
    water_efficiency: Math.round(50 + naturalRatio * 30 - syntheticPenalty * 10),
    toxicity_safety: Math.round(40 + naturalRatio * 45 - syntheticPenalty * 30),
    packaging_score: 55, // neutral default since we don't have packaging data
  };
}

function DeltaBadge({ delta }) {
  if (delta > 5) return <Badge className="bg-green-100 text-green-700 gap-1"><TrendingUp className="w-3 h-3" />+{delta}</Badge>;
  if (delta < -5) return <Badge className="bg-red-100 text-red-700 gap-1"><TrendingDown className="w-3 h-3" />{delta}</Badge>;
  return <Badge className="bg-slate-100 text-slate-600 gap-1"><Minus className="w-3 h-3" />{delta}</Badge>;
}

export default function ComparativeImpactReport() {
  const [selectedFormulaId, setSelectedFormulaId] = useState('');
  const [advice, setAdvice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: formulas = [], isLoading: isLoadingFormulas } = useQuery({
    queryKey: ['formulas-for-report'],
    queryFn: () => base44.entities.Formula.list('-created_date', 50),
  });

  const selectedFormula = useMemo(() => formulas.find(f => f.id === selectedFormulaId), [formulas, selectedFormulaId]);

  const benchmark = useMemo(() => {
    const key = selectedFormula?.product_type?.toLowerCase().replace(/ /g, '_');
    return INDUSTRY_BENCHMARKS[key] || DEFAULT_BENCHMARK;
  }, [selectedFormula]);

  const userScores = useMemo(() => selectedFormula ? deriveScores(selectedFormula) : null, [selectedFormula]);

  const chartData = useMemo(() => {
    if (!userScores) return [];
    return Object.keys(METRIC_LABELS).map(key => ({
      metric: METRIC_LABELS[key],
      'Your Formula': userScores[key],
      'Industry Avg': benchmark[key],
    }));
  }, [userScores, benchmark]);

  const deltas = useMemo(() => {
    if (!userScores) return {};
    return Object.keys(METRIC_LABELS).reduce((acc, key) => {
      acc[key] = userScores[key] - benchmark[key];
      return acc;
    }, {});
  }, [userScores, benchmark]);

  const lowPerformingIngredients = useMemo(() => {
    if (!selectedFormula) return [];
    const syntheticKeywords = ['sodium lauryl', 'parabens', 'phthalate', 'formaldehyde', 'triclosan', 'bha', 'bht', 'petrolatum', 'mineral oil', 'sodium laureth'];
    return (selectedFormula.ingredients || []).filter(ing => {
      const name = (ing.chemical_name || '').toLowerCase();
      return syntheticKeywords.some(k => name.includes(k));
    });
  }, [selectedFormula]);

  const generateAdvice = async () => {
    if (!selectedFormula || !userScores) return;
    setIsGenerating(true);
    setAdvice(null);

    const weakAreas = Object.entries(deltas)
      .filter(([, d]) => d < -5)
      .map(([k]) => METRIC_LABELS[k]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a sustainability expert. A user has a formula named "${selectedFormula.name}" (type: ${selectedFormula.product_type}) with these eco-scores vs industry averages:

${Object.keys(METRIC_LABELS).map(k => `- ${METRIC_LABELS[k]}: ${userScores[k]}/100 (industry avg: ${benchmark[k]})`).join('\n')}

Weak areas below industry average: ${weakAreas.join(', ') || 'None — performing above average!'}

Low-performing ingredients identified: ${lowPerformingIngredients.map(i => i.chemical_name).join(', ') || 'None flagged'}

Ingredients in formula: ${(selectedFormula.ingredients || []).map(i => `${i.chemical_name} (${i.percentage}%)`).join(', ')}

Provide 4-6 concise, specific, actionable recommendations to improve this formula's eco-score. Focus on:
1. Swapping flagged ingredients for greener alternatives
2. Addressing the weakest scoring areas
3. Certifications they could pursue
Keep each recommendation to 1-2 sentences.`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_summary: { type: 'string' },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  detail: { type: 'string' },
                  impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                  category: { type: 'string' },
                }
              }
            },
            certifications: { type: 'array', items: { type: 'string' } },
          }
        }
      });
      setAdvice(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const impactColor = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-blue-100 text-blue-700' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
          <Leaf className="w-4 h-4" /> Sustainability Benchmarking
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Comparative Impact Report</h1>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto">Compare your formula's eco-scores against industry averages and get AI-powered advice to improve.</p>
      </div>

      {/* Formula Selector */}
      <Card>
        <CardContent className="p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select a Formula to Analyze</label>
          {isLoadingFormulas ? (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading formulas…</div>
          ) : (
            <Select value={selectedFormulaId} onValueChange={setSelectedFormulaId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a formula…" />
              </SelectTrigger>
              <SelectContent>
                {formulas.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name} — {f.product_type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {formulas.length === 0 && !isLoadingFormulas && (
            <p className="text-sm text-slate-400 mt-2">No formulas found. Create a formula first using the Formula Generator.</p>
          )}
        </CardContent>
      </Card>

      {selectedFormula && userScores && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="w-4 h-4 text-teal-600" />
                Eco-Score Radar — <span className="font-normal text-slate-500">{selectedFormula.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#475569' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Radar name="Your Formula" dataKey="Your Formula" stroke="#02988C" fill="#02988C" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Industry Avg" dataKey="Industry Avg" stroke="#9531F5" fill="#9531F5" fillOpacity={0.15} strokeWidth={2} strokeDasharray="5 3" />
                  <Legend />
                  <Tooltip formatter={(val) => [`${val}/100`]} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Breakdown vs Industry Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Metric', 'Your Score', 'Industry Avg', 'Delta'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(METRIC_LABELS).map(([key, label]) => (
                      <tr key={key} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{label}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 rounded-full h-2">
                              <div className="h-2 rounded-full bg-teal-500" style={{ width: `${userScores[key]}%` }} />
                            </div>
                            <span className="font-mono font-bold text-teal-700">{userScores[key]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{benchmark[key]}</td>
                        <td className="px-4 py-3"><DeltaBadge delta={deltas[key]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Flagged Ingredients */}
          {lowPerformingIngredients.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-5">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Low-Performing Ingredients Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {lowPerformingIngredients.map((ing, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full">
                      {ing.chemical_name} ({ing.percentage}%)
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Advice */}
          <div className="flex justify-center">
            <Button
              onClick={generateAdvice}
              disabled={isGenerating}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold px-8 py-2 rounded-xl gap-2"
            >
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating AI Advice…</> : <><Lightbulb className="w-4 h-4" /> Generate Actionable Advice</>}
            </Button>
          </div>

          {/* AI Advice */}
          {advice && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="border-teal-200 bg-teal-50">
                <CardContent className="p-5">
                  <p className="text-teal-800 text-sm leading-relaxed font-medium">{advice.overall_summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advice.recommendations?.map((rec, i) => (
                  <Card key={i} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-bold text-slate-900 text-sm">{rec.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${impactColor[rec.impact] || impactColor.low}`}>
                              {rec.impact?.toUpperCase()} IMPACT
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs leading-relaxed">{rec.detail}</p>
                          {rec.category && <p className="text-teal-600 text-[10px] font-semibold mt-1">{rec.category}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {advice.certifications?.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-slate-900 mb-2 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-600" /> Certifications You Could Pursue
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {advice.certifications.map((cert, i) => (
                        <Badge key={i} className="bg-violet-100 text-violet-700">{cert}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}