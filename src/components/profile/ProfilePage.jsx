import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../auth/AuthContext';
import usePullToRefresh from '../../hooks/usePullToRefresh';
import { Loader2 } from 'lucide-react';
import { getUserStats } from '@/functions/getUserStats';
import { base44 } from '@/api/base44Client';

// Import Dashboard Components
import DashboardHeader from '../dashboard/DashboardHeader';
import PersonalizedRecommendations from '../dashboard/PersonalizedRecommendations';
import QuickAccess from '../dashboard/QuickAccess';
import UserStats from '../dashboard/UserStats';
import RecentFormulas from '../dashboard/RecentFormulas';
import SavedSimulations from '../dashboard/SavedSimulations';
import ScannedProducts from '../dashboard/ScannedProducts';
import NotificationsSummary from '../dashboard/NotificationsSummary';
import RewardsSummary from '../dashboard/RewardsSummary';
import NotificationCenter from '../notifications/NotificationCenter';
import ProjectsOverview from '../dashboard/ProjectsOverview';
import ReferralPanel from '../referral/ReferralPanel';
import SustainabilityScores from '../dashboard/SustainabilityScores';
import HistoricalDataChart from '../dashboard/HistoricalDataChart';

export default function ProfilePage() {
    const { user, refreshUser } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalFormulas: 0, totalSimulations: 0, totalScans: 0 });
    const [formulas, setFormulas] = useState([]);
    const [simulations, setSimulations] = useState([]);
    const [scans, setScans] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [statsData, formulasData, simulationsData, scansData, notificationsData] = await Promise.all([
                    getUserStats(),
                    base44.entities.Formula.list('-updated_date', 20),
                    base44.entities.Simulation.list('-created_date', 20),
                    base44.entities.BarcodeHistory.list('-created_date', 20),
                    base44.entities.Notification.list('-created_date', 10),
                ]);

                if (statsData?.data) {
                    setStats(statsData.data);
                }

                setFormulas(formulasData || []);
                setSimulations(simulationsData || []);
                setScans(scansData || []);
                setNotifications(notificationsData || []);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleRefresh = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [statsData, formulasData, simulationsData, scansData, notificationsData] = await Promise.all([
                getUserStats(),
                base44.entities.Formula.list('-updated_date', 20),
                base44.entities.Simulation.list('-created_date', 20),
                base44.entities.BarcodeHistory.list('-created_date', 20),
                base44.entities.Notification.list('-created_date', 10),
            ]);
            if (statsData?.data) setStats(statsData.data);
            setFormulas(formulasData || []);
            setSimulations(simulationsData || []);
            setScans(scansData || []);
            setNotifications(notificationsData || []);
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const { pullDistance, isRefreshing } = usePullToRefresh(handleRefresh);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };
    
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: '#EDF7F2' }}>
            {/* Pull-to-refresh indicator */}
            <AnimatePresence>
                {(pullDistance > 10 || isRefreshing) && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        className="fixed top-16 left-0 right-0 z-40 flex justify-center pointer-events-none"
                    >
                        <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 text-sm text-slate-600 border border-slate-200">
                            <Loader2 className={`w-4 h-4 text-teal-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing…' : 'Pull to refresh'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                >
                    {/* Profile Header */}
                    <DashboardHeader user={user} greeting={getGreeting()} />

                    {/* Personalized Recommendations based on onboarding role */}
                    <PersonalizedRecommendations user={user} />

                    {/* Quick Access Tools */}
                    <QuickAccess />

                    {/* Stats Overview */}
                    <UserStats stats={stats} isLoading={isLoading} />

                    {/* Projects Overview */}
                    <ProjectsOverview 
                        formulas={formulas}
                        simulations={simulations}
                        isLoading={isLoading}
                    />

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Activity & History */}
                        <div className="lg:col-span-2 space-y-6">
                            <HistoricalDataChart 
                                formulas={formulas}
                                simulations={simulations}
                                scans={scans}
                                isLoading={isLoading}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <RecentFormulas formulas={formulas.slice(0, 5)} isLoading={isLoading} />
                                <SavedSimulations simulations={simulations.slice(0, 5)} isLoading={isLoading} />
                            </div>
                            <ScannedProducts scans={scans.slice(0, 5)} isLoading={isLoading} />
                        </div>

                        {/* Right Column - Insights & Notifications */}
                        <div className="space-y-6">
                            <ReferralPanel user={user} onPointsUpdated={handleRefresh} />
                             <RewardsSummary user={user} />
                            <SustainabilityScores formulas={formulas} isLoading={isLoading} />
                            <NotificationsSummary 
                                notifications={notifications} 
                                isLoading={isLoading}
                                onOpenNotifications={() => setShowNotifications(true)}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Notification Center Modal */}
            <NotificationCenter 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
            />
        </div>
    );
}