-- ============================================
-- A) Camada de dados pública dos cursos
-- ============================================

-- 1. Criar VIEW pública courses_public (SECURITY INVOKER)
-- Expõe apenas campos não-sensíveis de cursos ativos, não ocultos e públicos
DROP VIEW IF EXISTS public.courses_public CASCADE;

CREATE VIEW public.courses_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  description,
  category,
  duration,
  price,
  image_url,
  institution,
  level,
  badge,
  affiliate_link,
  is_active,
  is_hidden,
  views,
  upvotes,
  downvotes,
  vote_score,
  rating,
  students,
  created_at,
  updated_at,
  -- Campos calculados para compatibilidade
  upvotes as likes,
  downvotes as dislikes
FROM public.courses
WHERE is_active = true 
  AND is_hidden = false;

COMMENT ON VIEW public.courses_public IS 
'Public view of active courses - excludes sensitive fields like created_by/updated_by';

-- 2. Recriar active_courses como alias de courses_public
DROP VIEW IF EXISTS public.active_courses CASCADE;

CREATE VIEW public.active_courses
WITH (security_invoker = true)
AS
SELECT * FROM public.courses_public;

COMMENT ON VIEW public.active_courses IS 
'Alias for courses_public - backward compatibility';

-- 3. Conceder SELECT em views públicas
GRANT SELECT ON public.courses_public TO anon, authenticated;
GRANT SELECT ON public.active_courses TO anon, authenticated;

-- 4. Garantir que tabela base courses não é acessível diretamente por público
-- (já protegida por RLS, mas reforçar)
REVOKE SELECT ON public.courses FROM anon;

-- ============================================
-- B) View agregada para contadores de categoria
-- ============================================

DROP VIEW IF EXISTS public.course_categories_public CASCADE;

CREATE VIEW public.course_categories_public
WITH (security_invoker = true)
AS
SELECT 
  category,
  COUNT(*) as course_count,
  AVG(rating) as avg_rating,
  SUM(views) as total_views
FROM public.courses_public
GROUP BY category;

COMMENT ON VIEW public.course_categories_public IS 
'Aggregated public course statistics by category';

GRANT SELECT ON public.course_categories_public TO anon, authenticated;