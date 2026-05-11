import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Sparkles } from 'lucide-react';

export default function MealCoachPanel({ coachInsights, summary }) {
    return (
        <div className="space-y-3">
            {/* Summary */}
            {summary && (
                <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-violet-900 text-sm mb-1">Molecular Meal Coach™</p>
                                <p className="text-sm text-violet-800 leading-relaxed">{summary}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Insights */}
            {coachInsights?.length > 0 && (
                <Card className="border-slate-200 bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Chemistry-Based Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {coachInsights.map((insight, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-6 h-6 bg-violet-100 text-violet-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <p className="text-center text-[10px] text-slate-400 pb-2">
                Molecular coaching insights are for educational purposes only. Not personalized medical or dietary advice.
            </p>
        </div>
    );
}