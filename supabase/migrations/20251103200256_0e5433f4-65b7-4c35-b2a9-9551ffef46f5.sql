-- Tabela de configurações da Brevo
CREATE TABLE IF NOT EXISTS public.brevo_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_encrypted TEXT, -- será gerenciado via secrets
  default_list_id TEXT NOT NULL DEFAULT '2',
  default_tags TEXT[] NOT NULL DEFAULT ARRAY['curadoria_ferramenta'],
  opt_in_mode TEXT NOT NULL DEFAULT 'single_opt_in' CHECK (opt_in_mode IN ('single_opt_in', 'double_opt_in')),
  webhook_url TEXT,
  allow_resend_welcome BOOLEAN NOT NULL DEFAULT true,
  success_message_doi TEXT NOT NULL DEFAULT 'Confira seu e-mail 📬 — confirme para receber o bônus (00).',
  success_message_single TEXT NOT NULL DEFAULT 'Pronto! O primeiro bônus (00) está no seu e-mail.',
  error_message_already_subscribed TEXT NOT NULL DEFAULT 'Esse e-mail já está inscrito. Quer receber o (00) novamente?',
  error_message_generic TEXT NOT NULL DEFAULT 'Tivemos um problema. Tente novamente.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Garantir apenas uma linha de configuração
CREATE UNIQUE INDEX IF NOT EXISTS brevo_config_singleton ON public.brevo_config ((1));

-- Inserir configuração padrão
INSERT INTO public.brevo_config (default_list_id, default_tags, opt_in_mode)
VALUES ('2', ARRAY['curadoria_ferramenta'], 'single_opt_in')
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.brevo_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem visualizar configurações Brevo"
  ON public.brevo_config FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins podem atualizar configurações Brevo"
  ON public.brevo_config FOR UPDATE
  USING (public.is_admin());

-- Tabela de eventos de newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('newsletter_submit', 'newsletter_valid', 'newsletter_listed', 'newsletter_confirmed', 'newsletter_error', 'newsletter_resend')),
  email_hash TEXT NOT NULL, -- hash do email para privacidade
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  page_slug TEXT,
  ip_hash TEXT, -- hash do IP para rate limiting
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_newsletter_events_created_at ON public.newsletter_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_event_type ON public.newsletter_events(event_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_email_hash ON public.newsletter_events(email_hash);
CREATE INDEX IF NOT EXISTS idx_newsletter_events_ip_hash ON public.newsletter_events(ip_hash, created_at);

-- Habilitar RLS
ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem visualizar eventos de newsletter"
  ON public.newsletter_events FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Edge functions podem inserir eventos"
  ON public.newsletter_events FOR INSERT
  WITH CHECK (true);

-- Tabela de rate limiting
CREATE TABLE IF NOT EXISTS public.newsletter_rate_limit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para cleanup e queries
CREATE INDEX IF NOT EXISTS idx_newsletter_rate_limit_ip_hash ON public.newsletter_rate_limit(ip_hash, window_start DESC);

-- Habilitar RLS
ALTER TABLE public.newsletter_rate_limit ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Edge functions podem gerenciar rate limit"
  ON public.newsletter_rate_limit FOR ALL
  USING (true);

-- Função para limpar rate limits antigos
CREATE OR REPLACE FUNCTION public.cleanup_newsletter_rate_limit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.newsletter_rate_limit 
  WHERE window_start < NOW() - INTERVAL '5 minutes';
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_brevo_config_updated_at
  BEFORE UPDATE ON public.brevo_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();