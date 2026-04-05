import React from 'react';
import ComparisonViewer from '../components/simulation/ComparisonViewer';
import AuthGate from '../components/auth/AuthGate';
import { motion } from 'framer-motion';
import { Zap, BookOpen } from 'lucide-react';

export default function StructureComparison() {
  return (
    <AuthGate featureName="Structure Comparison" featureDescription="Compare two simulation outputs side-by-side with visual analysis of geometric differences.">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Structure Comparison</h1>
              <p className="text-slate-600 text-sm mt-1">Load two simulation outputs and visually inspect atomic structure differences</p>
            </div>
          </div>
        </motion.div>

        {/* Main Viewer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
          <ComparisonViewer />
        </motion.div>

        {/* Guide */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How to use:</p>
              <ul className="text-xs space-y-1 text-blue-800">
                <li>• <strong>Load structures:</strong> Enter PDB IDs, molecule names, or SMILES strings on each side</li>
                <li>• <strong>Adjust view:</strong> Use style and color scheme dropdowns for each panel</li>
                <li>• <strong>Align & compare:</strong> Click "Align & Show Differences" to overlay structures and highlight geometric deviations</li>
                <li>• <strong>Export:</strong> Download side-by-side comparison images</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AuthGate>
  );
}