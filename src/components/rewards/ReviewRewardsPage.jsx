
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, Gift, MessageSquare, Award, ChevronRight, Info, FlaskConical, TestTube } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, description, colorClass }) => (
    <Card className="shadow-lg border-0">
        <CardContent className="p-6 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm font-semibold text-slate-700">{title}</p>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
        </CardContent>
    </Card>
);

const HowToEarnCard = ({ icon: Icon, title, description, points, colorClass }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow">
        <div className={`w-10 h-10 flex-shrink-0 ${colorClass} text-white rounded-full flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-slate-600 text-sm">{description} <span className="font-bold text-amber-500">+{points} points</span>.</p>
        </div>
    </div>
);


export default function ReviewRewardsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.warn("User not logged in");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };
    
    const userPoints = user?.reward_points || 0;
    const redeemableValue = (userPoints * 0.01).toFixed(2);

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                     <motion.div
                        className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-full mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Award className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                        Your Rewards
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Earn points for your feedback and contributions.
                    </p>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {loading ? (
                        <p>Loading rewards...</p>
                    ) : (
                        <>
                            <StatCard
                                icon={Star}
                                title="Reward Points"
                                value={userPoints}
                                description="Keep them coming!"
                                colorClass="bg-gradient-to-br from-amber-400 to-orange-500"
                            />
                            <StatCard
                                icon={Gift}
                                title="Redeemable Value"
                                value={`$${redeemableValue}`}
                                description="Each point is worth $0.01"
                                colorClass="bg-gradient-to-br from-teal-400 to-cyan-500"
                            />
                        </>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* How to Earn */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">How to Earn Points</h2>
                        <div className="space-y-4">
                           <HowToEarnCard
                                icon={MessageSquare}
                                title="Leave a Review"
                                description="Rate our features and provide feedback"
                                points={5}
                                colorClass="bg-violet-500"
                           />
                           <HowToEarnCard
                                icon={FlaskConical}
                                title="Create a Formula"
                                description="Save a new formula in the generator"
                                points={10}
                                colorClass="bg-rose-500"
                           />
                           <HowToEarnCard
                                icon={TestTube}
                                title="Run a Simulation"
                                description="Successfully run a simulation"
                                points={5}
                                colorClass="bg-teal-500"
                           />
                        </div>
                    </div>
                    
                    {/* Redemption Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800">Redeem Points</h2>
                         <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-2xl">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Gift className="w-6 h-6"/>
                                    Redemption Coming Soon
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 space-y-4">
                                <p className="text-slate-300">
                                    We're working hard to let you use your points for discounts on Suttain subscriptions.
                                </p>
                                <Button disabled className="w-full bg-slate-700 hover:bg-slate-600 text-white cursor-not-allowed">
                                    Redeem Now
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Card className="inline-block">
                        <CardContent className="p-6">
                             <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Earn More?</h3>
                            <p className="text-slate-600 mb-4">Leave a review on a feature you've used.</p>
                            <Link to={createPageUrl('CommunityReviews')}>
                                <Button size="lg" className="bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                                    Leave a Review
                                    <ChevronRight className="w-5 h-5 ml-2"/>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
                
                 <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-blue-800">Rewards Program Policy</h4>
                        <p className="text-sm text-blue-700">
                            Points are awarded for genuine contributions and activities within the Suttain platform. Suttain reserves the right to adjust point values and earning methods. Points have no cash value outside of the Suttain platform and cannot be transferred. Redemption options and rates are subject to change.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
