import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Lightbulb } from "lucide-react";

export default function ImprovementSuggestions({ improvements }) {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
        <Lightbulb className="w-4 h-4" />
        Improvement Suggestions
      </h3>
      <div className="space-y-2">
        {improvements.map((imp, i) => (
          <Card key={i} className="border border-slate-200">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{imp.suggestion}</p>
                {imp.category && <Badge variant="outline" className="text-[10px] mt-1 capitalize">{imp.category}</Badge>}
              </div>
              <div className="flex-shrink-0">
                <span className="text-sm font-bold text-green-600">+{imp.impact_percentage}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}