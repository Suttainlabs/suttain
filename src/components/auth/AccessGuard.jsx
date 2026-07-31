import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { accessForPath, hasAccess, getAccessOption, ACCESS_OPTIONS } from './productAccess';

export default function AccessGuard({ user, isAuthLoading, children }) {
  const location = useLocation();
  const required = accessForPath(location.pathname);

  // Not gated, still loading, or logged out: let the page handle itself.
  if (!required || isAuthLoading || !user) return children;
  if (hasAccess(user, required)) return children;

  const blocked = getAccessOption(required);
  const allowed = ACCESS_OPTIONS.filter((o) => (user.product_access || []).includes(o.value));

  return (
    <div className="page-wrapper content-container max-w-xl">
      <div className="bg-white border border-border rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <h1 className="mb-2">This area is not part of your plan</h1>
        <p className="text-muted-foreground mb-6">
          You chose not to include {blocked.label.toLowerCase()} when you signed up. You can add it any time from your profile.
        </p>
        <div className="flex flex-col gap-2">
          {allowed.map((option) => (
            <Button key={option.value} asChild variant="outline" className="w-full">
              <Link to={option.path}>Go to {option.label.toLowerCase()}</Link>
            </Button>
          ))}
          <Button asChild className="w-full">
            <Link to="/Profile">Manage my access</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}