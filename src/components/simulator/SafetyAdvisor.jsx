import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronRight,
  HardHat, Glasses, FlaskConical, Wind, Thermometer, Droplets, Flame,
  Skull, Biohazard, Radiation, Loader2, Sparkles, FileText, BookOpen,
  AlertOctagon, ShieldCheck, Siren, ClipboardList, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const PPE_ICONS = {
  goggles: Glasses,
  gloves: HardHat,
  lab_coat: FlaskConical,
  fume_hood: Wind,
  respirator: Wind,
  face_shield: ShieldCheck,
  heat_resistant: Thermometer,
  chemical_resistant: Droplets,
};

const HAZARD_ICONS = {
  flammable: Flame,
  toxic: Skull,
  corrosive: Droplets,
  oxidizer: Flame,
  biohazard: Biohazard,
  radioactive: Radiation,
  reactive: AlertOctagon,
  irritant: AlertTriangle,
};

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function SafetyAdvisor({ chemicals, simulationResults, compact = false, onAnalysisComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    hazards: true,
    ppe: true,
    protocols: false,
    emergencyProcedures: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const runAnalysis = async () => {
    if (!chemicals?.length) {
      toast.error('No chemicals to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Fetch detailed chemical data from database
      const chemicalDetails = await Promise.all(
        chemicals.map(async (chem) => {
          const name = typeof chem === 'string' ? chem : chem.name;
          const results = await base44.entities.Chemical.filter({ name });
          return results[0] || { name, chemical_type: 'unknown' };
        })
      );

      // Build comprehensive prompt for AI analysis
      const prompt = `
You are a chemical safety expert. Analyze the following chemicals and simulation data to provide comprehensive safety recommendations.

CHEMICALS:
${chemicalDetails.map(c => `
- Name: ${c.name}
- Type: ${c.chemical_type || 'unknown'}
- Safety Level: ${c.safety_level || 'unknown'}
- Physical Properties: ${JSON.stringify(c.physical_properties || {})}
- Toxicity Data: ${JSON.stringify(c.toxicity_data || {})}
- Incompatibilities: ${JSON.stringify(c.incompatibilities || [])}
`).join('\n')}

SIMULATION RESULTS:
${simulationResults ? `
- Risk Score: ${simulationResults.risk_score || 'N/A'}
- Health Impact: ${simulationResults.health_impact || 'N/A'}
- Environmental Impact: ${simulationResults.environmental_impact || 'N/A'}
- Reactivity: ${simulationResults.reactivity || 'N/A'}
- Reaction Summary: ${simulationResults.reaction_summary || 'N/A'}
` : 'No simulation results available'}

Provide a detailed safety analysis in the following JSON format:
{
  "overall_risk_level": "critical|high|medium|low",
  "risk_score": <0-100>,
  "summary": "<2-3 sentence executive summary>",
  "identified_hazards": [
    {
      "hazard_type": "flammable|toxic|corrosive|oxidizer|reactive|irritant|biohazard",
      "severity": "critical|high|medium|low",
      "description": "<description>",
      "chemicals_involved": ["<chemical names>"],
      "mitigation": "<how to mitigate>"
    }
  ],
  "unidentified_risks": [
    {
      "risk": "<potential risk not covered by standard alerts>",
      "severity": "high|medium|low",
      "explanation": "<why this is a concern>",
      "recommendation": "<what to do>"
    }
  ],
  "required_ppe": [
    {
      "item": "<PPE item>",
      "type": "goggles|gloves|lab_coat|fume_hood|respirator|face_shield|heat_resistant|chemical_resistant",
      "priority": "required|recommended|optional",
      "specification": "<specific requirements like material, rating>",
      "reason": "<why needed>"
    }
  ],
  "lab_protocols": [
    {
      "protocol": "<protocol name>",
      "category": "handling|storage|disposal|emergency",
      "steps": ["<step 1>", "<step 2>"],
      "critical": <boolean>
    }
  ],
  "emergency_procedures": [
    {
      "scenario": "<what could go wrong>",
      "immediate_actions": ["<action 1>", "<action 2>"],
      "first_aid": "<first aid instructions>",
      "contact": "<who to contact>"
    }
  ],
  "storage_recommendations": {
    "temperature": "<temp requirements>",
    "ventilation": "<ventilation needs>",
    "segregation": ["<chemicals to keep separate>"],
    "container_type": "<recommended container>"
  },
  "disposal_guidelines": {
    "method": "<disposal method>",
    "regulations": "<relevant regulations>",
    "warnings": ["<disposal warnings>"]
  },
  "additional_notes": ["<any other important safety considerations>"]
}`;

      const response = await base44.functions.invoke('runConsumerLLM', {
        operation: 'safetyAdvisor',
        data: { chemicals, simulationResults }
      });

      setAnalysis(response);
      if (onAnalysisComplete) {
        onAnalysisComplete(response);
      }
      toast.success('Safety analysis complete');
    } catch (error) {
      toast.error('Failed to analyze: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (chemicals?.length && !analysis && !isAnalyzing) {
      runAnalysis();
    }
    // Reset analysis when chemicals change so a new run is triggered
    if (!chemicals?.length) {
      setAnalysis(null);
    }
  }, [JSON.stringify(chemicals?.map(c => (typeof c === 'string' ? c : c?.name)))]);

  if (isAnalyzing) {
    return (
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="py-12 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center"
          >
            <ShieldAlert className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-slate-800">Analyzing Safety Data...</h3>
          <p className="text-slate-600 text-sm mt-1">AI is evaluating hazards and generating recommendations</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-dashed border-2 border-slate-300">
        <CardContent className="py-8 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">Safety Advisor</h3>
          <p className="text-slate-500 text-sm mb-4">Get AI-powered safety recommendations</p>
          <Button onClick={runAnalysis} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Run Safety Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level) => {
    const colors = {
      critical: 'from-red-500 to-red-600',
      high: 'from-orange-500 to-orange-600',
      medium: 'from-yellow-500 to-yellow-600',
      low: 'from-green-500 to-green-600',
    };
    return colors[level] || colors.medium;
  };

  if (compact) {
    return (
      <Card className="border-indigo-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            Safety Advisor Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getRiskColor(analysis.overall_risk_level)}`}>
              {analysis.overall_risk_level?.toUpperCase()} RISK
            </div>
            <span className="text-sm text-slate-600">Score: {analysis.risk_score}/100</span>
          </div>
          <p className="text-sm text-slate-700">{analysis.summary}</p>
          <div className="flex flex-wrap gap-2">
            {analysis.identified_hazards?.slice(0, 3).map((h, i) => {
              const Icon = HAZARD_ICONS[h.hazard_type] || AlertTriangle;
              return (
                <Badge key={i} className={SEVERITY_COLORS[h.severity]}>
                  <Icon className="w-3 h-3 mr-1" />
                  {h.hazard_type}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getRiskColor(analysis.overall_risk_level)} flex items-center justify-center shadow-lg`}>
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">AI Safety Advisor</h2>
                  <Badge className={`${SEVERITY_COLORS[analysis.overall_risk_level]} font-semibold`}>
                    {analysis.overall_risk_level?.toUpperCase()} RISK
                  </Badge>
                </div>
                <p className="text-slate-600 max-w-xl">{analysis.summary}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">{analysis.risk_score}</div>
              <div className="text-xs text-slate-500">Risk Score</div>
            </div>
          </div>
          <Progress value={analysis.risk_score} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Identified Hazards */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleSection('hazards')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-500" />
              Identified Hazards
              <Badge variant="secondary">{analysis.identified_hazards?.length || 0}</Badge>
            </CardTitle>
            {expandedSections.hazards ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.hazards && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-0 space-y-3">
                {analysis.identified_hazards?.map((hazard, i) => {
                  const Icon = HAZARD_ICONS[hazard.hazard_type] || AlertTriangle;
                  return (
                    <div key={i} className={`p-4 rounded-lg border ${SEVERITY_COLORS[hazard.severity]}`}>
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold capitalize">{hazard.hazard_type}</span>
                            <Badge variant="outline" className="text-xs">{hazard.severity}</Badge>
                          </div>
                          <p className="text-sm mb-2">{hazard.description}</p>
                          <div className="text-xs">
                            <span className="font-medium">Chemicals: </span>
                            {hazard.chemicals_involved?.join(', ')}
                          </div>
                          <div className="text-xs mt-1">
                            <span className="font-medium">Mitigation: </span>
                            {hazard.mitigation}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Unidentified Risks */}
                {analysis.unidentified_risks?.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-700">
                      <Siren className="w-4 h-4" />
                      Potential Unidentified Risks
                    </h4>
                    {analysis.unidentified_risks.map((risk, i) => (
                      <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="font-medium text-amber-800 text-sm">{risk.risk}</div>
                        <p className="text-xs text-amber-700 mt-1">{risk.explanation}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          <span className="font-medium">Recommendation: </span>{risk.recommendation}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Required PPE */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleSection('ppe')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <HardHat className="w-5 h-5 text-blue-500" />
              Required PPE & Equipment
              <Badge variant="secondary">{analysis.required_ppe?.length || 0}</Badge>
            </CardTitle>
            {expandedSections.ppe ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.ppe && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.required_ppe?.map((ppe, i) => {
                    const Icon = PPE_ICONS[ppe.type] || ShieldCheck;
                    const priorityColors = {
                      required: 'bg-red-50 border-red-200',
                      recommended: 'bg-yellow-50 border-yellow-200',
                      optional: 'bg-blue-50 border-blue-200',
                    };
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${priorityColors[ppe.priority]}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" />
                          <span className="font-semibold text-sm">{ppe.item}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {ppe.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{ppe.specification}</p>
                        <p className="text-xs text-slate-500 mt-1">{ppe.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Lab Protocols */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleSection('protocols')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-green-500" />
              Lab Protocols
              <Badge variant="secondary">{analysis.lab_protocols?.length || 0}</Badge>
            </CardTitle>
            {expandedSections.protocols ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.protocols && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-0 space-y-3">
                {analysis.lab_protocols?.map((protocol, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${protocol.critical ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{protocol.protocol}</span>
                      <Badge variant="outline" className="text-xs">{protocol.category}</Badge>
                      {protocol.critical && <Badge className="bg-red-500 text-xs">Critical</Badge>}
                    </div>
                    <ol className="list-decimal list-inside space-y-1">
                      {protocol.steps?.map((step, j) => (
                        <li key={j} className="text-sm text-slate-700">{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Emergency Procedures */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => toggleSection('emergencyProcedures')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Siren className="w-5 h-5 text-red-500" />
              Emergency Procedures
              <Badge variant="secondary">{analysis.emergency_procedures?.length || 0}</Badge>
            </CardTitle>
            {expandedSections.emergencyProcedures ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.emergencyProcedures && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-0 space-y-3">
                {analysis.emergency_procedures?.map((procedure, i) => (
                  <div key={i} className="p-4 rounded-lg border border-red-200 bg-red-50">
                    <h4 className="font-semibold text-sm text-red-800 mb-2">
                      Scenario: {procedure.scenario}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-red-700">Immediate Actions:</span>
                        <ul className="list-disc list-inside ml-2">
                          {procedure.immediate_actions?.map((action, j) => (
                            <li key={j} className="text-red-700">{action}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">First Aid: </span>
                        <span className="text-red-600">{procedure.first_aid}</span>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">Contact: </span>
                        <span className="text-red-600">{procedure.contact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Storage & Disposal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-500" />
              Storage Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="font-medium">Temperature:</span> {analysis.storage_recommendations?.temperature}</div>
            <div><span className="font-medium">Ventilation:</span> {analysis.storage_recommendations?.ventilation}</div>
            <div><span className="font-medium">Container:</span> {analysis.storage_recommendations?.container_type}</div>
            {analysis.storage_recommendations?.segregation?.length > 0 && (
              <div>
                <span className="font-medium">Keep separate from:</span>
                <ul className="list-disc list-inside ml-2 text-xs">
                  {analysis.storage_recommendations.segregation.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Biohazard className="w-4 h-4 text-orange-500" />
              Disposal Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="font-medium">Method:</span> {analysis.disposal_guidelines?.method}</div>
            <div><span className="font-medium">Regulations:</span> {analysis.disposal_guidelines?.regulations}</div>
            {analysis.disposal_guidelines?.warnings?.length > 0 && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                <span className="font-medium text-orange-700">Warnings:</span>
                <ul className="list-disc list-inside">
                  {analysis.disposal_guidelines.warnings.map((w, i) => (
                    <li key={i} className="text-orange-600">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Notes */}
      {analysis.additional_notes?.length > 0 && (
        <Card className="border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              Additional Safety Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.additional_notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Re-analyze Button */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={runAnalysis} className="gap-2">
          <Sparkles className="w-4 h-4" />
          Re-analyze Safety Data
        </Button>
      </div>
    </div>
  );
}