import React, { useContext } from 'react';
import { Gauge } from 'lucide-react';
import AuthContext from '@/components/auth/AuthContext';
import useTrialStatus from '@/hooks/useTrialStatus';

export default function SimulationStatusBanner({ user: suppliedUser, pillar = 'research', className = '' }) {
  const { user: contextUser } = useContext(AuthContext);
  const user = contextUser || suppliedUser;
  const status = useTrialStatus(user);
  if (!user) return null;
  const research = pillar === 'research';
  const key = research ? 'researchSimulations' : 'simulations';
  const unlimited = research ? status.hasResearchAccess : status.hasCoreAccess;
  const remaining = Math.max(0, status.limits[key] - status.usage[key]);
  const plan = user.role === 'admin' ? 'Admin access' : user.admin_granted_access ? 'Granted access' : status.hasResearchAccess ? 'Research plan' : status.hasCoreAccess ? 'Core plan' : 'Free plan';
  const label = research ? 'Research' : 'Core';
  return (
    <div role="status" aria-live="polite" className={`flex flex-col gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex items-center gap-2"><Gauge aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="font-medium">{plan}</span></div>
      <p className="text-muted-foreground">{unlimited ? `${label} simulations: unlimited this month` : <><span className="font-medium text-foreground">{remaining} of {status.limits[key]}</span> {label.toLowerCase()} simulations remaining this month</>}</p>
    </div>
  );
}