import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf, TrendingUp, TrendingDown, Minus, Sparkles, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const getSustainabilityLevel = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', icon: TrendingUp };
  if (score >= 60) return { label: 'Good', color: 'text-teal-600', bgColor: 'bg-teal-100', icon: TrendingUp };
  if (score >= 40) return { label: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Minus };
  return { label: 'Needs Work', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: TrendingDown };
};

const ScoreCard = ({ formula }) => {
  const score = formula.full_recipe_data?.sustainability?.overall_score || 0;
  const level = getSustainabilityLevel(score);
  const Icon = level.icon;

  return (
    <div className="p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:shadow-sm transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1">{formula.name}</h4>
          <Badge variant="outline" className={`text-xs ${level.bgColor} ${level.color} border-0`}>
            <Icon className="w-3 h-3 mr-1" />
            {level.label}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{score}</div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>
      <Progress value={score} className="h-2 mb-2" />
      {formula.full_recipe_data?.sustainability?.certifications?.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {formula.full_recipe_data.sustainability.certifications.slice(0, 2).join(', ')}
        </div>
      )}
    </div>
  );
};

export default function SustainabilityScores({ formulas = [], isLoading }) {
  // Filter formulas with sustainability scores
  const scoredFormulas = formulas.filter(f => 
    f.full_recipe_data?.sustainability?.overall_score > 0
  ).sort((a, b) => 
    (b.full_recipe_data?.sustainability?.overall_score || 0) - 
    (a.full_recipe_data?.sustainability?.overall_score || 0)
  );

  const averageScore = scoredFormulas.length > 0
    ? Math.round(scoredFormulas.reduce((sum, f) => sum + (f.full_recipe_data?.sustainability?.overall_score || 0), 0) / scoredFormulas.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            Sustainability Scores
          </div>
          {averageScore > 0 && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Avg: {averageScore}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : scoredFormulas.length > 0 ? (
          <>
            <div className="space-y-3 mb-4">
              {scoredFormulas.slice(0, 4).map(formula => (
                <Link key={formula.id} to={`${createPageUrl('generator')}?load=${formula.id}`}>
                  <ScoreCard formula={formula} />
                </Link>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={createPageUrl('Sustainability')}>
                View Sustainability Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Leaf className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No sustainability scores yet</p>
            <p className="text-xs text-slate-400 mt-1">Create formulas to get sustainability analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}