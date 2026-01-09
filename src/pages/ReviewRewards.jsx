import React, { useContext } from 'react';
import ReviewRewardsPage from '../components/rewards/ReviewRewardsPage';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';

export default function ReviewRewards() {
    const { user } = useContext(AuthContext);
    
    if (!user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                 <AuthGate 
                    featureName="Rewards Program"
                    featureDescription="Log in to view your points, earn rewards for feedback, and see what the community is saying."
                />
            </div>
        );
    }
    return <ReviewRewardsPage user={user} />;
}