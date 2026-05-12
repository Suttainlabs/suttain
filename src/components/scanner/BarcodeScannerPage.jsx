import { useState, useRef, useCallback, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarcodeHistory as BarcodeHistoryEntity } from '@/entities/BarcodeHistory';
import AuthContext from '../auth/AuthContext';
import LiveScanner from './LiveScanner';
import BarcodeAnalysis from './ProductAnalysis';
import BarcodeHistory from './BarcodeHistory';
import RegulatoryScanner from '../compliance/RegulatoryScanner';
import { base44 } from '@/api/base44Client';
import { History, Camera, Loader2, Search, ChevronLeft, UploadCloud, QrCode, Globe, Smartphone, ArrowRight, Scan, Zap, Leaf, ShieldCheck, Recycle, FlaskConical, ScanLine, BarChart2 } from 'lucide-react';
import NutriScanApp from '../nutriscan/NutriScanApp';
import BulkScanDashboard from './BulkScanDashboard';
import CompareProducts from './CompareProducts';
import { Link } from 'react-router-dom';
import ToolFeedbackToast from '../shared/ToolFeedbackToast';
import { sendFeatureUsageEmail } from '../shared/featureNotifications';
import { incrementUsage } from '../../utils/usageTracker';
import useTrialStatus from '../../hooks/useTrialStatus';

const BarcodeHint = ({ barcode }) => {
    if (!barcode) return null;
    let hint = '';
    const len = barcode.length;
    if (len >= 4 && len <= 5) hint = '✓ Looks like a PLU code (fresh produce)';
    else if (len === 12) hint = '✓ Looks like a UPC-A barcode';
    else if (len === 13) hint = '✓ Looks like an EAN-13 barcode';
    else if (len === 8) hint = '✓ Looks like a UPC-E / EAN-8 barcode';
    else if (len > 5 && len < 12) hint = 'Keep typing... most barcodes are 12–13 digits';
    else if (len > 14) hint = 'Too many digits — check the barcode';
    return <p className="text-xs text-slate-500 text-center mt-1">{hint}</p>;
};

const MODES = [
    { id: 'quick',    label: 'QuickScan', icon: QrCode },
    { id: 'nutriscan', label: 'FoodAnalysis', icon: Leaf },
];

const QUICK_SUB_MODES = [
    { id: 'scan',    label: 'Scan',       icon: Scan },
    { id: 'bulk',    label: 'Bulk Scan',  icon: ScanLine },
    { id: 'compare', label: 'Compare',    icon: BarChart2 },
];

