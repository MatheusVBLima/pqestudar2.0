
-- =============================================
-- legal_documents: config per legal page
-- =============================================
CREATE TABLE public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text UNIQUE NOT NULL,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can read legal_documents"
  ON public.legal_documents FOR SELECT
  USING (true);

-- Admin can manage
CREATE POLICY "Admins can manage legal_documents"
  ON public.legal_documents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- legal_sections: content sections per document
-- =============================================
CREATE TABLE public.legal_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_sections ENABLE ROW LEVEL SECURITY;

-- Public can read active sections
CREATE POLICY "Public can read active legal_sections"
  ON public.legal_sections FOR SELECT
  USING (is_active = true);

-- Admin can manage
CREATE POLICY "Admins can manage legal_sections"
  ON public.legal_sections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Index for efficient queries
CREATE INDEX idx_legal_sections_doc_order
  ON public.legal_sections(document_id, is_active, sort_order);

-- Trigger for updated_at
CREATE TRIGGER update_legal_sections_updated_at
  BEFORE UPDATE ON public.legal_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert documents
INSERT INTO public.legal_documents (route) VALUES ('/termos'), ('/privacidade');

-- Seed /termos sections
INSERT INTO public.legal_sections (document_id, title, content, sort_order) VALUES
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '1. Aceitação dos Termos',
  '<p>Ao acessar e utilizar o site <code>pqestudar.com.br</code> ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso e à nossa Política de Privacidade e Cookies. Se você não concorda com qualquer parte destes documentos, não deve utilizar nossos serviços.</p>',
  1
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '2. Descrição dos Serviços',
  '<p>A PqEstudar é uma plataforma de conteúdo e educação que oferece os seguintes serviços:</p><ul class="space-y-3 mb-4"><li class="flex gap-2"><span class="text-primary mt-1">•</span><span><strong>Conteúdo Informativo:</strong> Disponibilização de notícias, artigos e guias sobre educação, carreira e desenvolvimento profissional.</span></li><li class="flex gap-2"><span class="text-primary mt-1">•</span><span><strong>Curadoria de Cursos:</strong> Apresentação e direcionamento para cursos e materiais educacionais, gratuitos ou pagos, hospedados em plataformas de terceiros.</span></li><li class="flex gap-2"><span class="text-primary mt-1">•</span><span><strong>Produtos Digitais:</strong> Venda de produtos próprios, como o "Kit de Aceleração".</span></li><li class="flex gap-2"><span class="text-primary mt-1">•</span><span><strong>Comunicação por E-mail:</strong> Envio de newsletters, conteúdos exclusivos e ofertas.</span></li></ul><p>Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto dos serviços a qualquer momento, sem aviso prévio.</p>',
  2
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '3. Cadastro e Conta do Usuário',
  '<ul class="space-y-3"><li class="flex gap-2"><span class="text-primary mt-1">•</span><span><strong>Acesso ao Conteúdo:</strong> A maior parte do conteúdo da Plataforma pode ser acessada sem a necessidade de criação de uma conta.</span></li><li class="flex gap-2"><span class="text-primary mt-1">•</span><span><strong>Compra de Produtos e Acesso a Conteúdo Restrito:</strong> Para comprar nossos produtos digitais ou acessar áreas restritas, pode ser necessário criar uma conta.</span></li><li class="flex gap-2"><span class="text-primary mt-1">•</span><span><strong>Responsabilidades:</strong> Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem em sua conta.</span></li></ul>',
  3
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '4. Regras de Uso e Conduta',
  '<p>Ao utilizar nossos serviços, você concorda em não:</p><ul class="space-y-3"><li class="flex gap-2"><span class="text-primary mt-1">•</span><span>Reproduzir, distribuir, modificar ou criar obras derivadas do conteúdo da Plataforma sem nossa autorização expressa por escrito.</span></li><li class="flex gap-2"><span class="text-primary mt-1">•</span><span>Utilizar a Plataforma para quaisquer fins ilegais ou não autorizados.</span></li><li class="flex gap-2"><span class="text-primary mt-1">•</span><span>Tentar obter acesso não autorizado aos nossos sistemas ou a contas de outros usuários.</span></li></ul>',
  4
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '5. Propriedade Intelectual',
  '<p>Todo o conteúdo original disponibilizado na Plataforma, incluindo textos, design, vídeos, imagens, e os produtos digitais como o "Kit de Aceleração", são de propriedade exclusiva da PqEstudar e protegidos por direitos autorais. O conteúdo de terceiros terá sua fonte devidamente citada.</p>',
  5
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '6. Links para Terceiros e Isenção de Responsabilidade',
  '<p>A Plataforma contém links para sites e serviços de terceiros. Não temos controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de quaisquer sites ou serviços de terceiros. O uso desses serviços é por sua conta e risco.</p>',
  6
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '7. Limitação de Responsabilidade',
  '<p>A PqEstudar não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou da impossibilidade de uso de nossos serviços, incluindo decisões de carreira ou educacionais baseadas no conteúdo apresentado. Nosso conteúdo tem caráter informativo e não constitui aconselhamento profissional.</p>',
  7
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '8. Modificações dos Termos',
  '<p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação da versão atualizada no site. O uso continuado do serviço após as modificações constitui sua aceitação dos novos termos.</p>',
  8
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/termos'),
  '9. Contato',
  '<p>Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: <code>pqestudar.suporte@gmail.com</code>.</p>',
  9
);

