import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
export default function SubscriptionLock({ pillar = 'core', featureName, limit = false }) {
  const research = pillar === 'research';
  return <section className="flex min-h-64 items-center justify-center px-4 py-10 bg-background">
    <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center">
      <div className={research ? 'mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent' : 'mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary'}><Lock className="h-5 w-5" /></div>
      <h2>{limit ? 'Monthly limit reached' : `${featureName || 'This feature'} is included in ${research ? 'Research' : 'Core'}`}</h2>
      <p className="my-4 text-sm text-muted-foreground">{limit ? `Your free monthly allowance for ${featureName || 'simulations'} is used. Subscribe for unlimited access, or return next month.` : `Subscribe to Core or Research to unlock ${featureName || 'this feature'}.`}</p>
      <Link to={`/Pricing?pillar=${pillar}`} className={research ? 'inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm text-accent-foreground' : 'inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm text-primary-foreground'}>Get {research ? 'research' : 'core'} <ArrowRight className="h-4 w-4" /></Link>
    </div>
  </section>;
}