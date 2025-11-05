-- =========================================
-- REFORÇO DE SEGURANÇA: Eliminar warnings finais (v2)
-- =========================================

-- A) newsletter_subscribers — blindagem total
-- Garantir RLS ativa
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes para recriar clean
DROP POLICY IF EXISTS "Block all direct access to subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service role can manage subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "block_all_public_access_subscribers" ON public.newsletter_subscribers;

-- Política única: DENY ALL para todos exceto service_role
CREATE POLICY "block_all_public_access_subscribers"
ON public.newsletter_subscribers
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Revogar TODOS os grants explicitamente (incluindo sequências)
REVOKE ALL ON TABLE public.newsletter_subscribers FROM anon, authenticated, public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, public;

-- Garantir acesso SOMENTE para service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_subscribers TO service_role;

COMMENT ON TABLE public.newsletter_subscribers IS 
'[SEGURANÇA MÁXIMA] Emails de assinantes. ZERO acesso público. Acesso exclusivo: service_role via Edge Functions. RPC: newsletter_submit.';


-- B) newsletter_events — blindagem total
-- Garantir RLS ativa
ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes para recriar clean
DROP POLICY IF EXISTS "Block all direct access to newsletter events" ON public.newsletter_events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.newsletter_events;
DROP POLICY IF EXISTS "Service role can manage events" ON public.newsletter_events;
DROP POLICY IF EXISTS "block_all_public_access_events" ON public.newsletter_events;

-- Política única: DENY ALL para todos exceto service_role
CREATE POLICY "block_all_public_access_events"
ON public.newsletter_events
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Revogar TODOS os grants explicitamente
REVOKE ALL ON TABLE public.newsletter_events FROM anon, authenticated, public;

-- Garantir acesso SOMENTE para service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_events TO service_role;

COMMENT ON TABLE public.newsletter_events IS 
'[SEGURANÇA MÁXIMA] Telemetria newsletter (APENAS hashes HMAC). ZERO acesso público. Acesso exclusivo: service_role via Edge Functions. Retenção: 180 dias.';


-- C) newsletter_rate_limit — blindagem total
-- Garantir RLS ativa
ALTER TABLE public.newsletter_rate_limit ENABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes para recriar clean
DROP POLICY IF EXISTS "Block all direct access to rate limit" ON public.newsletter_rate_limit;
DROP POLICY IF EXISTS "Admins can manage rate limit" ON public.newsletter_rate_limit;
DROP POLICY IF EXISTS "Service role can manage rate limit" ON public.newsletter_rate_limit;
DROP POLICY IF EXISTS "block_all_public_access_rate_limit" ON public.newsletter_rate_limit;

-- Política única: DENY ALL para todos exceto service_role
CREATE POLICY "block_all_public_access_rate_limit"
ON public.newsletter_rate_limit
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Revogar TODOS os grants explicitamente
REVOKE ALL ON TABLE public.newsletter_rate_limit FROM anon, authenticated, public;

-- Garantir acesso SOMENTE para service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_rate_limit TO service_role;

COMMENT ON TABLE public.newsletter_rate_limit IS 
'[SEGURANÇA MÁXIMA] Rate limiting newsletter (hashes IP). ZERO acesso público. Acesso exclusivo: service_role. Retenção: 30 dias.';


-- D) active_courses VIEW — garantir SECURITY INVOKER e acesso controlado
-- Garantir RLS na tabela courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Revogar TODO acesso direto à tabela courses de anon/authenticated
REVOKE ALL ON TABLE public.courses FROM anon, authenticated, public;

-- Confirmar que active_courses (VIEW) tem acesso público SOMENTE para SELECT
REVOKE ALL ON public.active_courses FROM anon, authenticated, public;
GRANT SELECT ON public.active_courses TO anon, authenticated;

COMMENT ON VIEW public.active_courses IS 
'[VIEW PÚBLICA SEGURA] Cursos ativos (SECURITY INVOKER). Herda RLS de courses. Exclui campos sensíveis (created_by, updated_by). NUNCA acessar courses diretamente.';

COMMENT ON TABLE public.courses IS 
'[ACESSO RESTRITO] Tabela base de cursos. Acesso direto NEGADO para público. Usar VIEW active_courses para consulta pública. Admins: via is_admin() RLS.';


-- E) Adicionar índices de segurança/performance (sem predicados problemáticos)
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at 
ON public.newsletter_subscribers(subscribed_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_events_created_email 
ON public.newsletter_events(created_at DESC, email_hash);

CREATE INDEX IF NOT EXISTS idx_newsletter_rate_limit_window 
ON public.newsletter_rate_limit(window_start DESC);