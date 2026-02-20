-- Adicionar colunas de destaque na tabela tools
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_indefinite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_start timestamptz NULL,
  ADD COLUMN IF NOT EXISTS featured_end timestamptz NULL;

-- Atualizar a view tools_public para incluir as novas colunas
DROP VIEW IF EXISTS public.tools_public;

CREATE VIEW public.tools_public WITH (security_invoker=true) AS
  SELECT
    id,
    name,
    description,
    url,
    attachment_url,
    icon_url,
    tags,
    is_visible,
    sort_order,
    created_at,
    is_featured,
    featured_indefinite,
    featured_start,
    featured_end
  FROM public.tools
  WHERE is_visible = true;

-- Grant select para anon e authenticated
GRANT SELECT ON public.tools_public TO anon, authenticated;