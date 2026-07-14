import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, History, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NutriScanInput from './NutriScanInput';
import NutriScanResults from './NutriScanResults';
import NutriScanDashboard from './NutriScanDashboard';
import NutriScanHistory from './NutriScanHistory';
import UsdaNutritionPanel from './UsdaNutritionPanel';
import { base44 } from '@/api/base44Client';

export default function NutriScanApp({ user, embedded = false }) {
    const [activeTab, setActiveTab] = useState('scan');
    const [result, setResult] = useState(null);
    const [dailyLog, setDailyLog] = useState([]);

    const saveToHistory = async (data) => {
        if (!user) return;
        try {
            await base44.entities.FoodScanHistory.create({
                food_name: data.food_name,
                food_input: data.food_input,
                calories: data.calories,
                protein_g: data.protein_g,
                carbs_g: data.carbs_g,
                fat_g: data.fat_g,
                fiber_g: data.fiber_g,
                nova_score: data.nova_score,
                nova_label: data.nova_label,
                chemical_threat_level: data.chemical_threat_level,
                chemical_threat_score: data.chemical_threat_score,
                overall_summary: data.overall_summary,
                portion_estimate: data.portion_estimate,
                scanned_at: new Date().toISOString(),
            });
        } catch (e) {
            console.error('Failed to save food history:', e);
        }
    };

    const handleResult = (data) => {
        setResult(data);
        saveToHistory(data);
    };

    const handleAddToDay = (data) => {
        setDailyLog(prev => [...prev, { ...data, addedAt: new Date().toISOString() }]);
        setResult(null);
        setActiveTab('dashboard');
    };

    const handleNewScan = () => {
        setResult(null);
    };

    return (
        <div className={embedded ? "bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50" : "min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50"}>
            {/* Hero Header — hidden when embedded in SuttainScan */}
            {!embedded && (
                <div className="bg-gradient-to-r from-[#02988C] via-[#017a70] to-[#09D2FF] text-white py-6 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-3 mb-1">
                            <div>
                                <h1 className="text-2xl font-bold leading-tight">Food Analysis</h1>
                                <p className="text-teal-100 text-xs">Chemical-Aware Food Intelligence Engine</p>
                            </div>
                        </div>
                        <p className="text-teal-100 text-sm mt-2 leading-relaxed">
                            Not just calories — your food's full molecular profile, chemical threats, and body system impact.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full bg-white border border-slate-200 rounded-xl mb-6 p-1">
                        <TabsTrigger value="scan" className="flex-1 data-[state=active]:bg-[#02988C] data-[state=active]:text-white rounded-lg text-sm">
                            <Camera className="w-4 h-4 mr-1.5" /> Analyze Food
                        </TabsTrigger>
                        <TabsTrigger value="dashboard" className="flex-1 data-[state=active]:bg-[#02988C] data-[state=active]:text-white rounded-lg text-sm">
                            <Zap className="w-4 h-4 mr-1.5" /> Today's Report
                            {dailyLog.length > 0 && (
                                <span className="ml-1.5 bg-white/30 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{dailyLog.length}</span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex-1 data-[state=active]:bg-[#02988C] data-[state=active]:text-white rounded-lg text-sm">
                            <History className="w-4 h-4 mr-1.5" /> History
                        </TabsTrigger>
                        <TabsTrigger value="usda" className="flex-1 data-[state=active]:bg-[#02988C] data-[state=active]:text-white rounded-lg text-sm">
                            <Search className="w-4 h-4 mr-1.5" /> USDA Lookup
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scan">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <NutriScanInput onResult={handleResult} />
                                </motion.div>
                            ) : (
                                <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <NutriScanResults result={result} onAddToDay={handleAddToDay} onNewScan={handleNewScan} user={user} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    <TabsContent value="dashboard">
                        <NutriScanDashboard dailyLog={dailyLog} user={user} onGoScan={() => setActiveTab('scan')} />
                    </TabsContent>

                    <TabsContent value="history">
                        <NutriScanHistory user={user} />
                    </TabsContent>

                    <TabsContent value="usda">
                        <UsdaNutritionPanel />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}