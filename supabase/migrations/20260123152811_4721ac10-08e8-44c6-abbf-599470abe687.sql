-- Add trash columns to oportunidades table
ALTER TABLE public.oportunidades 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID NULL REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status_admin TEXT NOT NULL DEFAULT 'ativo' 
  CHECK (status_admin IN ('ativo', 'lixeira'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_oportunidades_status_admin ON public.oportunidades(status_admin);
CREATE INDEX IF NOT EXISTS idx_oportunidades_deleted_at ON public.oportunidades(deleted_at) WHERE deleted_at IS NOT NULL;

-- Create audit table for oportunidades
CREATE TABLE IF NOT EXISTS public.oportunidades_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('trash', 'restore', 'purge')),
  actor UUID NOT NULL REFERENCES auth.users(id),
  actor_email TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.oportunidades_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit table (admin only)
CREATE POLICY "Admins can view audit logs" 
ON public.oportunidades_audit 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert audit logs" 
ON public.oportunidades_audit 
FOR INSERT 
WITH CHECK (is_admin());

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oportunidades_audit_oportunidade_id 
ON public.oportunidades_audit(oportunidade_id);

CREATE INDEX IF NOT EXISTS idx_oportunidades_audit_created_at 
ON public.oportunidades_audit(created_at DESC);

-- Update the oportunidades_public view to exclude trashed items
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
  slug,
  published_at,
  created_at,
  updated_at
FROM public.oportunidades
WHERE publicado = true 
  AND status_admin = 'ativo';

-- Grant access to the view
GRANT SELECT ON public.oportunidades_public TO anon, authenticated;