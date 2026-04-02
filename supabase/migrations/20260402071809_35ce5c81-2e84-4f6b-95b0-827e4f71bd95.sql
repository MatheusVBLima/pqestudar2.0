
-- 1. Create guides table
CREATE TABLE public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  short_description text NOT NULL,
  content_markdown text NOT NULL DEFAULT '',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  cta_top_label text,
  cta_top_url text,
  cta_middle_label text,
  cta_middle_url text,
  cta_final_label text,
  cta_final_url text,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Related tables
CREATE TABLE public.guide_related_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(guide_id, tool_id)
);

CREATE TABLE public.guide_related_contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(guide_id, contest_id)
);

CREATE TABLE public.guide_related_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  related_guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(guide_id, related_guide_id),
  CHECK (guide_id != related_guide_id)
);

-- 3. Updated_at trigger
CREATE TRIGGER guides_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. RLS
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_related_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_related_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_related_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published guides"
  ON public.guides FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admins can manage guides"
  ON public.guides FOR ALL
  TO public
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public can view guide_related_tools"
  ON public.guide_related_tools FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage guide_related_tools"
  ON public.guide_related_tools FOR ALL
  TO public
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public can view guide_related_contests"
  ON public.guide_related_contests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage guide_related_contests"
  ON public.guide_related_contests FOR ALL
  TO public
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public can view guide_related_guides"
  ON public.guide_related_guides FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage guide_related_guides"
  ON public.guide_related_guides FOR ALL
  TO public
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Seed data
INSERT INTO public.guides (title, slug, category, short_description, content_markdown, seo_title, seo_description, is_published, is_featured, sort_order) VALUES
(
  'Como começar a estudar para concursos públicos',
  'como-comecar-estudar-concursos',
  'Concursos',
  'Um roteiro prático para quem está dando os primeiros passos na preparação para concursos públicos.',
  E'## Por onde começar?\n\nEstudar para concursos pode parecer assustador no início, mas com um plano claro, tudo fica mais simples.\n\n### 1. Defina seu objetivo\n\nEscolha a área que mais combina com o seu perfil: administrativa, fiscal, policial, jurídica ou de saúde.\n\n### 2. Monte um cronograma realista\n\nNão tente estudar tudo de uma vez. Comece com 2 horas por dia e vá aumentando.\n\n### 3. Use materiais de qualidade\n\nPrefira fontes confiáveis e atualizadas. Apostilas gratuitas podem ser um bom ponto de partida.\n\n### 4. Pratique com questões\n\nResolver provas anteriores é a melhor forma de fixar o conteúdo e entender o estilo da banca.',
  'Como começar a estudar para concursos públicos | PqEstudar',
  'Roteiro prático para quem está começando a se preparar para concursos públicos. Dicas de planejamento, materiais e métodos de estudo.',
  true, true, 1
),
(
  'Ferramentas de IA para estudantes',
  'ferramentas-ia-estudantes',
  'Ferramentas',
  'Descubra como usar inteligência artificial para acelerar seus estudos e ser mais produtivo.',
  E'## IA nos estudos\n\nA inteligência artificial pode ser uma aliada poderosa na sua rotina de estudos.\n\n### Resumos automáticos\n\nFerramentas como ChatGPT podem ajudar a resumir textos longos e criar flashcards.\n\n### Organização\n\nUse IA para montar cronogramas personalizados baseados no seu ritmo de aprendizado.\n\n### Cuidados\n\nSempre confira as informações geradas por IA com fontes oficiais.',
  'Ferramentas de IA para estudantes | PqEstudar',
  'Como usar inteligência artificial para estudar melhor. Ferramentas, dicas e cuidados para estudantes.',
  true, false, 2
),
(
  'Guia de bolsas de estudo no Brasil',
  'guia-bolsas-estudo-brasil',
  'Oportunidades',
  'As principais bolsas de estudo disponíveis no Brasil e como se candidatar.',
  E'## Bolsas de estudo\n\nExistem diversas oportunidades de bolsas no Brasil, tanto para graduação quanto pós-graduação.\n\n### ProUni\n\nO Programa Universidade para Todos oferece bolsas integrais e parciais em instituições privadas.\n\n### FIES\n\nEmbora seja financiamento, o FIES pode complementar bolsas parciais.',
  'Guia de bolsas de estudo no Brasil | PqEstudar',
  'Conheça as principais bolsas de estudo disponíveis no Brasil e saiba como se candidatar.',
  false, false, 3
);
