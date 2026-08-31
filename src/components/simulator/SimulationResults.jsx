import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, CheckCircle, Shield, FlaskConical, Zap, Leaf, Heart,
    Thermometer, BarChart, Beaker, FileText, ChevronRight, CornerUpLeft, BookOpen, Microscope,
    Download, Calculator, Share2, ClipboardCheck, Loader2, X, ChevronLeft, Atom, TrendingUp, TrendingDown, Info, Sparkles, ArrowRightLeft, Eye,
    Database, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { base44 } from '@/api/base44Client';
import SurfacePlot3D from './SurfacePlot3D';
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ReportCustomizationModal from './ReportCustomizationModal';
import { analyzeAndCreateAlerts } from '../safety/safetyAlertUtils';
import AdvancedAnalysisPanel from './AdvancedAnalysisPanel';
import SafetyAdvisor from './SafetyAdvisor';
import ShareButton from '../shared/ShareButton';
import ShareSimulationModal from './ShareSimulationModal';

// Lazy load visualization component
const ChemicalVisualization = lazy(() => import('./ChemicalVisualization'));

const ChemFormula = ({ formula }) => {
    if (!formula) return null;
    const parts = formula.split(/(\d+)/);
    return (
        <span className="font-mono">
            {parts.map((part, i) =>
                /^\d+$/.test(part) ? <sub key={i}>{part}</sub> : part
            )}
        </span>
    );
};

const getSafetyStyling = (level) => {
    switch (level) {
        case 'FATAL':
        case 'CRITICAL':
            return {
                gradient: 'from-red-500 to-rose-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-900',
                badge: 'bg-red-100 text-red-800',
                icon: <AlertTriangle className="w-5 h-5" />,
                ringColor: 'ring-red-500',
                accentColor: 'bg-red-500'
            };
        case 'DANGEROUS':
            return {
                gradient: 'from-orange-500 to-red-500',
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                text: 'text-orange-900',
                badge: 'bg-orange-100 text-orange-800',
                icon: <AlertTriangle className="w-5 h-5" />,
                ringColor: 'ring-orange-500',
                accentColor: 'bg-orange-500'
            };
        case 'MODERATE':
            return {
                gradient: 'from-yellow-400 to-orange-400',
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-900',
                badge: 'bg-yellow-100 text-yellow-800',
                icon: <Shield className="w-5 h-5" />,
                ringColor: 'ring-yellow-500',
                accentColor: 'bg-yellow-500'
            };
        case 'LOW':
            return {
                gradient: 'from-blue-400 to-cyan-500',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-900',
                badge: 'bg-blue-100 text-blue-800',
                icon: <CheckCircle className="w-5 h-5" />,
                ringColor: 'ring-blue-500',
                accentColor: 'bg-blue-500'
            };
        case 'SAFE':
        default:
            return {
                gradient: 'from-emerald-400 to-teal-500',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-900',
                badge: 'bg-emerald-100 text-emerald-800',
                icon: <CheckCircle className="w-5 h-5" />,
                ringColor: 'ring-emerald-500',
                accentColor: 'bg-emerald-500'
            };
    }
};

// Per-category results framing — changes only labeling, tone, and default tab
const PERSONA_FRAMING = {
    household: {
        headlinePrefix: 'Is it safe?',
        recommendationLabel: 'Home safety guidance',
        whatHappensLabel: 'What this means for you',
        defaultTab: 'overview',
    },
    researcher: {
        headlinePrefix: 'Scientific summary',
        recommendationLabel: 'Researcher recommendation',
        whatHappensLabel: 'Reaction summary',
        defaultTab: 'reaction',
    },
    business: {
        headlinePrefix: 'Compliance & formulation',
        recommendationLabel: 'Formulation guidance',
        whatHappensLabel: 'What this means for your formula',
        defaultTab: 'overview',
    },
};

