import React from 'react';
import PremiumFeatureGate from '../components/shared/PremiumFeatureGate';
import ComplianceDashboard from '../components/compliance/ComplianceDashboard';

export default function ComplianceCoPilot() {
  return (
    <PremiumFeatureGate
      featureName="AI Compliance Co-Pilot"
      featureDescription="Automate regulatory compliance checks across global markets with AI-powered analysis."
    >
      <ComplianceDashboard />
    </PremiumFeatureGate>
  );
}