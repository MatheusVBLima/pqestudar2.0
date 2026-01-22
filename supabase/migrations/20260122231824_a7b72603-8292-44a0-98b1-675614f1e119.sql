-- Add SEO fields to oportunidades table
ALTER TABLE public.oportunidades
ADD COLUMN IF NOT EXISTS conteudo_principal text,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS slug_locked boolean NOT NULL DEFAULT false;

-- Create table for oportunidade updates (atualizações do concurso)
CREATE TABLE IF NOT EXISTS public.atualizacoes_oportunidade (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oportunidade_id uuid NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  data_atualizacao timestamp with time zone NOT NULL DEFAULT now(),
  texto text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create table for slug redirects (301 redirects when admin changes slug)
CREATE TABLE IF NOT EXISTS public.oportunidades_slug_redirects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oportunidade_id uuid NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  old_slug text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique index on old_slug for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_oportunidades_slug_redirects_old_slug 
ON public.oportunidades_slug_redirects(old_slug);

-- Enable RLS on new tables
ALTER TABLE public.atualizacoes_oportunidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidades_slug_redirects ENABLE ROW LEVEL SECURITY;

-- RLS policies for atualizacoes_oportunidade
CREATE POLICY "Public can view atualizacoes of published oportunidades" 
ON public.atualizacoes_oportunidade 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.oportunidades o 
    WHERE o.id = atualizacoes_oportunidade.oportunidade_id 
    AND o.publicado = true
  )
);

CREATE POLICY "Admins can manage atualizacoes" 
ON public.atualizacoes_oportunidade 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- RLS policies for slug redirects (only admins manage, public reads for redirects)
CREATE POLICY "Public can view slug redirects" 
ON public.oportunidades_slug_redirects 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage slug redirects" 
ON public.oportunidades_slug_redirects 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Update the oportunidades_public view to include new fields
DROP VIEW IF EXISTS public.oportunidades_public;
CREATE VIEW public.oportunidades_public WITH (security_invoker = true) AS
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
  link_edital,
  orgao,
  banca,
  resumo_editorial,
  conteudo_principal,
  meta_title,
  meta_description,
  slug,
  created_at,
  updated_at,
  published_at
FROM public.oportunidades
WHERE publicado = true;

-- Grant SELECT on new views/tables
GRANT SELECT ON public.oportunidades_public TO anon, authenticated;
GRANT SELECT ON public.atualizacoes_oportunidade TO anon, authenticated;
GRANT SELECT ON public.oportunidades_slug_redirects TO anon, authenticated;

-- Create view for public atualizacoes
CREATE VIEW public.atualizacoes_oportunidade_public WITH (security_invoker = true) AS
SELECT 
  ao.id,
  ao.oportunidade_id,
  ao.data_atualizacao,
  ao.texto,
  ao.created_at
FROM public.atualizacoes_oportunidade ao
INNER JOIN public.oportunidades o ON o.id = ao.oportunidade_id
WHERE o.publicado = true;

GRANT SELECT ON public.atualizacoes_oportunidade_public TO anon, authenticated;