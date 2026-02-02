import React from 'react';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import AuthGate from '../components/auth/AuthGate';

export default function ReportsPage() {
  return (
    <AuthGate featureName="Reports">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReportsDashboard />
        </div>
      </div>
    </AuthGate>
  );
}