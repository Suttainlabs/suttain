import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarcodeHistory as BarcodeHistoryEntity } from '@/entities/BarcodeHistory';
import AuthContext from '../auth/AuthContext';
import LiveScanner from './LiveScanner';
import BarcodeAnalysis from './ProductAnalysis';
import BarcodeHistory from './BarcodeHistory';
import RegulatoryScanner from '../compliance/RegulatoryScanner';
import { base44 } from '@/api/base44Client';
import { History, Camera, Loader2, Search, ChevronLeft, UploadCloud, ShoppingCart, QrCode, Globe } from 'lucide-react';
import BulkScanDashboard from './BulkScanDashboard';
import ToolFeedbackToast from '../shared/ToolFeedbackToast';
import { sendFeatureUsageEmail } from '../shared/featureNotifications';
import { incrementUsage } from '../../utils/usageTracker';
import useTrialStatus from '../../hooks/useTrialStatus';

const containerVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.3, ease: 'easeInOut' } }
};

const BarcodeHint = ({ barcode }) => {
    if (!barcode) return <p className="text-sm text-slate-500 text-center h-5">Enter 12-14 digits for most product barcodes.</p>;
    
    let hint = '';
    const len = barcode.length;

    if (len === 12) hint = 'This looks like a UPC-A barcode.';
    else if (len === 13) hint = 'This looks like an EAN-13 barcode.';
    else if (len > 8 && len < 12) hint = 'Searching... Most barcodes are 12-13 digits.';
    else if (len < 8 || len > 14) hint = 'Invalid length. Most barcodes are 12-14 digits.';

    return <p className="text-sm text-slate-500 text-center h-5">{hint}</p>;
};

