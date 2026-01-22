-- Tabela: coleta_config (configurações persistentes)
CREATE TABLE public.coleta_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escopo text NOT NULL DEFAULT 'concursos',
  tema_consulta text,
  ano_alvo integer NOT NULL DEFAULT EXTRACT(year FROM now())::integer,
  profundidade integer NOT NULL DEFAULT 2,
  limite_paginas integer NOT NULL DEFAULT 50,
  limite_resultados integer NOT NULL DEFAULT 20,
  extensoes_bloqueadas jsonb NOT NULL DEFAULT '[".jpg",".jpeg",".png",".webp",".gif",".svg",".pdf",".mp4",".mp3",".css",".js",".json",".xml"]'::jsonb,
  caminhos_bloqueados jsonb NOT NULL DEFAULT '["/wp-content","/uploads","/assets","/images","/img","/static","/media","/feed","/wp-json","/manifest"]'::jsonb,
  caminhos_permitidos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(escopo)
);

-- Tabela: coleta_runs (histórico de execuções)
CREATE TABLE public.coleta_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  executed_at timestamp with time zone NOT NULL DEFAULT now(),
  tipo_coleta text NOT NULL CHECK (tipo_coleta IN ('crawler', 'busca', 'manual')),
  sites_env jsonb NOT NULL DEFAULT '[]'::jsonb,
  tema_consulta text,
  ano_alvo integer NOT NULL,
  profundidade integer,
  limite_paginas integer,
  limite_resultados integer,
  filtros_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_urls integer NOT NULL DEFAULT 0,
  total_novas integer NOT NULL DEFAULT 0,
  total_ignoradas integer NOT NULL DEFAULT 0,
  total_erros integer NOT NULL DEFAULT 0,
  status_execucao text NOT NULL DEFAULT 'ok' CHECK (status_execucao IN ('ok', 'parcial', 'erro')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela: coleta_run_items (detalhes de cada URL por execução)
CREATE TABLE public.coleta_run_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.coleta_runs(id) ON DELETE CASCADE,
  url text NOT NULL,
  dominio text NOT NULL,
  tipo_pagina text NOT NULL DEFAULT 'detalhe' CHECK (tipo_pagina IN ('listagem', 'detalhe')),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'ignorado', 'erro')),
  motivo_descartar text,
  metodo_coleta text NOT NULL CHECK (metodo_coleta IN ('crawler', 'busca', 'manual')),
  data_coleta timestamp with time zone NOT NULL DEFAULT now(),
  ano_alvo integer NOT NULL,
  texto_bruto text,
  hash_conteudo text,
  meta_obs text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_coleta_runs_executed_at ON public.coleta_runs(executed_at DESC);
CREATE INDEX idx_coleta_run_items_run_id ON public.coleta_run_items(run_id);
CREATE INDEX idx_coleta_run_items_status ON public.coleta_run_items(status);
CREATE INDEX idx_coleta_run_items_tipo_pagina ON public.coleta_run_items(tipo_pagina);

-- Enable RLS
ALTER TABLE public.coleta_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coleta_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coleta_run_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin only
CREATE POLICY "Admins can manage coleta_config" ON public.coleta_config
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage coleta_runs" ON public.coleta_runs
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage coleta_run_items" ON public.coleta_run_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Insert default config row
INSERT INTO public.coleta_config (escopo) VALUES ('concursos');

-- Trigger for updated_at on coleta_config
CREATE TRIGGER update_coleta_config_updated_at
  BEFORE UPDATE ON public.coleta_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();