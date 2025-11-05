-- =====================================================
-- PARCEIROS: Ocultar IDs de admins (created_by/updated_by)
-- =====================================================

-- 1) Garantir RLS ON na tabela base
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 2) Revogar todos os grants públicos diretos à tabela base
REVOKE ALL ON public.partners FROM public;
REVOKE ALL ON public.partners FROM anon;
REVOKE ALL ON public.partners FROM authenticated;

-- 3) Criar VIEW pública segura (sem campos sensíveis)
CREATE OR REPLACE VIEW public.partners_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  logo_url,
  url,
  sort_order,
  is_active,
  created_at,
  updated_at
FROM public.partners
WHERE is_active = true;

-- 4) Conceder SELECT na VIEW para usuários públicos
GRANT SELECT ON public.partners_public TO anon;
GRANT SELECT ON public.partners_public TO authenticated;

-- 5) Manter acesso completo para admins via tabela base (já existe política RLS)
-- A política "Admins can manage partners" já garante que admins podem SELECT/INSERT/UPDATE/DELETE
-- via is_admin() function

-- 6) Adicionar comentários de segurança
COMMENT ON TABLE public.partners IS 
'[SECURITY] Acesso direto bloqueado para anon/authenticated. Admins via RLS is_admin(). Público usa partners_public VIEW.';

COMMENT ON VIEW public.partners_public IS 
'[SECURITY] VIEW pública sem campos sensíveis (created_by, updated_by). Apenas parceiros ativos (is_active=true).';