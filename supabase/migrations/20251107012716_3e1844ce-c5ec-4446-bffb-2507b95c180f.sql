-- Garantir que RLS está ativo nas tabelas base
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Revogar qualquer acesso direto de anon/authenticated às tabelas base
REVOKE ALL ON public.courses FROM anon, authenticated;
REVOKE ALL ON public.partners FROM anon, authenticated;

-- Recriar view partners_public (DROP CASCADE para recriar limpo)
DROP VIEW IF EXISTS public.partners_public CASCADE;
CREATE OR REPLACE VIEW public.partners_public AS
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
ORDER BY sort_order ASC, id ASC;

-- Criar alias active_partners apontando para partners_public
DROP VIEW IF EXISTS public.active_partners CASCADE;
CREATE OR REPLACE VIEW public.active_partners AS
SELECT * FROM public.partners_public;

-- Recriar view courses_public (DROP CASCADE para recriar limpo)
DROP VIEW IF EXISTS public.courses_public CASCADE;
CREATE OR REPLACE VIEW public.courses_public AS
SELECT 
  id,
  title,
  description,
  category,
  duration,
  students,
  rating,
  price,
  image_url,
  institution,
  level,
  is_active,
  is_hidden,
  badge,
  upvotes,
  downvotes,
  vote_score,
  views,
  created_at,
  updated_at,
  affiliate_link,
  upvotes as likes,
  downvotes as dislikes
FROM public.courses
WHERE is_active = true 
  AND is_hidden = false
ORDER BY created_at DESC, id ASC;

-- Criar alias active_courses apontando para courses_public
DROP VIEW IF EXISTS public.active_courses CASCADE;
CREATE OR REPLACE VIEW public.active_courses AS
SELECT * FROM public.courses_public;

-- Conceder SELECT nas views públicas para anon e authenticated
GRANT SELECT ON public.partners_public TO anon, authenticated;
GRANT SELECT ON public.active_partners TO anon, authenticated;
GRANT SELECT ON public.courses_public TO anon, authenticated;
GRANT SELECT ON public.active_courses TO anon, authenticated;

-- Garantir que a função is_admin() existe e está correta
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Comentários para documentação
COMMENT ON VIEW public.partners_public IS 'View pública segura para parceiros ativos (sem created_by/updated_by)';
COMMENT ON VIEW public.active_partners IS 'Alias para partners_public';
COMMENT ON VIEW public.courses_public IS 'View pública segura para cursos ativos e visíveis (sem created_by/updated_by)';
COMMENT ON VIEW public.active_courses IS 'Alias para courses_public';