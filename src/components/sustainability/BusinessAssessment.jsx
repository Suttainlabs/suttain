import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Minus, Building2 } from "lucide-react";

export default function BusinessAssessment({ onAnalyze }) {
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [manufacturing, setManufacturing] = useState("");
  const [packaging, setPackaging] = useState("");
  const [sourcing, setSourcing] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!productName.trim() || ingredients.filter(i => i.trim()).length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await base44.functions.invoke('runConsumerLLM', {
        operation: 'businessAssessment',
        data: { productName, ingredients, manufacturing, packaging, sourcing }
      });
      onAnalyze(result);
    } catch (error) {
      console.error("Business assessment failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-600" />
          Product Data Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Product Name *</label>
          <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Gentle Face Cleanser" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Ingredients *</label>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={ing}
                  onChange={(e) => { const arr = [...ingredients]; arr[i] = e.target.value; setIngredients(arr); }}
                  placeholder={`Ingredient ${i + 1}`}
                  className="flex-1"
                />
                {ingredients.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-red-500 h-10 w-10">
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setIngredients([...ingredients, ""])}>
              <Plus className="w-3 h-3 mr-1" /> Add Ingredient
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Manufacturing Method</label>
          <Select value={manufacturing} onValueChange={setManufacturing}>
            <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cold_process">Cold Process</SelectItem>
              <SelectItem value="hot_process">Hot Process</SelectItem>
              <SelectItem value="batch_mixing">Batch Mixing</SelectItem>
              <SelectItem value="continuous_flow">Continuous Flow</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Packaging Materials</label>
          <Textarea value={packaging} onChange={(e) => setPackaging(e.target.value)} placeholder="e.g., HDPE bottle, cardboard box, no plastic wrap..." rows={2} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Sourcing Origin</label>
          <Input value={sourcing} onChange={(e) => setSourcing(e.target.value)} placeholder="e.g., Locally sourced, Fair Trade certified..." />
        </div>

        <Button onClick={handleAnalyze} disabled={isAnalyzing || !productName.trim()} className="w-full bg-[#02988C] hover:bg-[#027d73] h-11">
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isAnalyzing ? "Analyzing..." : "Calculate Sustainability Score"}
        </Button>
      </CardContent>
    </Card>
  );
}