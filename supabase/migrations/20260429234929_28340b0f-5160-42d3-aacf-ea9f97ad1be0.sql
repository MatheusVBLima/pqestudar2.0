-- 1) New columns
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS what_is text,
  ADD COLUMN IF NOT EXISTS who_for text,
  ADD COLUMN IF NOT EXISTS how_helps text,
  ADD COLUMN IF NOT EXISTS pros text,
  ADD COLUMN IF NOT EXISTS cons text,
  ADD COLUMN IF NOT EXISTS extra_markdown text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- 2a) Create unaccent_safe FIRST (used by slugify)
CREATE OR REPLACE FUNCTION public.unaccent_safe(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN translate(
    coalesce(input_text, ''),
    'áàâãäåÁÀÂÃÄÅéèêëÉÈÊËíìîïÍÌÎÏóòôõöÓÒÔÕÖúùûüÚÙÛÜçÇñÑ',
    'aaaaaaAAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUcCnN'
  );
END;
$$;

-- 2b) Slug generator helper
CREATE OR REPLACE FUNCTION public.slugify_tool_name(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(
    regexp_replace(
      lower(public.unaccent_safe(coalesce(input_text, ''))),
      '[^a-z0-9]+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
$$;

-- 3) Trigger function
CREATE OR REPLACE FUNCTION public.tools_ensure_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  candidate text;
  counter int := 1;
BEGIN
  IF NEW.slug IS NULL OR length(trim(NEW.slug)) = 0 THEN
    base_slug := public.slugify_tool_name(NEW.name);
  ELSE
    base_slug := public.slugify_tool_name(NEW.slug);
  END IF;

  IF base_slug IS NULL OR base_slug = '' THEN
    base_slug := 'ferramenta';
  END IF;

  candidate := base_slug;

  WHILE EXISTS (
    SELECT 1 FROM public.tools
    WHERE slug = candidate
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) LOOP
    counter := counter + 1;
    candidate := base_slug || '-' || counter::text;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tools_ensure_slug ON public.tools;
CREATE TRIGGER trg_tools_ensure_slug
BEFORE INSERT OR UPDATE OF name, slug ON public.tools
FOR EACH ROW EXECUTE FUNCTION public.tools_ensure_slug();

-- 4) Backfill existing rows (force slug regeneration where null)
UPDATE public.tools SET name = name WHERE slug IS NULL OR slug = '';

-- 5) Unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS tools_slug_unique_idx ON public.tools(slug);

-- 6) Recreate public view with new columns
DROP VIEW IF EXISTS public.tools_public;
CREATE VIEW public.tools_public
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  slug,
  description,
  url,
  icon_url,
  attachment_url,
  tags,
  is_visible,
  sort_order,
  is_featured,
  featured_indefinite,
  featured_start,
  featured_end,
  what_is,
  who_for,
  how_helps,
  pros,
  cons,
  extra_markdown,
  seo_title,
  seo_description,
  created_at
FROM public.tools
WHERE is_visible = true;

GRANT SELECT ON public.tools_public TO anon, authenticated;