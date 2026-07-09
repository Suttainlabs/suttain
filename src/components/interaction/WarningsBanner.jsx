import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';

const SEVERITY_STYLES = {
  high: {
    container: 'bg-red-50 border-red-300',
    icon: 'text-red-600',
    title: 'text-red-800',
    body: 'text-red-700',
    label: 'Critical',
  },
  medium: {
    container: 'bg-amber-50 border-amber-300',
    icon: 'text-amber-600',
    title: 'text-amber-800',
    body: 'text-amber-700',
    label: 'Warning',
  },
  low: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-700',
    body: 'text-blue-600',
    label: 'Info',
  },
};

export default function WarningsBanner({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  const highSeverity = warnings.filter(w => w.severity === 'high');
  const otherWarnings = warnings.filter(w => w.severity !== 'high');

  return (
    <div className="space-y-2">
      {highSeverity.map((w, i) => {
        const s = SEVERITY_STYLES.high;
        return (
          <Card key={`high-${i}`} className={`border-2 ${s.container}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 ${s.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${s.title}`}>{w.ingredient_pair}</p>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${s.container} ${s.title}`}>{s.label}</span>
                  </div>
                  <p className={`text-xs ${s.body} mt-0.5`}>{w.message}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs flex-shrink-0">
                  <Link to="/generator">
                    Fix in Generator <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {otherWarnings.length > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-3 space-y-2">
            {otherWarnings.map((w, i) => {
              const s = SEVERITY_STYLES[w.severity] || SEVERITY_STYLES.low;
              const Icon = w.severity === 'medium' ? AlertTriangle : Info;
              return (
                <div key={`other-${i}`} className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 ${s.icon} flex-shrink-0 mt-0.5`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-semibold ${s.title}`}>{w.ingredient_pair}</p>
                      <span className={`text-[9px] font-bold uppercase ${s.body}`}>{s.label}</span>
                    </div>
                    <p className={`text-xs ${s.body}`}>{w.message}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}