import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
 * Tracks page views for public routes only.
 * Skips /admin/* routes. Debounces same path within 10s.
 */
export function usePageViewTracker() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const lastRef = useRef<{ path: string; time: number }>({ path: '', time: 0 });

  useEffect(() => {
    // Skip admin routes
    if (pathname.startsWith('/admin')) return;

    const now = Date.now();
    // Debounce: don't re-insert same path within 10s
    if (lastRef.current.path === pathname && now - lastRef.current.time < 10_000) return;

    lastRef.current = { path: pathname, time: now };

    supabase
      .from('page_views')
      .insert({
        path: pathname,
        session_id: getSessionId(),
        user_id: user?.id ?? null,
      })
      .then(() => {
        // fire-and-forget
      });
  }, [pathname, user?.id]);
}
