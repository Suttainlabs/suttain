import React from 'react';
import PremiumFeatureGate from '../components/shared/PremiumFeatureGate';
import PersonalizedSafetyDashboard from '../components/safety/PersonalizedSafetyDashboard';

export default function PersonalizedSafety() {
  return (
    <PremiumFeatureGate
      featureName="Personalized Safety Alerts"
      featureDescription="Get safety alerts tailored to your personal health profile and sensitivities."
    >
      <PersonalizedSafetyDashboard />
    </PremiumFeatureGate>
  );
}