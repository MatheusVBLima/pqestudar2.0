import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Shield, Search, Printer, Link2, ChevronDown, ChevronUp, Download, Eye, Edit, Trash2, FileText, Cookie, CheckCircle2, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const Privacidade = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);
  const { toast } = useToast();
  const { consentData, acceptAll, acceptNecessaryOnly, updatePreferences } = useCookieConsent();

  const sections = [
    {
      id: "1-compromisso",
      title: "1. Compromisso com sua Privacidade",
      content: "A PqEstudar está comprometida em proteger sua privacidade e dados pessoais. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza nossos serviços. Valorizamos a transparência e a confiança que você deposita em nós ao compartilhar seus dados."
    },
    {
      id: "2-informacoes-coletadas",
      title: "2. Informações que Coletamos",
      content: `<div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold mb-2">Informações Fornecidas por Você:</h3>
          <ul class="list-disc list-inside ml-4 space-y-1">
            <li>Nome, e-mail e informações de perfil</li>
            <li>Dados de pagamento (processados por terceiros seguros como Stripe)</li>
            <li>Conteúdo que você compartilha na plataforma</li>
            <li>Comunicações conosco via e-mail ou formulários</li>
            <li>Preferências de consentimento de cookies</li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold mb-2">Informações Coletadas Automaticamente:</h3>
          <ul class="list-disc list-inside ml-4 space-y-1">
            <li>Dados de uso e navegação (páginas visitadas, tempo de sessão)</li>
            <li>Informações do dispositivo e navegador (tipo, versão, resolução)</li>
            <li>Endereço IP e localização aproximada</li>
            <li>Cookies e tecnologias similares (detalhados na seção de cookies)</li>
          </ul>
        </div>
      </div>`
    },
    {
      id: "3-uso-informacoes",
      title: "3. Como Utilizamos suas Informações",
      content: `<div class="space-y-2">
        <p>Utilizamos suas informações para:</p>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li>Fornecer e melhorar nossos serviços educacionais</li>
          <li>Personalizar sua experiência de aprendizagem e recomendações</li>
          <li>Processar pagamentos e gerenciar sua conta de usuário</li>
          <li>Comunicar sobre cursos, atualizações e promoções relevantes</li>
          <li>Garantir a segurança da plataforma e prevenir fraudes</li>
          <li>Cumprir obrigações legais e regulatórias</li>
          <li>Realizar análises estatísticas para melhoria contínua</li>
        </ul>
      </div>`
    },
    {
      id: "4-compartilhamento",
      title: "4. Compartilhamento de Informações",
      content: `<p class="mb-2">Não vendemos suas informações pessoais. Podemos compartilhar dados apenas com:</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Provedores de serviços:</strong> Empresas que nos auxiliam nas operações (hospedagem, pagamentos, e-mail marketing)</li>
        <li><strong>Autoridades legais:</strong> Quando exigido por lei ou para proteger direitos legais</li>
        <li><strong>Parceiros de negócios:</strong> Com seu consentimento explícito para ofertas específicas</li>
        <li><strong>Transferência de ativos:</strong> Em caso de fusão, aquisição ou venda de ativos da empresa</li>
      </ul>`
    },
    {
      id: "5-cookies",
      title: "5. Cookies e Tecnologias Similares",
      content: `<p class="mb-4">Utilizamos cookies e tecnologias similares para melhorar sua experiência. Você pode gerenciar suas preferências através do nosso Centro de Preferências de Cookies.</p>
      <div class="my-4">
        <h4 class="font-semibold mb-2">Tipos de Cookies que Utilizamos:</h4>
        <p class="text-sm text-muted-foreground mb-2">Veja a tabela detalhada abaixo com todos os cookies utilizados.</p>
      </div>`
    },
    {
      id: "6-seus-direitos",
      title: "6. Seus Direitos (LGPD)",
      content: `<p class="mb-2">De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>Acesso:</strong> Confirmar se tratamos seus dados e acessar suas informações</li>
        <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
        <li><strong>Exclusão:</strong> Solicitar a eliminação de dados desnecessários ou tratados em desconformidade</li>
        <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e interoperável</li>
        <li><strong>Revogação:</strong> Revogar consentimentos dados anteriormente</li>
        <li><strong>Informação:</strong> Ser informado sobre violações de dados que possam acarretar risco</li>
        <li><strong>Oposição:</strong> Opor-se ao tratamento de dados em determinadas situações</li>
      </ul>
      <p class="mt-4">Para exercer seus direitos, utilize o card "Seus Direitos" abaixo ou entre em contato conosco.</p>`
    },
    {
      id: "7-seguranca",
      title: "7. Segurança dos Dados",
      content: `<p>Implementamos medidas técnicas e organizacionais adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Nossas medidas incluem:</p>
      <ul class="list-disc list-inside ml-4 space-y-1 mt-2">
        <li>Criptografia SSL/TLS para transmissão de dados</li>
        <li>Controles de acesso baseados em função (RBAC)</li>
        <li>Monitoramento contínuo de segurança e detecção de ameaças</li>
        <li>Backups regulares e planos de recuperação de desastres</li>
        <li>Treinamento de equipe sobre práticas de segurança</li>
        <li>Auditorias periódicas de segurança</li>
      </ul>`
    },
    {
      id: "8-retencao",
      title: "8. Retenção de Dados",
      content: `<p>Mantemos suas informações pelo tempo necessário para fornecer nossos serviços, cumprir obrigações legais e resolver disputas. Os períodos de retenção variam conforme o tipo de dado:</p>
      <ul class="list-disc list-inside ml-4 space-y-1 mt-2">
        <li><strong>Dados de conta ativa:</strong> Durante a vigência da conta e até 5 anos após inatividade</li>
        <li><strong>Dados de transação:</strong> Conforme requisitos fiscais e legais (geralmente 5 anos)</li>
        <li><strong>Dados de marketing:</strong> Até a revogação do consentimento ou 2 anos de inatividade</li>
        <li><strong>Logs de acesso:</strong> 6 meses para fins de segurança</li>
      </ul>
      <p class="mt-2">Dados inativos são anonimizados ou excluídos conforme nossa política de retenção.</p>`
    },
    {
      id: "9-transferencias",
      title: "9. Transferências Internacionais",
      content: `<p>Seus dados podem ser transferidos e processados em servidores localizados fora do Brasil, incluindo países que podem ter leis de proteção de dados diferentes. Garantimos que todas as transferências internacionais cumprem requisitos da LGPD através de:</p>
      <ul class="list-disc list-inside ml-4 space-y-1 mt-2">
        <li>Cláusulas contratuais padrão aprovadas</li>
        <li>Certificações de adequação de privacidade</li>
        <li>Garantias apropriadas de proteção de dados</li>
      </ul>`
    },
    {
      id: "10-menores",
      title: "10. Privacidade de Menores",
      content: `<p>Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se você é pai, mãe ou responsável e acredita que seu filho nos forneceu dados pessoais, entre em contato conosco imediatamente para que possamos tomar as medidas necessárias.</p>`
    },
    {
      id: "11-atualizacoes",
      title: "11. Atualizações desta Política",
      content: `<p>Reservamo-nos o direito de modificar esta política a qualquer momento. As alterações significativas serão notificadas através de:</p>
      <ul class="list-disc list-inside ml-4 space-y-1 mt-2">
        <li>Aviso destacado em nossa plataforma</li>
        <li>E-mail para usuários cadastrados</li>
        <li>Atualização da data de "Última atualização" no topo desta página</li>
      </ul>
      <p class="mt-2">É sua responsabilidade revisar esta política periodicamente. O uso continuado do serviço após as modificações constitui sua aceitação dos novos termos.</p>`
    },
    {
      id: "12-contato",
      title: "12. Contato e DPO",
      content: `<p class="mb-2">Para exercer seus direitos, esclarecer dúvidas sobre esta política ou relatar preocupações de privacidade, entre em contato conosco:</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li><strong>E-mail:</strong> privacidade@pqestudar.com</li>
        <li><strong>E-mail do DPO:</strong> dpo@pqestudar.com</li>
        <li><strong>Telefone:</strong> (11) 1234-5678</li>
        <li><strong>Endereço:</strong> Rua da Educação, 123 - São Paulo, SP - CEP 01234-567</li>
      </ul>
      <p class="mt-4">Respondemos a todas as solicitações em até 15 dias úteis, conforme previsto pela LGPD.</p>`
    }
  ];

  const cookiesData = [
    {
      categoria: "Essenciais",
      cookies: [
        { nome: "cookieConsent", finalidade: "Armazena suas preferências de consentimento de cookies", duracao: "365 dias", provedor: "PqEstudar" },
        { nome: "session_id", finalidade: "Mantém sua sessão de login ativa", duracao: "Sessão", provedor: "PqEstudar" },
        { nome: "_csrf", finalidade: "Proteção contra ataques CSRF", duracao: "Sessão", provedor: "PqEstudar" }
      ]
    },
    {
      categoria: "Desempenho e Análise",
      cookies: [
        { nome: "_ga", finalidade: "Google Analytics - Distingue usuários", duracao: "2 anos", provedor: "Google" },
        { nome: "_ga_*", finalidade: "Google Analytics - Mantém estado da sessão", duracao: "2 anos", provedor: "Google" },
        { nome: "_gid", finalidade: "Google Analytics - Distingue usuários", duracao: "24 horas", provedor: "Google" }
      ]
    },
    {
      categoria: "Funcionais",
      cookies: [
        { nome: "theme_preference", finalidade: "Armazena sua preferência de tema (claro/escuro)", duracao: "365 dias", provedor: "PqEstudar" },
        { nome: "lang_preference", finalidade: "Armazena sua preferência de idioma", duracao: "365 dias", provedor: "PqEstudar" }
      ]
    },
    {
      categoria: "Marketing",
      cookies: [
        { nome: "_fbp", finalidade: "Facebook Pixel - Rastreamento de conversões", duracao: "90 dias", provedor: "Meta" },
        { nome: "utm_*", finalidade: "Rastreamento de campanhas de marketing", duracao: "30 dias", provedor: "PqEstudar" }
      ]
    }
  ];

  const versionHistory = [
    { date: "28 de Outubro de 2025", changes: "Versão atual - Adição de seção sobre cookies e Centro de Preferências" },
    { date: "15 de Setembro de 2025", changes: "Atualização sobre transferências internacionais de dados" },
    { date: "01 de Junho de 2025", changes: "Adequação completa à LGPD e adição de seção sobre direitos do titular" },
    { date: "10 de Janeiro de 2024", changes: "Versão inicial da Política de Privacidade" }
  ];

  const [cookiePrefs, setCookiePrefs] = useState({
    necessary: true,
    analytics: consentData?.preferences?.analytics || false,
    functional: consentData?.preferences?.functional || false,
    marketing: consentData?.preferences?.marketing || false
  });

  useEffect(() => {
    // SEO
    document.title = "Política de Privacidade — PqEstudar | Proteção de Dados e LGPD";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Política de Privacidade da PqEstudar. Saiba como coletamos, usamos e protegemos seus dados pessoais conforme a LGPD. Última atualização: 28 de Outubro de 2025.");
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", "https://pqestudar.com.br/privacidade");
    }

    // JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://pqestudar.com.br/privacidade",
      "name": "Política de Privacidade — PqEstudar",
      "description": "Política de Privacidade da PqEstudar conforme LGPD",
      "publisher": {
        "@type": "Organization",
        "name": "PqEstudar"
      },
      "dateModified": "2025-10-28"
    });
    document.head.appendChild(script);

    console.log("[Privacidade] Página carregada - SEO configurado");

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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
    setExpandedItems(sections.map(s => s.id));
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

  const filteredSections = sections.filter(section => 
    searchTerm === "" || 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>');
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
      marketing: cookiePrefs.marketing
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
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Shield className="h-16 w-16 md:h-20 md:w-20 text-primary mx-auto mb-6" />
            <Badge variant="secondary" className="mb-4">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Última atualização: 28 de Outubro de 2025
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Política de Privacidade
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Transparência e proteção dos seus dados pessoais são nossa prioridade. Veja como coletamos, usamos e protegemos suas informações conforme a LGPD.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 max-w-7xl mx-auto">
          {/* Sidebar TOC */}
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
                <CardTitle className="text-xl">Navegação e Ferramentas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar na política..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleExpandAll}>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expandir Tudo
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCollapseAll}>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Recolher Tudo
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" />
                    Imprimir/PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Accordion Sections */}
            <Accordion
              type="multiple"
              value={expandedItems}
              onValueChange={setExpandedItems}
              className="space-y-4"
            >
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
                    className="border-2 rounded-2xl shadow-md px-6 bg-card"
                  >
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span dangerouslySetInnerHTML={{ __html: highlightText(section.title) }} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(section.id);
                          }}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 pt-2 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: highlightText(section.content) }} />
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            {/* Tabela de Cookies */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-6 w-6" />
                  Tabela Detalhada de Cookies
                </CardTitle>
                <CardDescription>
                  Veja todos os cookies que utilizamos, sua finalidade e duração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cookiesData.map((category, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-lg font-semibold">{category.categoria}</h3>
                    <div className="overflow-x-auto">
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
                    {idx < cookiesData.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
                <div className="mt-6 text-center">
                  <Dialog open={showCookiePreferences} onOpenChange={setShowCookiePreferences}>
                    <DialogTrigger asChild>
                      <Button variant="premium" size="lg">
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
                        <DialogDescription>
                          Gerencie suas preferências de cookies por categoria
                        </DialogDescription>
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
                              onCheckedChange={(checked) => setCookiePrefs(prev => ({ ...prev, analytics: checked }))}
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
                              onCheckedChange={(checked) => setCookiePrefs(prev => ({ ...prev, functional: checked }))}
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
                              onCheckedChange={(checked) => setCookiePrefs(prev => ({ ...prev, marketing: checked }))}
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
                <CardDescription>
                  Acompanhe as mudanças em nossa política ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versionHistory.map((version, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
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

            {/* Card de Contato */}
            <Card className="shadow-lg border-2 bg-gradient-to-br from-accent/10 to-background">
              <CardHeader>
                <CardTitle className="text-2xl">Entre em Contato</CardTitle>
                <CardDescription>
                  Dúvidas sobre privacidade? Nossa equipe está pronta para ajudar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">E-mail</h4>
                    <p className="text-sm text-muted-foreground">privacidade@pqestudar.com</p>
                    <p className="text-sm text-muted-foreground">dpo@pqestudar.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Telefone</h4>
                    <p className="text-sm text-muted-foreground">(11) 1234-5678</p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" asChild>
                    <a href="/termos">Ver Termos de Uso</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/configuracoes-cookies">Configurações de Cookies</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacidade;