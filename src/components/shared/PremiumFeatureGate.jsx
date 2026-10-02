import { useContext } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import useTrialStatus from '@/hooks/useTrialStatus';
import SubscriptionLock from '@/components/shared/SubscriptionLock';
export default function PremiumFeatureGate({ children, featureName }) {
  const { user, isAuthLoading } = useContext(AuthContext);
  const { hasCoreAccess } = useTrialStatus(user);
  if (isAuthLoading) return <div className="py-16 text-center text-muted-foreground">Loading access…</div>;
  return hasCoreAccess ? <>{children}</> : <SubscriptionLock featureName={featureName} />;
}