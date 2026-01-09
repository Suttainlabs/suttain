
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Loader2, Scale, Globe, FileText, CheckCircle } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

export default function ComplianceChecker({ formula }) {
  const [complianceData, setComplianceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formula && formula.ingredients && formula.ingredients.length > 0) {
      runComplianceCheck();
    } else {
      setComplianceData(null); // Clear data if ingredients are removed
    }
  }, [formula]);

  const runComplianceCheck = async () => {
    setIsLoading(true);
    const ingredientList = formula.ingredients.map(i => i.chemical_name).join(', ');
    const prompt = `
      Perform a detailed regulatory compliance check for a cosmetic formula intended for commercial sale in both the US and EU markets.
      The formula's ingredients are: ${ingredientList}.
      Analyze the following aspects and return a response in the specified JSON format.
      - Check each ingredient against US (FDA) and EU (Cosing) restricted/prohibited lists.
      - Identify any ingredients with concentration limits and note them.
      - List common allergens that must be declared.
      - Suggest mandatory labeling requirements (e.g., INCI list, Period After Opening).
      - Provide a summary of the overall compliance risk.

      JSON response format:
      {
        "overall_risk": "low" | "medium" | "high",
        "risk_summary": "string",
        "regional_compliance": [
          { "region": "USA (FDA)", "status": "compliant" | "non-compliant" | "restricted", "details": "string" },
          { "region": "EU (Cosing)", "status": "compliant" | "non-compliant" | "restricted", "details": "string" }
        ],
        "restricted_ingredients": [ { "ingredient": "string", "reason": "string" } ],
        "concentration_limits": [ { "ingredient": "string", "limit": "string" } ],
        "allergen_declarations": [ "string" ],
        "labeling_requirements": [ "string" ]
      }
    `;

    try {
      const analysis = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk: { type: "string" },
            risk_summary: { type: "string" },
            regional_compliance: { type: "array", items: { type: "object", properties: { region: { type: "string" }, status: { type: "string" }, details: { type: "string" } } } },
            restricted_ingredients: { type: "array", items: { type: "object", properties: { ingredient: { type: "string" }, reason: { type: "string" } } } },
            concentration_limits: { type: "array", items: { type: "object", properties: { ingredient: { type: "string" }, limit: { type: "string" } } } },
            allergen_declarations: { type: "array", items: { type: "string" } },
            labeling_requirements: { type: "array", items: { type: "string" } }
          }
        }
      });
      setComplianceData(analysis);
    } catch (error) {
      console.error("Compliance check failed:", error);
      setComplianceData({ error: "Failed to generate compliance analysis." });
    }
    setIsLoading(false);
  };

  const InfoCard = ({ icon: Icon, title, data, badgeType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.map((item, index) => (
              <Badge key={index} variant={badgeType || "secondary"}>
                {typeof item === 'string' ? item : `${item.ingredient}: ${item.reason || item.limit}`}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">None identified.</p>
        )}
      </CardContent>
    </Card>
  );

  // Informative state when no ingredients are present
  if (!formula || !formula.ingredients || formula.ingredients.length === 0) {
    return (
      <div className="space-y-6 rounded-lg p-4 md:p-6 bg-slate-50/80">
        <div className="text-center pb-4 border-b border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Compliance & Regulatory Guide</h3>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              General information to consider when creating a product for market.
            </p>
        </div>
        
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-3">
          <AccordionItem value="item-1" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-4 text-base font-semibold text-slate-800">Key Regulatory Frameworks</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-2 text-slate-700 text-sm">
              <p><strong>For Cosmetics & Personal Care:</strong> The FDA (in the US) and the EU Cosmetics Regulation are primary. They govern ingredient safety, labeling, and claims.</p>
              <p><strong>For Cleaning Products:</strong> The EPA (in the US) and regulations like REACH/CLP (in the EU) are key. They focus on chemical safety, environmental impact, and hazard communication.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-4 text-base font-semibold text-slate-800">Common Compliance Requirements</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                <li><strong>Ingredient Labeling (INCI):</strong> All ingredients must be listed in a specific order on product packaging.</li>
                <li><strong>Safety Data Sheets (SDS):</strong> Required for professional/industrial products to communicate hazards.</li>
                <li><strong>Good Manufacturing Practices (GMP):</strong> Ensures products are consistently produced and controlled according to quality standards.</li>
                <li><strong>Product Stability & Safety Testing:</strong> You must ensure your product is safe and stable for its intended shelf life.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="text-center pt-6">
          <p className="text-slate-800 font-semibold bg-teal-100/70 border border-teal-200 rounded-md py-3 px-4 inline-block">
            Add ingredients to your formula to generate a specific compliance analysis.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-slate-800">Analyzing Compliance...</h3>
        <p className="text-slate-500">Checking your ingredients against US & EU regulatory databases.</p>
      </div>
    );
  }

  if (!complianceData) {
    return <div className="text-center p-8">No compliance data available.</div>;
  }
  
  if (complianceData.error) {
    return <div className="text-center p-8 text-red-600">{complianceData.error}</div>;
  }

  const riskColor = {
    low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className={`border-2 ${riskColor[complianceData.overall_risk]}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {complianceData.overall_risk === 'low' && <CheckCircle className="w-6 h-6"/>}
            {complianceData.overall_risk !== 'low' && <AlertTriangle className="w-6 h-6"/>}
            Overall Risk: <span className="capitalize">{complianceData.overall_risk}</span>
          </CardTitle>
          <CardDescription className="text-base pt-2">
            {complianceData.risk_summary}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {complianceData.regional_compliance?.map(region => (
          <Card key={region.region}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-slate-500" />
                        {region.region}
                    </CardTitle>
                    <Badge variant={region.status === 'compliant' ? 'default' : 'destructive'}>
                        {region.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{region.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Accordion type="multiple" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 text-base font-semibold">Restricted Ingredients</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
             <InfoCard icon={AlertTriangle} title="Restricted" data={complianceData.restricted_ingredients} badgeType="destructive"/>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 text-base font-semibold">Concentration Limits</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <InfoCard icon={Scale} title="Limits" data={complianceData.concentration_limits} badgeType="warning"/>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 text-base font-semibold">Labeling Requirements</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <InfoCard icon={FileText} title="Allergens" data={complianceData.allergen_declarations} />
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-sm">General Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                {complianceData.labeling_requirements?.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}
