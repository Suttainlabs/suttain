import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MolecularViewer3D from '@/components/molecular/MolecularViewer3D';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MolecularVisualization() {
  const [selectedMolecule, setSelectedMolecule] = useState('Water');

  const molecules = [
    { name: 'Water', smiles: 'O', description: 'H2O - Essential for life' },
    { name: 'Methane', smiles: 'C', description: 'CH4 - Simple hydrocarbon' },
    { name: 'Ethanol', smiles: 'CCO', description: 'C2H5OH - Alcohol' },
    { name: 'Acetone', smiles: 'CC(=O)C', description: 'C3H6O - Ketone solvent' },
  ];

  const selectedMol = molecules.find(m => m.name === selectedMolecule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Molecular Visualization</h1>
          <p className="text-slate-600">Explore 3D structures of chemical compounds with interactive controls</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Molecule Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Molecules</CardTitle>
                <CardDescription>Select a compound to visualize</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {molecules.map(mol => (
                  <button
                    key={mol.name}
                    onClick={() => setSelectedMolecule(mol.name)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedMolecule === mol.name
                        ? 'bg-teal-100 border-2 border-teal-600 text-teal-900'
                        : 'bg-slate-100 border-2 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    <p className="font-semibold text-sm">{mol.name}</p>
                    <p className="text-xs text-slate-600 mt-1">{mol.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">Rotate</p>
                  <p>Click and drag on the molecule</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Zoom</p>
                  <p>Use the zoom in/out buttons</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Auto-Rotate</p>
                  <p>Toggle rotation animation</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Export</p>
                  <p>Download as PNG image</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{selectedMol?.name}</CardTitle>
                <CardDescription className="space-y-1">
                  <p>SMILES: {selectedMol?.smiles}</p>
                  <p>{selectedMol?.description}</p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MolecularViewer3D
                  molecule={selectedMol?.name}
                  smiles={selectedMol?.smiles}
                  canvasHeight={600}
                />

                {/* Info Section */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">About This Visualization</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    This interactive 3D molecular viewer displays the structure of chemical compounds. You can rotate, zoom, and analyze molecular geometries to understand chemical properties better.
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Atom Colors:</strong> Carbon (Gray) • Oxygen (Red) • Nitrogen (Teal) • Hydrogen (White)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}