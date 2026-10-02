import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '@/components/auth/AuthContext';
export default function ResearchGuard({ children }) {
  const { user, isAuthLoading } = useContext(AuthContext);
  if (isAuthLoading) return <div className="py-16 text-center text-muted-foreground">Loading access…</div>;
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />;
  // Research runs enforce their own separate monthly allowance, not Core access.
  return <>{children}</>;
}