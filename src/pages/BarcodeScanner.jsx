import React, { useContext } from 'react';
import BarcodeScannerPage from '../components/scanner/BarcodeScannerPage';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import useTrialStatus from '../hooks/useTrialStatus';
import TrialExpiredBanner from '../components/trial/TrialExpiredBanner';

export default function BarcodeScanner() {
    const { user } = useContext(AuthContext);
    const trialStatus = useTrialStatus(user);

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                 <AuthGate 
                    featureName="Barcode Scanner"
                    featureDescription="Sign up free to scan products. Free tier includes 2 scans per month."
                />
            </div>
        );
    }

    if (!trialStatus.isPro && !trialStatus.canScan) {
        return <TrialExpiredBanner featureName="Quick Scan" />;
    }

    return <BarcodeScannerPage />;
}