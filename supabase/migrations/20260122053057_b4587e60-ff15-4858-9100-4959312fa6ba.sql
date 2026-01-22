-- Create oportunidades table
CREATE TABLE public.oportunidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL CHECK (categoria IN ('Concurso', 'Políticas Públicas', 'Educação')),
  titulo TEXT NOT NULL,
  abrangencia TEXT NOT NULL CHECK (abrangencia IN ('Nacional', 'Estadual', 'Municipal')),
  situacao TEXT NOT NULL CHECK (situacao IN ('Previsto', 'Edital publicado', 'Aberto', 'Encerrado')),
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL CHECK (tipo IN ('Concurso', 'Programa educacional', 'Processo seletivo')),
  escolaridade TEXT NOT NULL CHECK (escolaridade IN ('Fundamental', 'Médio', 'Superior')),
  link_edital TEXT,
  orgao TEXT,
  banca TEXT,
  resumo_editorial TEXT,
  slug TEXT NOT NULL UNIQUE,
  publicado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraint: link_edital required when situacao is 'Aberto' or 'Edital publicado'
  CONSTRAINT link_edital_required_when_open CHECK (
    (situacao NOT IN ('Aberto', 'Edital publicado')) OR (link_edital IS NOT NULL AND link_edital ~ '^https?://')
  ),
  
  -- Constraint: link_edital must be valid URL if provided
  CONSTRAINT link_edital_valid_url CHECK (
    link_edital IS NULL OR link_edital ~ '^https?://'
  )
);

-- Create fontes_oportunidade table (1..N per oportunidade)
CREATE TABLE public.fontes_oportunidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL CHECK (source_url ~ '^https?://'),
  source_title TEXT,
  source_tipo TEXT NOT NULL CHECK (source_tipo IN ('oficial', 'diario', 'banca', 'outro-oficial')),
  source_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_oportunidades_publicado ON public.oportunidades(publicado);
CREATE INDEX idx_oportunidades_categoria ON public.oportunidades(categoria);
CREATE INDEX idx_oportunidades_situacao ON public.oportunidades(situacao);
CREATE INDEX idx_oportunidades_tipo ON public.oportunidades(tipo);
CREATE INDEX idx_oportunidades_escolaridade ON public.oportunidades(escolaridade);
CREATE INDEX idx_oportunidades_abrangencia ON public.oportunidades(abrangencia);
CREATE INDEX idx_oportunidades_slug ON public.oportunidades(slug);
CREATE INDEX idx_oportunidades_data_publicacao ON public.oportunidades(data_publicacao DESC);
CREATE INDEX idx_fontes_oportunidade_oportunidade_id ON public.fontes_oportunidade(oportunidade_id);

-- Enable RLS
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fontes_oportunidade ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oportunidades
CREATE POLICY "Admins can manage oportunidades"
ON public.oportunidades
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Public can view published oportunidades"
ON public.oportunidades
FOR SELECT
USING (publicado = true);

-- RLS Policies for fontes_oportunidade
CREATE POLICY "Admins can manage fontes"
ON public.fontes_oportunidade
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Public can view fontes of published oportunidades"
ON public.fontes_oportunidade
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.oportunidades o 
    WHERE o.id = oportunidade_id AND o.publicado = true
  )
);

-- Create public view for safe access (no sensitive columns)
CREATE VIEW public.oportunidades_public WITH (security_invoker = true) AS
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
  link_edital,
  orgao,
  banca,
  resumo_editorial,
  slug,
  created_at,
  updated_at
FROM public.oportunidades
WHERE publicado = true;

-- Create public view for fontes
CREATE VIEW public.fontes_oportunidade_public WITH (security_invoker = true) AS
SELECT 
  f.id,
  f.oportunidade_id,
  f.source_url,
  f.source_title,
  f.source_tipo,
  f.source_date
FROM public.fontes_oportunidade f
INNER JOIN public.oportunidades o ON o.id = f.oportunidade_id
WHERE o.publicado = true;

-- Trigger for updated_at
CREATE TRIGGER update_oportunidades_updated_at
BEFORE UPDATE ON public.oportunidades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if oportunidade can be published (has official source)
CREATE OR REPLACE FUNCTION public.validate_oportunidade_publication()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Only validate when trying to publish
  IF NEW.publicado = true AND (OLD.publicado = false OR OLD.publicado IS NULL) THEN
    -- Check if there's at least one official source
    IF NOT EXISTS (
      SELECT 1 FROM public.fontes_oportunidade 
      WHERE oportunidade_id = NEW.id 
      AND source_tipo IN ('oficial', 'diario', 'banca', 'outro-oficial')
    ) THEN
      RAISE EXCEPTION 'Não é possível publicar sem pelo menos uma fonte oficial (oficial, diário, banca ou outro-oficial).';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to validate publication
CREATE TRIGGER validate_oportunidade_before_publish
BEFORE UPDATE ON public.oportunidades
FOR EACH ROW
EXECUTE FUNCTION public.validate_oportunidade_publication();

-- Grant SELECT on views to anon and authenticated
GRANT SELECT ON public.oportunidades_public TO anon, authenticated;
GRANT SELECT ON public.fontes_oportunidade_public TO anon, authenticated;