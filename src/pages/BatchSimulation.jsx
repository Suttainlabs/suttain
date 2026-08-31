import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';
import BatchResultsTable from '../components/batch-simulation/BatchResultsTable';
import { parseCSV } from '../utils/csvParser';
import useTrialStatus from '../hooks/useTrialStatus';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const UploadArea = ({ onFile, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    setError('');
    onFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card className="border-2 border-dashed">
      <CardContent
        className={`p-12 text-center cursor-pointer transition-all ${
          dragActive ? 'bg-violet-50 border-violet-400' : 'hover:bg-slate-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Upload CSV File</p>
            <p className="text-sm text-slate-500 mt-1">
              Drag & drop or{' '}
              <label className="text-violet-600 hover:underline cursor-pointer">
                browse
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            CSV format: One chemical combination per row. Columns = chemicals (min 2 per row)
          </p>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function BatchSimulation() {
  const { user } = useContext(AuthContext);
  const trialStatus = useTrialStatus(user);
  const [combinations, setCombinations] = useState([]);
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const canAccess = !user || trialStatus.isPro || trialStatus.trialDaysLeft > 0;

  const handleCSVUpload = async (file) => {
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setCombinations(parsed);
      setResults([]);
      setUploadError('');
      setError('');
    } catch (err) {
      setUploadError(err.message);
    }
  };

  const runBatchSimulation = async () => {
    if (combinations.length === 0) return;
    setIsRunning(true);
    setError('');
    setResults(combinations.map(c => ({ ...c, processing: true })));

    const processed = [...combinations];
    let completed = 0;

    for (let i = 0; i < combinations.length; i++) {
      try {
        const combo = combinations[i];
        const prompt = `Analyze the chemical interaction and safety risk of mixing these chemicals: ${combo.chemicals.join(', ')}.

Return a JSON response with:
1. risk_score (0-100)
2. reaction_summary (brief text)
3. health_impact (0-100)
4. environmental_impact (0-100)
5. voc_level (0-100)
6. reactivity (0-100)
7. hazard_symbols (array: toxic, flammable, corrosive, irritant, environmental)
8. ai_recommendation (safety text)`;

        const response = await base44.functions.invoke('runConsumerLLM', {
          operation: 'batchSimulation',
          data: { chemicals: combo.chemicals }
        });

        processed[i] = { ...combo, ...response, processing: false };
        completed++;
        setResults([...processed]);
      } catch (err) {
        console.error(`Error analyzing combination ${i + 1}:`, err);
        processed[i] = { ...processed[i], error: err.message, processing: false };
        setResults([...processed]);
      }
    }

    setIsRunning(false);
  };

  if (user && !canAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-violet-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pro Feature</h2>
          <p className="text-slate-600 mb-6">Batch Simulations require a Pro subscription to run multiple combinations at once.</p>
          <div className="space-y-3">
            <Link to={createPageUrl('Pricing')} className="block w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
              Upgrade to Pro
            </Link>
            <Link to="/" className="block w-full text-slate-500 hover:text-slate-700 text-sm py-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGate featureName="Batch Simulation" featureDescription="Upload CSV files and run batch chemical simulations.">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <FileText className="w-4 h-4" /> Batch Simulation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Batch Chemical Simulations</h1>
          <p className="text-slate-600 max-w-2xl text-base">
            Upload a CSV file with multiple chemical combinations and run simulations in batch. Get aggregate risk analysis and export results.
          </p>
        </motion.div>

        {/* Upload Section */}
        {combinations.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <UploadArea onFile={handleCSVUpload} isProcessing={isRunning} />
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-semibold text-sm">Upload Error</p>
                  <p className="text-red-600 text-xs mt-1">{uploadError}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Combinations Info */}
        {combinations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-blue-800 font-semibold text-sm">
                  {combinations.length} Combination{combinations.length !== 1 ? 's' : ''} Loaded
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  Ready to simulate. Click below to start analysis.
                </p>
              </div>
              <button
                onClick={() => {
                  setCombinations([]);
                  setResults([]);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Run Button */}
        {combinations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex gap-3">
            <Button
              onClick={runBatchSimulation}
              disabled={isRunning}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold px-8 gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Running...
                </>
              ) : (
                <>Run Simulations</>
              )}
            </Button>
            {isRunning && (
              <p className="text-sm text-slate-500 flex items-center">
                Processing {results.filter(r => r.risk_score).length} of {combinations.length}...
              </p>
            )}
          </motion.div>
        )}

        {/* Results */}
        {(results.length > 0 || isRunning) && <BatchResultsTable results={results} isRunning={isRunning} />}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Example CSV */}
        {combinations.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSV Format Example</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-green-300 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                  {`Chemical1,Chemical2,Chemical3
Sodium Hydroxide,Acetone,Water
Bleach,Ammonia,Vinegar
Hydrogen Peroxide,Iron Oxide,Alcohol`}
                </pre>
                <p className="text-sm text-slate-600 mt-3">
                  Each row = one combination. Minimum 2 chemicals per row. Save as .csv and upload above.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AuthGate>
  );
}