import React, { useContext } from 'react';
import ProfilePage from '../components/profile/ProfilePage';
import AuthGate from '../components/auth/AuthGate';
import AuthContext from '../components/auth/AuthContext';

export default function Profile() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <AuthGate 
                    featureName="Profile"
                    featureDescription="Please log in to view and manage your profile, saved formulas, and rewards."
                />
            </div>
        );
    }
    
    return <ProfilePage />;
}