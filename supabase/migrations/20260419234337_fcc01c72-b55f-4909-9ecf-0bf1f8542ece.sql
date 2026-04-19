-- 1. Adiciona coluna public_category
ALTER TABLE public.guides
ADD COLUMN IF NOT EXISTS public_category text;

-- 2. Backfill com mapeamento determinístico da categoria interna existente
UPDATE public.guides
SET public_category = CASE
  WHEN category IN ('estudos-planejamento', 'Estudos e Planejamento') THEN 'Educação'
  WHEN category IN ('cursos-certificados-formacao', 'Cursos, Certificados e Formação') THEN 'Educação'
  WHEN category IN ('produtividade-rotina', 'Produtividade e Rotina') THEN 'Educação'
  WHEN category IN ('carreira-oportunidades', 'Carreira e Oportunidades') THEN 'Carreira'
  WHEN category IN ('ferramentas-tecnologia', 'Ferramentas e Tecnologia') THEN 'Ferramentas'
  WHEN category IN ('provas-editais-regras', 'Provas, Editais e Regras') THEN 'Oportunidades'
  WHEN category IN ('guias-praticos', 'Guias práticos do dia a dia') THEN 'Guias'
  ELSE 'Guias'
END
WHERE public_category IS NULL;

-- 3. Default para novos inserts
ALTER TABLE public.guides
ALTER COLUMN public_category SET DEFAULT 'Guias';

-- 4. Tornar NOT NULL agora que está backfilled
ALTER TABLE public.guides
ALTER COLUMN public_category SET NOT NULL;

-- 5. Trigger de validação (em vez de CHECK constraint, conforme guidelines do projeto)
CREATE OR REPLACE FUNCTION public.validate_guide_public_category()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.public_category NOT IN (
    'Educação', 'Carreira', 'Ferramentas', 'Guias',
    'Benefícios', 'Oportunidades', 'Listas'
  ) THEN
    RAISE EXCEPTION 'Categoria Pública inválida: %. Valores permitidos: Educação, Carreira, Ferramentas, Guias, Benefícios, Oportunidades, Listas.', NEW.public_category;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_guide_public_category_trigger ON public.guides;
CREATE TRIGGER validate_guide_public_category_trigger
BEFORE INSERT OR UPDATE OF public_category ON public.guides
FOR EACH ROW
EXECUTE FUNCTION public.validate_guide_public_category();

-- 6. Índice para filtro público por categoria
CREATE INDEX IF NOT EXISTS idx_guides_public_category
ON public.guides(public_category)
WHERE is_published = true;