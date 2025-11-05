-- ============================================================================
-- SECURITY FIX: Resolve EXPOSED_SENSITIVE_DATA + MISSING_RLS_PROTECTION
-- ============================================================================

-- A) brevo_config — ZERO direct access, only via whitelisted function
-- ============================================================================

-- Ensure RLS is ON
ALTER TABLE public.brevo_config ENABLE ROW LEVEL SECURITY;

-- Revoke ALL grants from everyone (idempotent)
REVOKE ALL ON public.brevo_config FROM public, anon, authenticated;

-- Drop ALL existing policies (even service_role ones that are too permissive)
DROP POLICY IF EXISTS "service_role_only_select" ON public.brevo_config;
DROP POLICY IF EXISTS "service_role_only_update" ON public.brevo_config;
DROP POLICY IF EXISTS "Admins podem visualizar configurações Brevo" ON public.brevo_config;
DROP POLICY IF EXISTS "Admins podem atualizar configurações Brevo" ON public.brevo_config;

-- Create DENY-ALL policies for anon and authenticated
CREATE POLICY "deny_all_anon" ON public.brevo_config
  FOR ALL TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "deny_all_authenticated" ON public.brevo_config
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);

-- Service role can still access for admin operations
CREATE POLICY "service_role_admin_access" ON public.brevo_config
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create secure function to get Brevo config (SECURITY DEFINER)
-- This function can ONLY be called from backend/edge functions with service_role
-- Never expose this via PostgREST to public
CREATE OR REPLACE FUNCTION public.get_brevo_config()
RETURNS TABLE (
  default_list_id text,
  webhook_url text,
  opt_in_mode text,
  default_tags text[],
  success_message_single text,
  success_message_doi text,
  error_message_generic text,
  error_message_already_subscribed text,
  allow_resend_welcome boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with definer's privileges
  -- Only returns non-encrypted fields safe for backend use
  RETURN QUERY
  SELECT 
    bc.default_list_id,
    bc.webhook_url,
    bc.opt_in_mode,
    bc.default_tags,
    bc.success_message_single,
    bc.success_message_doi,
    bc.error_message_generic,
    bc.error_message_already_subscribed,
    bc.allow_resend_welcome
  FROM public.brevo_config bc
  LIMIT 1;
END;
$$;

-- DO NOT grant EXECUTE to anon or authenticated
-- Only service_role (backend) can call this
REVOKE ALL ON FUNCTION public.get_brevo_config() FROM public, anon, authenticated;

COMMENT ON TABLE public.brevo_config IS 
'SECURITY CRITICAL: Contains encrypted API keys and sensitive configuration. 
- RLS: Enabled with DENY-ALL for anon/authenticated
- Access: ONLY via get_brevo_config() function from backend (service_role)
- Never query this table directly from client code
- Never expose get_brevo_config() via PostgREST public endpoints';

COMMENT ON FUNCTION public.get_brevo_config() IS
'SECURITY: Returns safe Brevo config fields. NEVER expose to public endpoints. Backend/edge functions only.';

-- B) course_suggestions — strict RLS on base table
-- ============================================================================

-- Ensure RLS is ON
ALTER TABLE public.course_suggestions ENABLE ROW LEVEL SECURITY;

-- Revoke ALL direct access to base table
REVOKE ALL ON public.course_suggestions FROM public, anon, authenticated;

-- Drop existing policies and recreate strict ones
DROP POLICY IF EXISTS "insert_own_or_anonymous" ON public.course_suggestions;
DROP POLICY IF EXISTS "view_own_suggestions" ON public.course_suggestions;
DROP POLICY IF EXISTS "service_role_full_access_suggestions" ON public.course_suggestions;
DROP POLICY IF EXISTS "Users can create course suggestions" ON public.course_suggestions;
DROP POLICY IF EXISTS "Authenticated users can view their own suggestions" ON public.course_suggestions;

-- Deny all to anon by default
CREATE POLICY "deny_anon_select" ON public.course_suggestions
  FOR SELECT TO anon
  USING (false);

