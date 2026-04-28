
-- Tabela de páginas de afiliado para a landing /mapa-dos-beneficios
CREATE TABLE public.affiliate_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  basic_url text NOT NULL,
  premium_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_pages_slug ON public.affiliate_pages(slug);
CREATE INDEX idx_affiliate_pages_active ON public.affiliate_pages(is_active);

-- Slug deve seguir formato URL-safe
ALTER TABLE public.affiliate_pages
  ADD CONSTRAINT affiliate_pages_slug_format
  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 2 AND 80);

ALTER TABLE public.affiliate_pages ENABLE ROW LEVEL SECURITY;

-- Público: pode ler somente afiliados ativos (necessário para a página pública /mapa-dos-beneficios/:slug)
CREATE POLICY "Public can view active affiliate pages"
ON public.affiliate_pages
FOR SELECT
USING (is_active = true);

-- Admin: gerenciamento total
CREATE POLICY "Admins can manage affiliate pages"
ON public.affiliate_pages
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Trigger updated_at
CREATE TRIGGER update_affiliate_pages_updated_at
BEFORE UPDATE ON public.affiliate_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
