-- ============================================================================
-- SECURITY FIX: Eliminate EXPOSED_SENSITIVE_DATA, PUBLIC_USER_DATA, MISSING_RLS_PROTECTION
-- ============================================================================

-- A) brevo_config — EXPOSED_SENSITIVE_DATA
-- ============================================================================
-- Blind this table completely from public/anon/authenticated access
-- Only service_role and admin functions can access

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.brevo_config ENABLE ROW LEVEL SECURITY;

-- Revoke all public grants (idempotent)
REVOKE ALL ON public.brevo_config FROM public, anon, authenticated;

-- Drop existing policies and recreate strict ones
DROP POLICY IF EXISTS "Admins podem visualizar configurações Brevo" ON public.brevo_config;
DROP POLICY IF EXISTS "Admins podem atualizar configurações Brevo" ON public.brevo_config;

-- Only service_role can access (admin panel uses service_role)
-- No direct access for authenticated users
CREATE POLICY "service_role_only_select" ON public.brevo_config
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "service_role_only_update" ON public.brevo_config
  FOR UPDATE TO service_role
  USING (true);

COMMENT ON TABLE public.brevo_config IS 'SECURITY: Contains sensitive API keys. Only accessible via service_role. No public/anon/authenticated access.';

-- B) user_roles — PUBLIC_USER_DATA
-- ============================================================================
-- Already has "Deny all public access" policy, but let's ensure it's complete
-- The is_admin() function already exists and is the ONLY way to check admin status

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Revoke all public grants (idempotent)
REVOKE ALL ON public.user_roles FROM public, anon, authenticated;

-- Recreate strict policies (drop first for idempotency)
DROP POLICY IF EXISTS "Deny all public access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Deny everything by default to anon
CREATE POLICY "deny_anon_all" ON public.user_roles
  FOR ALL TO anon
  USING (false);

-- Authenticated users can ONLY see their own roles
CREATE POLICY "auth_view_own_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only service_role can manage roles (admin panel uses service_role)
CREATE POLICY "service_role_full_access" ON public.user_roles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.user_roles IS 'SECURITY: User roles table. Public cannot enumerate. Users see only their own roles. Admin operations via service_role only. Use is_admin() function to check admin status.';

-- Ensure is_admin() function has proper grants
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- C) course_suggestions_public — MISSING_RLS_PROTECTION
-- ============================================================================
-- Recreate VIEW without user_id exposure, showing only aggregated/anonymous data

-- Drop existing view
DROP VIEW IF EXISTS public.course_suggestions_public CASCADE;

-- Recreate view exposing ONLY safe, aggregated fields
-- No user_id, no personal identifiers
CREATE VIEW public.course_suggestions_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  suggestion,
  status,
  created_at,
  updated_at,
  is_anonymous,
  -- DO NOT include user_id
  -- DO NOT include any personal identifiers
  CASE 
    WHEN is_anonymous THEN 'anonymous'
    ELSE 'authenticated'
  END as submitter_type
FROM public.course_suggestions
WHERE is_anonymous = true OR user_id IS NOT NULL;

-- Grant SELECT to public on the view
GRANT SELECT ON public.course_suggestions_public TO anon, authenticated;

COMMENT ON VIEW public.course_suggestions_public IS 'SECURITY: Public view of course suggestions. Does NOT expose user_id or personal data. Shows only anonymous/aggregated information.';

-- Ensure course_suggestions table has proper RLS
ALTER TABLE public.course_suggestions ENABLE ROW LEVEL SECURITY;

-- Revoke direct table access
REVOKE ALL ON public.course_suggestions FROM public, anon, authenticated;

-- Recreate policies for course_suggestions (drop first for idempotency)
DROP POLICY IF EXISTS "Users can create course suggestions" ON public.course_suggestions;
DROP POLICY IF EXISTS "Authenticated users can view their own suggestions" ON public.course_suggestions;

-- Users can insert their own suggestions OR anonymous suggestions
CREATE POLICY "insert_own_or_anonymous" ON public.course_suggestions
  FOR INSERT TO authenticated, anon
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL AND is_anonymous = true) OR
    (auth.uid() = user_id AND is_anonymous = false)
  );

-- Authenticated users can ONLY view their own suggestions
CREATE POLICY "view_own_suggestions" ON public.course_suggestions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access (for admin panel)
CREATE POLICY "service_role_full_access_suggestions" ON public.course_suggestions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.course_suggestions IS 'SECURITY: User suggestions. RLS enforced. Users see only their own. Public view (course_suggestions_public) exposes aggregated data only.';

-- ============================================================================
-- Final security comments
-- ============================================================================

COMMENT ON FUNCTION public.is_admin() IS 'SECURITY: Safe way to check if current user is admin. Returns boolean without exposing admin user IDs.';
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 'SECURITY: DEFINER function to check roles without RLS recursion. Used internally by is_admin().';
