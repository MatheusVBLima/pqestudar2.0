import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireActiveSubscriptionProps {
  children: React.ReactNode;
}

export function RequireActiveSubscription({ children }: RequireActiveSubscriptionProps) {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const location = useLocation();

  // Show skeleton while loading
  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-8">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login with return URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not active subscriber -> redirect to upgrade page
  if (!isActive()) {
    return <Navigate to="/premium/upgrade" replace />;
  }

  // All good, render children
  return <>{children}</>;
}
