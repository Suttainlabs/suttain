import React, { useContext } from 'react';
import BarcodeScannerPage from '../components/scanner/BarcodeScannerPage';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';

export default function BarcodeScanner() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                 <AuthGate 
                    featureName="Barcode Scanner"
                    featureDescription="Want to scan a product? Start your 14-day free trial to instantly analyze product ingredients from a barcode."
                />
            </div>
        );
    }
    return <BarcodeScannerPage />;
}