import React, { useContext } from 'react';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import NutriScanApp from '../components/nutriscan/NutriScanApp';

export default function NutriScan() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 bg-slate-50">
                <AuthGate
                    featureName="NutriScan 2.0"
                    featureDescription="Sign up free to analyze any food's molecular profile, chemical safety, and body system impact."
                />
            </div>
        );
    }

    return <NutriScanApp user={user} />;
}