import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function SafetyInsights({ alerts, profiles }) {
  // Calculate insights
  const mostFlaggedIngredients = {};
  alerts.forEach(alert => {
    alert.flagged_ingredients?.forEach(item => {
      const ing = item.ingredient;
      if (!mostFlaggedIngredients[ing]) {
        mostFlaggedIngredients[ing] = { count: 0, reasons: new Set() };
      }
      mostFlaggedIngredients[ing].count++;
      if (item.reason) mostFlaggedIngredients[ing].reasons.add(item.reason);
    });
  });

  const topFlagged = Object.entries(mostFlaggedIngredients)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const alertsByType = alerts.reduce((acc, alert) => {
    acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      
      {/* Top Flagged Ingredients */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Top Flagged Ingredients
            </CardTitle>
          </div>
        </div>
        <CardContent className="p-6">
          {topFlagged.length > 0 ? (
            <div className="space-y-3">
              {topFlagged.map(([ingredient, data]) => (
                <div key={ingredient} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{ingredient}</p>
                    <p className="text-xs text-slate-600">{Array.from(data.reasons).join(', ')}</p>
                  </div>
                  <Badge className="bg-amber-600 text-white">{data.count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 text-center py-4">No ingredients flagged yet</p>
          )}
        </CardContent>
      </Card>

      {/* Alerts by Source */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Alert Sources
            </CardTitle>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="space-y-2">
            {Object.entries(alertsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700 capitalize">{type.replace(/_/g, ' ')}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-b border-blue-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
              <Info className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Safety Tips
            </CardTitle>
          </div>
        </div>
        <CardContent className="p-6">
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Always scan products before first use</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Update your profile when health conditions change</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Create separate profiles for family members</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Review safer alternatives suggested by the system</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}