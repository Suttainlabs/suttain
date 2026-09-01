import React, { useContext } from 'react';
import BarcodeScannerPage from '../components/scanner/BarcodeScannerPage';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';

export default function BarcodeScanner() {
    const { user } = useContext(AuthContext);
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

    return (
        <div>
            <BarcodeScannerPage initialQuery={initialQuery} />
        </div>
    );
}