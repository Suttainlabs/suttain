import SubscriptionLock from '@/components/shared/SubscriptionLock';
export default function ResearchAccessNotice() {
  return <SubscriptionLock pillar="research" featureName="Research simulations" limit />;
}