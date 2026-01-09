import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FlaskConical, ArrowRight, Clock, Building2, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const FormulaCard = ({ formula }) => {
  const formatProductType = (type) => {
    if (!type) return 'Custom';
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-slate-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        formula.is_business_mode ? 'bg-violet-100' : 'bg-teal-100'
      }`}>
        <FlaskConical className={`w-5 h-5 ${formula.is_business_mode ? 'text-violet-600' : 'text-teal-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-slate-800 truncate">{formula.name || 'Unnamed Formula'}</p>
          {formula.status === 'draft' && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
              Draft
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{formatProductType(formula.product_type)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            {formula.is_business_mode ? <Building2 className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
            {formula.is_business_mode ? 'Business' : 'Personal'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(formula.updated_date || formula.created_date), { addSuffix: true })}
      </div>
    </div>
  );
};

export default function RecentFormulas({ formulas, isLoading }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="w-5 h-5 text-violet-600" />
          Recent Formulas
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
        ) : formulas.length > 0 ? (
          <div className="space-y-1">
            {formulas.slice(0, 4).map(formula => (
              <Link key={formula.id} to={`${createPageUrl('generator')}?load=${formula.id}`}>
                <FormulaCard formula={formula} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No formulas yet</p>
            <p className="text-xs text-slate-400">Create your first formula!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={createPageUrl("FormulaHistory")} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View All Formulas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}