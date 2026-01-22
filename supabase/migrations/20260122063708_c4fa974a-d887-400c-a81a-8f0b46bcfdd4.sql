-- Create table for raw collected items (Coleta)
CREATE TABLE public.itens_brutos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  dominio TEXT NOT NULL,
  texto_bruto TEXT,
  data_coleta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metodo_coleta TEXT NOT NULL CHECK (metodo_coleta IN ('crawler', 'busca', 'manual')),
  ano_alvo INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'ignorado', 'erro')),
  motivo_status TEXT,
  hash_conteudo TEXT,
  meta_obs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint per URL + year target (dedup)
CREATE UNIQUE INDEX idx_itens_brutos_url_ano ON public.itens_brutos (url, ano_alvo);

-- Index for content hash similarity detection
CREATE INDEX idx_itens_brutos_hash ON public.itens_brutos (hash_conteudo);

-- Index for status filtering
CREATE INDEX idx_itens_brutos_status ON public.itens_brutos (status);

-- Index for date filtering
CREATE INDEX idx_itens_brutos_data_coleta ON public.itens_brutos (data_coleta DESC);

-- Enable RLS
ALTER TABLE public.itens_brutos ENABLE ROW LEVEL SECURITY;

-- Only admins can manage raw items
CREATE POLICY "Admins can manage itens_brutos"
  ON public.itens_brutos
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_itens_brutos_updated_at
  BEFORE UPDATE ON public.itens_brutos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();