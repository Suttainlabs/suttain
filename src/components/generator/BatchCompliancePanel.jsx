import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Loader2, Scale, Globe, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const riskColor = {
  low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  high: 'text-red-600 bg-red-50 border-red-200',
};

const statusBadge = {
  compliant: 'bg-emerald-100 text-emerald-700',
  restricted: 'bg-amber-100 text-amber-700',
  'non-compliant': 'bg-red-100 text-red-700',
};

function InfoCard({ icon: Icon, title, data, badgeClass }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      {data && data.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {data.map((item, index) => (
            <Badge key={index} className={`text-xs ${badgeClass || 'bg-slate-100 text-slate-600'}`}>
              {typeof item === 'string' ? item : `${item.ingredient}: ${item.reason || item.limit}`}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">None identified.</p>
      )}
    </div>
  );
}

export default function BatchCompliancePanel({ formula, batchSize, batchUnit, onComplianceResult }) {
  const [complianceData, setComplianceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runComplianceCheck = async () => {
    if (!formula?.ingredients?.length) return;
    setIsLoading(true);

    const ingredientList = formula.ingredients
      .map((i) => `${i.chemical_name} (${i.percentage}%)`)
      .join(', ');

    const prompt = `Perform a detailed regulatory compliance check for a cosmetic/personal care formula batch (${batchSize}${batchUnit}).
Ingredients with concentrations: ${ingredientList}.

Analyze against ALL THREE regulatory frameworks:
1. US FDA cosmetic restrictions and prohibitions
2. EU Cosmetics Regulation (EC 1223/2009) and REACH
3. UK Cosmetics Regulation (post-Brexit, UKCPNP)

For each ingredient, check:
- Is it restricted or prohibited in any region?
- Does its concentration exceed the allowed limit?
- Is it a known allergen requiring declaration?
- Are there specific labeling requirements?

Return the compliance scan as JSON with this exact structure:
{
  "overall_risk": "low" | "medium" | "high",
  "risk_summary": "string",
  "regional_compliance": [
    { "region": "US (FDA)", "status": "compliant" | "restricted" | "non-compliant", "details": "string", "labeling_requirements": ["string"] },
    { "region": "EU (Cosmetics Regulation + REACH)", "status": "...", "details": "...", "labeling_requirements": ["..."] },
    { "region": "UK (UK Cosmetics Regulation)", "status": "...", "details": "...", "labeling_requirements": ["..."] }
  ],
  "restricted_ingredients": [{ "ingredient": "string", "reason": "string", "region": "string" }],
  "concentration_limits": [{ "ingredient": "string", "limit": "string", "current": "string", "status": "within" | "exceeds" }],
  "allergen_declarations": ["string"],
  "labeling_requirements": ["string"]
}`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_risk: { type: 'string' },
            risk_summary: { type: 'string' },
            regional_compliance: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  region: { type: 'string' },
                  status: { type: 'string' },
                  details: { type: 'string' },
                  labeling_requirements: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            restricted_ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ingredient: { type: 'string' },
                  reason: { type: 'string' },
                  region: { type: 'string' },
                },
              },
            },
            concentration_limits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ingredient: { type: 'string' },
                  limit: { type: 'string' },
                  current: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
            allergen_declarations: { type: 'array', items: { type: 'string' } },
            labeling_requirements: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      setComplianceData(result);
      onComplianceResult?.(result);
    } catch (error) {
      console.error('Compliance check failed:', error);
      setComplianceData({ error: 'Failed to generate compliance analysis.' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (formula?.ingredients?.length) {
      runComplianceCheck();
    } else {
      setComplianceData(null);
    }
  }, [formula]);

  if (!formula?.ingredients?.length) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Add ingredients to run a compliance scan.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-700">Scanning compliance...</p>
          <p className="text-xs text-slate-500 mt-1">Checking FDA, EU REACH, and UK regulations</p>
        </CardContent>
      </Card>
    );
  }

  if (complianceData?.error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{complianceData.error}</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={runComplianceCheck}>
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!complianceData) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className={`border-2 ${riskColor[complianceData.overall_risk]}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              {complianceData.overall_risk === 'low' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              Compliance Risk: <span className="capitalize">{complianceData.overall_risk}</span>
            </CardTitle>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={runComplianceCheck}>
              <RefreshCw className="w-3 h-3 mr-1" /> Re-scan
            </Button>
          </div>
          <CardDescription className="text-sm pt-1">{complianceData.risk_summary}</CardDescription>
        </CardHeader>
      </Card>

      {/* Regional Compliance */}
      <div className="grid md:grid-cols-3 gap-3">
        {complianceData.regional_compliance?.map((region, i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-500" />
                  {region.region}
                </CardTitle>
                <Badge className={`text-[10px] ${statusBadge[region.status] || 'bg-slate-100 text-slate-600'}`}>
                  {region.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-2">{region.details}</p>
              {region.labeling_requirements?.length > 0 && (
                <div className="pt-1 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Labeling</p>
                  <ul className="space-y-0.5">
                    {region.labeling_requirements.map((req, j) => (
                      <li key={j} className="text-[10px] text-slate-500 flex items-start gap-1">
                        <FileText className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" /> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Accordion type="multiple" className="w-full space-y-2">
        <AccordionItem value="restricted" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 text-sm font-semibold">Restricted Ingredients ({complianceData.restricted_ingredients?.length || 0})</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <InfoCard icon={AlertTriangle} title="Restricted" data={complianceData.restricted_ingredients} badgeClass="bg-red-100 text-red-700" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="limits" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 text-sm font-semibold">Concentration Limits ({complianceData.concentration_limits?.length || 0})</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <InfoCard icon={Scale} title="Limits" data={complianceData.concentration_limits} badgeClass="bg-amber-100 text-amber-700" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="allergens" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 text-sm font-semibold">Allergen Declarations ({complianceData.allergen_declarations?.length || 0})</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <InfoCard icon={ShieldCheck} title="Allergens" data={complianceData.allergen_declarations} badgeClass="bg-orange-100 text-orange-700" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}