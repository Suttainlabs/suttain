import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TestTube, ArrowRight, Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getRiskBadge = (riskScore) => {
  if (riskScore >= 70) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'High Risk', icon: AlertTriangle };
  if (riskScore >= 40) return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Moderate', icon: AlertCircle };
  return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Low Risk', icon: CheckCircle };
};

const SimulationCard = ({ simulation }) => {
  const riskBadge = getRiskBadge(simulation.risk_score);
  const RiskIcon = riskBadge.icon;

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100">
        <TestTube className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {simulation.chemicals?.slice(0, 2).join(' + ') || 'Chemical Analysis'}
          {simulation.chemicals?.length > 2 && ` +${simulation.chemicals.length - 2}`}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${riskBadge.color}`}>
            <RiskIcon className="w-3 h-3 mr-1" />
            {riskBadge.label}
          </Badge>
          <span className="text-xs text-slate-400">
            Score: {simulation.risk_score}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(simulation.created_date), { addSuffix: true })}
      </div>
    </div>
  );
};

export default function SavedSimulations({ simulations, isLoading }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TestTube className="w-5 h-5 text-blue-600" />
          Recent Simulations
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : simulations.length > 0 ? (
          <div className="space-y-1">
            {simulations.slice(0, 4).map(sim => (
              <SimulationCard key={sim.id} simulation={sim} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <TestTube className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No simulations yet</p>
            <p className="text-xs text-slate-400">Run your first simulation!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={createPageUrl("Simulator")} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            Open Simulator
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}