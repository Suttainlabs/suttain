import React from 'react';
import PremiumFeatureGate from '../components/shared/PremiumFeatureGate';

export default function Sustainability() {
  return (
    <PremiumFeatureGate
      featureName="Sustainability Scoring"
      featureDescription="Analyze and improve your product's environmental impact with comprehensive sustainability metrics."
    >
      <div className="p-8 text-center">
        <p className="text-slate-600">Sustainability dashboard coming soon...</p>
      </div>
    </PremiumFeatureGate>
  );
}