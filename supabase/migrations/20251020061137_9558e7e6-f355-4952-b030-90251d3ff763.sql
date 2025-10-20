-- Criar extensão para vetores (embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Criar tabela de notícias
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  topic TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  author TEXT,
  lang TEXT DEFAULT 'pt-BR',
  title_hash TEXT NOT NULL UNIQUE,
  embedding vector(384),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar índices
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_title_hash ON public.news(title_hash);
CREATE INDEX idx_news_embedding ON public.news USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Criar tabela de configurações do gerador
CREATE TABLE IF NOT EXISTS public.news_generator_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_age_days INTEGER DEFAULT 14 NOT NULL,
  min_category_distance INTEGER DEFAULT 3 NOT NULL,
  duplicate_similarity_threshold NUMERIC DEFAULT 0.88 NOT NULL,
  topic_similarity_threshold NUMERIC DEFAULT 0.90 NOT NULL,
  topic_repost_days INTEGER DEFAULT 7 NOT NULL,
  max_candidates INTEGER DEFAULT 8 NOT NULL,
  target_news_count INTEGER DEFAULT 3 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Inserir configuração padrão
INSERT INTO public.news_generator_config (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Criar tabela de logs de execução
CREATE TABLE IF NOT EXISTS public.news_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_by UUID REFERENCES auth.users(id),
  candidates_fetched INTEGER DEFAULT 0,
  discarded_old INTEGER DEFAULT 0,
  discarded_duplicate_hash INTEGER DEFAULT 0,
  discarded_duplicate_url INTEGER DEFAULT 0,
  discarded_duplicate_semantic INTEGER DEFAULT 0,
  discarded_duplicate_topic INTEGER DEFAULT 0,
  published_count INTEGER DEFAULT 0,
  execution_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_generator_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_generation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para news (público pode ler, admin pode tudo)
CREATE POLICY "Public can view news" ON public.news FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert news" ON public.news FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update news" ON public.news FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete news" ON public.news FOR DELETE TO authenticated USING (public.is_admin());

-- Políticas para config (só admin)
CREATE POLICY "Admins can view config" ON public.news_generator_config FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update config" ON public.news_generator_config FOR UPDATE TO authenticated USING (public.is_admin());

-- Políticas para logs (só admin)
CREATE POLICY "Admins can view logs" ON public.news_generation_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert logs" ON public.news_generation_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON public.news_generator_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();