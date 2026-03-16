import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Leaf } from "lucide-react";
import ScoreGauge from "./ScoreGauge";

export default function GreenAlternatives({ alternatives }) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
        <Leaf className="w-4 h-4" />
        Greener Alternatives
      </h3>
      <div className="space-y-3">
        {alternatives.map((alt, i) => (
          <Card key={i} className="border border-green-100 hover:border-green-200 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <ScoreGauge score={alt.score} size="sm" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900">{alt.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alt.reason}</p>
                {alt.certifications?.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {alt.certifications.map((c, j) => (
                      <Badge key={j} variant="outline" className="text-[10px]">{c}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  +{alt.score_improvement || 0}
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}