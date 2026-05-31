import React from 'react';
import MolecularEditor3D from '@/components/simulation/MolecularEditor3D';

export default function MolecularVisualization() {
  return (
    <div className="min-h-screen bg-[#0d1117]" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MolecularEditor3D />
      </div>
    </div>
  );
}