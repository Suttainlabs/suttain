import React, { useState, useContext } from 'react';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
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

  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <AuthGate
          featureName="Compliance Co-Pilot"
          featureDescription="Automate regulatory compliance checks across global markets with intelligent analysis."
        />
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}