-- =========================================
-- SEGURANÇA: Resolver achados restantes
-- =========================================

-- 1) newsletter_subscribers — blindar TOTAL
-- Revogar todos os grants públicos explicitamente
REVOKE ALL ON TABLE public.newsletter_subscribers FROM anon;
REVOKE ALL ON TABLE public.newsletter_subscribers FROM authenticated;
REVOKE ALL ON TABLE public.newsletter_subscribers FROM public;

-- Garantir que somente service_role pode acessar
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_subscribers TO service_role;

COMMENT ON TABLE public.newsletter_subscribers IS 
'Contém emails de assinantes. ACESSO RESTRITO: somente service_role via RPC/Edge Functions. Nunca expor diretamente.';


-- 2) newsletter_events — endurecer escrita pública
-- Revogar todos os grants públicos explicitamente
REVOKE ALL ON TABLE public.newsletter_events FROM anon;
REVOKE ALL ON TABLE public.newsletter_events FROM authenticated;
REVOKE ALL ON TABLE public.newsletter_events FROM public;

-- Garantir que somente service_role pode acessar
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_events TO service_role;

COMMENT ON TABLE public.newsletter_events IS 
'Telemetria de newsletter (somente hashes HMAC). ACESSO RESTRITO: somente service_role via RPC/Edge Functions. Retenção: 180 dias.';


-- 3) newsletter_rate_limit — garantir isolamento
-- Revogar todos os grants públicos explicitamente
REVOKE ALL ON TABLE public.newsletter_rate_limit FROM anon;
REVOKE ALL ON TABLE public.newsletter_rate_limit FROM authenticated;
REVOKE ALL ON TABLE public.newsletter_rate_limit FROM public;

-- Garantir que somente service_role pode acessar
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.newsletter_rate_limit TO service_role;

COMMENT ON TABLE public.newsletter_rate_limit IS 
'Rate limiting para newsletter (somente hashes IP). ACESSO RESTRITO: somente service_role. Retenção: 30 dias.';


-- 4) active_courses — Recriar VIEW como SECURITY INVOKER
-- Dropar a VIEW existente
DROP VIEW IF EXISTS public.active_courses;

-- Recriar como SECURITY INVOKER (herda permissões do usuário chamador)
CREATE VIEW public.active_courses
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  description,
  category,
  level,
  duration,
  price,
  institution,
  image_url,
  affiliate_link,
  badge,
  is_active,
  is_hidden,
  students,
  views,
  upvotes,
  downvotes,
  vote_score,
  COALESCE(upvotes, 0) AS likes,
  COALESCE(downvotes, 0) AS dislikes,
  CASE 
    WHEN (upvotes + downvotes) > 0 THEN 
      ROUND(5.0 * (upvotes::numeric / (upvotes + downvotes)), 1)
    ELSE 0.0
  END AS rating,
  created_at,
  updated_at
FROM public.courses
WHERE is_active = true 
  AND is_hidden = false;

-- Revogar acesso direto à tabela courses para anon/authenticated
REVOKE ALL ON TABLE public.courses FROM anon;
REVOKE ALL ON TABLE public.courses FROM authenticated;
REVOKE ALL ON TABLE public.courses FROM public;

-- Conceder SELECT apenas na VIEW para anon/authenticated
GRANT SELECT ON public.active_courses TO anon;
GRANT SELECT ON public.active_courses TO authenticated;

COMMENT ON VIEW public.active_courses IS 
'VIEW pública de cursos ativos (SECURITY INVOKER). Exclui campos sensíveis (created_by, updated_by). Acesso via VIEW, nunca direto à tabela courses.';


-- 5) course_suggestions — privacidade por design
-- Adicionar campo is_anonymous
ALTER TABLE public.course_suggestions 
ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Adicionar constraint: se anônimo, user_id deve ser NULL
ALTER TABLE public.course_suggestions
DROP CONSTRAINT IF EXISTS check_anonymous_user_id;

ALTER TABLE public.course_suggestions
ADD CONSTRAINT check_anonymous_user_id 
CHECK (
  (is_anonymous = true AND user_id IS NULL) OR 
  (is_anonymous = false)
);

-- Atualizar registros existentes: se user_id for NULL, marcar como anônimo
UPDATE public.course_suggestions 
SET is_anonymous = true 
WHERE user_id IS NULL AND is_anonymous = false;

-- Dropar política antiga de inserção e recriar
DROP POLICY IF EXISTS "Users can create course suggestions" ON public.course_suggestions;

CREATE POLICY "Users can create course suggestions" 
ON public.course_suggestions 
FOR INSERT 
WITH CHECK (
  -- Anônimo: sem user_id, is_anonymous = true
  (auth.uid() IS NULL AND user_id IS NULL AND is_anonymous = true) OR
  -- Autenticado: com user_id, is_anonymous = false
  (auth.uid() = user_id AND is_anonymous = false)
);

-- Criar VIEW pública sem user_id
DROP VIEW IF EXISTS public.course_suggestions_public;

CREATE VIEW public.course_suggestions_public
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
ORDER BY created_at DESC;

-- Conceder SELECT na VIEW pública
GRANT SELECT ON public.course_suggestions_public TO anon;
GRANT SELECT ON public.course_suggestions_public TO authenticated;

COMMENT ON VIEW public.course_suggestions_public IS 
'VIEW pública de sugestões de cursos. NUNCA expõe user_id. Agregações e análises devem usar esta VIEW.';

COMMENT ON TABLE public.course_suggestions IS 
'Sugestões de cursos. Suporta envio anônimo (is_anonymous=true, user_id=NULL) e autenticado (is_anonymous=false, user_id preenchido).';


-- 6) Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_course_suggestions_anonymous 
ON public.course_suggestions(is_anonymous) 
WHERE is_anonymous = true;

CREATE INDEX IF NOT EXISTS idx_newsletter_events_created_at 
ON public.newsletter_events(created_at);

CREATE INDEX IF NOT EXISTS idx_newsletter_rate_limit_window_start 
ON public.newsletter_rate_limit(window_start);