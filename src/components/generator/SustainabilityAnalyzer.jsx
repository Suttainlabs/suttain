
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InvokeLLM } from '@/integrations/Core';
import { Leaf, Recycle, Droplets, Footprints, Award, Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const scoreColor = (score) => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const scoreTextColor = (score) => {
    if (score >= 80) return "text-emerald-800";
    if (score >= 60) return "text-green-800";
    if (score >= 40) return "text-yellow-800";
    return "text-red-800";
};

const scoreBgColor = (score) => {
    if (score >= 80) return "bg-emerald-50";
    if (score >= 60) return "bg-green-50";
    if (score >= 40) return "bg-yellow-50";
    return "bg-red-50";
};

const ScoreCard = ({ title, score, details, icon: Icon }) => (
  <Card className={`${scoreBgColor(score)} h-full`}>
    <CardHeader>
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <Icon className={`w-5 h-5 ${scoreTextColor(score)}`} />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-2xl font-bold ${scoreTextColor(score)}`}>{score}/100</span>
      </div>
      <Progress value={score} className="h-2 [&>*]:bg-current" color={scoreTextColor(score)} />
      <p className="text-xs text-slate-600 mt-2">{details}</p>
    </CardContent>
  </Card>
);

export default function SustainabilityAnalyzer({ formula }) {
  const [sustainabilityData, setSustainabilityData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formula && formula.ingredients && formula.ingredients.length > 0) {
      analyzeSustainability();
    } else {
      setSustainabilityData(null); // Clear data if ingredients are removed
    }
  }, [formula]);

  const analyzeSustainability = async () => {
    setIsLoading(true);
    const ingredientList = formula.ingredients.map(i => i.chemical_name).join(', ');
    const prompt = `
      Analyze the sustainability profile of a cosmetic formula with these ingredients: ${ingredientList}.
      Provide scores from 0-100 and brief details for each category.
      Return a response in the specified JSON format.
      - Overall Score: A holistic score considering all factors.
      - Carbon Footprint: Score based on production and transport emissions.
      - Biodegradability: Score based on how easily the components break down.
      - Water Usage: Score related to water consumed in production and use.
      - Packaging Impact: Score based on assumed standard packaging recyclability.
      - Improvement Suggestions: Provide 2-3 actionable suggestions.

      JSON response format:
      {
        "overall_score": number,
        "summary": "string",
        "categories": [
          { "name": "Carbon Footprint", "score": number, "details": "string" },
          { "name": "Biodegradability", "score": number, "details": "string" },
          { "name": "Water Usage", "score": number, "details": "string" },
          { "name": "Packaging Impact", "score": number, "details": "string" }
        ],
        "improvement_suggestions": [ "string" ]
      }
    `;

    try {
      const analysis = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            summary: { type: "string" },
            categories: { type: "array", items: { type: "object", properties: { name: { type: "string" }, score: { type: "number" }, details: { type: "string" } } } },
            improvement_suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setSustainabilityData(analysis);
    } catch (error) {
      console.error("Sustainability analysis failed:", error);
      setSustainabilityData({ error: "Failed to generate sustainability analysis." });
    }
    setIsLoading(false);
  };
  
  const categoryIcons = {
    "Carbon Footprint": Footprints,
    "Biodegradability": Recycle,
    "Water Usage": Droplets,
    "Packaging Impact": Recycle
  };
  
  if (!formula || !formula.ingredients || formula.ingredients.length === 0) {
    return (
      <div className="space-y-6 rounded-lg p-4 md:p-6 bg-slate-50/80">
        <div className="text-center pb-4 border-b border-slate-200">
          <Leaf className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Sustainability Best Practices</h3>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            General principles for creating environmentally-conscious formulas.
          </p>
        </div>

        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-3">
          <AccordionItem value="item-1" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-4 text-base font-semibold text-slate-800">Sustainable Ingredient Sourcing</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                <li>Prioritize renewable, plant-based, or bio-based raw materials.</li>
                <li>Look for third-party certifications (e.g., RSPO for palm oil, Fair Trade, Organic).</li>
                <li>Consider the carbon footprint and water usage associated with an ingredient's production.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border rounded-lg bg-white shadow-sm">
            <AccordionTrigger className="px-4 text-base font-semibold text-slate-800">Formulation & Packaging Principles</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
               <ul className="list-disc pl-5 space-y-2 text-slate-700 text-sm">
                <li>Aim for high biodegradability to minimize aquatic impact.</li>
                <li>Develop concentrated or waterless formulas to reduce shipping weight and packaging needs.</li>
                <li>Choose packaging that is recyclable (e.g., PET, HDPE), made from recycled content (PCR), or refillable.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

         <div className="text-center pt-6">
          <p className="text-slate-800 font-semibold bg-teal-100/70 border border-teal-200 rounded-md py-3 px-4 inline-block">
            Add ingredients to your formula to generate a detailed sustainability score.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-slate-800">Calculating Eco-Impact...</h3>
        <p className="text-slate-500">Analyzing ingredient sourcing, production, and end-of-life impact.</p>
      </div>
    );
  }

  if (!sustainabilityData) {
    return <div className="text-center p-8">No sustainability data available.</div>;
  }

  if (sustainabilityData.error) {
    return <div className="text-center p-8 text-red-600">{sustainabilityData.error}</div>;
  }
  
  return (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Leaf className={`w-7 h-7 ${scoreTextColor(sustainabilityData.overall_score)}`}/>
            Overall Sustainability Score
          </CardTitle>
          <CardDescription>A holistic rating of your formula's environmental impact.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center mb-4">
                <p className={`text-7xl font-bold ${scoreTextColor(sustainabilityData.overall_score)}`}>
                    {sustainabilityData.overall_score}
                </p>
                <p className="text-lg font-medium text-slate-600 -mt-2">out of 100</p>
            </div>
            <Progress value={sustainabilityData.overall_score} className="h-3" color={scoreColor(sustainabilityData.overall_score)} />
            <p className="text-center text-slate-600 mt-4 text-sm">{sustainabilityData.summary}</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sustainabilityData.categories?.map(cat => (
          <ScoreCard 
            key={cat.name} 
            title={cat.name} 
            score={cat.score} 
            details={cat.details}
            icon={categoryIcons[cat.name] || Leaf}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600"/>
                Improvement Suggestions
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
                {sustainabilityData.improvement_suggestions?.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                ))}
            </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
