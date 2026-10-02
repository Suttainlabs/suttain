import SubscriptionLock from '@/components/shared/SubscriptionLock';
export default function TrialExpiredBanner({ featureName, pillar = 'core' }) {
  return <SubscriptionLock pillar={pillar} featureName={featureName} limit />;
}