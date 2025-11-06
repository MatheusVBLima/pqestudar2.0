-- ============================================
-- A) Camada pública segura para parceiros
-- ============================================

-- 1. Criar VIEW pública partners_public (SECURITY INVOKER)
-- Expõe apenas campos não-sensíveis de parceiros ativos
DROP VIEW IF EXISTS public.partners_public CASCADE;

CREATE VIEW public.partners_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  logo_url,
  url as partner_url,
  sort_order as display_order,
  is_active,
  updated_at
FROM public.partners
WHERE is_active = true
ORDER BY sort_order NULLS LAST, updated_at DESC;

COMMENT ON VIEW public.partners_public IS 
'Public view of active partners - excludes sensitive fields like created_by/updated_by';

-- 2. Conceder SELECT em view pública
GRANT SELECT ON public.partners_public TO anon, authenticated;

-- 3. Garantir que tabela base partners não é acessível diretamente por público
-- (já protegida por RLS existente, mas reforçar)
REVOKE SELECT ON public.partners FROM anon;
REVOKE SELECT ON public.partners FROM authenticated;

-- 4. Criar view adicional active_partners se ainda não existir (alias para compatibilidade)
DROP VIEW IF EXISTS public.active_partners CASCADE;

CREATE VIEW public.active_partners
WITH (security_invoker = true)
AS
SELECT * FROM public.partners_public;

COMMENT ON VIEW public.active_partners IS 
'Alias for partners_public - backward compatibility';

GRANT SELECT ON public.active_partners TO anon, authenticated;