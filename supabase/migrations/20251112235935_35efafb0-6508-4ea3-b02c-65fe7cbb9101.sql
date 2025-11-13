-- Criar tabela de ferramentas
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  icon_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Habilitar RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can manage tools"
ON public.tools
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Policy: Público pode ver apenas ferramentas visíveis
CREATE POLICY "Public can view visible tools"
ON public.tools
FOR SELECT
USING (is_visible = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON public.tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- View pública segura (sem campos sensíveis)
CREATE OR REPLACE VIEW public.tools_public AS
SELECT 
  id,
  name,
  description,
  url,
  icon_url,
  tags,
  is_visible,
  sort_order,
  created_at,
  updated_at
FROM public.tools
WHERE is_visible = true
ORDER BY sort_order ASC, created_at DESC;

-- Inserir dados mock para demonstração
INSERT INTO public.tools (name, description, url, icon_url, tags, is_visible, sort_order) VALUES
('ChatGPT Plus', 'IA conversacional avançada para automação de tarefas e criação de conteúdo.', 'https://chat.openai.com/plus', null, ARRAY['Inteligência Artificial', 'Produtividade'], true, 0),
('Notion AI', 'Workspace integrado com assistente de IA para organização e documentação.', 'https://notion.so', null, ARRAY['Produtividade', 'Inteligência Artificial'], true, 1),
('ProtonVPN', 'VPN segura e privada com servidores em todo o mundo.', 'https://protonvpn.com', null, ARRAY['Segurança e Privacidade'], true, 2),
('Harvard CS50', 'Curso gratuito de ciência da computação da Universidade de Harvard.', 'https://cs50.harvard.edu', null, ARRAY['Cursos Gratuitos'], true, 3),
('Midjourney', 'Gerador de imagens por IA com qualidade cinematográfica.', 'https://midjourney.com', null, ARRAY['Inteligência Artificial'], true, 4),
('Todoist', 'Gerenciador de tarefas minimalista e poderoso.', 'https://todoist.com', null, ARRAY['Produtividade'], true, 5),
('Bitwarden', 'Gerenciador de senhas open-source e seguro.', 'https://bitwarden.com', null, ARRAY['Segurança e Privacidade', 'Utilidades'], true, 6),
('Google Data Analytics', 'Certificado profissional gratuito em análise de dados.', 'https://grow.google/certificates/data-analytics', null, ARRAY['Cursos Gratuitos'], true, 7),
('Raycast', 'Launcher poderoso com extensões e atalhos para macOS.', 'https://raycast.com', null, ARRAY['Produtividade', 'Utilidades'], true, 8),
('Perplexity AI', 'Motor de busca com IA que fornece respostas contextualizadas.', 'https://perplexity.ai', null, ARRAY['Inteligência Artificial'], true, 9),
('Signal', 'Mensageiro criptografado end-to-end com foco em privacidade.', 'https://signal.org', null, ARRAY['Segurança e Privacidade'], true, 10),
('freeCodeCamp', 'Plataforma completa de cursos gratuitos de programação e desenvolvimento.', 'https://freecodecamp.org', null, ARRAY['Cursos Gratuitos'], true, 11);