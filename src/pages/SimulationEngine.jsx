import React, { useContext } from 'react';
import AuthContext from '../components/auth/AuthContext';
import AuthGate from '../components/auth/AuthGate';
import SimulationEngine from '../components/simulator/SimulationEngine';

export default function SimulationEnginePage() {
  const { user } = useContext(AuthContext);
  return (
    <AuthGate featureName="Formula Simulation Engine" featureDescription="Adjust ingredient percentages and see live cost and sustainability score updates for your formulas.">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-purple-50/20 py-8 pb-24">
        <SimulationEngine />
      </div>
    </AuthGate>
  );
}