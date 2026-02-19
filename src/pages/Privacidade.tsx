import {
  Shield,
  Search,
  Printer,
  Link2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Cookie,
  CheckCircle2,
  Settings,
  Building2,
  List,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { usePageSettings } from "@/hooks/usePageSettings";

import { sanitizeHtml, safeHighlight } from "@/lib/utils";

const Privacidade = () => {
  const ps = usePageSettings("/privacidade");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);
  const [expandedCookieCategories, setExpandedCookieCategories] = useState<string[]>([]);
  const [showMobileTOC, setShowMobileTOC] = useState(false);
  const { toast } = useToast();
  const { consentData, acceptAll, acceptNecessaryOnly, updatePreferences } = useCookieConsent();

  const sections = [
    {
      id: "1-nosso-compromisso",
      title: "1. Nosso Compromisso com sua Privacidade",
      content:
        'A PqEstudar (pqestudar.com.br), referida como "Plataforma", está comprometida em proteger sua privacidade e seus dados pessoais. Esta Política descreve de forma transparente como coletamos, usamos, armazenamos e protegemos suas informações em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).',
    },
    {
      id: "2-quais-informacoes",
      title: "2. Quais Informações Coletamos e Por Quê",
      content: `<div class="space-y-4">
        <p>Coletamos diferentes tipos de informações para finalidades específicas:</p>
        <div>
          <h3 class="text-lg font-semibold mb-2">a) Informações Fornecidas Diretamente por Você:</h3>
          <ul class="list-disc list-inside ml-4 space-y-1">
            <li><strong>Dados de Inscrição (Leads):</strong> Quando você se cadastra para receber nossos bônus, newsletters ou materiais gratuitos, coletamos seu endereço de e-mail. Utilizamos este dado para cumprir nossa promessa de enviar o conteúdo solicitado e para nos comunicarmos com você, enviando outros conteúdos e ofertas que possam ser do seu interesse.</li>
            <li><strong>Dados de Compra:</strong> Ao adquirir nosso "Kit de Aceleração" ou outros produtos, coletamos informações necessárias para a transação, como nome completo, e-mail e CPF. Seus dados de pagamento (como número do cartão de crédito) são inseridos diretamente em um ambiente seguro de nossos parceiros de processamento de pagamento e não são armazenados por nós.</li>
            <li><strong>Comunicações:</strong> Se você entrar em contato conosco, guardamos o histórico da comunicação para oferecer um suporte melhor.</li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">b) Informações Coletadas Automaticamente (Dados de Navegação):</h3>
          <ul class="list-disc list-inside ml-4 space-y-1">
            <li><strong>Dados de Uso:</strong> Coletamos informações sobre como você interage com nossa Plataforma, como as páginas que visita, os links em que clica e o tempo que permanece em cada página.</li>
            <li><strong>Dados Técnicos:</strong> Coletamos informações do seu dispositivo e navegador, como endereço IP, tipo de navegador, sistema operacional e localização geográfica aproximada.</li>
            <li><strong>Cookies e Tecnologias Similares:</strong> Utilizamos cookies para coletar esses dados a fim de operar, analisar e personalizar nossos serviços.</li>
          </ul>
        </div>
      </div>`,
    },
    {
      id: "3-como-utilizamos",
      title: "3. Como e Por Que Utilizamos suas Informações",
      content: `<div class="space-y-2">
        <p>As informações coletadas são utilizadas para as seguintes finalidades:</p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li><strong>Operar e Melhorar a Plataforma:</strong> Garantir que o site funcione corretamente e entender quais conteúdos e recursos são mais populares para aprimorar a experiência do usuário.</li>
          <li><strong>Personalizar sua Experiência:</strong> Exibir conteúdo e recomendações que sejam mais relevantes para seus interesses.</li>
          <li><strong>Realizar Transações:</strong> Processar a compra de nossos produtos e gerenciar o acesso de clientes.</li>
          <li><strong>Marketing e Comunicação:</strong> Enviar e-mails com notícias, dicas, ofertas e realizar campanhas de publicidade direcionada (remarketing), sempre que houver seu consentimento para tal.</li>
          <li><strong>Segurança:</strong> Proteger nossa Plataforma contra fraudes e atividades maliciosas.</li>
          <li><strong>Obrigações Legais:</strong> Cumprir exigências legais e regulatórias.</li>
        </ul>
      </div>`,
    },
    {
      id: "4-cookies",
      title: "4. Cookies: O Que São e Como Usamos",
      content: `<div class="space-y-3">
        <p>Cookies são pequenos arquivos de texto armazenados no seu navegador. Nós os utilizamos para:</p>
        <ul class="list-disc list-inside ml-4 space-y-2">
          <li><strong>Cookies Necessários:</strong> Essenciais para o funcionamento básico do site (ex.: segurança, login).</li>
          <li><strong>Cookies de Análise (Analytics):</strong> Ajudam a entender como os visitantes usam o site (ex.: Google Analytics). Estes só são ativados com o seu consentimento.</li>
          <li><strong>Cookies de Marketing:</strong> Permitem personalizar anúncios e campanhas em outras plataformas, como redes sociais (ex.: Pixel da Meta). Estes só são ativados com o seu consentimento.</li>
          <li><strong>Cookies Funcionais:</strong> Lembram suas preferências, como idioma ou outras configurações. Estes só são ativados com o seu consentimento.</li>
        </ul>
        <p class="mt-3"><strong>Observação:</strong> Você pode gerenciar suas preferências de cookies a qualquer momento através do nosso banner de consentimento ou pelo link "Gerenciar Cookies" no rodapé do site.</p>
        <div class="my-4">
          <p class="text-sm text-muted-foreground">Veja a tabela detalhada abaixo com todos os cookies utilizados por categoria.</p>
        </div>
      </div>`,
    },
    {
      id: "5-compartilhamento",
      title: "5. Com Quem Compartilhamos suas Informações",
      content: `<div class="space-y-2">
        <p>Não vendemos suas informações pessoais. O compartilhamento ocorre apenas nas seguintes circunstâncias:</p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li><strong>Provedores de Serviço:</strong> Empresas que nos auxiliam a operar, como plataformas de e-mail marketing, processadores de pagamento e ferramentas de análise de dados (como Google e Meta). Exigimos que todos cumpram as normas de proteção de dados.</li>
          <li><strong>Autoridades Legais:</strong> Quando exigido por lei, ordem judicial ou para proteger nossos direitos.</li>
        </ul>
      </div>`,
    },
    {
      id: "6-seus-direitos-lgpd",
      title: "6. Seus Direitos como Titular dos Dados (LGPD)",
      content: `<div class="space-y-2">
        <p>Você tem o direito de:</p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li><strong>Acessar</strong> seus dados e confirmar a existência do tratamento.</li>
          <li><strong>Corrigir</strong> informações incompletas, inexatas ou desatualizadas.</li>
          <li><strong>Solicitar a anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou tratados em desconformidade com a LGPD.</li>
          <li><strong>Revogar</strong> seu consentimento a qualquer momento.</li>
          <li><strong>Solicitar a portabilidade</strong> dos seus dados a outro fornecedor.</li>
          <li><strong>Ser informado</strong> sobre com quem compartilhamos seus dados.</li>
        </ul>
        <p class="mt-3">Para exercer seus direitos, entre em contato pelo e-mail <strong>privacidade@pqestudar.com.br</strong>.</p>
      </div>`,
    },
    {
      id: "7-seguranca-retencao",
      title: "7. Segurança e Retenção dos Dados",
      content: `<div class="space-y-3">
        <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados. Mantemos suas informações apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletadas, para obrigações legais ou para a resolução de disputas.</p>
      </div>`,
    },
    {
      id: "8-contato",
      title: "8. Contato",
      content: `<div class="space-y-2">
        <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco:</p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li><strong>E-mail:</strong> privacidade@pqestudar.com.br</li>
        </ul>
      </div>`,
    },
  ];

  const cookiesData = [
    {
      categoria: "Essenciais",
      descricao: "Necessários para o funcionamento básico e segurança da plataforma",
      cookies: [
        {
          nome: "cookieConsent",
          finalidade: "Armazena suas preferências de consentimento de cookies",
          duracao: "365 dias",
          provedor: "PqEstudar",
        },
        {
          nome: "session_id",
          finalidade: "Mantém sua sessão de login ativa",
          duracao: "Sessão",
          provedor: "PqEstudar",
        },
        { nome: "_csrf", finalidade: "Proteção contra ataques CSRF", duracao: "Sessão", provedor: "PqEstudar" },
      ],
    },
    {
      categoria: "Desempenho e Análise",
      descricao: "Ajudam a entender como os visitantes usam o site para melhorias",
      cookies: [
        { nome: "_ga", finalidade: "Google Analytics - Distingue usuários", duracao: "2 anos", provedor: "Google" },
        {
          nome: "_ga_*",
          finalidade: "Google Analytics - Mantém estado da sessão",
          duracao: "2 anos",
          provedor: "Google",
        },
        { nome: "_gid", finalidade: "Google Analytics - Distingue usuários", duracao: "24 horas", provedor: "Google" },
      ],
    },
    {
      categoria: "Funcionais",
      descricao: "Lembram suas preferências e configurações personalizadas",
      cookies: [
        {
          nome: "theme_preference",
          finalidade: "Armazena sua preferência de tema (claro/escuro)",
          duracao: "365 dias",
          provedor: "PqEstudar",
        },
        {
          nome: "lang_preference",
          finalidade: "Armazena sua preferência de idioma",
          duracao: "365 dias",
          provedor: "PqEstudar",
        },
      ],
    },
    {
      categoria: "Marketing",
      descricao: "Permitem personalizar anúncios e campanhas em outras plataformas",
      cookies: [
        {
          nome: "_fbp",
          finalidade: "Facebook Pixel - Rastreamento de conversões",
          duracao: "90 dias",
          provedor: "Meta",
        },
        { nome: "_gcl_au", finalidade: "Conversões de anúncios Google", duracao: "90 dias", provedor: "Google" },
        {
          nome: "utm_*",
          finalidade: "Rastreamento de campanhas de marketing",
          duracao: "30 dias",
          provedor: "PqEstudar",
        },
      ],
    },
  ];

  const versionHistory = [
    { date: "28 de Outubro de 2025", changes: "Versão atual - Adição de seção sobre cookies e Centro de Preferências" },
    { date: "15 de Setembro de 2025", changes: "Atualização sobre transferências internacionais de dados" },
    { date: "01 de Junho de 2025", changes: "Adequação completa à LGPD e adição de seção sobre direitos do titular" },
    { date: "10 de Janeiro de 2024", changes: "Versão inicial da Política de Privacidade" },
  ];

  const [cookiePrefs, setCookiePrefs] = useState({
    necessary: true,
    analytics: consentData?.preferences?.analytics || false,
    functional: consentData?.preferences?.functional || false,
    marketing: consentData?.preferences?.marketing || false,
  });

  useEffect(() => {
    // SEO - use page settings
    document.title = ps.titleTag;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", ps.metaDescription);
    }

    // Canonical is handled globally by GlobalSeo

    // JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": ["WebPage", "PrivacyPolicy"],
      "@id": "https://pqestudar.com.br/privacidade",
      name: "Política de Privacidade – PqEstudar",
      description:
        "Transparência e proteção dos seus dados pessoais são nossa prioridade. Veja como coletamos, usamos e protegemos suas informações conforme a LGPD.",
      publisher: {
        "@type": "Organization",
        name: "PqEstudar",
      },
      dateModified: "2025-10-28",
    });
    document.head.appendChild(script);

    console.log("[Privacidade] Página carregada - SEO configurado");

    return () => {
      document.head.removeChild(script);
    };
  }, [ps.titleTag, ps.metaDescription]);

  useEffect(() => {
    // Scroll spy
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            if (activeSection !== section.id) {
              setActiveSection(section.id);
              console.log(`[Privacidade] Seção ativa: ${section.id}`);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection, sections]);

  const handleExpandAll = () => {
    setExpandedItems(sections.map((s) => s.id));
    console.log("[Privacidade] Todas as seções expandidas");
    toast({ title: "Todas as seções expandidas" });
  };

  const handleCollapseAll = () => {
    setExpandedItems([]);
    console.log("[Privacidade] Todas as seções recolhidas");
    toast({ title: "Todas as seções recolhidas" });
  };

  const handlePrint = () => {
    console.log("[Privacidade] Impressão/PDF iniciada");
    window.print();
  };

  const handleCopyLink = (sectionId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url);
    console.log(`[Privacidade] Link copiado: ${sectionId}`);
    toast({ title: "Link copiado!", description: "O link da seção foi copiado para a área de transferência." });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      console.log(`[Privacidade] Navegação TOC: ${sectionId}`);
    }
  };

  const filteredSections = sections.filter(
    (section) =>
      searchTerm === "" ||
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Highlight text with safe fallback
  const highlightText = (text: string) => {
    if (!text) return "";
    return safeHighlight(text, searchTerm);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value) {
      console.log(`[Privacidade] Busca realizada: "${value}"`);
    }
  };

  const handleAcceptAllCookies = () => {
    acceptAll();
    setCookiePrefs({ necessary: true, analytics: true, functional: true, marketing: true });
    setShowCookiePreferences(false);
    console.log("[Privacidade] Preferências de cookies: Aceitar Todos");
    toast({ title: "Preferências salvas", description: "Todos os cookies foram aceitos." });
  };

  const handleRejectNonEssential = () => {
    acceptNecessaryOnly();
    setCookiePrefs({ necessary: true, analytics: false, functional: false, marketing: false });
    setShowCookiePreferences(false);
    console.log("[Privacidade] Preferências de cookies: Apenas Essenciais");
    toast({ title: "Preferências salvas", description: "Apenas cookies essenciais foram aceitos." });
  };

  const handleSaveCookiePreferences = () => {
    updatePreferences({
      necessary: true,
      analytics: cookiePrefs.analytics,
      functional: cookiePrefs.functional,
      marketing: cookiePrefs.marketing,
    });
    setShowCookiePreferences(false);
    console.log("[Privacidade] Preferências de cookies salvas:", cookiePrefs);
    toast({ title: "Preferências salvas", description: "Suas preferências de cookies foram atualizadas." });
  };

  const handleDownloadPDF = () => {
    console.log("[Privacidade] Download PDF solicitado");
    toast({ title: "Funcionalidade em breve", description: "O download em PDF estará disponível em breve." });
  };

  return (
    <div className="min-h-screen flex flex-col">
      

      {/* Hero Premium */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto px-6 py-16 md:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Última atualização: 28 de outubro de 2025
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {ps.headerTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {ps.headerDescription}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 max-w-7xl mx-auto">
          {/* Mobile TOC Toggle */}
          <div className="lg:hidden mb-6">
            <Button
              onClick={() => setShowMobileTOC(!showMobileTOC)}
              variant="outline"
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Índice de Conteúdo</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${showMobileTOC ? "rotate-180" : ""}`} />
            </Button>
            {showMobileTOC && (
              <Card className="mt-2 p-4">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToSection(section.id);
                        setShowMobileTOC(false);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </Card>
            )}
          </div>

          {/* Sidebar TOC (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Índice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Search and Actions */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Navegação e Ferramentas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar na política..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandAll}
                    className="w-full sm:w-auto justify-start sm:justify-center"
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span>Expandir Tudo</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCollapseAll}
                    className="w-full sm:w-auto justify-start sm:justify-center"
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>Recolher Tudo</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="w-full sm:w-auto justify-start sm:justify-center"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    <span>Imprimir/PDF</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Accordion Sections */}
            <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems} className="space-y-4">
              {filteredSections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AccordionItem
                    value={section.id}
                    id={section.id}
                    className="border-2 rounded-2xl shadow-md px-4 sm:px-6 bg-card"
                  >
                    <AccordionTrigger className="text-base sm:text-lg font-semibold hover:no-underline py-4 sm:py-6">
                      <div className="flex items-center justify-between w-full pr-2 sm:pr-4 gap-2">
                        <span
                          className="text-left break-words flex-1"
                          dangerouslySetInnerHTML={{ __html: highlightText(section.title || "") }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(section.id);
                          }}
                        >
                          <Link2 className="h-4 w-4" />
                          <span className="sr-only">Copiar link</span>
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 sm:pb-6 pt-2 leading-relaxed [&>div]:break-words">
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content || "") }} />
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            {/* Tabela de Cookies - Collapsible */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Cookie className="h-6 w-6" />
                  Tabela Detalhada de Cookies
                </CardTitle>
                <CardDescription>Clique em cada categoria para ver os cookies utilizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion
                  type="multiple"
                  value={expandedCookieCategories}
                  onValueChange={setExpandedCookieCategories}
                  className="space-y-3"
                >
                  {cookiesData.map((category, idx) => (
                    <AccordionItem key={idx} value={category.categoria} className="border-2 rounded-xl overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
                        <div className="flex items-center gap-3 flex-1 text-left pr-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm sm:text-base break-words">
                                {category.categoria}
                              </span>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {category.cookies.length} {category.cookies.length === 1 ? "cookie" : "cookies"}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                              {category.descricao}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-3 bg-card/50">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Finalidade</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead>Provedor</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {category.cookies.map((cookie, cIdx) => (
                                <TableRow key={cIdx}>
                                  <TableCell className="font-mono text-sm">{cookie.nome}</TableCell>
                                  <TableCell>{cookie.finalidade}</TableCell>
                                  <TableCell>{cookie.duracao}</TableCell>
                                  <TableCell>{cookie.provedor}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                          {category.cookies.map((cookie, cIdx) => (
                            <Card key={cIdx} className="p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-sm font-semibold break-all">{cookie.nome}</span>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {cookie.duracao}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground break-words">{cookie.finalidade}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3 flex-shrink-0" />
                                <span className="break-words">{cookie.provedor}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-6 text-center">
                  <Dialog open={showCookiePreferences} onOpenChange={setShowCookiePreferences}>
                    <DialogTrigger asChild>
                      <Button variant="premium" size="lg" className="w-full sm:w-auto">
                        <Settings className="h-5 w-5 mr-2" />
                        Gerenciar Preferências de Cookies
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Cookie className="h-6 w-6" />
                          Centro de Preferências de Cookies
                        </DialogTitle>
                        <DialogDescription>Gerencie suas preferências de cookies por categoria</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div className="space-y-1 flex-1">
                              <Label htmlFor="necessary" className="text-base font-semibold">
                                Cookies Essenciais
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Necessários para o funcionamento básico do site. Sempre ativos.
                              </p>
                            </div>
                            <Switch id="necessary" checked={true} disabled />
                          </div>

                          <div className="flex items-center justify-between p-4 border-2 rounded-lg">
                            <div className="space-y-1 flex-1">
                              <Label htmlFor="analytics" className="text-base font-semibold">
                                Cookies de Análise
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Nos ajudam a entender como você usa o site para melhorá-lo.
                              </p>
                            </div>
                            <Switch
                              id="analytics"
                              checked={cookiePrefs.analytics}
                              onCheckedChange={(checked) => setCookiePrefs((prev) => ({ ...prev, analytics: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border-2 rounded-lg">
                            <div className="space-y-1 flex-1">
                              <Label htmlFor="functional" className="text-base font-semibold">
                                Cookies Funcionais
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Permitem funcionalidades avançadas e personalização.
                              </p>
                            </div>
                            <Switch
                              id="functional"
                              checked={cookiePrefs.functional}
                              onCheckedChange={(checked) =>
                                setCookiePrefs((prev) => ({ ...prev, functional: checked }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border-2 rounded-lg">
                            <div className="space-y-1 flex-1">
                              <Label htmlFor="marketing" className="text-base font-semibold">
                                Cookies de Marketing
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Usados para exibir anúncios relevantes aos seus interesses.
                              </p>
                            </div>
                            <Switch
                              id="marketing"
                              checked={cookiePrefs.marketing}
                              onCheckedChange={(checked) => setCookiePrefs((prev) => ({ ...prev, marketing: checked }))}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button variant="success" className="flex-1" onClick={handleAcceptAllCookies}>
                            Aceitar Todos
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={handleRejectNonEssential}>
                            Apenas Essenciais
                          </Button>
                          <Button variant="premium" className="flex-1" onClick={handleSaveCookiePreferences}>
                            Salvar Preferências
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Card Direitos LGPD */}
            <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="h-6 w-6" />
                  Seus Direitos (LGPD)
                </CardTitle>
                <CardDescription className="text-base">
                  Você tem direitos garantidos pela Lei Geral de Proteção de Dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <Eye className="h-5 w-5 mr-2 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">Acessar Dados</div>
                      <div className="text-xs text-muted-foreground">Veja seus dados armazenados</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <Edit className="h-5 w-5 mr-2 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">Corrigir Dados</div>
                      <div className="text-xs text-muted-foreground">Atualize informações incorretas</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <Trash2 className="h-5 w-5 mr-2 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">Excluir/Revogar</div>
                      <div className="text-xs text-muted-foreground">Remova seus dados</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3" onClick={handleDownloadPDF}>
                    <Download className="h-5 w-5 mr-2 shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold">Baixar PDF</div>
                      <div className="text-xs text-muted-foreground">Salve esta política</div>
                    </div>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Para exercer seus direitos, entre em contato: <strong>privacidade@pqestudar.com</strong>
                </p>
              </CardContent>
            </Card>

            {/* Histórico de Versões */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Histórico de Versões
                </CardTitle>
                <CardDescription>Acompanhe as mudanças em nossa política ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versionHistory.map((version, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 rounded-full ${idx === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                        />
                        {idx < versionHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-muted-foreground/20 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={idx === 0 ? "default" : "secondary"} className="text-xs">
                            {version.date}
                          </Badge>
                          {idx === 0 && <Badge className="bg-emerald-600 text-white">Atual</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{version.changes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card de Contato - Simplified */}
            <Card className="shadow-lg border-2 bg-gradient-to-br from-accent/10 to-background">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Entre em Contato</CardTitle>
                <CardDescription>Dúvidas sobre privacidade? Nossa equipe está pronta para ajudar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    E-mail
                  </h4>
                  <a
                    href="mailto:privacidade@pqestudar.com"
                    className="text-primary hover:underline break-all font-medium"
                  >
                    privacidade@pqestudar.com
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" asChild className="flex-1 justify-start sm:justify-center">
                    <a href="/termos">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Termos de Uso
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1 justify-start sm:justify-center">
                    <a href="/configuracoes-cookies">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações de Cookies
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default Privacidade;
