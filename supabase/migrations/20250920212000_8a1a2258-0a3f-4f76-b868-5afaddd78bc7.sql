-- Criar tabela de cursos
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  duration TEXT NOT NULL,
  students INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  price TEXT NOT NULL,
  image_url TEXT,
  instructor TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Iniciante', 'Intermediário', 'Avançado')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Ativar RLS na tabela de cursos
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cursos
CREATE POLICY "Todos podem ver cursos ativos" 
ON public.courses 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Usuários autenticados podem criar cursos" 
ON public.courses 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Usuários podem atualizar seus próprios cursos" 
ON public.courses 
FOR UPDATE 
USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Usuários podem deletar seus próprios cursos" 
ON public.courses 
FOR DELETE 
USING (auth.uid() = created_by);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir cursos de exemplo
INSERT INTO public.courses (title, description, category, duration, students, rating, price, image_url, instructor, level) VALUES
('Desenvolvimento Web Completo', 'Aprenda HTML, CSS, JavaScript e React do zero ao avançado', 'tech', '40h', 1250, 4.8, 'R$ 199,90', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&crop=center', 'João Silva', 'Iniciante'),
('Marketing Digital Avançado', 'Estratégias completas de marketing digital para empresas', 'marketing', '30h', 890, 4.9, 'R$ 299,90', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center', 'Maria Santos', 'Intermediário'),
('UX/UI Design Fundamentals', 'Princípios essenciais de design de experiência do usuário', 'design', '25h', 650, 4.7, 'R$ 179,90', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop&crop=center', 'Pedro Costa', 'Iniciante'),
('Gestão de Projetos Ágeis', 'Metodologias ágeis aplicadas na gestão de projetos', 'business', '20h', 420, 4.6, 'R$ 149,90', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&crop=center', 'Ana Lima', 'Intermediário'),
('Python para Data Science', 'Análise de dados e machine learning com Python', 'tech', '50h', 980, 4.9, 'R$ 349,90', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center', 'Carlos Oliveira', 'Avançado'),
('Estratégias de E-commerce', 'Como criar e otimizar sua loja virtual', 'business', '35h', 730, 4.8, 'R$ 249,90', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop&crop=center', 'Lucia Ferreira', 'Intermediário');