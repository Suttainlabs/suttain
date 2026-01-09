import React from 'react';
import { FlaskConical, TestTube, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ icon: Icon, title, value, iconColor, isLoading }) => (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {isLoading ? (
                <Skeleton className="h-8 w-16" />
            ) : (
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
        </CardContent>
    </Card>
);

export default function UserStats({ stats, isLoading }) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard 
                    icon={FlaskConical} 
                    title="Formulas Created" 
                    value={stats.totalFormulas} 
                    iconColor="bg-purple-600"
                    isLoading={isLoading}
                />
                <StatCard 
                    icon={TestTube} 
                    title="Simulations Run" 
                    value={stats.totalSimulations}
                    iconColor="bg-teal-600"
                    isLoading={isLoading}
                />
                <StatCard 
                    icon={QrCode} 
                    title="Products Scanned" 
                    value={stats.totalScans}
                    iconColor="bg-blue-600"
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}