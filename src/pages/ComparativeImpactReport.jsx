import React, { useContext } from 'react';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import ComparativeImpactReport from '../components/sustainability/ComparativeImpactReport';

export default function ComparativeImpactReportPage() {
  const { user } = useContext(AuthContext);
  return (
    <AuthGate featureName="Comparative Impact Report" featureDescription="Benchmark your formula's sustainability against industry standards and get AI-powered improvement advice.">
      <div className="min-h-screen py-8 pb-24" style={{ backgroundColor: '#EDF7F2' }}>
        <ComparativeImpactReport />
      </div>
    </AuthGate>
  );
}