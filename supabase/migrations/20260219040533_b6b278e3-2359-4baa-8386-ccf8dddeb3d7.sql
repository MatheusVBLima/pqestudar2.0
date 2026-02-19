
-- Create page_settings table
CREATE TABLE IF NOT EXISTS public.page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL UNIQUE,
  title_tag text NOT NULL,
  meta_description text NOT NULL,
  header_title text NOT NULL,
  header_description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;

-- Public can read (these are non-sensitive page metadata)
CREATE POLICY "Public can read page_settings"
  ON public.page_settings FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can update page_settings"
  ON public.page_settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can insert page_settings"
  ON public.page_settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete page_settings"
  ON public.page_settings FOR DELETE
  USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER trg_page_settings_updated_at
  BEFORE UPDATE ON public.page_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data
INSERT INTO public.page_settings (route, title_tag, meta_description, header_title, header_description)
VALUES
  ('/ferramentas', 'Ferramentas - PqEstudar', 'Oportunidades educacionais e ferramentas úteis.', 'Ferramentas', 'Conteúdo organizado para você evoluir mais rápido.'),
  ('/concursos', 'Concursos - PqEstudar', 'Oportunidades educacionais e ferramentas úteis.', 'Concursos', 'Conteúdo organizado para você evoluir mais rápido.'),
  ('/votacoes', 'Votações - PqEstudar', 'Oportunidades educacionais e ferramentas úteis.', 'Votações', 'Conteúdo organizado para você evoluir mais rápido.'),
  ('/ferramentas/salvos', 'Ferramentas salvas - PqEstudar', 'Oportunidades educacionais e ferramentas úteis.', 'Salvos', 'Conteúdo organizado para você evoluir mais rápido.'),
  ('/premium', 'Premium - PqEstudar', 'Oportunidades educacionais e ferramentas úteis.', 'Premium', 'Conteúdo organizado para você evoluir mais rápido.'),
  ('/privacidade', 'Privacidade - PqEstudar', 'Oportunidades educacionais e ferramentas úteis.', 'Privacidade', 'Conteúdo organizado para você evoluir mais rápido.'),
  ('/termos', 'Termos - PqEstudar', 'Oportunidades educacionais e ferramentas úteis.', 'Termos', 'Conteúdo organizado para você evoluir mais rápido.')
ON CONFLICT (route) DO NOTHING;
