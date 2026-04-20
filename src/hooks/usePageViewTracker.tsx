import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';

const SESSION_KEY = 'pqestudar_session_id';

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Tracks page views.
 * - Public routes (non-/admin): registered as actor_type 'public' or 'admin'
 *   so admin's own browsing on the public site is excluded from public metrics.
 * - Admin routes (/admin/*): registered as actor_type 'admin' for admin activity insights.
 * Debounces same path within 10s.
 */
export function usePageViewTracker() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const lastRef = useRef<{ path: string; time: number }>({ path: '', time: 0 });

  useEffect(() => {
    // Wait until we know the user's role to avoid mislabeling
    if (rolesLoading) return;

    const now = Date.now();
    if (lastRef.current.path === pathname && now - lastRef.current.time < 10_000) return;
    lastRef.current = { path: pathname, time: now };

    const isAdminRoute = pathname.startsWith('/admin');
    // Skip if non-admin user lands on /admin (won't have permission anyway)
    if (isAdminRoute && !isAdmin) return;

    const actor_type = isAdmin ? 'admin' : 'public';

    supabase
      .from('page_views')
      .insert({
        path: pathname,
        session_id: getSessionId(),
        user_id: user?.id ?? null,
        actor_type,
      } as any)
      .then(() => {});
  }, [pathname, user?.id, isAdmin, rolesLoading]);
}
