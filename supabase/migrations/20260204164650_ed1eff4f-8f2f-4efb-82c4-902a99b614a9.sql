-- Table: curation_pages
CREATE TABLE public.curation_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Unique index on slug
CREATE UNIQUE INDEX idx_curation_pages_slug ON public.curation_pages (slug);

-- Trigger for updated_at
CREATE TRIGGER update_curation_pages_updated_at
BEFORE UPDATE ON public.curation_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Table: curation_page_items
CREATE TABLE public.curation_page_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.curation_pages(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for ordering
CREATE INDEX idx_curation_page_items_page_order ON public.curation_page_items (page_id, "order");

-- Enable RLS
ALTER TABLE public.curation_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curation_page_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curation_pages
-- Public: SELECT only published
CREATE POLICY "Public can view published curation pages"
ON public.curation_pages
FOR SELECT
USING (status = 'published');

-- Admin: full access
CREATE POLICY "Admins can manage curation pages"
ON public.curation_pages
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- RLS Policies for curation_page_items
-- Public: SELECT only if page is published
CREATE POLICY "Public can view items of published pages"
ON public.curation_page_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.curation_pages cp
    WHERE cp.id = curation_page_items.page_id
    AND cp.status = 'published'
  )
);

-- Admin: full access
CREATE POLICY "Admins can manage curation page items"
ON public.curation_page_items
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());