const RiskMetric = ({ icon, label, value, maxValue = 100, color }) => {
    const percentage = (value / maxValue) * 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${color}/10 flex items-center justify-center`}>
                        <div className={`${color}`}>{icon}</div>
                    </div>
                    <span className="font-medium text-sm text-slate-700">{label}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{value}</span>
            </div>
            <div className="relative">
                <Progress value={percentage} className="h-2" />
                <div
                    className={`absolute top-0 left-0 h-2 rounded-full ${color}/20 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const ExternalSourcesCard = ({ sources }) => {
    const [expanded, setExpanded] = useState(false);
    const grouped = React.useMemo(() => {
        const map = {};
        for (const s of sources) {
            if (!map[s.source_db]) map[s.source_db] = { source_db: s.source_db, fields: [], retrieved_at: s.retrieved_at };
            for (const f of (s.fields || [])) map[s.source_db].fields.push(f);
        }
        return Object.values(map);
    }, [sources]);
    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <Database className="w-4 h-4 text-[#02988C]" />
                <h4 className="text-sm font-semibold text-slate-800">External data sources</h4>
                <Badge variant="outline" className="text-[10px] ml-1">{grouped.length} databases</Badge>
                <ChevronRight className={`w-4 h-4 ml-auto text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
            {expanded && (
                <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
                    {grouped.map((src, i) => (
                        <div key={i} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                            <p className="text-xs font-bold text-slate-700 mb-1">{src.source_db}</p>
                            {src.fields.map((f, j) => (
                                <div key={j} className="flex items-start justify-between gap-2 py-0.5">
                                    <div className="min-w-0">
                                        <span className="text-[11px] text-slate-500">{f.field}: </span>
                                        <span className="text-[11px] text-slate-900 break-words">{String(f.value)}</span>
                                        {f.units && <span className="text-[10px] text-slate-500 ml-1">{f.units}</span>}
                                    </div>
                                    {f.source_url && (
                                        <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#02988C] flex-shrink-0">
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function SimulationResults({ data, chemicals: chemicalsProp, onViewAlternatives, onStartNew, persona }) {
    const framing = PERSONA_FRAMING[persona] || PERSONA_FRAMING.household;
    const [activeTab, setActiveTab] = useState(framing.defaultTab);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [showDetails, setShowDetails] = useState(true);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [supervisorName, setSupervisorName] = useState('');
    const [supervisorSignature, setSupervisorSignature] = useState('');
    const tabsContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [showReportCustomization, setShowReportCustomization] = useState(false);
    const [reportOptions, setReportOptions] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [safetyAlert, setSafetyAlert] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (err) {
                console.log('User not logged in');
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (data && user) {
            checkSimulationSafety();
        }
    }, [data, user]);

    const checkSimulationSafety = async () => {
        if (!user || !chemicals || chemicals.length === 0) return;

        try {
            const profiles = await base44.entities.SafetyProfile.filter({ is_default: true });
            if (profiles.length === 0) return;

            const defaultProfile = profiles[0];
            const allIngredients = [
                ...chemicals.map(c => c.name),
                ...(reaction_details?.products_formed?.map(p => p.name) || [])
            ];

            const result = await analyzeAndCreateAlerts({
                productName: `Simulation: ${chemicals.map(c => c.name).join(' + ')}`,
                ingredients: allIngredients,
                alertType: 'simulator',
                profileId: defaultProfile.id,
                userEmail: user.email,
                additionalContext: {
                    risk_score: risk_assessment.overall_risk_score,
                    safety_level: safety_status.level,
                    persona
                }
            });

            if (result.shouldWarn) {
                setSafetyAlert(result.alert);
            }
        } catch (error) {
            console.error('Safety check failed:', error);
        }
    };

    // Safe destructuring with fallbacks
    const risk_assessment = data?.risk_assessment || {};
    const safety_status = data?.safety_status || { level: 'UNKNOWN', warnings: [] };
    const reaction_details = data?.reaction_details || {};
    const chemicals = (chemicalsProp?.length ? chemicalsProp : data?.chemicals) || [];
    const experimental_analysis = data?.experimental_analysis || {};
    const energy_profile = data?.energy_profile || {};
    const health_and_safety = data?.health_and_safety || {};
    const experimentalConditions = data?.experimentalConditions || {};
    const safetyProtocols = data?.safetyProtocols || {};
    const parameterSets = data?.parameterSets || [];

    const styling = getSafetyStyling(safety_status.level);

    const ADVANCED_PERSONAS = new Set(['business', 'teacher', 'researcher']);
    const isAdvanced = ADVANCED_PERSONAS.has(persona);
    
    // Only researcher and teacher require supervisor approval for certain sections/reports
    const requiresSupervisorApproval = persona === 'researcher' || persona === 'teacher';

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'visualization', label: 'Visualization', icon: <Eye className="w-4 h-4" /> },
        { id: 'reaction', label: 'Reaction', icon: <ArrowRightLeft className="w-4 h-4" /> },
        { id: 'health', label: 'Health & Safety', icon: <Heart className="w-4 h-4" /> },

        { id: 'analysis', label: 'Advanced Analysis', icon: <BarChart className="w-4 h-4" /> },
        ...(isAdvanced ? [
            { id: 'experimental', label: 'Experimental', icon: <Microscope className="w-4 h-4" /> },
            { id: 'protocols', label: 'Protocols', icon: <Shield className="w-4 h-4" /> },
            { id: 'calculations', label: 'Calculations', icon: <Calculator className="w-4 h-4" /> },
            { id: 'documentation', label: 'Report', icon: <FileText className="w-4 h-4" /> }
        ] : [])
    ];

    const checkScroll = () => {
        const container = tabsContainerRef.current;
        if (container) {
            setShowLeftArrow(container.scrollLeft > 10);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 10
            );
        }
    };

    useEffect(() => {
        checkScroll();
        const container = tabsContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            const timeoutId = setTimeout(checkScroll, 100); // Run once after component mounts and potentially renders content

            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
                clearTimeout(timeoutId);
            };
        }
    }, [tabs.length]); // Re-check scroll if tabs change (e.g., when advanced status changes)

    const scrollTabs = (direction) => {
        const container = tabsContainerRef.current;
        if (container) {
            const scrollAmount = 200; // pixels to scroll
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const generateReport = async () => {
        if (!reportOptions) {
            toast.error('Please select report options first');
            return;
        }

        setIsGeneratingReport(true);
        try {
            const reportData = {
                ...data,
                supervisorSignature: supervisorName ? {
                    name: supervisorName,
                    signature: supervisorSignature,
                    date: new Date().toISOString()
                } : null
            };

            const response = await base44.functions.invoke('generateLabReport', {
                simulationData: reportData,
                persona,
                customization: reportOptions
            });

            // Check if response exists and has data
            if (!response) {
                throw new Error('No response from server');
            }

            // The response.data contains the ArrayBuffer
            const pdfData = response.data;
            
            if (!pdfData) {
                throw new Error('No PDF data received');
            }

            // Create blob from the ArrayBuffer
            const blob = new Blob([pdfData], { type: 'application/pdf' });

            // Download the PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const template = reportOptions?.template || 'professional';
            const safeChemicals = chemicals.map(c => (c.name || 'chemical').replace(/[^a-z0-9]/gi, '-')).join('-');
            a.download = `${template}-lab-report-${safeChemicals}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                a.remove();
            }, 100);
            
            setShowSignatureModal(false);
            setShowReportCustomization(false);
            setSupervisorName('');
            setSupervisorSignature('');
            setReportOptions(null);
            toast.success('Report downloaded successfully!');

            // Send report to user's email
            if (user?.email) {
                try {
                    const uploadResult = await base44.integrations.Core.UploadFile({ file: blob });
                    const fileUrl = uploadResult?.file_url;
                    if (fileUrl) {
                        await base44.functions.invoke('sendEmailResend', {
                            to: user.email,
                            subject: `Your Chemical Simulation Report - ${chemicals.map(c => c.name).join(' + ')}`,
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #02988C;">Your Simulation Report</h2>
                                    <p>Hi ${user.full_name || 'there'},</p>
                                    <p>Your chemical simulation report is ready for download.</p>
                                    <p><strong>Chemicals tested:</strong> ${chemicals.map(c => c.name).join(', ')}</p>
                                    <p><strong>Risk Score:</strong> ${risk_assessment.overall_risk_score || 'N/A'}/100</p>
                                    <p><strong>Safety Level:</strong> ${safety_status.level}</p>
                                    <p><a href="${fileUrl}" style="display: inline-block; background: linear-gradient(135deg, #02988C, #09D2FF); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Download Report</a></p>
                                    <p style="color: #666; font-size: 12px; margin-top: 24px;">Best regards,<br/>The Suttain Team</p>
                                </div>
                            `
                        });
                        toast.success('Report also sent to your email!');
                    }
                } catch (emailErr) {
                    console.error('Failed to send report email:', emailErr);
                }
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error occurred';
            toast.error(`Failed to generate report: ${errorMsg}`);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleReportCustomizationComplete = (options) => {
        setReportOptions(options);
        setShowReportCustomization(false); // Close customization modal
        
        // If supervisor approval is required for this persona AND enabled in selected report options
        if (requiresSupervisorApproval && options.sections.supervisorApproval) {
            setShowSignatureModal(true);
        } else {
            // Otherwise generate directly
            generateReport();
        }
    };

    const shareText = `Chemical Simulation on Suttain\n\nChemicals: ${chemicals?.map(c => c.name).join(' + ')}\nRisk Score: ${risk_assessment.overall_risk_score || 0}/100\nSafety Level: ${safety_status.level}\n${risk_assessment.recommendation ? `\nKey Finding: ${risk_assessment.recommendation}` : ''}\n\nRun your own simulations free at suttain.com`;

    const calculateMolarMass = (formula) => {
        const atomicMasses = {
            'H': 1.008, 'He': 4.002, 'Li': 6.941, 'Be': 9.012, 'B': 10.811,
            'C': 12.011, 'N': 14.007, 'O': 15.999, 'F': 18.998, 'Ne': 20.180,
            'Na': 22.990, 'Mg': 24.305, 'Al': 26.982, 'Si': 28.086, 'P': 30.974,
            'S': 32.065, 'Cl': 35.453, 'Ar': 39.948, 'K': 39.098, 'Ca': 40.078,
            'Sc': 44.956, 'Ti': 47.867, 'V': 50.942, 'Cr': 51.996, 'Mn': 54.938,
            'Fe': 55.845, 'Co': 58.933, 'Ni': 58.693, 'Cu': 63.546, 'Zn': 65.38,
            'Br': 79.904, 'I': 126.904, 'Pb': 207.2
        };

        let mass = 0;
        const matches = formula?.match(/([A-Z][a-z]?)(\d*)/g) || [];

        matches.forEach(match => {
            const elementMatch = match.match(/[A-Z][a-z]?/);
            const element = elementMatch ? elementMatch[0] : '';
            const countMatch = match.match(/\d+/);
            const count = countMatch ? parseInt(countMatch[0]) : 1;
            mass += (atomicMasses[element] || 0) * count;
        });

        return mass.toFixed(3);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-4">
                        {/* Safety Alert */}
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
                                            🚨 Personalized Safety Alert
                                        </h4>
                                        <p className={`text-sm mb-2 ${
                                            safetyAlert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                                        }`}>
                                            {safetyAlert.alert_message}
                                        </p>
                                        <Badge className={`${
                                            safetyAlert.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'
                                        } text-white text-xs`}>
                                            📧 Email notification sent
                                        </Badge>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Energy Profile */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <div className={`p-2 sm:p-4 ${styling.bg} border ${styling.border} rounded-xl text-center`}>
                                <Thermometer className={`w-5 h-5 mx-auto mb-1 sm:mb-2 ${styling.text}`} />
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Reaction Type</p>
                                <p className={`font-bold text-xs sm:text-sm leading-tight ${styling.text}`}>{energy_profile?.type || 'Unknown'}</p>
                            </div>
                            <div className={`p-2 sm:p-4 ${styling.bg} border ${styling.border} rounded-xl text-center`}>
                                {energy_profile?.type === 'Exothermic' ? (
                                    <TrendingDown className={`w-5 h-5 mx-auto mb-1 sm:mb-2 ${styling.text}`} />
                                ) : (
                                    <TrendingUp className={`w-5 h-5 mx-auto mb-1 sm:mb-2 ${styling.text}`} />
                                )}
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Energy Change</p>
                                <p className={`font-bold text-xs sm:text-sm leading-tight ${styling.text}`}>{energy_profile?.energy_change || 0} kJ/mol</p>
                            </div>
                            <div className={`p-2 sm:p-4 ${styling.bg} border ${styling.border} rounded-xl text-center`}>
                                <Zap className={`w-5 h-5 mx-auto mb-1 sm:mb-2 ${styling.text}`} />
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Activation Energy</p>
                                <p className={`font-bold text-xs sm:text-sm leading-tight ${styling.text}`}>{energy_profile?.activation_energy || 0} kJ/mol</p>
                            </div>
                        </div>

                        {/* What Happens */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                {framing.whatHappensLabel}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {reaction_details?.what_happens || 'No detailed description available.'}
                            </p>
                        </div>

                        {/* External data sources (live enrichment) */}
                        {data?.external_sources?.length > 0 && (
                            <ExternalSourcesCard sources={data.external_sources} />
                        )}

                        {/* Experimental Conditions Summary */}
                        {isAdvanced && experimentalConditions && Object.keys(experimentalConditions).length > 0 && (
                            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                    <Microscope className="w-4 h-4" />
                                    Experimental Conditions Applied
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                    {experimentalConditions.stirringRate && (
                                        <div>
                                            <span className="text-slate-600">Stirring Rate:</span>
                                            <span className="font-semibold text-slate-900 ml-1">{experimentalConditions.stirringRate} RPM</span>
                                        </div>
                                    )}
                                    {experimentalConditions.phValue && (
                                        <div>
                                            <span className="text-slate-600">pH:</span>
                                            <span className="font-semibold text-slate-900 ml-1">{experimentalConditions.phValue}</span>
                                        </div>
                                    )}
                                    {experimentalConditions.solvent && (
                                        <div>
                                            <span className="text-slate-600">Solvent:</span>
                                            <span className="font-semibold text-slate-900 ml-1 capitalize">{experimentalConditions.solvent}</span>
                                        </div>
                                    )}
                                    {experimentalConditions.atmosphereControl && (
                                        <div>
                                            <span className="text-slate-600">Atmosphere:</span>
                                            <span className="font-semibold text-slate-900 ml-1 capitalize">{experimentalConditions.atmosphereControl}</span>
                                        </div>
                                    )}
                                    {experimentalConditions.vesselType && (
                                        <div>
                                            <span className="text-slate-600">Vessel:</span>
                                            <span className="font-semibold text-slate-900 ml-1 capitalize">{experimentalConditions.vesselType.replace(/_/g, ' ')}</span>
                                        </div>
                                    )}
                                    {experimentalConditions.lightExposure && (
                                        <div>
                                            <span className="text-slate-600">Light:</span>
                                            <span className="font-semibold text-slate-900 ml-1 capitalize">{experimentalConditions.lightExposure}</span>
                                        </div>
                                    )}
                                </div>
                                {experimentalConditions.catalystPresent && experimentalConditions.catalystType && (
                                    <div className="mt-3 pt-3 border-t border-indigo-200">
                                        <span className="text-slate-600 text-xs">Catalyst:</span>
                                        <span className="font-semibold text-indigo-900 ml-1 text-xs">{experimentalConditions.catalystType}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 'visualization':
                return (
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <span className="ml-3 text-slate-600">Loading visualization...</span>
                        </div>
                    }>
                        <ChemicalVisualization data={data} />
                    </Suspense>
                );
            case 'reaction':
                return (
                    <div className="space-y-4">
                        {/* Balanced Equation */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-900 mb-2">Balanced Equation</h4>
                            <p className="text-sm text-indigo-600 leading-relaxed">
                                <ChemFormula formula={reaction_details?.balanced_equation || 'No equation available'} />
                            </p>
                        </div>

                        {/* Reaction Mechanism */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Mechanism</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {reaction_details?.reaction_mechanism || 'No mechanism details available'}
                            </p>
                        </div>

                        {/* Source */}
                        {reaction_details?.peer_reviewed_source && (
                            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                                <BookOpen className="w-4 h-4 mt-0.5" />
                                <div>
                                    <p className="font-medium mb-1">Scientific Source:</p>
                                    <p>{reaction_details.peer_reviewed_source}</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'health':
                return (
                    <div className="space-y-4">
                        {/* Safety Warnings */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Safety Warnings
                            </h4>
                            <div className="space-y-2">
                                {safety_status.warnings.map((warning, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                                        <p className="text-sm text-amber-900 flex-1">{warning}</p>
                                    </div>
                                ))}
                                {safety_status.warnings.length === 0 && (
                                    <p className="text-sm text-slate-600">No specific warnings at this time.</p>
                                )}
                            </div>
                        </div>

                        {/* Emergency Response */}
                        {health_and_safety?.emergency_response_protocol && (
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Emergency Response</h4>
                                <div className="grid gap-3">
                                    {health_and_safety.emergency_response_protocol.skin_contact && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-xs font-semibold text-red-900 mb-1">Skin Contact</p>
                                            <p className="text-xs text-red-700">
                                                {health_and_safety.emergency_response_protocol.skin_contact}
                                            </p>
                                        </div>
                                    )}
                                    {health_and_safety.emergency_response_protocol.eye_contact && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-xs font-semibold text-blue-900 mb-1">Eye Contact</p>
                                            <p className="text-xs text-blue-700">
                                                {health_and_safety.emergency_response_protocol.eye_contact}
                                            </p>
                                        </div>
                                    )}
                                    {health_and_safety.emergency_response_protocol.inhalation && (
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="text-xs font-semibold text-purple-900 mb-1">Inhalation</p>
                                            <p className="text-xs text-purple-700">
                                                {health_and_safety.emergency_response_protocol.inhalation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'analysis':
                return (
                    <AdvancedAnalysisPanel currentSimulation={data} />
                );
            case 'experimental':
                return (
                    <div className="space-y-4">
                        {/* Experimental Conditions */}
                        {experimental_analysis.conditions?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Experimental Conditions</h4>
                                <div className="space-y-2">
                                    {experimental_analysis.conditions.map((cond, idx) => (
                                        <div key={idx} className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                <div>
                                                    <p className="text-slate-600">Temperature</p>
                                                    <p className="font-semibold text-indigo-900">{cond.temperature}°C</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Pressure</p>
                                                    <p className="font-semibold text-indigo-900">{cond.pressure} atm</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Time</p>
                                                    <p className="font-semibold text-indigo-900">{cond.time} min</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Yield</p>
                                                    <p className="font-semibold text-indigo-900">{cond.yield?.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3D Surface Plot */}
                        {experimental_analysis.conditions?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">3D Yield Surface</h4>
                                <div className="bg-white border border-slate-200 rounded-lg p-4">
                                    <SurfacePlot3D conditions={experimental_analysis.conditions} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'protocols':
                return (
                    <div className="space-y-4">
                        {/* Safety Protocols */}
                        {safetyProtocols && Object.keys(safetyProtocols).length > 0 ? (
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Safety Protocols</h4>
                                <div className="space-y-3">
                                    {safetyProtocols.fumeHood && (
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm text-blue-900 font-medium">Fume Hood Required</span>
                                        </div>
                                    )}
                                    {safetyProtocols.ppe?.length > 0 && (
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="text-sm font-medium text-purple-900 mb-2">PPE Required:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {safetyProtocols.ppe.map((item, idx) => (
                                                    <Badge key={idx} variant="outline" className="bg-white text-xs">
                                                        {item.replace(/_/g, ' ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {safetyProtocols.wasteDisposal && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-sm font-medium text-amber-900 mb-1">Waste Disposal:</p>
                                            <p className="text-xs text-amber-800">{safetyProtocols.wasteDisposal}</p>
                                        </div>
                                    )}
                                    <div className={`flex items-center gap-2 p-3 ${safetyProtocols.supervisorApproval ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border rounded-lg`}>
                                        {safetyProtocols.supervisorApproval ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-900 font-medium">Supervisor Approval Obtained</span>
                                            </>
                                        ) : (
                                            <>
                                                <ClipboardCheck className="w-4 h-4 text-amber-600" />
                                                <span className="text-sm text-amber-900 font-medium">Supervisor Approval May Be Required</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600">No specific safety protocols found for this reaction.</p>
                        )}
                    </div>
                );
            case 'calculations':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Key Calculations & Parameters</h4>
                        {parameterSets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {parameterSets.map((param, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <h5 className="font-medium text-indigo-700 text-sm mb-2">Parameter Set {idx + 1}</h5>
                                        <ul className="text-xs text-slate-600 space-y-1">
                                            <li className="flex justify-between items-center">
                                                <span className="font-mono text-slate-500">Temperature:</span>
                                                <span className="font-semibold text-slate-800">{param.temperature} {param.temperatureUnit || '°C'}</span>
                                            </li>
                                            <li className="flex justify-between items-center">
                                                <span className="font-mono text-slate-500">Pressure:</span>
                                                <span className="font-semibold text-slate-800">{param.pressure} {param.pressureUnit || 'atm'}</span>
                                            </li>
                                            <li className="flex justify-between items-center">
                                                <span className="font-mono text-slate-500">Time:</span>
                                                <span className="font-semibold text-slate-800">{param.time} min</span>
                                            </li>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600">No detailed parameter sets available.</p>
                        )}

                        {/* Molar Mass Calculations */}
                        {chemicals.length > 0 && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <h5 className="font-medium text-indigo-700 text-sm mb-2">Molar Masses</h5>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    {chemicals.map((chem, idx) => (
                                        <li key={idx} className="flex justify-between items-center">
                                            <span className="text-slate-500"><ChemFormula formula={chem.molecular_formula || chem.name} />:</span>
                                            <span className="font-semibold text-slate-800">
                                                {calculateMolarMass(chem.molecular_formula)} g/mol
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'documentation':
                return (
                    <div className="space-y-4">
                        <div className="border-t pt-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                                <div className="text-center sm:text-left mb-3 sm:mb-0">
                                    <h4 className="font-semibold text-indigo-900 mb-1">Laboratory Report</h4>
                                    <p className="text-xs text-indigo-700">
                                        Download complete analysis with calculations and protocols
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowReportCustomization(true)} // Open customization modal
                                    disabled={isGeneratingReport}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isGeneratingReport ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FlaskConical className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-lg text-slate-600 mb-4">No simulation data available</p>
                <Button onClick={onStartNew} className="bg-indigo-600 hover:bg-indigo-700">
                    Start New Simulation
                </Button>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto space-y-4"
            >
                {/* Compact Modern Header */}
                <Card className="border-0 shadow-lg bg-white overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${styling.gradient}`}></div>

                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Left: Status & Chemicals */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${styling.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                    <div className="text-white">
                                        {React.cloneElement(styling.icon, { className: 'w-6 h-6' })}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col gap-0.5 mb-1">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{framing.headlinePrefix}</span>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base sm:text-lg font-bold text-slate-900">{safety_status.level}</h2>
                                            {isAdvanced && (
                                                <Badge variant="outline" className="text-xs">
                                                    {persona === 'researcher' ? 'Research' : persona === 'business' ? 'Business' : 'Teaching'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                                        {chemicals.map(c => c.scientific_name || c.name).join(' + ')}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Analyzed {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {data?.audit?.attribution && (
                                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Shield className="w-2.5 h-2.5" />
                                            {data.audit.attribution}
                                            {data.audit.overridden && (
                                                <span className="text-amber-600 font-semibold">— safety-corrected</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right: Risk Score */}
                            <div className="flex items-center gap-4 mt-2 sm:mt-0 self-end sm:self-center">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 mb-0.5">Risk Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                                            {risk_assessment.overall_risk_score || 0}
                                        </span>
                                        <span className="text-xs sm:text-sm text-slate-500">/100</span>
                                    </div>
                                </div>

                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                                    <svg viewBox="0 0 64 64" className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="none"
                                            className="text-slate-200"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 28}`}
                                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - (risk_assessment.overall_risk_score || 0) / 100)}`}
                                            className={styling.text}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Compact Recommendation */}
                        <AnimatePresence mode="wait">
                            {showDetails && risk_assessment.recommendation && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: '12px' }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`mt-3 px-3 py-2 ${styling.bg} ${styling.border} border rounded-lg flex items-start gap-2`}
                                >
                                    <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styling.text}`} />
                                    <div className={`text-xs ${styling.text} flex-1`}>
                                        <span className="font-bold block mb-0.5">{framing.recommendationLabel}</span>
                                        {risk_assessment.recommendation}
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="text-slate-400 hover:text-slate-600 p-0.5 -mr-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!showDetails && (
                            <button
                                onClick={() => setShowDetails(true)}
                                className="mt-2 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                            >
                                <Info className="w-3 h-3" />
                                Show recommendation
                            </button>
                        )}
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
                    {/* Left: Tabs Content (3 columns) */}
                    <div className="lg:col-span-3">
                        <Card className="border-slate-200 shadow-md">
                            {/* Compact Tab Navigation */}
                            <div className="border-b border-slate-200 bg-slate-50/50">
                                <div className="relative">
                                    {showLeftArrow && (
                                        <button
                                            onClick={() => scrollTabs('left')}
                                            className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-slate-50 to-transparent pr-4 pl-2 flex items-center hover:from-slate-100 transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                                        </button>
                                    )}

                                    <nav
                                        ref={tabsContainerRef}
                                        className="flex overflow-x-auto scrollbar-hide"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                                                    activeTab === tab.id
                                                        ? 'border-indigo-600 text-indigo-600 bg-white'
                                                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                            >
                                                {tab.icon}
                                                <span className="sr-only sm:not-sr-only sm:inline">{tab.label}</span>
                                            </button>
                                        ))}
                                    </nav>

                                    {showRightArrow && (
                                        <button
                                            onClick={() => scrollTabs('right')}
                                            className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-slate-50 to-transparent pl-4 pr-2 flex items-center hover:from-slate-100 transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4 text-slate-600" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-4 sm:p-6">
                                {renderTabContent()}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Sidebar (1 column) */}
                     <div className="space-y-3 sm:space-y-4">
                        {/* Risk Metrics - Compact */}
                        <Card className="border-slate-200 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <BarChart className="w-4 h-4 text-indigo-600" />
                                    Risk Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <RiskMetric
                                    icon={<Heart className="w-3.5 h-3.5" />}
                                    label="Health"
                                    value={risk_assessment.health_impact_score || 0}
                                    color="text-red-500"
                                />
                                <RiskMetric
                                    icon={<Leaf className="w-3.5 h-3.5" />}
                                    label="Environment"
                                    value={risk_assessment.environmental_impact_score || 0}
                                    color="text-green-500"
                                />
                                <RiskMetric
                                    icon={<Zap className="w-3.5 h-3.5" />}
                                    label="Reactivity"
                                    value={risk_assessment.reactivity_score || 0}
                                    color="text-amber-500"
                                />
                            </CardContent>
                        </Card>

                        {/* Products Formed - Compact */}
                        <Card className="border-slate-200 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Beaker className="w-4 h-4 text-indigo-600" />
                                    Products
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {reaction_details?.products_formed?.slice(0, 3).map((product, idx) => (
                                    <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <Atom className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs text-slate-900 truncate" title={product.name}>
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-0.5">
                                                    <ChemFormula formula={product.formula} /> (MW: {calculateMolarMass(product.formula)})
                                                </p>
                                                {product.hazards?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {product.hazards.slice(0, 2).map((hazard, hidx) => (
                                                            <Badge key={hidx} variant="outline" className="text-xs px-1 py-0 bg-red-50 text-red-700 border-red-200">
                                                                {hazard}
                                                            </Badge>
                                                        ))}
                                                        {product.hazards.length > 2 && (
                                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                                                +{product.hazards.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!reaction_details?.products_formed || reaction_details.products_formed.length === 0) && (
                                    <p className="text-sm text-slate-600 text-center py-2">No products reported.</p>
                                )}
                                {reaction_details?.products_formed?.length > 3 && (
                                    <p className="text-xs text-slate-500 text-center">
                                        +{reaction_details.products_formed.length - 3} more products
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions - Compact */}
                        <Card className="border-slate-200 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    onClick={onViewAlternatives}
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                                >
                                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                                    View Alternatives
                                </Button>
                                <Button
                                    onClick={onStartNew}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    <CornerUpLeft className="w-3.5 h-3.5 mr-2" />
                                    New Simulation
                                </Button>
                                <Button
                                    onClick={() => setShowShareModal(true)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    <Share2 className="w-3.5 h-3.5 mr-2" />
                                    Share with Team
                                </Button>
                                {isAdvanced && (
                                    <>
                                        <Separator className="my-2" />
                                        <Button
                                            onClick={() => setShowReportCustomization(true)}
                                            disabled={isGeneratingReport}
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            {isGeneratingReport ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-3.5 h-3.5 mr-2" />
                                                    Download Report
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>

            {/* Supervisor Signature Modal - Only for Researcher and Teacher */}
            {requiresSupervisorApproval && (
                <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Supervisor Approval Required</DialogTitle>
                            <DialogDescription>
                                This experimental simulation requires supervisor approval before generating the lab report.
                                Please enter your supervisor's details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="supervisor-name">Supervisor Name</Label>
                                <Input
                                    id="supervisor-name"
                                    placeholder="Dr. Jane Smith"
                                    value={supervisorName}
                                    onChange={(e) => setSupervisorName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supervisor-signature">Digital Signature</Label>
                                <Input
                                    id="supervisor-signature"
                                    placeholder="Type full name to confirm"
                                    value={supervisorSignature}
                                    onChange={(e) => setSupervisorSignature(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">
                                    By typing your name, you confirm that you have reviewed and approved this experimental procedure.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowSignatureModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={generateReport}
                                disabled={!supervisorName || !supervisorSignature || isGeneratingReport}
                            >
                                {isGeneratingReport ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Approve & Generate Report'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Report Customization Modal */}
            <ReportCustomizationModal
                isOpen={showReportCustomization}
                onClose={() => setShowReportCustomization(false)}
                onGenerate={handleReportCustomizationComplete}
                isGenerating={isGeneratingReport}
                persona={persona}
            />

            {/* Share Simulation Modal */}
            <ShareSimulationModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                simulationData={data}
                chemicals={chemicals}
                persona={persona}
            />
        </TooltipProvider>
    );
}