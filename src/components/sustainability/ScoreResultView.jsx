import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Bookmark, BarChart3 } from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import MetricBreakdown from "./MetricBreakdown";
import EcoBadges from "./EcoBadges";
import GreenAlternatives from "./GreenAlternatives";
import ImprovementSuggestions from "./ImprovementSuggestions";

export default function ScoreResultView({ result, onBack, isBusiness }) {
  if (!result) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="-ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to search
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <ScoreGauge score={result.overall_score} size="lg" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">{result.product_name}</h2>
          {result.category && <Badge variant="outline" className="capitalize mt-1">{result.category}</Badge>}
          {isBusiness && result.industry_average && (
            <div className="mt-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">
                Industry average: <span className="font-semibold text-slate-700">{result.industry_average}/100</span>
                {result.overall_score > result.industry_average
                  ? <span className="text-green-600 ml-1">(+{result.overall_score - result.industry_average} above)</span>
                  : <span className="text-red-600 ml-1">({result.overall_score - result.industry_average} below)</span>
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Eco Badges */}
      <EcoBadges badges={result.eco_badges} />

      {/* Score Reasons */}
      {result.score_reasons?.length > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Why This Score</h3>
            <ul className="space-y-2">
              {result.score_reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Critical Areas (Business) */}
      {isBusiness && result.critical_areas?.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">Critical Improvement Areas</h3>
            <ul className="space-y-2">
              {result.critical_areas.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metrics Breakdown */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <MetricBreakdown metrics={result.metrics} />
        </CardContent>
      </Card>

      {/* Improvements */}
      <ImprovementSuggestions improvements={result.improvements} />

      {/* Green Alternatives */}
      <GreenAlternatives alternatives={result.alternatives} />
    </div>
  );
}