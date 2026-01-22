-- Configuration table for admin settings (search, anti-repetition, AI)
CREATE TABLE public.concursos_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analyzed URLs for anti-repetition (hash-based deduplication)
CREATE TABLE public.concursos_analyzed_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_hash TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  content_hash TEXT,
  orgao TEXT,
  ano INTEGER,
  tipo TEXT,
  situacao TEXT,
  tema TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ignored BOOLEAN NOT NULL DEFAULT false,
  ignore_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pending items for curation (before becoming oportunidades)
CREATE TABLE public.concursos_pending_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Source info
  source_url TEXT NOT NULL,
  source_domain TEXT,
  source_title TEXT,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- AI-extracted or manual data
  titulo_sugerido TEXT,
  ano_detectado INTEGER,
  categoria_detectada TEXT,
  tipo_detectado TEXT,
  situacao_detectada TEXT,
  orgao_detectado TEXT,
  banca_detectada TEXT,
  escolaridade_detectada TEXT,
  abrangencia_detectada TEXT,
  resumo_editorial TEXT,
  link_edital TEXT,
  -- Confidence and AI info
  confiabilidade NUMERIC(3,2) CHECK (confiabilidade >= 0 AND confiabilidade <= 1),
  ai_engine TEXT,
  ai_response JSONB,
  ai_executed_at TIMESTAMP WITH TIME ZONE,
  -- Curation status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  rejection_reason TEXT,
  curated_by UUID,
  curated_at TIMESTAMP WITH TIME ZONE,
  -- Link to created oportunidade if approved
  oportunidade_id UUID REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_concursos_config_key ON public.concursos_config(config_key);
CREATE INDEX idx_concursos_analyzed_urls_hash ON public.concursos_analyzed_urls(url_hash);
CREATE INDEX idx_concursos_analyzed_urls_content_hash ON public.concursos_analyzed_urls(content_hash);
CREATE INDEX idx_concursos_analyzed_urls_orgao_ano_tipo ON public.concursos_analyzed_urls(orgao, ano, tipo, situacao);
CREATE INDEX idx_concursos_analyzed_urls_tema ON public.concursos_analyzed_urls(tema);
CREATE INDEX idx_concursos_pending_items_status ON public.concursos_pending_items(status);
CREATE INDEX idx_concursos_pending_items_collected ON public.concursos_pending_items(collected_at DESC);

-- Enable RLS
ALTER TABLE public.concursos_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concursos_analyzed_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concursos_pending_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only
CREATE POLICY "Admins can manage concursos_config"
ON public.concursos_config
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage concursos_analyzed_urls"
ON public.concursos_analyzed_urls
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage concursos_pending_items"
ON public.concursos_pending_items
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_concursos_config_updated_at
BEFORE UPDATE ON public.concursos_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_concursos_pending_items_updated_at
BEFORE UPDATE ON public.concursos_pending_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();