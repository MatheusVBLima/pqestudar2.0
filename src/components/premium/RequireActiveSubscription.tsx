import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RouteFallbackPremium } from '@/components/layout/route-fallbacks';

interface RequireActiveSubscriptionProps {
  children: React.ReactNode;
}

export function RequireActiveSubscription({ children }: RequireActiveSubscriptionProps) {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const location = useLocation();

  // Show skeleton while loading
  if (authLoading || subLoading || rolesLoading) {
    return <RouteFallbackPremium />;
  }

  // Not logged in -> redirect to login with return URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin always has access (bypass subscription check)
  if (isAdmin) {
    return <>{children}</>;
  }

  // Not active subscriber -> redirect to upgrade page
  if (!isActive()) {
    return <Navigate to="/premium/upgrade" replace />;
  }

  // All good, render children
  return <>{children}</>;
}