export default function BarcodeScannerPage() {
    const [mode, setMode] = useState('quick');
    const [view, setView] = useState('main');
    const [productInfo, setProductInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);
    const [barcodeInput, setBarcode] = useState('');
    const [history, setHistory] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showRegulatoryCheck, setShowRegulatoryCheck] = useState(false);
    const [quickSubMode, setQuickSubMode] = useState('scan');
    const fileInputRef = useRef(null);

    const { user, openAuthModal } = useContext(AuthContext);
    const trialStatus = useTrialStatus(user);

    const loadHistory = useCallback(async () => {
        try {
            const items = await BarcodeHistoryEntity.list('-created_date', 50);
            setHistory(items);
        } catch {}
    }, []);

    const handleDeleteHistory = useCallback(async (id) => {
        try {
            await BarcodeHistoryEntity.delete(id);
            setHistory(prev => prev.filter(h => h.id !== id));
        } catch {}
    }, []);

    useEffect(() => {
        if (user) loadHistory();
        else setHistory([]);
    }, [user, loadHistory]);

    const handleLookup = useCallback(async (scannedBarcode, scanMethod = 'manual') => {
        if (!user) { openAuthModal('login'); return; }
        if (!scannedBarcode) { setError('Please enter a valid barcode.'); return; }
        setIsLoading(true);
        setError('');
        setProductInfo(null);
        setBarcode(scannedBarcode);
        try {
            const { data } = await base44.functions.invoke('lookupBarcode', { barcode: scannedBarcode });
            if (data) {
                setProductInfo(data);
                if (data.source !== 'Not Found') {
                    try {
                        await BarcodeHistoryEntity.create({
                            barcode: scannedBarcode,
                            product_name: data.name,
                            product_image: data.imageUrl,
                            scan_method: scanMethod,
                            ingredient_count: data.ingredients?.length || 0,
                            analysis_completed: true
                        });
                        base44.entities.WorkspaceSession.create({
                            title: data.name || `Scan: ${scannedBarcode}`,
                            type: 'scan',
                            notes: `Scanned via ${scanMethod}`,
                            snapshot: { barcode: scannedBarcode, product_name: data.name, brand: data.brand, risk_level: data.riskAssessment?.overallRisk, ingredient_count: data.ingredients?.length || 0 }
                        }).catch(() => {});
                        loadHistory();
                        setShowFeedback(true);
                        setTimeout(() => setShowFeedback(false), 12000);
                        sendFeatureUsageEmail(user, 'barcode_scan', { productName: data.name, brand: data.brand, barcode: scannedBarcode, riskLevel: data.riskAssessment?.overallRisk, ingredientCount: data.ingredients?.length || 0 });
                    } catch {}
                }
            } else throw new Error("No data returned.");
        } catch (err) {
            setError(err.response?.data?.error || 'Could not fetch product data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [loadHistory, user, openAuthModal]);

    const handleScanSuccess = (bc) => { setIsLiveScannerOpen(false); handleLookup(bc, 'live_scan'); };
    const handleHistorySelect = (bc) => handleLookup(bc, 'history');
    const handleManualSubmit = (e) => { e.preventDefault(); handleLookup(barcodeInput); };
    const clearSearch = () => { setProductInfo(null); setError(''); setBarcode(''); setView('main'); };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');
        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            if (!file_url) throw new Error("Upload failed.");
            const { data: scanResult } = await base44.functions.invoke('scanBarcodeFromImage', { file_url });
            if (!scanResult?.barcode) throw new Error(scanResult?.error || "No barcode detected in image.");
            handleLookup(scanResult.barcode, 'image_upload');
        } catch (e) {
            setError(e.message || "Could not process the image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <>
        <ToolFeedbackToast isOpen={showFeedback} onClose={() => setShowFeedback(false)} feature="scanner" featureLabel="SuttainScan" user={user} pointsToAward={0} />
        <LiveScanner isOpen={isLiveScannerOpen} onClose={() => setIsLiveScannerOpen(false)} onScanSuccess={handleScanSuccess} />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 pb-24">

            {/* Hero header */}
            <div className="relative overflow-hidden bg-white text-slate-800 pt-12 pb-20 px-4 text-center border-b border-slate-100">

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        <Zap className="w-3.5 h-3.5" />
                        Instant Ingredient Analysis
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight gradient-text">SuttainScan</h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">
                        Scan any product barcode to instantly reveal its safety, sustainability, and ingredient profile.
                    </p>
                </motion.div>
            </div>

            {/* Mode tabs — floating over the hero */}
            <div className="flex justify-center -mt-5 px-4 z-20 relative mb-6">
                <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-lg gap-1">
                    {MODES.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setMode(id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                mode === id
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Non-quick modes */}
            {mode === 'nutriscan' && <NutriScanApp user={user} embedded />}

            {/* Quick / SuttainScan mode */}
            {mode === 'quick' && (
                <div className="max-w-lg mx-auto px-4">
                    {/* Sub-mode tabs */}
                    <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm gap-1 mb-5">
                        {QUICK_SUB_MODES.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => { setQuickSubMode(id); if (id === 'scan') { setProductInfo(null); setError(''); } }}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    quickSubMode === id
                                        ? 'bg-slate-800 text-white shadow'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Bulk Scan sub-mode */}
                    {quickSubMode === 'bulk' && <BulkScanDashboard user={user} />}

                    {/* Compare sub-mode */}
                    {quickSubMode === 'compare' && (
                        <div className="pb-12">
                            <CompareProducts user={user} />
                        </div>
                    )}

                    {/* Scan sub-mode */}
                    {quickSubMode === 'scan' && <AnimatePresence mode="wait">
                        {productInfo ? (

                            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <BarcodeAnalysis product={productInfo} onClear={clearSearch} user={user} />
                                {showRegulatoryCheck && (
                                    <div className="mt-6">
                                        <RegulatoryScanner ingredients={productInfo.ingredients?.map(ing => ({ chemical_name: ing }))} onClose={() => setShowRegulatoryCheck(false)} />
                                    </div>
                                )}
                                {!showRegulatoryCheck && productInfo.ingredients?.length > 0 && (
                                    <Button onClick={() => setShowRegulatoryCheck(true)} variant="outline" className="w-full mt-4 gap-2">
                                        <Globe className="w-4 h-4" /> Check Regional Regulations
                                    </Button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="scanner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <AnimatePresence mode="wait">
                                    {view === 'main' ? (
                                        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            {/* Main scan card */}
                                            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                                                {/* Card header */}
                                                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                                                    <h2 className="text-xl font-bold text-slate-800 text-center">Scan or Enter a Barcode</h2>
                                                    <p className="text-sm text-slate-500 text-center mt-1">UPC, EAN, or PLU code (fresh produce)</p>
                                                </div>

                                                <div className="p-6 space-y-5">
                                                    {/* Manual input */}
                                                    <form onSubmit={handleManualSubmit} className="space-y-2">
                                                        <div className="relative">
                                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                            <Input
                                                                type="text"
                                                                placeholder="UPC, EAN, or PLU code (e.g. 4011)..."
                                                                value={barcodeInput}
                                                                onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ''))}
                                                                className="h-13 pl-11 pr-4 text-base rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400"
                                                                autoFocus
                                                                disabled={isLoading || isUploading}
                                                            />
                                                        </div>
                                                        <BarcodeHint barcode={barcodeInput} />
                                                        {/* PLU quick picks */}
                                                        <div>
                                                            <p className="text-xs text-slate-400 mb-1.5">Common PLU codes (fresh produce):</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {[
                                                                    { code: '4011', label: '🍌 Banana' },
                                                                    { code: '4065', label: '🍎 Apple' },
                                                                    { code: '3107', label: '🍓 Strawberry' },
                                                                    { code: '4053', label: '🥦 Broccoli' },
                                                                    { code: '4062', label: '🥕 Carrot' },
                                                                ].map(({ code, label }) => (
                                                                    <button
                                                                        key={code}
                                                                        type="button"
                                                                        onClick={() => setBarcode(code)}
                                                                        className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-teal-100 hover:text-teal-700 rounded-full transition-colors text-slate-600"
                                                                    >
                                                                        {label} <span className="text-slate-400">#{code}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="submit"
                                                            className="w-full h-12 text-base rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold gap-2"
                                                            disabled={isLoading || isUploading || !barcodeInput}
                                                        >
                                                            {isLoading
                                                                ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                                                                : <><Scan className="w-5 h-5" /> Analyze Product</>
                                                            }
                                                        </Button>
                                                    </form>

                                                    {/* Divider */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-px bg-slate-200" />
                                                        <span className="text-xs text-slate-400 font-medium">OR SCAN WITH</span>
                                                        <div className="flex-1 h-px bg-slate-200" />
                                                    </div>

                                                    {/* Camera / Upload */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => setIsLiveScannerOpen(true)}
                                                            disabled={isUploading}
                                                            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all group"
                                                        >
                                                            <div className="w-10 h-10 rounded-xl bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center transition-colors">
                                                                <Camera className="w-5 h-5 text-teal-600" />
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-700">Camera</span>
                                                            <span className="text-xs text-slate-400">Scan live</span>
                                                        </button>
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={isUploading}
                                                            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all group"
                                                        >
                                                            <div className="w-10 h-10 rounded-xl bg-cyan-100 group-hover:bg-cyan-200 flex items-center justify-center transition-colors">
                                                                {isUploading
                                                                    ? <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                                                                    : <UploadCloud className="w-5 h-5 text-cyan-600" />
                                                                }
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-700">Upload Image</span>
                                                            <span className="text-xs text-slate-400">Photo of barcode</span>
                                                        </button>
                                                    </div>

                                                    {error && (
                                                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                                            <span className="text-sm text-red-700">{error}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer actions */}
                                                <div className="px-6 pb-6 space-y-3">
                                                    <Link to="/MobileScan" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all text-sm font-semibold">
                                                        <Smartphone className="w-4 h-4" />
                                                        Open Full-Screen Mobile Scanner
                                                        <ArrowRight className="w-4 h-4 ml-auto" />
                                                    </Link>

                                                    {history.length > 0 && (
                                                        <button
                                                            onClick={() => setView('history')}
                                                            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-slate-500 hover:text-teal-600 transition-colors font-medium"
                                                        >
                                                            <History className="w-4 h-4" />
                                                            View Scan History ({history.length})
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Feature hints */}
                                            <div className="grid grid-cols-3 gap-3 mt-5">
                                                {[
                                                    { label: 'Safety Score', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
                                                    { label: 'Eco Rating', icon: Recycle, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
                                                    { label: 'Ingredient Breakdown', icon: FlaskConical, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                                                ].map(({ label, icon: Icon, color, bg, border }) => (
                                                    <div key={label} className={`${bg} rounded-2xl p-3 text-center border ${border} shadow-sm flex flex-col items-center gap-1.5`}>
                                                        <Icon className={`w-5 h-5 ${color}`} />
                                                        <span className={`text-xs font-semibold ${color}`}>{label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                                                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                                                    <button onClick={() => setView('main')} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                                                    </button>
                                                    <h2 className="text-lg font-bold text-slate-800">Scan History</h2>
                                                    <span className="ml-auto text-xs text-slate-400 font-medium">{history.length} scans</span>
                                                </div>
                                                <div className="p-4">
                                                    <BarcodeHistory history={history} onSelect={handleHistorySelect} onDelete={handleDeleteHistory} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>}
                </div>
            )}
        </div>
        </>
    );
}