import React, { useState } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyzeAndCreateAlerts } from './safetyAlertUtils';
import { base44 } from '@/api/base44Client';
import { TestTube, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SafetyAlertDemo({ profile }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const testProduct = {
    name: 'Test Sunscreen with Oxybenzone',
    ingredients: ['Water', 'Oxybenzone', 'Octinoxate', 'Avobenzone', 'Fragrance', 'Parabens']
  };

  const handleTestAlert = async () => {
    if (!profile) {
      alert('Please create a safety profile first');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const user = await base44.auth.me();
      
      const analysisResult = await analyzeAndCreateAlerts({
        productName: testProduct.name,
        ingredients: testProduct.ingredients,
        alertType: 'product_scan',
        profileId: profile.id,
        userEmail: user.email,
        additionalContext: {
          test_mode: true,
          source: 'demo'
        }
      });

      setResult(analysisResult);
    } catch (error) {
      console.error('Test alert failed:', error);
      alert('Failed to create test alert');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <TestTube className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Test Alert System
            </CardTitle>
            <CardDescription className="text-indigo-700 text-sm mt-1">
              Try the system with a sample product
            </CardDescription>
          </div>
        </div>
      </div>
      <CardContent className="p-6">

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 mb-5 border border-slate-200 shadow-inner">
          <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TestTube className="w-4 h-4 text-indigo-600" />
            Sample Test Product:
          </p>
          <p className="text-base font-bold text-slate-800 mb-3">{testProduct.name}</p>
          <div className="flex flex-wrap gap-2">
            {testProduct.ingredients.map((ing, index) => (
              <Badge key={index} className="bg-white border-2 border-indigo-200 text-indigo-900 text-xs font-medium">
                {ing}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleTestAlert}
          disabled={isAnalyzing || !profile}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] py-6 text-base"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing & Sending Alert...
            </>
          ) : (
            <>
              <TestTube className="w-5 h-5 mr-2" />
              Run Test Analysis
            </>
          )}
        </Button>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-green-900 text-lg">Test Complete!</span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-green-800">
                <strong>Severity:</strong>{' '}
                <Badge className={`ml-1 ${
                  result.analysis.severity === 'critical' ? 'bg-red-600' :
                  result.analysis.severity === 'high' ? 'bg-orange-600' :
                  result.analysis.severity === 'medium' ? 'bg-yellow-600' :
                  'bg-blue-600'
                } text-white`}>
                  {result.analysis.severity}
                </Badge>
              </p>
              <p className="text-green-800">
                <strong>Alert Message:</strong> {result.analysis.alert_message}
              </p>
              <p className="text-green-800">
                <strong>Flagged Ingredients:</strong> {result.analysis.flagged_ingredients?.length || 0}
              </p>
              {result.shouldWarn && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800 font-medium">
                    📧 Email notification sent to your inbox with full details
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}