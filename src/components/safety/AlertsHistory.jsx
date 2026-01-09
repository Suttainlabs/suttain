import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';

const severityConfig = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: '🚨' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: '⚠️' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', icon: '⚡' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: 'ℹ️' }
};

export default function AlertsHistory({ alerts }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-rose-600" />
        Recent Alerts
      </h2>
      
      <div className="space-y-3">
        {alerts.map(alert => {
          const config = severityConfig[alert.severity] || severityConfig.medium;
          
          return (
            <Card key={alert.id} className={`border-2 ${config.border}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${config.bg} ${config.text} capitalize`}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.alert_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{alert.product_name}</h4>
                    <p className="text-sm text-slate-600 mb-2">{alert.alert_message}</p>
                    
                    {alert.flagged_ingredients && alert.flagged_ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {alert.flagged_ingredients.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item.ingredient}
                          </Badge>
                        ))}
                        {alert.flagged_ingredients.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{alert.flagged_ingredients.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-500">
                      {format(new Date(alert.created_date), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}