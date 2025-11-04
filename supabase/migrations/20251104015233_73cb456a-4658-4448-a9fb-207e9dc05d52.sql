-- ============================================================================
-- MIGRAÇÃO DE SEGURANÇA: Newsletter Tables Lockdown
-- Remove achados: MISSING_RLS_PROTECTION, EXPOSED_SENSITIVE_DATA, 
-- PUBLIC_USER_DATA, SUPA_extension_in_public
-- ============================================================================

-- 1) newsletter_rate_limit - RLS completa (fecha ERRO)
-- ============================================================================

-- Drop política permissiva existente
DROP POLICY IF EXISTS "Edge functions podem gerenciar rate limit" ON public.newsletter_rate_limit;

-- Ativar RLS se não estiver
ALTER TABLE public.newsletter_rate_limit ENABLE ROW LEVEL SECURITY;

-- Revogar todos os grants públicos
REVOKE ALL ON public.newsletter_rate_limit FROM public;
REVOKE ALL ON public.newsletter_rate_limit FROM anon;
REVOKE ALL ON public.newsletter_rate_limit FROM authenticated;

-- Política: bloquear TUDO (service role bypassa RLS automaticamente)
CREATE POLICY "Block all direct access to rate limit"
ON public.newsletter_rate_limit
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 2) newsletter_subscribers - travar SELECT e bloquear bypass
-- ============================================================================

-- Drop políticas permissivas existentes
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "No direct read access to newsletter subscribers" ON public.newsletter_subscribers;

-- Garantir RLS ativa
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Revogar todos os grants públicos
REVOKE ALL ON public.newsletter_subscribers FROM public;
REVOKE ALL ON public.newsletter_subscribers FROM anon;
REVOKE ALL ON public.newsletter_subscribers FROM authenticated;

-- Política: bloquear TUDO (service role bypassa RLS)
CREATE POLICY "Block all direct access to subscribers"
ON public.newsletter_subscribers
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 3) newsletter_events - endurecer escrita pública
-- ============================================================================

-- Drop políticas permissivas existentes
DROP POLICY IF EXISTS "Admins podem visualizar eventos de newsletter" ON public.newsletter_events;
DROP POLICY IF EXISTS "Edge functions podem inserir eventos" ON public.newsletter_events;

-- Garantir RLS ativa
ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;

-- Revogar todos os grants públicos
REVOKE ALL ON public.newsletter_events FROM public;
REVOKE ALL ON public.newsletter_events FROM anon;
REVOKE ALL ON public.newsletter_events FROM authenticated;

-- Política: bloquear TUDO (service role bypassa RLS)
CREATE POLICY "Block all direct access to newsletter events"
ON public.newsletter_events
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- 4) Mover extensões do schema public para extensions
-- ============================================================================

-- Criar schema extensions se não existir
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover extensão vector e tipos relacionados
-- Nota: pgvector já vem instalado no Supabase, apenas garantindo que está no schema correto
DO $$ 
BEGIN
  -- Verificar se vector está no public e mover para extensions
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'vector' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Se já está em extensions ou não existe, ignora
    NULL;
END $$;

-- Atualizar search_path para incluir extensions
ALTER DATABASE postgres SET search_path TO public, extensions;

-- 5) Criar função de limpeza de dados antigos (retenção)
-- ============================================================================

-- Função para limpar rate_limit (30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_newsletter_rate_limit_30d()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.newsletter_rate_limit 
  WHERE window_start < NOW() - INTERVAL '30 days';
END;
$$;

-- Função para limpar events (180 dias)
CREATE OR REPLACE FUNCTION public.cleanup_newsletter_events_180d()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.newsletter_events 
  WHERE created_at < NOW() - INTERVAL '180 days';
END;
$$;

-- Comentários de documentação
COMMENT ON TABLE public.newsletter_rate_limit IS 'Rate limiting para newsletter - acesso apenas via service role. Retenção: 30 dias.';
COMMENT ON TABLE public.newsletter_subscribers IS 'Emails de assinantes - acesso apenas via service role. Dados sensíveis (PII).';
COMMENT ON TABLE public.newsletter_events IS 'Eventos de newsletter (hashes apenas) - acesso apenas via service role. Retenção: 180 dias.';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- Service role bypassa RLS automaticamente
-- Edge functions com service_role_key continuam funcionando normalmente
-- Cliente web não tem acesso direto a essas tabelas
-- ============================================================================