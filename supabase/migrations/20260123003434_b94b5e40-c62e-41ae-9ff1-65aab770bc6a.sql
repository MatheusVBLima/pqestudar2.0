-- 1) Add escolaridades column (text array) with empty default
ALTER TABLE public.oportunidades
ADD COLUMN IF NOT EXISTS escolaridades text[] NOT NULL DEFAULT '{}';

-- 2) Backfill: copy escolaridade (string) to escolaridades (array) for existing records
UPDATE public.oportunidades
SET escolaridades = ARRAY[escolaridade]
WHERE escolaridade IS NOT NULL 
  AND escolaridade != ''
  AND (escolaridades IS NULL OR escolaridades = '{}');

-- 3) Create GIN index for array filtering
CREATE INDEX IF NOT EXISTS idx_oportunidades_escolaridades 
ON public.oportunidades USING GIN (escolaridades);

-- 4) Update the public view to expose escolaridades
DROP VIEW IF EXISTS public.oportunidades_public;
CREATE VIEW public.oportunidades_public WITH (security_invoker = true) AS
SELECT 
  id,
  titulo,
  slug,
  categoria,
  tipo,
  escolaridade,
  escolaridades,
  abrangencia,
  situacao,
  orgao,
  banca,
  resumo_editorial,
  conteudo_principal,
  link_edital,
  meta_title,
  meta_description,
  data_publicacao,
  published_at,
  visualizacoes,
  created_at,
  updated_at
FROM public.oportunidades
WHERE publicado = true;

-- 5) Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.oportunidades_public TO anon, authenticated;