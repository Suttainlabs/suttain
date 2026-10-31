import { useState, useRef, useCallback, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarcodeHistory as BarcodeHistoryEntity } from '@/entities/BarcodeHistory';
import AuthContext from '../auth/AuthContext';
import LiveScanner from './LiveScanner';
import BarcodeAnalysis from './ProductAnalysis';
import BarcodeHistory from './BarcodeHistory';
import PremiumFeatureGate from '@/components/shared/PremiumFeatureGate';
import { base44 } from '@/api/base44Client';
import { History, Camera, Loader2, Search, ChevronLeft, UploadCloud, QrCode, Smartphone, ArrowRight, Scan, Zap, Leaf, ShieldCheck, Recycle, FlaskConical, ScanLine, BarChart2 } from 'lucide-react';
import BulkScanDashboard from './BulkScanDashboard';
import CompareProducts from './CompareProducts';
import { Link } from 'react-router-dom';
import { sendFeatureUsageEmail } from '../shared/featureNotifications';
import { incrementUsage } from '../../utils/usageTracker';
import useTrialStatus from '../../hooks/useTrialStatus';
import ConsumerWorkbench, { ModeTabs, WorkbenchGrid, SetupRail, ResultsRail } from '@/components/consumer/ConsumerWorkbench';

const BarcodeHint = ({ barcode }) => {
    if (!barcode) return null;
    let hint = '';
    const len = barcode.length;
    if (len >= 4 && len <= 5) hint = '✓ Looks like a PLU code (fresh produce)';
    else if (len === 12) hint = '✓ Looks like a UPC-A barcode';
    else if (len === 13) hint = '✓ Looks like an EAN-13 barcode';
    else if (len === 8) hint = '✓ Looks like a UPC-E / EAN-8 barcode';
    else if (len > 5 && len < 12) hint = 'Keep typing... most barcodes are 12–13 digits';
    else if (len > 14) hint = 'Too many digits, check the barcode';
    return <p className="text-xs text-slate-500 text-center mt-1">{hint}</p>;
};

const MODES = [
    { id: 'quick',    label: 'QuickScan', icon: QrCode },
];

const QUICK_SUB_MODES = [
    { id: 'scan',    label: 'Scan',       icon: Scan },
    { id: 'bulk',    label: 'Bulk Scan',  icon: ScanLine },
    { id: 'compare', label: 'Compare',    icon: BarChart2 },
];

