
-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text,
  cta_url text NOT NULL,
  clicks_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "public_can_view_active_products"
ON public.products FOR SELECT
USING (is_active = true);

-- Admin full access (SELECT included for viewing inactive)
CREATE POLICY "admins_can_view_all_products"
ON public.products FOR SELECT
USING (is_admin());

CREATE POLICY "admins_can_insert_products"
ON public.products FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "admins_can_update_products"
ON public.products FOR UPDATE
USING (is_admin());

CREATE POLICY "admins_can_delete_products"
ON public.products FOR DELETE
USING (is_admin());

-- RPC for public click increment (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_product_click(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET clicks_count = clicks_count + 1
  WHERE id = product_id AND is_active = true;
END;
$$;

-- Updated_at trigger
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 4 initial products
INSERT INTO public.products (title, description, category, cta_url, image_url, sort_order) VALUES
('Kit de Produtividade Digital', 'Ferramentas e templates para organizar sua rotina de estudos e trabalho com eficiência máxima.', 'Produtividade', '#', '/placeholder.svg', 1),
('Guia de Concursos 2026', 'E-book completo com estratégias, cronogramas e dicas para aprovação em concursos públicos.', 'Concursos', '#', '/placeholder.svg', 2),
('Pacote de Automações IA', 'Prompts prontos e fluxos de automação para acelerar tarefas repetitivas com inteligência artificial.', 'Inteligência Artificial', '#', '/placeholder.svg', 3),
('Mapa de Carreira Tech', 'Roadmap visual interativo para quem quer migrar ou evoluir na área de tecnologia.', 'Carreira', '#', '/placeholder.svg', 4);
