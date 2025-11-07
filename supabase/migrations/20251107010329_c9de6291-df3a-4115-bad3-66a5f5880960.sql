-- Garantir RLS habilitado e remover GRANT direto para anon/authenticated
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Remover qualquer GRANT direto nas tabelas base para anon/authenticated
REVOKE ALL ON public.courses FROM anon, authenticated;
REVOKE ALL ON public.partners FROM anon, authenticated;

-- Garantir que apenas service_role pode acessar tabelas base
-- (As policies já existentes controlam acesso via is_admin())

-- Confirmar VIEW courses_public já existe (criada anteriormente)
-- Confirmar VIEW partners_public já existe (criada anteriormente)

-- Garantir GRANT SELECT nas views públicas
GRANT SELECT ON public.courses_public TO anon, authenticated;
GRANT SELECT ON public.active_courses TO anon, authenticated;
GRANT SELECT ON public.partners_public TO anon, authenticated;
GRANT SELECT ON public.active_partners TO anon, authenticated;