import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingCart, Plus, Trash2, Camera, Upload, Loader2, Sparkles,
    CheckCircle, AlertTriangle, Leaf, HeartPulse, BarChart2, X,
    ScanLine, Package
} from 'lucide-react';
import { lookupBarcode } from '@/functions/lookupBarcode';
import { scanBarcodeFromImage } from '@/functions/scanBarcodeFromImage';

// ── Helpers ────────────────────────────────────────────────────────────────

const RATING_CONFIG = {
    Excellent: { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    Good:      { color: 'text-teal-700',    bg: 'bg-teal-100',    border: 'border-teal-200' },
    Fair:      { color: 'text-amber-700',   bg: 'bg-amber-100',   border: 'border-amber-200' },
    Poor:      { color: 'text-red-700',     bg: 'bg-red-100',     border: 'border-red-200' },
};

const RISK_BADGE = {
    low:     { label: 'Low Risk',  color: 'bg-emerald-100 text-emerald-800' },
    medium:  { label: 'Med Risk',  color: 'bg-amber-100 text-amber-800' },
    high:    { label: 'High Risk', color: 'bg-red-100 text-red-800' },
    unknown: { label: 'Unknown',   color: 'bg-slate-100 text-slate-600' },
};

function toNum(v) { return typeof v === 'number' ? v : 0; }

// ── Product Card ───────────────────────────────────────────────────────────

function ProductCard({ item, onRemove, index }) {

    const riskKey = item.product?.riskAssessment?.overallRisk ?? 'unknown';
    const cfg = RISK_BADGE[riskKey] ?? RISK_BADGE.unknown;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm"
        >
            {item.product?.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 object-contain rounded-lg border border-slate-100 flex-shrink-0" />
            ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-slate-400" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                {item.loading ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        <span>Looking up barcode...</span>
                    </div>
                ) : item.error ? (
                    <p className="text-sm text-red-600">{item.error}</p>
                ) : (
                    <>
                        <p className="font-semibold text-sm text-slate-800 truncate">{item.product?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{item.product?.brand}</p>
                        {item.healthRating && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                                <Badge className={`text-[10px] px-1.5 py-0 ${RATING_CONFIG[item.healthRating]?.bg ?? 'bg-slate-100'} ${RATING_CONFIG[item.healthRating]?.color ?? 'text-slate-700'} border-0`}>
                                    ❤️ {item.healthRating}
                                </Badge>
                                <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color} border-0`}>
                                    🛡 {cfg.label}
                                </Badge>
                            </div>
                        )}
                    </>
                )}
            </div>
            <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

// ── Consolidated Dashboard ─────────────────────────────────────────────────

function ConsolidatedDashboard({ items }) {
    const completed = items.filter(i => i.product && !i.loading && !i.error);
    if (completed.length === 0) return null;

    // Aggregate scores
    const avgSafety = Math.round(
        completed.reduce((acc, i) => {
            const ings = i.product?.ingredients ?? [];
            if (!ings.length) return acc;
            const s = ings.reduce((a, g) => a + toNum(g.safety), 0) / ings.length;
            return acc + s;
        }, 0) / completed.length
    );

    const avgSustainability = Math.round(
        completed.reduce((acc, i) => {
            const ings = i.product?.ingredients ?? [];
            if (!ings.length) return acc;
            const s = ings.reduce((a, g) => a + toNum(g.sustainability), 0) / ings.length;
            return acc + s;
        }, 0) / completed.length
    );

    const totalHazards = completed.reduce((a, i) => a + (i.product?.hazards?.length ?? 0), 0);
    const highRiskCount = completed.filter(i => i.product?.riskAssessment?.overallRisk === 'high').length;

    const ratingCounts = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 };
    completed.forEach(i => { if (i.healthRating && ratingCounts[i.healthRating] !== undefined) ratingCounts[i.healthRating]++; });

    const topWarnings = completed
        .flatMap(i => (i.healthWarnings ?? []).map(w => ({ ...w, product: i.product?.name })))
        .filter(w => w.severity === 'high')
        .slice(0, 5);

    const topAlternatives = completed
        .flatMap(i => (i.healthAlternatives ?? []).map(a => ({ ...a, from: i.product?.name })))
        .slice(0, 4);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Haul Dashboard</h2>
                    <p className="text-sm text-slate-500">{completed.length} products analyzed</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { icon: ShoppingCart, label: 'Products', value: completed.length, color: 'bg-teal-500' },
                    { icon: AlertTriangle, label: 'Total Hazards', value: totalHazards, color: 'bg-red-500' },
                    { icon: HeartPulse, label: 'High Risk Items', value: highRiskCount, color: 'bg-amber-500' },
                    { icon: Leaf, label: 'Avg. Eco Score', value: `${avgSustainability}%`, color: 'bg-emerald-500' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <Card key={label} className="bg-white shadow-sm border-slate-200">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">{value}</p>
                                <p className="text-xs text-slate-500">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Health Rating Distribution */}
            <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><HeartPulse className="w-4 h-4 text-rose-500" /> Health Rating Breakdown</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex gap-3 flex-wrap">
                        {Object.entries(ratingCounts).map(([rating, count]) => count > 0 && (
                            <div key={rating} className={`px-3 py-2 rounded-lg border ${RATING_CONFIG[rating]?.bg} ${RATING_CONFIG[rating]?.border}`}>
                                <p className={`text-lg font-bold ${RATING_CONFIG[rating]?.color}`}>{count}</p>
                                <p className={`text-xs ${RATING_CONFIG[rating]?.color}`}>{rating}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* High Priority Warnings */}
            {topWarnings.length > 0 && (
                <Card className="bg-red-50 border-red-200 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> High Priority Warnings</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {topWarnings.map((w, i) => (
                            <div key={i} className="p-2 bg-white rounded-lg border border-red-200">
                                <p className="text-sm font-semibold text-red-800">{w.warning}</p>
                                <p className="text-xs text-red-600">{w.product} &bull; {w.affected_groups}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Healthier Alternatives */}
            {topAlternatives.length > 0 && (
                <Card className="bg-teal-50 border-teal-200 shadow-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-base text-teal-800 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Suggested Healthier Swaps</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {topAlternatives.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <Leaf className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-teal-800">{a.name}</span>
                                    <span className="text-teal-600">: {a.benefit}</span>
                                    <span className="text-teal-400 text-xs ml-1">(swap for {a.from})</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

let idCounter = 0;
const newId = () => `item-${++idCounter}`;

export default function BulkScanDashboard({ user }) {
    const [items, setItems] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');
    const imageInputRef = useRef(null);

    const updateItem = (id, patch) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

    const fetchProduct = async (barcode) => {
        const id = newId();
        setItems(prev => [...prev, { id, loading: true, product: null, error: null, healthRating: null, healthWarnings: [], healthAlternatives: [] }]);
        try {
            const res = await lookupBarcode({ barcode });
            const product = res?.data ?? res;
            if (!product || !product.name) throw new Error('Product not found');
            updateItem(id, { loading: false, product });
        } catch (e) {
            updateItem(id, { loading: false, error: `Barcode ${barcode}: ${e.message}` });
        }
        return id;
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        const barcode = barcodeInput.trim();
        if (!barcode) return;
        setBarcodeInput('');
        await fetchProduct(barcode);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        e.target.value = '';
        for (const file of files) {
            const id = newId();
            setItems(prev => [...prev, { id, loading: true, product: null, error: null, healthRating: null, healthWarnings: [], healthAlternatives: [] }]);
            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                const res = await scanBarcodeFromImage({ image_url: file_url });
                const barcode = res?.data?.barcode ?? res?.barcode;
                if (!barcode) throw new Error('No barcode detected in image');
                const lookup = await lookupBarcode({ barcode });
                const product = lookup?.data ?? lookup;
                if (!product || !product.name) throw new Error('Product not found for barcode ' + barcode);
                updateItem(id, { loading: false, product });
            } catch (e) {
                updateItem(id, { loading: false, error: `Image scan failed: ${e.message}` });
            }
        }
    };

    const analyzeAll = async () => {
        const pending = items.filter(i => i.product && !i.loading && !i.error && !i.healthRating);
        if (pending.length === 0) return;
        setIsAnalyzing(true);
        for (const item of pending) {
            const p = item.product;
            const ingredients = p.ingredients?.map(i => i.name).join(', ') || 'unknown';
            try {
                const result = await base44.functions.invoke('runConsumerLLM', {
                    operation: 'bulkScanHealth',
                    data: { product: p }
                });
                updateItem(item.id, {
                    healthRating: result.overall_health_rating,
                    healthWarnings: result.health_warnings ?? [],
                    healthAlternatives: result.healthier_alternatives ?? []
                });
            } catch (err) {
                console.error('Health analysis failed for', p.name, err);
            }
        }
        setIsAnalyzing(false);
    };

    const completedItems = items.filter(i => i.product && !i.loading && !i.error);
    const unanalyzed = completedItems.filter(i => !i.healthRating);
    const canAnalyze = unanalyzed.length > 0 && !isAnalyzing;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <ScanLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Bulk Scan</h1>
                        <p className="text-sm text-slate-500">Scan your grocery haul and get a consolidated health report</p>
                    </div>
                </div>

                {/* Add Products */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" /> Add Products</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {/* Manual barcode */}
                        <form onSubmit={handleManualAdd} className="flex gap-2">
                            <input
                                type="text"
                                value={barcodeInput}
                                onChange={e => setBarcodeInput(e.target.value)}
                                placeholder="Enter barcode number..."
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                            <Button type="submit" size="sm" disabled={!barcodeInput.trim()}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </form>

                        {/* Image upload */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => imageInputRef.current?.click()}
                            >
                                <Camera className="w-4 h-4 mr-2" /> Upload Photos
                            </Button>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <p className="text-xs text-slate-400 text-center">Upload one or more photos of product barcodes</p>
                    </CardContent>
                </Card>

                {/* Product List */}
                {items.length > 0 && (
                    <Card className="bg-white shadow-sm border-slate-200">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" /> Your Haul ({items.length})
                            </CardTitle>
                            {items.length > 0 && (
                                <button onClick={() => setItems([])} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Clear all
                                </button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <AnimatePresence>
                                {items.map((item, idx) => (
                                    <ProductCard key={item.id} item={item} onRemove={removeItem} index={idx} />
                                ))}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                )}

                {/* Analyze Button */}
                {completedItems.length > 0 && (
                    <Button
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                        size="lg"
                        onClick={analyzeAll}
                        disabled={!canAnalyze}
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing {unanalyzed.length} product{unanalyzed.length !== 1 ? 's' : ''}...</>
                        ) : canAnalyze ? (
                            <><Sparkles className="w-4 h-4 mr-2" /> Analyze {unanalyzed.length} Product{unanalyzed.length !== 1 ? 's' : ''}</>
                        ) : (
                            <><CheckCircle className="w-4 h-4 mr-2" /> All Products Analyzed</>
                        )}
                    </Button>
                )}

                {/* Consolidated Dashboard */}
                <ConsolidatedDashboard items={items} />
            </div>
        </div>
    );
}