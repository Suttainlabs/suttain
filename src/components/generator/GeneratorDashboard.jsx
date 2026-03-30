import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  User, Briefcase, PlusCircle, FolderOpen, ArrowRight, CheckCircle,
  FlaskConical, FileText, BarChart2, Clock
} from 'lucide-react';
import LoadFormulaModal from './LoadFormulaModal';
import { Wand2 } from 'lucide-react';

const ModeCard = ({ icon: Icon, title, description, features, isActive, onSelect, colorClass }) => (
    <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
            isActive ? `${colorClass.border} shadow-xl` : 'border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
        onClick={onSelect}
    >
        <CardHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClass.bg}`}>
                    <Icon className={`w-7 h-7 ${colorClass.text}`} />
                </div>
                <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
                    <CardDescription className="text-slate-600 text-sm mt-1">
                        {description}
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="pt-0">
            <ul className="space-y-2.5">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass.text}`} />
                        <span className="text-slate-700">{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
    </motion.div>
);

const ActionCard = ({ icon: Icon, title, description, onClick, gradient }) => (
    <motion.button
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`w-full p-6 rounded-2xl ${gradient} text-left shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group`}
    >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-lg font-bold mb-1 text-white">{title}</h3>
                <p className="text-sm text-white/90">{description}</p>
            </div>
        </div>
        <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </motion.button>
);

const RecentProjectCard = ({ formula, onClick }) => {
    const getIconByType = (type) => {
        if (type?.includes('cleaner') || type?.includes('cleaning')) return FlaskConical;
        if (type?.includes('moisturizer') || type?.includes('skincare')) return FileText;
        return BarChart2;
    };

    const Icon = getIconByType(formula.product_type);
    const isBusinessMode = formula.is_business_mode;

    return (
        <motion.div
            whileHover={{ y: -3, shadow: 'lg' }}
            className="cursor-pointer"
            onClick={() => onClick(formula)}
        >
            <Card className="border-2 border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isBusinessMode ? 'bg-violet-100' : 'bg-teal-100'
                            }`}>
                                <Icon className={`w-4 h-4 ${isBusinessMode ? 'text-violet-600' : 'text-teal-600'}`} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 line-clamp-1">
                                    {formula.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5 capitalize">
                                    {formula.product_type?.replace(/_/g, ' ')}
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-xs ${
                            formula.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                            {formula.status === 'completed' ? 'Completed' : 'Draft'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(formula.updated_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default function GeneratorDashboard({ onModeSelect, onFormulaSelect }) {
    const [selectedMode, setSelectedMode] = useState('individual');
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [recentFormulas, setRecentFormulas] = useState([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const formulas = await base44.entities.Formula.list('-updated_date', 3);
                setRecentFormulas(formulas);
            } catch (error) {
                console.error("Failed to fetch recent formulas:", error);
            }
        };
        fetchRecent();
    }, []);

    const handleStart = () => {
        onModeSelect(selectedMode);
    };

    const handleSelectAndLoad = (formula) => {
        setShowLoadModal(false);
        onFormulaSelect(formula);
    };

    const modeDisplayName = selectedMode === 'individual' ? 'Individual' : 'Business';
    const actionGradient = selectedMode === 'individual' 
        ? 'bg-gradient-to-br from-teal-500 to-cyan-600' 
        : 'bg-gradient-to-br from-violet-500 to-purple-600';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative watermarks */}
            <div className="absolute top-10 left-0 w-52 h-52 opacity-5 pointer-events-none hidden lg:block">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/82e0d0bab_adding-essential-oil-in-soap-base-2026-01-07-07-10-18-utc.jpg"
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-20 right-0 w-60 h-60 opacity-5 pointer-events-none hidden lg:block">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/ad03a94a9_blank-cosmetic-skincare-makeup-containers-2026-01-07-00-38-06-utc.jpg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                {/* Header */}
                <div className="text-center space-y-3">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900"
                    >
                        Formula Generator
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        Choose your path and start creating professional-grade formulas
                    </motion.p>
                </div>

                {/* Mode Selection */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <ModeCard
                        icon={User}
                        title="Individual Creator"
                        description="For personal projects and DIY enthusiasts"
                        features={[
                            "Simple, easy-to-find ingredient names",
                            "Beginner-friendly step-by-step instructions",
                            "Small batch sizes (100g - 500g)",
                            "Home kitchen equipment only",
                            "Basic safety tips & usage guidance"
                        ]}
                        isActive={selectedMode === 'individual'}
                        onSelect={() => setSelectedMode('individual')}
                        colorClass={{
                            border: 'border-teal-400',
                            bg: 'bg-teal-100',
                            text: 'text-teal-600'
                        }}
                    />
                    <ModeCard
                        icon={Briefcase}
                        title="Business Formulation"
                        description="For startups, brands, and commercial production"
                        features={[
                            "INCI nomenclature & CAS numbers",
                            "Multi-region regulatory compliance (FDA, EU, ASEAN)",
                            "Scalable batch calculations (kg to tons)",
                            "Cost analysis & supplier sourcing data",
                            "GMP documentation & stability testing protocols",
                            "Certification guidance (Organic, Vegan, Cruelty-free)"
                        ]}
                        isActive={selectedMode === 'business'}
                        onSelect={() => setSelectedMode('business')}
                        colorClass={{
                            border: 'border-violet-400',
                            bg: 'bg-violet-100',
                            text: 'text-violet-600'
                        }}
                    />
                </motion.div>

                {/* Smart Start - Beginner CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <button
                        onClick={() => onModeSelect('smart_start')}
                        className="w-full p-6 rounded-2xl bg-slate-800 text-left shadow-lg hover:shadow-xl hover:bg-slate-900 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Wand2 className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-xl font-bold text-white">New Here? Let Us Guide You</h3>
                                    <Badge className="bg-white/20 text-white border-0 text-xs">Recommended</Badge>
                                </div>
                                <p className="text-white/80 text-sm">
                                    No chemistry knowledge needed. Answer a few simple questions and we'll create the perfect formula for you.
                                </p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                    </button>
                </motion.div>

                {/* Action Cards */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <ActionCard
                        icon={PlusCircle}
                        title="Create New Formula"
                        description={`Start from scratch in ${modeDisplayName} mode`}
                        onClick={handleStart}
                        gradient={actionGradient}
                    />
                    <ActionCard
                        icon={FolderOpen}
                        title="Load Saved Project"
                        description="Continue working on a draft or view a completed formula"
                        onClick={() => setShowLoadModal(true)}
                        gradient="bg-gradient-to-br from-slate-700 to-slate-900"
                    />
                </motion.div>

                {/* Recent Projects */}
                {recentFormulas.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-900">Recent Projects</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowLoadModal(true)}
                                className="text-slate-600 hover:text-slate-900"
                            >
                                View All
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recentFormulas.map(formula => (
                                <RecentProjectCard 
                                    key={formula.id} 
                                    formula={formula}
                                    onClick={handleSelectAndLoad}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {showLoadModal && (
                <LoadFormulaModal
                    isOpen={showLoadModal}
                    onClose={() => setShowLoadModal(false)}
                    onSelectFormula={handleSelectAndLoad}
                />
            )}
        </div>
    );
}