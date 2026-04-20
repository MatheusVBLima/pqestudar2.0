import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';

export interface AdminActivityParams {
  area: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  meta?: Record<string, unknown>;
}

/**
 * Records administrative actions (CRUD, publish, AI generation, sync, etc.)
 * into admin_activity_events. Only fires for authenticated admins.
 */
export function useAdminTracker() {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRoles();

  const trackAdmin = useCallback(
    async (params: AdminActivityParams) => {
      if (loading || !isAdmin || !user?.id) return;
      try {
        await supabase.from('admin_activity_events').insert({
          admin_user_id: user.id,
          admin_email: user.email ?? null,
          area: params.area,
          action: params.action,
          entity_type: params.entity_type ?? null,
          entity_id: params.entity_id ?? null,
          path: window.location.pathname,
          meta: (params.meta as any) ?? {},
        } as any);
      } catch {
        // fire-and-forget
      }
    },
    [isAdmin, loading, user?.id, user?.email],
  );

  return { trackAdmin };
}
