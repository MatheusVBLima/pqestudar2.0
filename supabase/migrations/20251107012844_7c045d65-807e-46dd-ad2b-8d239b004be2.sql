-- Corrigir views para não serem SECURITY DEFINER
-- As views devem respeitar as permissões do usuário que as consulta

DROP VIEW IF EXISTS public.active_courses CASCADE;
DROP VIEW IF EXISTS public.courses_public CASCADE;
DROP VIEW IF EXISTS public.active_partners CASCADE;
DROP VIEW IF EXISTS public.partners_public CASCADE;

-- Recriar partners_public como view normal (sem SECURITY DEFINER)
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
ORDER BY sort_order ASC, id ASC;

-- Alias active_partners
CREATE VIEW public.active_partners
WITH (security_invoker = true)
AS
SELECT * FROM public.partners_public;

-- Recriar courses_public como view normal (sem SECURITY DEFINER)
CREATE VIEW public.courses_public
WITH (security_invoker = true)
AS
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

-- Alias active_courses
CREATE VIEW public.active_courses
WITH (security_invoker = true)
AS
SELECT * FROM public.courses_public;

-- Recriar grants para as views
GRANT SELECT ON public.partners_public TO anon, authenticated;
GRANT SELECT ON public.active_partners TO anon, authenticated;
GRANT SELECT ON public.courses_public TO anon, authenticated;
GRANT SELECT ON public.active_courses TO anon, authenticated;

-- Comentários
COMMENT ON VIEW public.partners_public IS 'View pública segura para parceiros ativos (security_invoker)';
COMMENT ON VIEW public.active_partners IS 'Alias para partners_public';
COMMENT ON VIEW public.courses_public IS 'View pública segura para cursos ativos e visíveis (security_invoker)';
COMMENT ON VIEW public.active_courses IS 'Alias para courses_public';