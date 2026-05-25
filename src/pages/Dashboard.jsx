import { useContext } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import ProfilePage from '@/components/profile/ProfilePage';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#EDF7F2' }}>
        <AuthGate featureName="Dashboard" featureDescription="Sign in to access your personalised command centre." />
      </div>
    );
  }

  return <ProfilePage />;
}