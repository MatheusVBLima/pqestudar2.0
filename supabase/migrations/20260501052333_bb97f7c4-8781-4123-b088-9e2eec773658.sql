-- 1) Add editorial fields to tools
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS content_markdown text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS cta_top_label text,
  ADD COLUMN IF NOT EXISTS cta_top_url text,
  ADD COLUMN IF NOT EXISTS cta_top_text text,
  ADD COLUMN IF NOT EXISTS cta_middle_label text,
  ADD COLUMN IF NOT EXISTS cta_middle_url text,
  ADD COLUMN IF NOT EXISTS cta_middle_text text,
  ADD COLUMN IF NOT EXISTS cta_final_label text,
  ADD COLUMN IF NOT EXISTS cta_final_url text,
  ADD COLUMN IF NOT EXISTS cta_final_text text,
  ADD COLUMN IF NOT EXISTS internal_links jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Recreate tools_public view with editorial fields (security_invoker)
DROP VIEW IF EXISTS public.tools_public;
CREATE VIEW public.tools_public
WITH (security_invoker = true) AS
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
  -- legacy editorial (kept for compat)
  what_is,
  who_for,
  how_helps,
  pros,
  cons,
  extra_markdown,
  -- new editorial (guide-style)
  content_markdown,
  cover_image_url,
  cta_top_label, cta_top_url, cta_top_text,
  cta_middle_label, cta_middle_url, cta_middle_text,
  cta_final_label, cta_final_url, cta_final_text,
  internal_links,
  -- seo
  seo_title,
  seo_description,
  created_at,
  updated_at
FROM public.tools
WHERE is_visible = true;

GRANT SELECT ON public.tools_public TO anon, authenticated;

-- 3) Junction tables for related tools and related guides
CREATE TABLE IF NOT EXISTS public.tool_related_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL,
  related_tool_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, related_tool_id),
  CHECK (tool_id <> related_tool_id)
);

CREATE TABLE IF NOT EXISTS public.tool_related_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL,
  guide_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, guide_id)
);

ALTER TABLE public.tool_related_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_related_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage tool_related_tools" ON public.tool_related_tools;
CREATE POLICY "Admins can manage tool_related_tools"
  ON public.tool_related_tools
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public can view tool_related_tools" ON public.tool_related_tools;
CREATE POLICY "Public can view tool_related_tools"
  ON public.tool_related_tools
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage tool_related_guides" ON public.tool_related_guides;
CREATE POLICY "Admins can manage tool_related_guides"
  ON public.tool_related_guides
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public can view tool_related_guides" ON public.tool_related_guides;
CREATE POLICY "Public can view tool_related_guides"
  ON public.tool_related_guides
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tool_related_tools_tool_id ON public.tool_related_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_related_guides_tool_id ON public.tool_related_guides(tool_id);