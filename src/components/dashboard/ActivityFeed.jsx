import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, QrCode, ArrowRight, FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const activityConfig = {
    formula: {
        icon: Sparkles,
        color: 'bg-purple-100 text-purple-600',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Formula'
    },
    simulation: {
        icon: Zap,
        color: 'bg-blue-100 text-blue-600',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Simulation'
    },
    scan: {
        icon: QrCode,
        color: 'bg-teal-100 text-teal-600',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        label: 'Scan'
    }
};

const formatProductType = (type) => {
    if (!type) return null;
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const ActivityItem = ({ item }) => {
    const config = activityConfig[item.type] || { icon: FileText, color: 'bg-slate-100 text-slate-600', badgeColor: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Activity' };
    const Icon = config.icon;
    let title, subtitle;

    switch (item.type) {
        case 'formula':
            title = item.name || 'Unnamed Formula';
            subtitle = formatProductType(item.product_type);
            break;
        case 'simulation':
            title = 'Chemical Simulation';
            subtitle = item.chemicals?.slice(0, 3).join(', ') + (item.chemicals?.length > 3 ? '...' : '');
            break;
        case 'scan':
            title = item.product_name || 'Product Scan';
            subtitle = item.barcode;
            break;
        default:
            title = 'Activity';
            subtitle = '';
    }

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-slate-50/80 rounded-xl transition-colors group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${config.badgeColor}`}>
                        {config.label}
                    </Badge>
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{title}</p>
                {subtitle && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
                )}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap pt-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
            </div>
        </div>
    );
};

export default function ActivityFeed({ activity, isLoading }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="flex items-center space-x-4">
                             <Skeleton className="h-8 w-8 rounded-full" />
                             <div className="space-y-2">
                               <Skeleton className="h-4 w-[250px]" />
                               <Skeleton className="h-4 w-[200px]" />
                             </div>
                           </div>
                        ))}
                    </div>
                ) : activity.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {activity.map(item => <ActivityItem key={`${item.type}-${item.id}`} item={item} />)}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No recent activity yet. Get started with one of the tools!</p>
                )}
            </CardContent>
            <CardFooter>
                 <Link to={createPageUrl("ActivityHistory")} className="w-full">
                    <Button variant="outline" className="w-full">
                        View All Activity
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}