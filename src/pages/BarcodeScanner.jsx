import React, { useContext } from 'react';
import BarcodeScannerPage from '../components/scanner/BarcodeScannerPage';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import useTrialStatus from '../hooks/useTrialStatus';
import TrialExpiredBanner from '../components/trial/TrialExpiredBanner';
import { ProductDataPanel, IngredientAnalysisPanel, InteractionAnalysisPanel } from '@/components/scanner/ProductPanels';
import ScanResultsCharts from '@/components/scanner/ScanResultsCharts';

export default function BarcodeScanner() {
    const { user } = useContext(AuthContext);
    const trialStatus = useTrialStatus(user);
    const initialQuery = new URLSearchParams(window.location.search).get('q') || '';

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#EDF7F2' }}>
                 <AuthGate 
                    featureName="Barcode Scanner"
                    featureDescription="Sign up free to scan any product and get instant ingredient safety analysis."
                />
            </div>
        );
    }

    // Quick Scan is free for all users — no limit gate
    return (
        <div>
            <BarcodeScannerPage initialQuery={initialQuery} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 border-t border-slate-200 mt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Product Data and Safety Analysis</h2>
                <p className="text-sm text-slate-500 mb-4">Look up any product by barcode or name, analyze ingredient safety, and check interactions. Full source transparency.</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <ProductDataPanel />
                    <IngredientAnalysisPanel />
                </div>
                <div className="mt-4">
                    <InteractionAnalysisPanel />
                </div>
                <div className="mt-4">
                    <ScanResultsCharts />
                </div>
            </div>
        </div>
    );
}