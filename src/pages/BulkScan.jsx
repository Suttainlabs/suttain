import React, { useContext } from 'react';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import BulkScanDashboard from '../components/scanner/BulkScanDashboard';

export default function BulkScan() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4">
                <AuthGate
                    featureName="Bulk Scan"
                    featureDescription="Sign up free to scan your entire grocery haul and get a consolidated health & sustainability report."
                />
            </div>
        );
    }

    return <BulkScanDashboard user={user} />;
}