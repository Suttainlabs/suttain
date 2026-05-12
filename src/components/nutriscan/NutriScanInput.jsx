import React, { useState, useRef } from 'react';
import { Camera, Search, Loader2, Upload, Utensils, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const EXAMPLE_FOODS = [
    'Grilled salmon with broccoli',
    'Greek yogurt with blueberries',
    'White rice with chicken breast',
    'Avocado toast on whole wheat',
    'Canned tuna in sunflower oil',
    'Strawberry Pop-Tarts',
    'McDonald\'s Big Mac',
    'Spinach salad with almonds',
];

export default function NutriScanInput({ onResult }) {
    const [mode, setMode] = useState('text'); // 'text' | 'image'
    const [foodInput, setFoodInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileRef = useRef(null);

    const analyzeFood = async (foodDescription, imageUrl = null) => {
        setIsAnalyzing(true);
        try {
            const prompt = imageUrl
                ? `You are a world-class food intelligence engine built by Suttain.

Look at the image provided and identify EXACTLY what food items are visible. Do NOT guess or add foods that are not clearly visible.
Only analyze what you can actually see in the image.

Return a comprehensive molecular food analysis as JSON for only the food(s) visible in the image.
For informational purposes only — not medical advice.`
                : `You are a world-class food intelligence engine built by Suttain, a professional chemistry company.

Analyze ONLY this specific food: "${foodDescription}"
Do not substitute, guess, or generalize. Analyze exactly what was described.

Return a comprehensive molecular food analysis as JSON. Be accurate and specific based on real nutritional science.
For informational purposes only — not medical advice.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                ...(imageUrl ? { file_urls: [imageUrl] } : {}),
                response_json_schema: {
                    type: 'object',
                    properties: {
                        food_name: { type: 'string' },
                        portion_estimate: { type: 'string' },
                        confidence: { type: 'number' },
                        // Basic macros
                        calories: { type: 'number' },
                        protein_g: { type: 'number' },
                        carbs_g: { type: 'number' },
                        fat_g: { type: 'number' },
                        fiber_g: { type: 'number' },
                        // Molecular Food Fingerprint
                        molecular_fingerprint: {
                            type: 'object',
                            properties: {
                                fatty_acids: {
                                    type: 'object',
                                    properties: {
                                        omega3_mg: { type: 'number' },
                                        omega6_mg: { type: 'number' },
                                        saturated_g: { type: 'number' },
                                        trans_g: { type: 'number' }
                                    }
                                },
                                carb_breakdown: {
                                    type: 'object',
                                    properties: {
                                        resistant_starch_g: { type: 'number' },
                                        soluble_fiber_g: { type: 'number' },
                                        fructose_g: { type: 'number' },
                                        glucose_g: { type: 'number' }
                                    }
                                },
                                amino_acid_score: { type: 'number' },
                                anti_nutrients: { type: 'array', items: { type: 'string' } },
                                bioavailability_score: { type: 'number' }
                            }
                        },
                        // Chemical Threat
                        chemical_threat_score: { type: 'number' },
                        chemical_threat_level: { type: 'string', enum: ['safe', 'low', 'moderate', 'high'] },
                        chemical_flags: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    category: { type: 'string' },
                                    severity: { type: 'string', enum: ['low', 'moderate', 'high'] },
                                    detail: { type: 'string' }
                                }
                            }
                        },
                        nova_score: { type: 'number' },
                        nova_label: { type: 'string' },
                        // Body System Impact
                        body_systems: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    system: { type: 'string' },
                                    icon: { type: 'string' },
                                    status: { type: 'string', enum: ['supported', 'neutral', 'stressed'] },
                                    reason: { type: 'string' }
                                }
                            }
                        },
                        // Meal Coach
                        coach_insights: { type: 'array', items: { type: 'string' } },
                        // Planetary
                        planetary_impact: {
                            type: 'object',
                            properties: {
                                carbon_footprint_kg: { type: 'number' },
                                water_usage_liters: { type: 'number' },
                                overall_score: { type: 'number' },
                                grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
                                notes: { type: 'string' }
                            }
                        },
                        // Key micronutrients
                        key_nutrients: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    amount: { type: 'string' },
                                    daily_pct: { type: 'number' },
                                    status: { type: 'string', enum: ['excellent', 'good', 'low', 'very_low'] }
                                }
                            }
                        },
                        overall_summary: { type: 'string' }
                    }
                }
            });

            onResult({ ...result, food_input: foodDescription });
        } catch (err) {
            console.error('Food analysis failed:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (mode === 'text' && foodInput.trim()) {
            await analyzeFood(foodInput.trim());
        } else if (mode === 'image' && imageFile) {
            // Upload image then analyze
            try {
                setIsAnalyzing(true);
                const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
                await analyzeFood('food from uploaded image', file_url);
            } catch (err) {
                console.error('Image upload failed:', err);
                setIsAnalyzing(false);
            }
        }
    };

    return (
        <div className="space-y-5">
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setMode('text')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${mode === 'text' ? 'border-[#02988C] bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-200'}`}
                >
                    <Search className={`w-5 h-5 mb-2 ${mode === 'text' ? 'text-[#02988C]' : 'text-slate-400'}`} />
                    <p className="font-semibold text-sm text-slate-800">Describe Food</p>
                    <p className="text-xs text-slate-500 mt-0.5">Type any food, meal, or ingredient</p>
                </button>
                <button
                    onClick={() => setMode('image')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${mode === 'image' ? 'border-[#02988C] bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-200'}`}
                >
                    <Camera className={`w-5 h-5 mb-2 ${mode === 'image' ? 'text-[#02988C]' : 'text-slate-400'}`} />
                    <p className="font-semibold text-sm text-slate-800">Upload Photo</p>
                    <p className="text-xs text-slate-500 mt-0.5">Photo of your food or label</p>
                </button>
            </div>

            {/* Input Area */}
            {mode === 'text' ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">What did you eat?</label>
                    <Textarea
                        value={foodInput}
                        onChange={e => setFoodInput(e.target.value)}
                        placeholder="E.g. grilled salmon with roasted broccoli and brown rice, or 'Cheerios cereal with whole milk'..."
                        className="resize-none h-24 text-sm border-slate-200"
                        onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
                    />
                    {/* Quick examples */}
                    <div>
                        <p className="text-xs text-slate-400 mb-2">Try an example:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {EXAMPLE_FOODS.slice(0, 5).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFoodInput(f)}
                                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-teal-100 hover:text-teal-700 rounded-full transition-colors text-slate-600"
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Upload a food photo</label>
                    {imagePreview ? (
                        <div className="relative">
                            <img src={imagePreview} alt="Food preview" className="w-full h-48 object-cover rounded-xl" />
                            <button
                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full px-2 py-0.5 text-xs"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors"
                        >
                            <Upload className="w-8 h-8 text-slate-400" />
                            <p className="text-sm text-slate-500">Tap to upload food photo</p>
                            <p className="text-xs text-slate-400">Works with meals, labels, packages</p>
                        </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                </div>
            )}

            {/* Analyze Button */}
            <Button
                onClick={handleSubmit}
                disabled={isAnalyzing || (mode === 'text' ? !foodInput.trim() : !imageFile)}
                className="w-full h-12 bg-gradient-to-r from-[#02988C] to-[#09D2FF] hover:opacity-90 text-white font-bold rounded-xl text-base shadow-lg"
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing molecular profile...
                    </>
                ) : (
                    <>Run FoodAnalysis</>

                )}
            </Button>

            {/* What you get */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">What Analysis Reveals</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        'Molecular Food Fingerprint™',
                        'Chemical Threat Score',
                        'Body System Impact Map',
                        'Molecular Meal Coach™',
                        'Planetary Impact Score™',
                        'NOVA Processing Level',
                    ].map(text => (
                        <div key={text} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300">{text}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3">Analysis data is for informational purposes only. Not medical advice.</p>
            </div>
        </div>
    );
}