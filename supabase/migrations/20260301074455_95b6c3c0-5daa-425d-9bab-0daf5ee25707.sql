
-- 1. nav_settings (configuração global do navbar - 1 registro)
CREATE TABLE public.nav_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_light_url text NOT NULL DEFAULT '',
  logo_dark_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nav_settings" ON public.nav_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage nav_settings" ON public.nav_settings FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER update_nav_settings_updated_at
  BEFORE UPDATE ON public.nav_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. nav_items (itens do menu)
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  icon text,
  order_index int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_external boolean NOT NULL DEFAULT false,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nav_items" ON public.nav_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage nav_items" ON public.nav_items FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER update_nav_items_updated_at
  BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Views públicas seguras
CREATE VIEW public.nav_items_public WITH (security_invoker = true) AS
  SELECT id, label, href, icon, order_index, is_external, open_in_new_tab
  FROM public.nav_items
  WHERE is_active = true
  ORDER BY order_index ASC;

CREATE VIEW public.nav_settings_public WITH (security_invoker = true) AS
  SELECT id, logo_light_url, logo_dark_url
  FROM public.nav_settings
  LIMIT 1;

-- 4. Seed: configuração padrão de logo (vazio = fallback para assets bundled)
INSERT INTO public.nav_settings (logo_light_url, logo_dark_url) VALUES ('', '');

-- 5. Seed: itens atuais do menu
INSERT INTO public.nav_items (label, href, icon, order_index) VALUES
  ('Início', '/', 'home', 0),
  ('Ferramentas', '/ferramentas', 'wrench', 1),
  ('Concursos', '/concursos', 'scroll-text', 2),
  ('Produtos', '/produtos', 'shopping-bag', 3),
  ('Votações', '/votacoes', 'vote', 4),
  ('Sobre', '/sobre', 'info', 5);