export default function BarcodeScannerPage({ initialQuery } = {}) {
    const [mode, setMode] = useState('quick');
    const [view, setView] = useState('main');
    const [productInfo, setProductInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);
    const [barcodeInput, setBarcode] = useState(initialQuery || '');
    const [history, setHistory] = useState([]);
    
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
        if (user && trialStatus.hasCoreAccess) loadHistory();
        else setHistory([]);
    }, [user, trialStatus.hasCoreAccess, loadHistory]);

    const handleLookup = useCallback(async (scannedBarcode, scanMethod = 'manual') => {
        if (!user) { openAuthModal('login'); return; }
        if (!scannedBarcode) { setError('Please enter a barcode or PLU code.'); return; }
        const len = scannedBarcode.length;
        if (len < 4 || len > 14) { setError('Please enter a valid barcode (4–5 digits for PLU, or 8–14 digits for UPC/EAN).'); return; }
        // PLU codes are 4-5 digits, always valid, skip further checks
        setIsLoading(true);
        setError('');
        setProductInfo(null);
        setBarcode(scannedBarcode);
        try {
            const { data } = await base44.functions.invoke('lookupBarcode', { barcode: scannedBarcode });
            if (data) {
                setProductInfo(data);
                if (data.source !== 'Not Found' && trialStatus.hasCoreAccess) {
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
                        sendFeatureUsageEmail(user, 'barcode_scan', { productName: data.name, brand: data.brand, barcode: scannedBarcode, riskLevel: data.riskAssessment?.overallRisk, ingredientCount: data.ingredients?.length || 0 });
                    } catch {}
                }
            } else throw new Error("No data returned.");
        } catch (err) {
            setError(err.response?.data?.error || 'Could not fetch product data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [loadHistory, user, openAuthModal, trialStatus.hasCoreAccess]);

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

    const subMode = QUICK_SUB_MODES.find(m => m.id === quickSubMode);

    return (
        <>
        <LiveScanner isOpen={isLiveScannerOpen} onClose={() => setIsLiveScannerOpen(false)} onScanSuccess={handleScanSuccess} />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        <ConsumerWorkbench toolId="scanner" tag={subMode?.label}>
            <ModeTabs label="Scanner mode" modes={QUICK_SUB_MODES} value={quickSubMode} onChange={(id) => { setQuickSubMode(id); if (id === 'scan') { setProductInfo(null); setError(''); } }} />

            {quickSubMode === 'bulk' && <BulkScanDashboard user={user} />}
            {quickSubMode === 'compare' && <div className="pb-12"><CompareProducts user={user} /></div>}

            {quickSubMode === 'scan' && (
                <WorkbenchGrid>
                    <SetupRail label="Input" title="Scan a product">
                        <form onSubmit={handleManualSubmit} className="space-y-2">
                            <label htmlFor="barcode-input" className="block text-sm font-medium">Barcode</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-research-muted" />
                                <Input
                                    id="barcode-input"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="UPC, EAN or PLU code"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="pl-9"
                                    disabled={isLoading || isUploading}
                                />
                            </div>
                            <BarcodeHint barcode={barcodeInput} />
                            <button type="submit" className="research-primary w-full disabled:opacity-50" disabled={isLoading || isUploading || !barcodeInput}>
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Scan className="w-4 h-4" /> Analyze product</>}
                            </button>
                        </form>

                        <div className="flex items-center gap-3"><div className="flex-1 h-px bg-research-border" /><span className="research-label">or scan with</span><div className="flex-1 h-px bg-research-border" /></div>

                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setIsLiveScannerOpen(true)} disabled={isUploading} className="flex flex-col items-center gap-2 rounded-lg border border-research-border p-4 hover:border-research-accent hover:bg-research-soft transition-colors">
                                <Camera className="w-5 h-5 text-research-accent" />
                                <span className="text-sm font-medium">Camera</span>
                                <span className="text-xs text-research-muted">Scan live</span>
                            </button>
                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex flex-col items-center gap-2 rounded-lg border border-research-border p-4 hover:border-research-accent hover:bg-research-soft transition-colors">
                                {isUploading ? <Loader2 className="w-5 h-5 text-research-accent animate-spin" /> : <UploadCloud className="w-5 h-5 text-research-accent" />}
                                <span className="text-sm font-medium">Upload image</span>
                                <span className="text-xs text-research-muted">Photo of barcode</span>
                            </button>
                        </div>

                        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                        <Link to="/MobileScan" className="flex items-center gap-2 rounded-lg border border-dashed border-research-border px-3 py-3 text-sm text-research-muted hover:border-research-accent hover:text-research-accent">
                            <Smartphone className="w-4 h-4" /> Full-screen mobile scanner <ArrowRight className="w-4 h-4 ml-auto" />
                        </Link>

                        {history.length > 0 && (
                            <div className="border-t border-research-border pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="research-label">Recent scans</p>
                                    <button type="button" onClick={() => { setProductInfo(null); setView('history'); }} className="text-xs text-research-accent hover:underline">View all ({history.length})</button>
                                </div>
                                <ul className="space-y-1">
                                    {history.slice(0, 4).map(item => (
                                        <li key={item.id}>
                                            <button type="button" onClick={() => handleHistorySelect(item.barcode)} className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-research-soft">
                                                <History className="w-3.5 h-3.5 text-research-muted shrink-0" />
                                                <span className="text-sm truncate flex-1">{item.product_name || item.barcode}</span>
                                                <span className="font-mono text-[11px] text-research-muted">{item.barcode}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </SetupRail>

                    <ResultsRail
                        hasOutput={!!productInfo || view === 'history'}
                        isRunning={isLoading || isUploading}
                        runningText={isUploading ? 'Reading the barcode from your photo…' : 'Looking up the product and rating its ingredients…'}
                        emptyTitle="Your product analysis will appear here"
                        emptyText="Enter a barcode, scan with your camera or upload a photo. You'll get an overall score, safety and eco ratings, and every ingredient rated."
                        tag={productInfo?.source && productInfo.source !== 'Not Found' ? productInfo.source : undefined}
                        emptyExtra={
                            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
                                {[['01', 'Overall score'], ['02', 'What’s inside'], ['03', 'Safety & impact']].map(([n, t]) => (
                                    <div key={n} className="rounded-lg border border-research-border p-3"><p className="font-mono text-[11px] text-research-accent">{n}</p><p className="text-xs mt-1">{t}</p></div>
                                ))}
                            </div>
                        }
                    >
                        {productInfo && !isLoading && <BarcodeAnalysis product={productInfo} onClear={clearSearch} user={user} />}
                        {!productInfo && view === 'history' && (
                            <div className="rounded-xl border border-research-border bg-research-card overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-research-border">
                                    <button type="button" onClick={() => setView('main')} className="p-1.5 rounded-lg hover:bg-research-soft" aria-label="Back"><ChevronLeft className="w-5 h-5" /></button>
                                    <h3 className="!text-base">Scan history</h3>
                                    <span className="ml-auto text-xs text-research-muted">{history.length} scans</span>
                                </div>
                                <div className="p-4">
                                    <PremiumFeatureGate featureName="Saved scan history"><BarcodeHistory history={history} onSelect={handleHistorySelect} onDelete={handleDeleteHistory} /></PremiumFeatureGate>
                                </div>
                            </div>
                        )}
                    </ResultsRail>
                </WorkbenchGrid>
            )}
        </ConsumerWorkbench>
        </>
    );
}