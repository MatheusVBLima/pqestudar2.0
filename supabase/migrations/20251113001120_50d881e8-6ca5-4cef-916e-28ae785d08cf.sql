-- PASSO 1: Diagnóstico antes da mudança (executar manualmente via SQL Editor)
-- SELECT n.nspname AS schema, c.relname AS view, c.reloptions
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relkind = 'v' AND c.relname IN ('tools_public');

-- PASSO 2: Recriar a view tools_public com security_invoker=true
DROP VIEW IF EXISTS public.tools_public;

CREATE OR REPLACE VIEW public.tools_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  name,
  description,
  url,
  icon_url,
  tags,
  is_visible,
  sort_order,
  created_at,
  updated_at
FROM public.tools
WHERE is_visible = true
ORDER BY sort_order ASC, created_at DESC;

-- Garantir que o público pode ler a view
GRANT SELECT ON public.tools_public TO anon, authenticated;

-- PASSO 3: Verificação pós-mudança (executar manualmente via SQL Editor)
-- SELECT n.nspname AS schema, c.relname AS view, c.reloptions
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relkind = 'v' AND c.relname IN ('tools_public');
-- Esperado: reloptions = {security_invoker=true}