-- Seed /privacidade sections
INSERT INTO public.legal_sections (document_id, title, content, sort_order) VALUES
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '1. Nosso Compromisso com sua Privacidade',
  '<p>A PqEstudar (pqestudar.com.br), referida como "Plataforma", está comprometida em proteger sua privacidade e seus dados pessoais. Esta Política descreve de forma transparente como coletamos, usamos, armazenamos e protegemos suas informações em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).</p>',
  1
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '2. Quais Informações Coletamos e Por Quê',
  '<div class="space-y-4"><p>Coletamos diferentes tipos de informações para finalidades específicas:</p><div><h3 class="text-lg font-semibold mb-2">a) Informações Fornecidas Diretamente por Você:</h3><ul class="list-disc list-inside ml-4 space-y-1"><li><strong>Dados de Inscrição (Leads):</strong> Quando você se cadastra para receber nossos bônus, newsletters ou materiais gratuitos, coletamos seu endereço de e-mail.</li><li><strong>Dados de Compra:</strong> Ao adquirir nossos produtos, coletamos informações necessárias para a transação.</li><li><strong>Comunicações:</strong> Se você entrar em contato conosco, guardamos o histórico da comunicação.</li></ul></div><div><h3 class="text-lg font-semibold mb-2">b) Informações Coletadas Automaticamente:</h3><ul class="list-disc list-inside ml-4 space-y-1"><li><strong>Dados de Uso:</strong> Informações sobre como você interage com nossa Plataforma.</li><li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional.</li><li><strong>Cookies e Tecnologias Similares:</strong> Utilizamos cookies para operar, analisar e personalizar nossos serviços.</li></ul></div></div>',
  2
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '3. Como e Por Que Utilizamos suas Informações',
  '<div class="space-y-2"><p>As informações coletadas são utilizadas para:</p><ul class="list-disc list-inside ml-4 space-y-1"><li><strong>Operar e Melhorar a Plataforma</strong></li><li><strong>Personalizar sua Experiência</strong></li><li><strong>Realizar Transações</strong></li><li><strong>Marketing e Comunicação</strong></li><li><strong>Segurança</strong></li><li><strong>Obrigações Legais</strong></li></ul></div>',
  3
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '4. Cookies: O Que São e Como Usamos',
  '<div class="space-y-3"><p>Cookies são pequenos arquivos de texto armazenados no seu navegador. Nós os utilizamos para:</p><ul class="list-disc list-inside ml-4 space-y-2"><li><strong>Cookies Necessários:</strong> Essenciais para o funcionamento básico do site.</li><li><strong>Cookies de Análise (Analytics):</strong> Ajudam a entender como os visitantes usam o site.</li><li><strong>Cookies de Marketing:</strong> Permitem personalizar anúncios e campanhas.</li><li><strong>Cookies Funcionais:</strong> Lembram suas preferências e configurações.</li></ul><p class="mt-3"><strong>Observação:</strong> Você pode gerenciar suas preferências de cookies a qualquer momento.</p></div>',
  4
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '5. Com Quem Compartilhamos suas Informações',
  '<div class="space-y-2"><p>Não vendemos suas informações pessoais. O compartilhamento ocorre apenas nas seguintes circunstâncias:</p><ul class="list-disc list-inside ml-4 space-y-1"><li><strong>Provedores de Serviço:</strong> Empresas que nos auxiliam a operar.</li><li><strong>Autoridades Legais:</strong> Quando exigido por lei.</li></ul></div>',
  5
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '6. Seus Direitos como Titular dos Dados (LGPD)',
  '<div class="space-y-2"><p>Você tem o direito de:</p><ul class="list-disc list-inside ml-4 space-y-1"><li><strong>Acessar</strong> seus dados e confirmar a existência do tratamento.</li><li><strong>Corrigir</strong> informações incompletas, inexatas ou desatualizadas.</li><li><strong>Solicitar a anonimização, bloqueio ou eliminação</strong> de dados desnecessários.</li><li><strong>Revogar</strong> seu consentimento a qualquer momento.</li><li><strong>Solicitar a portabilidade</strong> dos seus dados.</li><li><strong>Ser informado</strong> sobre com quem compartilhamos seus dados.</li></ul><p class="mt-3">Para exercer seus direitos, entre em contato pelo e-mail <strong>privacidade@pqestudar.com.br</strong>.</p></div>',
  6
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '7. Segurança e Retenção dos Dados',
  '<p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados. Mantemos suas informações apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletadas.</p>',
  7
),
(
  (SELECT id FROM public.legal_documents WHERE route = '/privacidade'),
  '8. Contato',
  '<div class="space-y-2"><p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco:</p><ul class="list-disc list-inside ml-4 space-y-1"><li><strong>E-mail:</strong> privacidade@pqestudar.com.br</li></ul></div>',
  8
);
