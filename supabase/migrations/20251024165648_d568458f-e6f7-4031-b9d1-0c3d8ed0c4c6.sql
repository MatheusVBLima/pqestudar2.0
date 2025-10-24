-- Criar tabela partners
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 80),
  logo_url text NOT NULL,
  url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Index para ordenação
CREATE INDEX idx_partners_sort_order ON public.partners(sort_order);
CREATE INDEX idx_partners_active ON public.partners(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can manage partners"
ON public.partners
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy: Público pode ver apenas ativos
CREATE POLICY "Public can view active partners"
ON public.partners
FOR SELECT
USING (is_active = true);

-- View para parceiros ativos (uso público)
CREATE OR REPLACE VIEW public.active_partners
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  logo_url,
  url,
  sort_order,
  created_at
FROM public.partners
WHERE is_active = true
ORDER BY sort_order ASC, created_at DESC;

-- Inserir dados de exemplo dos parceiros atuais
INSERT INTO public.partners (title, logo_url, url, sort_order, is_active) VALUES
('TechEdu', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center', 'https://techedu.com', 1, true),
('LearnHub', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=64&h=64&fit=crop&crop=center', 'https://learnhub.com', 2, true),
('SkillForge', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop&crop=center', 'https://skillforge.com', 3, true),
('EduTech', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=64&h=64&fit=crop&crop=center', 'https://edutech.com', 4, true),
('CodeAcademy', 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=64&h=64&fit=crop&crop=center', 'https://codeacademy.com', 5, true),
('DataCamp', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop&crop=center', 'https://datacamp.com', 6, true),
('WebDev', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=64&h=64&fit=crop&crop=center', 'https://webdev.com', 7, true),
('CloudU', 'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=64&h=64&fit=crop&crop=center', 'https://cloudu.com', 8, true);