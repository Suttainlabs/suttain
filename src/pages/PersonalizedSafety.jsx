import React, { useContext } from 'react';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import PersonalizedSafetyDashboard from '../components/safety/PersonalizedSafetyDashboard';

export default function PersonalizedSafety() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <AuthGate
          featureName="Personalized Safety Alerts"
          featureDescription="Get safety alerts tailored to your personal health profile and sensitivities."
        />
      </div>
    );
  }

  return <PersonalizedSafetyDashboard />;
}