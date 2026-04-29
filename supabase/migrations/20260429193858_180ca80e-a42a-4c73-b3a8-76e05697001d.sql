CREATE TABLE IF NOT EXISTS public.guide_public_categories (
  name text PRIMARY KEY,
  sort_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.guide_public_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active guide public categories" ON public.guide_public_categories;
CREATE POLICY "Public can view active guide public categories"
ON public.guide_public_categories
FOR SELECT
TO anon, authenticated
USING (is_active = true);

INSERT INTO public.guide_public_categories (name, sort_order, is_active)
VALUES
  ('Educação', 10, true),
  ('Carreira', 20, true),
  ('Ferramentas', 30, true),
  ('Guias', 40, true),
  ('Benefícios', 50, true),
  ('Oportunidades', 60, true),
  ('Listas', 70, true),
  ('Segurança', 80, true)
ON CONFLICT (name) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    is_active = true;

UPDATE public.guides
SET public_category = 'Segurança'
WHERE public_category = 'Segurança Digital';

CREATE OR REPLACE FUNCTION public.validate_guide_public_category()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.public_category IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.guide_public_categories gpc
    WHERE gpc.name = NEW.public_category
      AND gpc.is_active = true
  ) THEN
    RAISE EXCEPTION 'Categoria Pública inválida: %. Use uma categoria ativa cadastrada em guide_public_categories.', NEW.public_category;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_guide_public_category_trigger ON public.guides;
CREATE TRIGGER validate_guide_public_category_trigger
BEFORE INSERT OR UPDATE OF public_category ON public.guides
FOR EACH ROW
EXECUTE FUNCTION public.validate_guide_public_category();