-- Create newsletter bonus pages table
CREATE TABLE IF NOT EXISTS public.newsletter_bonus_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  intro TEXT NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_bonus_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view visible pages
CREATE POLICY "Anyone can view visible bonus pages"
ON public.newsletter_bonus_pages
FOR SELECT
USING (status = 'visible' OR auth.uid() IS NOT NULL);

-- Policy: Only admins can insert
CREATE POLICY "Admins can insert bonus pages"
ON public.newsletter_bonus_pages
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Policy: Only admins can update
CREATE POLICY "Admins can update bonus pages"
ON public.newsletter_bonus_pages
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Policy: Only admins can delete
CREATE POLICY "Admins can delete bonus pages"
ON public.newsletter_bonus_pages
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_newsletter_bonus_pages_updated_at
BEFORE UPDATE ON public.newsletter_bonus_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial 5 pages
INSERT INTO public.newsletter_bonus_pages (slug, title, intro, cards, sort_order) VALUES
('/acesso-kit-partida-8h3z', 'Seu Kit de Partida para a Produtividade Chegou!', 'Olá! Seja muito bem-vindo(a). Como prometido, aqui está o seu Kit de Partida: uma curadoria essencial com as ferramentas que vão te ajudar a ir direto ao ponto.', '[
  {"logoUrl": "", "logoAlt": "Perplexity AI", "toolTitle": "Perplexity AI", "toolDescription": "Uma ferramenta de pesquisa poderosa que funciona como um Google com superpoderes, ideal para iniciar qualquer trabalho ou estudo.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "PDFelement", "toolTitle": "PDFelement", "toolDescription": "A solução definitiva para editar, anotar e converter arquivos PDF, uma necessidade universal para estudantes e profissionais.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "SciSpace", "toolTitle": "SciSpace", "toolDescription": "Uma plataforma que ajuda a decifrar artigos científicos complexos, perfeita para pesquisa acadêmica aprofundada.", "toolLink": ""}
]'::jsonb, 0),
('/curadoria-conteudo-ia-k4f9', 'Curadoria da Semana 1: Criação de Conteúdo com IA', 'Olá! Chega de encarar a página em branco. Explore abaixo as 3 ferramentas selecionadas desta semana para criar textos e apresentações incríveis.', '[
  {"logoUrl": "", "logoAlt": "Decktopus", "toolTitle": "Decktopus", "toolDescription": "Uma IA que cria apresentações de slides profissionais em minutos. Perfeito para quem precisa de um material visual rápido e de impacto.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "Creati", "toolTitle": "Creati", "toolDescription": "Ferramenta de copywriting por IA que ajuda a superar o bloqueio criativo para escrever trabalhos, e-mails ou posts.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "Pippit AI", "toolTitle": "Pippit AI", "toolDescription": "Uma excelente opção para geração de texto focada em marketing e conteúdo, útil para estudantes de comunicação ou empreendedores.", "toolLink": ""}
]'::jsonb, 1),
('/acervo-video-prod-b7g1', 'Curadoria da Semana 2: Produção de Vídeo Simplificada', 'Olá! Esta semana, vamos entrar no universo dos vídeos. Separei 3 ferramentas com IA que simplificam a edição e te ajudam a criar vídeos de impacto.', '[
  {"logoUrl": "", "logoAlt": "Filmora", "toolTitle": "Filmora", "toolDescription": "Um editor de vídeo poderoso e amigável, ótimo para quem quer ir além do básico sem a complexidade de softwares profissionais.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "AI Video Cut", "toolTitle": "AI Video Cut", "toolDescription": "A promessa da edição de vídeo automática. Envie seu material bruto e deixe a IA fazer o trabalho pesado de cortes e montagem.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "ShortsNinja", "toolTitle": "ShortsNinja", "toolDescription": "Ferramenta focada em criar vídeos curtos (Shorts, Reels, TikTok) a partir de conteúdo mais longo, extremamente relevante para redes sociais.", "toolLink": ""}
]'::jsonb, 2),
('/metodos-automacao-w2p5', 'Curadoria da Semana 3: Automação e Eficiência', 'Olá! O tema desta semana é Automação. Descubra 3 ferramentas que funcionam como assistentes virtuais para que você possa focar no que realmente importa.', '[
  {"logoUrl": "", "logoAlt": "Automateed", "toolTitle": "Automateed", "toolDescription": "Conecte diferentes aplicativos e crie fluxos de trabalho automáticos para economizar horas de trabalho manual e repetitivo.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "Nim", "toolTitle": "Nim", "toolDescription": "Uma ferramenta de IA focada em automação de tarefas de recrutamento, ideal para quem está procurando emprego ou trabalhando com RH.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "Wegic", "toolTitle": "Wegic", "toolDescription": "Traduza automaticamente todo o seu site para outros idiomas, uma solução mágica para quem precisa de alcance global.", "toolLink": ""}
]'::jsonb, 3),
('/recursos-alta-performance-z9x0', 'Curadoria da Semana 4: IA de Alta Performance', 'Olá! Chegamos à nossa última semana deste ciclo. Prepare-se para conhecer 3 ferramentas de nicho que mostram o verdadeiro poder da IA.', '[
  {"logoUrl": "", "logoAlt": "Entr.ai", "toolTitle": "Entr.ai", "toolDescription": "Uma plataforma de análise de dados com IA. Faça perguntas em linguagem natural e obtenha insights complexos de planilhas e bancos de dados.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "PimEyes", "toolTitle": "PimEyes", "toolDescription": "Uma poderosa ferramenta de busca reversa de imagens por rosto. Fascinante para encontrar onde uma imagem sua aparece online.", "toolLink": ""},
  {"logoUrl": "", "logoAlt": "Toki AI", "toolTitle": "Toki AI", "toolDescription": "Realize a transcrição de áudios e vídeos para texto de forma rápida e precisa. Essencial para quem grava aulas ou faz entrevistas.", "toolLink": ""}
]'::jsonb, 4);