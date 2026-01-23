-- Add Markdown support columns to oportunidades
ALTER TABLE public.oportunidades
ADD COLUMN IF NOT EXISTS conteudo_markdown text,
ADD COLUMN IF NOT EXISTS conteudo_html text;

-- Backfill: convert existing conteudo_principal to markdown (it's already markdown-like)
UPDATE public.oportunidades
SET 
  conteudo_markdown = conteudo_principal,
  conteudo_html = NULL  -- Will be generated on next save
WHERE conteudo_markdown IS NULL AND conteudo_principal IS NOT NULL;

-- Update the public view to expose the new fields
DROP VIEW IF EXISTS public.oportunidades_public;

CREATE VIEW public.oportunidades_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  categoria,
  titulo,
  abrangencia,
  situacao,
  data_publicacao,
  visualizacoes,
  tipo,
  escolaridade,
  escolaridades,
  link_edital,
  orgao,
  banca,
  resumo_editorial,
  conteudo_principal,
  conteudo_markdown,
  conteudo_html,
  meta_title,
  meta_description,
  published_at,
  slug,
  created_at,
  updated_at
FROM public.oportunidades
WHERE publicado = true;

-- Grant access to the view
GRANT SELECT ON public.oportunidades_public TO anon, authenticated;

COMMENT ON COLUMN public.oportunidades.conteudo_markdown IS 'Raw markdown content for editor';
COMMENT ON COLUMN public.oportunidades.conteudo_html IS 'Pre-rendered and sanitized HTML from markdown';