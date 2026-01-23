-- 1) Adicionar coluna views_total à tabela oportunidades
ALTER TABLE public.oportunidades 
ADD COLUMN IF NOT EXISTS views_total integer DEFAULT 0 NOT NULL;

-- Índice para ordenações futuras
CREATE INDEX IF NOT EXISTS idx_oportunidades_views_total ON public.oportunidades(views_total DESC);

-- 2) Tabela de agregação diária de views
CREATE TABLE IF NOT EXISTS public.oportunidade_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidade_id uuid NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  dia date NOT NULL,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índices para oportunidade_views
CREATE UNIQUE INDEX IF NOT EXISTS idx_oportunidade_views_unique 
ON public.oportunidade_views(oportunidade_id, dia);

CREATE INDEX IF NOT EXISTS idx_oportunidade_views_oportunidade_id 
ON public.oportunidade_views(oportunidade_id);

-- 3) Tabela de fingerprints para deduplicação
CREATE TABLE IF NOT EXISTS public.oportunidade_view_fingerprints (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidade_id uuid NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  dia date NOT NULL,
  fp text NOT NULL,
  ua text,
  created_at timestamptz DEFAULT now()
);

-- Índice único para deduplicação
CREATE UNIQUE INDEX IF NOT EXISTS idx_oportunidade_view_fingerprints_unique 
ON public.oportunidade_view_fingerprints(oportunidade_id, dia, fp);

-- 4) Tabela de auditoria para ações administrativas
CREATE TABLE IF NOT EXISTS public.admin_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text,
  acao text NOT NULL,
  oportunidade_id uuid REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_oportunidade_id ON public.admin_audit(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_user_id ON public.admin_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON public.admin_audit(created_at DESC);

-- 5) Habilitar RLS em todas as novas tabelas
ALTER TABLE public.oportunidade_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidade_view_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;

-- 6) Policies para oportunidade_views (sem acesso direto para anon/authenticated)
-- Leitura pública apenas para admins
CREATE POLICY "Admins can read oportunidade_views" 
ON public.oportunidade_views 
FOR SELECT 
USING (public.is_admin());

-- 7) Policies para oportunidade_view_fingerprints (sem acesso público)
CREATE POLICY "Admins can read oportunidade_view_fingerprints" 
ON public.oportunidade_view_fingerprints 
FOR SELECT 
USING (public.is_admin());

-- 8) Policies para admin_audit
CREATE POLICY "Admins can read admin_audit" 
ON public.admin_audit 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Admins can insert admin_audit" 
ON public.admin_audit 
FOR INSERT 
WITH CHECK (public.is_admin());

-- 9) Função de cleanup para fingerprints antigos (opcional, manter 90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_view_fingerprints()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.oportunidade_view_fingerprints 
  WHERE dia < CURRENT_DATE - INTERVAL '90 days';
END;
$$;