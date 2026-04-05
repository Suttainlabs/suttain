import React, { useContext } from 'react';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import ImpactDashboard from '../components/sustainability/ImpactDashboard';

export default function SustainabilityImpact() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <AuthGate
                featureName="Sustainability Impact Dashboard"
                featureDescription="Track your eco-friendly shopping choices, earn badges, and see your carbon footprint reduction over time."
            />
        );
    }

    return <ImpactDashboard user={user} />;
}