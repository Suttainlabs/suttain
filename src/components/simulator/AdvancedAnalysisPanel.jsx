import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, 
  GitCompare, LineChart, Target, Lightbulb, ArrowUpRight, ArrowDownRight,
  Minus, Info, History, Loader2, RefreshCw, Zap, Shield, Leaf, Heart
} from 'lucide-react';

const TrendIndicator = ({ current, previous, label, inverse = false }) => {
  if (!previous) return null;
  const diff = current - previous;
  const percentChange = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : 0;
  const isPositive = inverse ? diff < 0 : diff > 0;
  const isNeutral = Math.abs(diff) < 2;

  return (
    <div className="flex items-center gap-1 text-xs">
      {isNeutral ? (
        <Minus className="w-3 h-3 text-slate-400" />
      ) : isPositive ? (
        <ArrowUpRight className="w-3 h-3 text-green-500" />
      ) : (
        <ArrowDownRight className="w-3 h-3 text-red-500" />
      )}
      <span className={isNeutral ? 'text-slate-500' : isPositive ? 'text-green-600' : 'text-red-600'}>
        {percentChange > 0 ? '+' : ''}{percentChange}%
      </span>
    </div>
  );
};

const OutlierCard = ({ outlier, type }) => {
  const getOutlierStyling = () => {
    switch (type) {
      case 'high_risk':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-600' };
      case 'unusual_pattern':
        return { bg: 'bg-amber-50', border: 'border-amber-200', icon: Lightbulb, iconColor: 'text-amber-600' };
      case 'positive':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', icon: Info, iconColor: 'text-slate-600' };
    }
  };

  const styling = getOutlierStyling();
  const Icon = styling.icon;

  return (
    <div className={`p-3 ${styling.bg} ${styling.border} border rounded-lg`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${styling.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900">{outlier.title}</p>
          <p className="text-xs text-slate-600 mt-1">{outlier.description}</p>
          {outlier.value && (
            <Badge variant="outline" className="mt-2 text-xs">
              Value: {outlier.value}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const ComparisonRow = ({ label, current, previous, icon: Icon, inverse = false }) => {
  const diff = current - previous;
  const isImproved = inverse ? diff < 0 : diff < 0;
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-500">Previous</p>
          <p className="text-sm font-medium text-slate-600">{previous}</p>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          Math.abs(diff) < 5 ? 'bg-slate-100' : isImproved ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {Math.abs(diff) < 5 ? (
            <Minus className="w-4 h-4 text-slate-500" />
          ) : isImproved ? (
            <TrendingDown className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingUp className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Current</p>
          <p className="text-sm font-bold text-slate-900">{current}</p>
        </div>
      </div>
    </div>
  );
};

export default function AdvancedAnalysisPanel({ currentSimulation, onClose }) {
  const [activeTab, setActiveTab] = useState('trends');
  const [pastSimulations, setPastSimulations] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trends, setTrends] = useState(null);
  const [outliers, setOutliers] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchPastSimulations();
  }, []);

  useEffect(() => {
    if (pastSimulations.length > 0) {
      analyzeTrends();
      detectOutliers();
      generateInsights();
    }
  }, [pastSimulations, currentSimulation]);

  const fetchPastSimulations = async () => {
    setIsLoading(true);
    try {
      const sims = await base44.entities.Simulation.list('-created_date', 20);
      setPastSimulations(sims || []);
      if (sims && sims.length > 1) {
        setSelectedComparison(sims[1]?.id); // Select second most recent for comparison
      }
    } catch (error) {
      console.error('Failed to fetch simulations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeTrends = () => {
    if (pastSimulations.length < 2) {
      setTrends(null);
      return;
    }

    const recentSims = pastSimulations.slice(0, 10);
    
    // Calculate averages and trends
    const avgRiskScore = recentSims.reduce((sum, s) => sum + (s.risk_score || 0), 0) / recentSims.length;
    const avgHealthImpact = recentSims.reduce((sum, s) => sum + (s.health_impact || 0), 0) / recentSims.length;
    const avgEnvImpact = recentSims.reduce((sum, s) => sum + (s.environmental_impact || 0), 0) / recentSims.length;
    const avgReactivity = recentSims.reduce((sum, s) => sum + (s.reactivity || 0), 0) / recentSims.length;

    // Calculate trend direction (comparing first half to second half)
    const firstHalf = recentSims.slice(0, Math.floor(recentSims.length / 2));
    const secondHalf = recentSims.slice(Math.floor(recentSims.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + (s.risk_score || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + (s.risk_score || 0), 0) / secondHalf.length;

    setTrends({
      avgRiskScore: avgRiskScore.toFixed(1),
      avgHealthImpact: avgHealthImpact.toFixed(1),
      avgEnvImpact: avgEnvImpact.toFixed(1),
      avgReactivity: avgReactivity.toFixed(1),
      trendDirection: secondHalfAvg < firstHalfAvg ? 'improving' : secondHalfAvg > firstHalfAvg ? 'declining' : 'stable',
      trendChange: Math.abs(secondHalfAvg - firstHalfAvg).toFixed(1),
      totalSimulations: recentSims.length,
      highRiskCount: recentSims.filter(s => (s.risk_score || 0) >= 70).length,
      safeCount: recentSims.filter(s => (s.risk_score || 0) < 30).length
    });
  };

  const detectOutliers = () => {
    if (pastSimulations.length < 3) {
      setOutliers([]);
      return;
    }

    const detected = [];
    const currentRisk = currentSimulation?.risk_assessment?.overall_risk_score || 0;
    const avgRisk = pastSimulations.reduce((sum, s) => sum + (s.risk_score || 0), 0) / pastSimulations.length;
    const stdDev = Math.sqrt(
      pastSimulations.reduce((sum, s) => sum + Math.pow((s.risk_score || 0) - avgRisk, 2), 0) / pastSimulations.length
    );

    // Check if current simulation is an outlier
    if (currentRisk > avgRisk + (2 * stdDev)) {
      detected.push({
        type: 'high_risk',
        title: 'Unusually High Risk Score',
        description: `This simulation's risk score (${currentRisk}) is significantly higher than your average (${avgRisk.toFixed(1)}).`,
        value: currentRisk
      });
    } else if (currentRisk < avgRisk - (2 * stdDev)) {
      detected.push({
        type: 'positive',
        title: 'Exceptionally Safe Combination',
        description: `This simulation's risk score (${currentRisk}) is significantly lower than your average (${avgRisk.toFixed(1)}).`,
        value: currentRisk
      });
    }

    // Check for unusual chemical patterns
    const chemicals = currentSimulation?.chemicals || [];
    const chemicalFrequency = {};
    pastSimulations.forEach(sim => {
      (sim.chemicals || []).forEach(chem => {
        chemicalFrequency[chem] = (chemicalFrequency[chem] || 0) + 1;
      });
    });

    chemicals.forEach(chem => {
      const name = chem.name || chem;
      if (!chemicalFrequency[name] || chemicalFrequency[name] < 2) {
        detected.push({
          type: 'unusual_pattern',
          title: 'New Chemical in Your History',
          description: `"${name}" is new or rarely used in your simulation history. Review safety data carefully.`,
          value: name
        });
      }
    });

    setOutliers(detected.slice(0, 5)); // Limit to 5 outliers
  };

  const generateInsights = () => {
    if (pastSimulations.length < 2) {
      setInsights([]);
      return;
    }

    const generated = [];
    const currentRisk = currentSimulation?.risk_assessment?.overall_risk_score || 0;
    
    // Risk trend insight
    const recentAvg = pastSimulations.slice(0, 5).reduce((sum, s) => sum + (s.risk_score || 0), 0) / Math.min(5, pastSimulations.length);
    if (currentRisk < recentAvg - 10) {
      generated.push({
        icon: TrendingDown,
        color: 'text-green-600',
        bg: 'bg-green-50',
        title: 'Risk Reduction Success',
        description: 'Your current simulation shows improved safety compared to recent runs.'
      });
    } else if (currentRisk > recentAvg + 10) {
      generated.push({
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        title: 'Elevated Risk Warning',
        description: 'This combination shows higher risk than your recent simulations. Consider alternatives.'
      });
    }

    // Frequency insight
    const totalSims = pastSimulations.length;
    if (totalSims >= 10) {
      const safePercentage = (pastSimulations.filter(s => (s.risk_score || 0) < 40).length / totalSims * 100).toFixed(0);
      generated.push({
        icon: BarChart3,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        title: 'Safety Track Record',
        description: `${safePercentage}% of your ${totalSims} simulations have been in the safe zone (risk < 40).`
      });
    }

    // Chemical diversity insight
    const uniqueChemicals = new Set();
    pastSimulations.forEach(sim => {
      (sim.chemicals || []).forEach(chem => uniqueChemicals.add(chem));
    });
    if (uniqueChemicals.size > 10) {
      generated.push({
        icon: Lightbulb,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        title: 'Diverse Testing',
        description: `You've tested ${uniqueChemicals.size} unique chemicals. Consider creating a reference library.`
      });
    }

    setInsights(generated.slice(0, 4));
  };

  const getComparisonSimulation = () => {
    return pastSimulations.find(s => s.id === selectedComparison);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
        <span className="text-slate-600">Loading analysis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="trends" className="text-xs">
            <LineChart className="w-3.5 h-3.5 mr-1.5" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="outliers" className="text-xs">
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Outliers
          </TabsTrigger>
          <TabsTrigger value="compare" className="text-xs">
            <GitCompare className="w-3.5 h-3.5 mr-1.5" />
            Compare
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {trends ? (
            <>
              {/* Trend Summary Card */}
              <Card className={`border-2 ${
                trends.trendDirection === 'improving' ? 'border-green-200 bg-green-50/50' :
                trends.trendDirection === 'declining' ? 'border-red-200 bg-red-50/50' :
                'border-slate-200 bg-slate-50/50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Overall Trend</p>
                      <p className={`text-lg font-bold capitalize ${
                        trends.trendDirection === 'improving' ? 'text-green-700' :
                        trends.trendDirection === 'declining' ? 'text-red-700' :
                        'text-slate-700'
                      }`}>
                        {trends.trendDirection}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      trends.trendDirection === 'improving' ? 'bg-green-100' :
                      trends.trendDirection === 'declining' ? 'bg-red-100' :
                      'bg-slate-100'
                    }`}>
                      {trends.trendDirection === 'improving' ? (
                        <TrendingDown className="w-6 h-6 text-green-600" />
                      ) : trends.trendDirection === 'declining' ? (
                        <TrendingUp className="w-6 h-6 text-red-600" />
                      ) : (
                        <Minus className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Based on your last {trends.totalSimulations} simulations
                  </p>
                </CardContent>
              </Card>

              {/* Average Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs text-slate-600">Avg Risk Score</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{trends.avgRiskScore}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-slate-600">Avg Health Impact</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{trends.avgHealthImpact}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-slate-600">Avg Env Impact</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{trends.avgEnvImpact}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-slate-600">Avg Reactivity</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{trends.avgReactivity}</p>
                </div>
              </div>

              {/* Distribution Summary */}
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Risk Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">High Risk (≥70)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(trends.highRiskCount / trends.totalSimulations) * 100} className="w-24 h-2" />
                      <span className="text-xs font-medium text-red-600">{trends.highRiskCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Safe (&lt;30)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(trends.safeCount / trends.totalSimulations) * 100} className="w-24 h-2" />
                      <span className="text-xs font-medium text-green-600">{trends.safeCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {insights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900">Insights</h4>
                  {insights.map((insight, idx) => (
                    <div key={idx} className={`p-3 ${insight.bg} rounded-lg flex items-start gap-3`}>
                      <insight.icon className={`w-4 h-4 ${insight.color} mt-0.5 flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{insight.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <LineChart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Not enough data for trend analysis</p>
              <p className="text-xs text-slate-400">Run more simulations to see trends</p>
            </div>
          )}
        </TabsContent>

        {/* Outliers Tab */}
        <TabsContent value="outliers" className="space-y-4">
          {outliers.length > 0 ? (
            <>
              <p className="text-sm text-slate-600">
                Detected {outliers.length} notable pattern{outliers.length !== 1 ? 's' : ''} in this simulation:
              </p>
              <div className="space-y-3">
                {outliers.map((outlier, idx) => (
                  <OutlierCard key={idx} outlier={outlier} type={outlier.type} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500 opacity-50" />
              <p className="text-sm font-medium text-green-700">No Outliers Detected</p>
              <p className="text-xs text-slate-400 mt-1">This simulation is within normal parameters</p>
            </div>
          )}
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-4">
          {pastSimulations.length > 1 ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Compare with:</span>
                <Select value={selectedComparison} onValueChange={setSelectedComparison}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select simulation" />
                  </SelectTrigger>
                  <SelectContent>
                    {pastSimulations.slice(1, 10).map((sim) => (
                      <SelectItem key={sim.id} value={sim.id}>
                        {(sim.chemicals || []).slice(0, 2).join(' + ')} - {new Date(sim.created_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedComparison && getComparisonSimulation() && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-indigo-600" />
                      Comparison Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <ComparisonRow
                      label="Risk Score"
                      current={currentSimulation?.risk_assessment?.overall_risk_score || 0}
                      previous={getComparisonSimulation()?.risk_score || 0}
                      icon={Shield}
                      inverse
                    />
                    <ComparisonRow
                      label="Health Impact"
                      current={currentSimulation?.risk_assessment?.health_impact_score || 0}
                      previous={getComparisonSimulation()?.health_impact || 0}
                      icon={Heart}
                      inverse
                    />
                    <ComparisonRow
                      label="Environmental"
                      current={currentSimulation?.risk_assessment?.environmental_impact_score || 0}
                      previous={getComparisonSimulation()?.environmental_impact || 0}
                      icon={Leaf}
                      inverse
                    />
                    <ComparisonRow
                      label="Reactivity"
                      current={currentSimulation?.risk_assessment?.reactivity_score || 0}
                      previous={getComparisonSimulation()?.reactivity || 0}
                      icon={Zap}
                      inverse
                    />
                  </CardContent>
                </Card>
              )}

              {/* Comparison chemicals */}
              {selectedComparison && getComparisonSimulation() && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-900 mb-2">Current</p>
                    <div className="flex flex-wrap gap-1">
                      {(currentSimulation?.chemicals || []).map((chem, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white">
                          {chem.name || chem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Previous</p>
                    <div className="flex flex-wrap gap-1">
                      {(getComparisonSimulation()?.chemicals || []).map((chem, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {chem}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No previous simulations to compare</p>
              <p className="text-xs text-slate-400">Run more simulations to enable comparison</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Button
        variant="outline"
        size="sm"
        onClick={fetchPastSimulations}
        className="w-full"
      >
        <RefreshCw className="w-3.5 h-3.5 mr-2" />
        Refresh Analysis
      </Button>
    </div>
  );
}