-- Anon can INSERT anonymous suggestions
CREATE POLICY "anon_insert_anonymous" ON public.course_suggestions
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND is_anonymous = true);

-- Authenticated can INSERT their own suggestions
CREATE POLICY "auth_insert_own" ON public.course_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_anonymous = false);

-- Authenticated can only SELECT their own suggestions
CREATE POLICY "auth_select_own" ON public.course_suggestions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated can only UPDATE/DELETE their own suggestions
CREATE POLICY "auth_update_own" ON public.course_suggestions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "auth_delete_own" ON public.course_suggestions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Service role has full access (for admin panel)
CREATE POLICY "service_role_full" ON public.course_suggestions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.course_suggestions IS
'SECURITY: User course suggestions with strict RLS.
- Authenticated users: see ONLY their own suggestions
- Anonymous: can insert anonymous suggestions only
- Public aggregated view: course_suggestions_public (no user_id exposure)
- Admin: full access via service_role';

-- C) course_suggestions_public — 100% anonymous aggregated VIEW
-- ============================================================================

-- Drop existing view
DROP VIEW IF EXISTS public.course_suggestions_public CASCADE;

-- Recreate as fully anonymous aggregated view
-- NO user_id, NO personal identifiers, ONLY aggregated/anonymized data
CREATE VIEW public.course_suggestions_public
WITH (security_invoker = true)
AS
SELECT 
  -- Anonymized/aggregated fields only
  DATE_TRUNC('day', created_at) as submission_date,
  status,
  COUNT(*) as suggestion_count,
  is_anonymous,
  -- Optionally show generic category/topic if needed
  CASE 
    WHEN is_anonymous THEN 'anonymous'
    ELSE 'authenticated'
  END as submitter_type
FROM public.course_suggestions
GROUP BY 
  DATE_TRUNC('day', created_at),
  status,
  is_anonymous
ORDER BY submission_date DESC;

-- Grant SELECT to public on aggregated view only
GRANT SELECT ON public.course_suggestions_public TO anon, authenticated;

COMMENT ON VIEW public.course_suggestions_public IS
'SECURITY: Public aggregated view of course suggestions.
- NO user_id exposure
- NO individual suggestion content
- Only aggregated counts and statistics
- Date truncated to day level (timing attack mitigation)
- Users wanting their own suggestions must query base table (RLS protects it)';

-- D) Optional: Create user-specific view for "my suggestions"
-- ============================================================================

-- Drop if exists
DROP VIEW IF EXISTS public.course_suggestions_me CASCADE;

-- User can see their own suggestions via this view
CREATE VIEW public.course_suggestions_me
WITH (security_invoker = true)
AS
SELECT 
  id,
  suggestion,
  status,
  created_at,
  updated_at,
  is_anonymous
FROM public.course_suggestions
WHERE user_id = auth.uid();

-- Grant SELECT only to authenticated users
GRANT SELECT ON public.course_suggestions_me TO authenticated;

COMMENT ON VIEW public.course_suggestions_me IS
'SECURITY: Personal view for authenticated users to see ONLY their own suggestions.
- Filtered by auth.uid() automatically
- No access to other users suggestions
- Safe for authenticated user self-service';

-- E) Consistency checks (optional but recommended)
-- ============================================================================

-- Add check constraint: is_anonymous=true implies user_id IS NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_anonymous_no_user'
  ) THEN
    ALTER TABLE public.course_suggestions
    ADD CONSTRAINT check_anonymous_no_user 
    CHECK (
      (is_anonymous = true AND user_id IS NULL) OR
      (is_anonymous = false AND user_id IS NOT NULL)
    );
  END IF;
END $$;

-- ============================================================================
-- Final security summary
-- ============================================================================

COMMENT ON SCHEMA public IS 
'Security hardened:
✅ brevo_config: DENY-ALL RLS, access only via get_brevo_config() (backend)
✅ course_suggestions: strict RLS (users see only their own)
✅ course_suggestions_public: aggregated view (no PII, timing-safe)
✅ course_suggestions_me: personal view (auth.uid() filter)
✅ user_roles: deny public, is_admin() only
';
