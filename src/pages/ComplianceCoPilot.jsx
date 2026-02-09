import React, { useState } from 'react';
import PremiumFeatureGate from '../components/shared/PremiumFeatureGate';
import ComplianceDashboard from '../components/compliance/ComplianceDashboard';
import NewComplianceCheck from '../components/compliance/NewComplianceCheck';
import ComplianceSettings from '../components/compliance/ComplianceSettings';
import ComplianceResultDisplay from '../components/compliance/ComplianceResultDisplay';

export default function ComplianceCoPilot() {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'new' | 'settings' | 'view'
  const [selectedCheck, setSelectedCheck] = useState(null);

  const handleNewCheck = () => setView('new');
  const handleSettings = () => setView('settings');
  const handleBack = () => {
    setView('dashboard');
    setSelectedCheck(null);
  };
  const handleViewCheck = (check) => {
    setSelectedCheck(check);
    setView('view');
  };

  return (
    <PremiumFeatureGate
      featureName="AI Compliance Co-Pilot"
      featureDescription="Automate regulatory compliance checks across global markets with AI-powered analysis."
    >
      {view === 'dashboard' && (
        <ComplianceDashboard 
          onNewCheck={handleNewCheck}
          onSettings={handleSettings}
          onViewCheck={handleViewCheck}
        />
      )}
      {view === 'new' && (
        <NewComplianceCheck 
          onBack={handleBack}
          onComplete={handleBack}
        />
      )}
      {view === 'settings' && (
        <ComplianceSettings onBack={handleBack} />
      )}
      {view === 'view' && selectedCheck && (
        <ComplianceResultDisplay 
          result={{
            summary: selectedCheck.summary,
            checked_regions: selectedCheck.checked_regions,
            compliance_details: selectedCheck.compliance_details,
            predictive_insights: selectedCheck.predictive_insights
          }}
          productName={`${selectedCheck.product_brand || ''} ${selectedCheck.product_name}`.trim()}
          onBack={handleBack}
        />
      )}
    </PremiumFeatureGate>
  );
}