export default function BarcodeScannerPage() {
    const [mode, setMode] = useState('quick'); // quick, bulk
    const [view, setView] = useState('main'); // main, history
    const [productInfo, setProductInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);
    const [barcodeInput, setBarcode] = useState('');
    const [history, setHistory] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showRegulatoryCheck, setShowRegulatoryCheck] = useState(false);
    const fileInputRef = useRef(null);

    const { user, openAuthModal, refreshUser } = useContext(AuthContext);
    const trialStatus = useTrialStatus(user);

    const loadHistory = useCallback(async () => {
        try {
            const historyItems = await BarcodeHistoryEntity.list('-created_date', 5); // Show 5 for better history view
            setHistory(historyItems);
        } catch (error) {
            console.error('Failed to load scan history:', error);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadHistory();
        } else {
            setHistory([]);
        }
    }, [user, loadHistory]);

    const handleLookup = useCallback(async (scannedBarcode, scanMethod = 'manual') => {
        if (!user) {
            openAuthModal('login');
            return;
        }
        if (!scannedBarcode) {
            setError('Please enter a valid barcode.');
            return;
        }
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
                       // Auto-save to Workspace
                       base44.entities.WorkspaceSession.create({
                         title: data.name || `Scan: ${scannedBarcode}`,
                         type: 'scan',
                         notes: `Scanned via ${scanMethod}`,
                         snapshot: {
                           barcode: scannedBarcode,
                           product_name: data.name,
                           brand: data.brand,
                           risk_level: data.riskAssessment?.overallRisk,
                           ingredient_count: data.ingredients?.length || 0
                         }
                       }).catch(() => {});
                       loadHistory();
                       setShowFeedback(true);
                       setTimeout(() => setShowFeedback(false), 12000);

                       // Send email notification
                       sendFeatureUsageEmail(user, 'barcode_scan', {
                         productName: data.name,
                         brand: data.brand,
                         barcode: scannedBarcode,
                         riskLevel: data.riskAssessment?.overallRisk,
                         ingredientCount: data.ingredients?.length || 0
                       });
                    } catch (historyError){
                       console.error("Failed to save history:", historyError)
                    }
                }
            } else {
                throw new Error("No data returned from lookup.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred while fetching product data.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [loadHistory, user, openAuthModal]);

    const handleScanSuccess = (scannedBarcode) => {
        setIsLiveScannerOpen(false);
        handleLookup(scannedBarcode, 'live_scan');
    };
    
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setIsUploading(true);

        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            if (!file_url) throw new Error("File upload failed.");
            
            const { data: scanResult } = await base44.functions.invoke('scanBarcodeFromImage', { file_url });
            if (!scanResult?.barcode) throw new Error(scanResult?.error || "No barcode could be detected in the image.");
            
            handleLookup(scanResult.barcode, 'image_upload');
        } catch (e) {
            console.error("Error processing uploaded barcode image:", e);
            setError(e.message || "Could not process the image. Please use a clear photo.");
        } finally {
            setIsUploading(false);
            // Reset file input so the same file can be selected again
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleHistorySelect = (selectedBarcode) => {
        handleLookup(selectedBarcode, 'history');
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        handleLookup(barcodeInput);
    };

    const clearSearch = () => {
        setProductInfo(null);
        setError('');
        setBarcode('');
        setView('main');
    };

    return (
        <>
        <ToolFeedbackToast
            isOpen={showFeedback}
            onClose={() => setShowFeedback(false)}
            feature="scanner"
            featureLabel="Quick Scan"
            user={user}
            pointsToAward={0}
        />
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 py-12 px-4 sm:px-6 lg:px-8 pb-24 relative overflow-hidden">
            {/* Decorative watermarks */}
            <div className="absolute top-10 right-0 w-48 h-48 opacity-5 pointer-events-none hidden lg:block">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/61947ef64_bright-travel-pack-of-hygiene-product-mini-packag-2026-01-07-00-44-39-utc.jpg"
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-20 left-0 w-40 h-40 opacity-5 pointer-events-none hidden lg:block">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688eaf737ea3b621021f8bac/bf10a155b_close-up-view-of-female-customer-refilling-deterge-2026-01-07-01-28-58-utc.jpg"
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <LiveScanner 
                isOpen={isLiveScannerOpen}
                onClose={() => setIsLiveScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />
            
            {/* Mode tabs */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setMode('quick')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                            mode === 'quick'
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow'
                                : 'text-slate-600 hover:text-slate-800'
                        }`}
                    >
                        <QrCode className="w-4 h-4" />
                        Quick Scan
                    </button>
                    <button
                        onClick={() => setMode('bulk')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                            mode === 'bulk'
                                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow'
                                : 'text-slate-600 hover:text-slate-800'
                        }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Bulk Scan
                    </button>
                </div>
            </div>

            {mode === 'bulk' && <BulkScanDashboard user={user} />}

            {mode === 'quick' && (
            <header className="text-center mb-12 max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 gradient-text">
                      Product Quick Scan
                  </h1>
                  <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                      Instantly analyze product ingredients, safety, and sustainability by scanning a barcode.
                  </p>
              </motion.div>
            </header>)}

            {mode === 'quick' && (
            <div className="max-w-xl mx-auto">
                <AnimatePresence mode="wait">
                    {productInfo ? (
                        <motion.div key="analysis" variants={containerVariants} initial="initial" animate="animate" exit="exit">
                            <BarcodeAnalysis product={productInfo} onClear={clearSearch} user={user} />
                            {showRegulatoryCheck && (
                              <div className="mt-6">
                                <RegulatoryScanner 
                                  ingredients={productInfo.ingredients?.map(ing => ({ chemical_name: ing }))} 
                                  onClose={() => setShowRegulatoryCheck(false)} 
                                />
                              </div>
                            )}
                            {!showRegulatoryCheck && productInfo.ingredients?.length > 0 && (
                              <Button 
                                onClick={() => setShowRegulatoryCheck(true)} 
                                variant="outline" 
                                className="w-full mt-4 gap-2"
                              >
                                <Globe className="w-4 h-4" />
                                Check Regional Regulations
                              </Button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="scanner" variants={containerVariants} initial="initial" animate="animate" exit="exit">
                           <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
                                <AnimatePresence mode="wait">
                                    {view === 'main' && (
                                        <motion.div key="main" variants={containerVariants} initial="initial" animate="animate" exit="exit">
                                            <CardHeader>
                                                <CardTitle className="text-center text-2xl">Scan or Enter a Barcode</CardTitle>
                                                <CardDescription className="text-center">Type, upload, or use your camera to start.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-4">
                                                <form onSubmit={handleManualSubmit} className="space-y-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter product barcode..."
                                                        value={barcodeInput}
                                                        onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ''))}
                                                        className="h-12 text-lg text-center"
                                                        autoFocus
                                                        disabled={isLoading || isUploading}
                                                    />
                                                    <BarcodeHint barcode={barcodeInput} />
                                                    <Button type="submit" className="w-full h-12 text-base btn-primary" disabled={isLoading || isUploading || !barcodeInput}>
                                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5 mr-2" /> Lookup Barcode</>}
                                                    </Button>
                                                </form>

                                                <div className="relative flex items-center py-2">
                                                    <div className="flex-grow border-t border-slate-300"></div>
                                                    <span className="flex-shrink mx-4 text-slate-500 text-sm font-medium">OR</span>
                                                    <div className="flex-grow border-t border-slate-300"></div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Button onClick={() => setIsLiveScannerOpen(true)} variant="outline" className="w-full h-14 text-lg" disabled={isUploading}>
                                                        <Camera className="w-6 h-6 mr-3" />
                                                        Scan with Camera
                                                    </Button>
                                                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-14 text-lg" disabled={isUploading}>
                                                         {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UploadCloud className="w-6 h-6 mr-3" /> Upload Image</>}
                                                    </Button>
                                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                                </div>
                                                
                                                {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}
                                                
                                                 {history.length > 0 && (
                                                     <div className="text-center pt-2">
                                                         <Button variant="link" onClick={() => setView('history')}>
                                                            <History className="w-4 h-4 mr-2" />
                                                            View Scan History
                                                         </Button>
                                                     </div>
                                                 )}
                                            </CardContent>
                                        </motion.div>
                                    )}
                                    
                                    {view === 'history' && (
                                        <motion.div key="history" variants={containerVariants} initial="initial" animate="animate" exit="exit">
                                            <CardHeader>
                                                <Button variant="ghost" size="sm" onClick={() => setView('main')} className="absolute top-4 left-4 flex items-center gap-1 text-slate-600">
                                                    <ChevronLeft className="w-4 h-4" /> Back
                                                 </Button>
                                                <CardTitle className="text-center text-2xl pt-8">Scan History</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                 <BarcodeHistory history={history} onSelect={handleHistorySelect} />
                                            </CardContent>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                           </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            )}
        </div>
        </>
    );
}