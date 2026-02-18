import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Printer, 
  Link2, 
  AlertTriangle,
  Mail,
  Shield,
  Cookie
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Termos = () => {
  const updatedAt = "28 de outubro de 2025";
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: "1-aceitacao-dos-termos",
      title: "1. Aceitação dos Termos",
      content: (
        <>
          <p className="mb-4">
            Ao acessar e utilizar o site <code className="px-2 py-1 bg-muted rounded text-sm">pqestudar.com.br</code> ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso e à nossa Política de Privacidade e Cookies. Se você não concorda com qualquer parte destes documentos, não deve utilizar nossos serviços.
          </p>
        </>
      ),
      critical: true
    },
    {
      id: "2-descricao-dos-servicos",
      title: "2. Descrição dos Serviços",
      content: (
        <>
          <p className="mb-4">
            A PqEstudar é uma plataforma de conteúdo e educação que oferece os seguintes serviços:
          </p>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Conteúdo Informativo:</strong> Disponibilização de notícias, artigos e guias sobre educação, carreira e desenvolvimento profissional.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Curadoria de Cursos:</strong> Apresentação e direcionamento para cursos e materiais educacionais, gratuitos ou pagos, hospedados em plataformas de terceiros. A PqEstudar não se responsabiliza pelo conteúdo ou pela certificação desses cursos externos.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Produtos Digitais:</strong> Venda de produtos próprios, como o "Kit de Aceleração", que incluem ferramentas, templates e métodos para desenvolvimento profissional.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Comunicação por E-mail:</strong> Envio de newsletters, conteúdos exclusivos e ofertas para usuários que se inscreverem em nossas listas.</span>
            </li>
          </ul>
          <p>
            Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto dos serviços a qualquer momento, sem aviso prévio.
          </p>
        </>
      )
    },
    {
      id: "3-cadastro-e-conta-do-usuario",
      title: "3. Cadastro e Conta do Usuário",
      content: (
        <>
          <ul className="space-y-3">
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Acesso ao Conteúdo:</strong> A maior parte do conteúdo da Plataforma pode ser acessada sem a necessidade de criação de uma conta.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Compra de Produtos e Acesso a Conteúdo Restrito:</strong> Para comprar nossos produtos digitais ou acessar áreas restritas, pode ser necessário criar uma conta, fornecendo informações precisas e atualizadas.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Responsabilidades:</strong> Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem em sua conta.</span>
            </li>
          </ul>
        </>
      )
    },
    {
      id: "4-regras-de-uso-e-conduta",
      title: "4. Regras de Uso e Conduta",
      content: (
        <>
          <p className="mb-4">Ao utilizar nossos serviços, você concorda em não:</p>
          <ul className="space-y-3">
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Reproduzir, distribuir, modificar ou criar obras derivadas do conteúdo da Plataforma sem nossa autorização expressa por escrito.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Utilizar a Plataforma para quaisquer fins ilegais ou não autorizados.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Tentar obter acesso não autorizado aos nossos sistemas ou a contas de outros usuários.</span>
            </li>
          </ul>
        </>
      ),
      critical: true
    },
    {
      id: "5-propriedade-intelectual",
      title: "5. Propriedade Intelectual",
      content: (
        <>
          <p>
            Todo o conteúdo original disponibilizado na Plataforma, incluindo, mas não se limitando a, textos, design, vídeos, imagens, e os produtos digitais como o "Kit de Aceleração", são de propriedade exclusiva da PqEstudar e protegidos por direitos autorais. O conteúdo de terceiros, como notícias e cursos externos, terá sua fonte devidamente citada, e os direitos pertencem aos seus respectivos proprietários.
          </p>
        </>
      )
    },
    {
      id: "6-links-terceiros-e-isencao",
      title: "6. Links para Terceiros e Isenção de Responsabilidade",
      content: (
        <>
          <p>
            A Plataforma contém links para sites e serviços de terceiros (por exemplo, plataformas de cursos). Não temos controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de quaisquer sites ou serviços de terceiros. O uso desses serviços é por sua conta e risco.
          </p>
        </>
      )
    },
    {
      id: "7-limitacao-de-responsabilidade",
      title: "7. Limitação de Responsabilidade",
      content: (
        <>
          <p>
            A PqEstudar não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou da impossibilidade de uso de nossos serviços, incluindo decisões de carreira ou educacionais baseadas no conteúdo apresentado. Nosso conteúdo tem caráter informativo e não constitui aconselhamento profissional.
          </p>
        </>
      ),
      critical: true
    },
    {
      id: "8-modificacoes-dos-termos",
      title: "8. Modificações dos Termos",
      content: (
        <>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação da versão atualizada no site. É sua responsabilidade revisar os termos periodicamente. O uso continuado do serviço após as modificações constitui sua aceitação dos novos termos.
          </p>
        </>
      )
    },
    {
      id: "9-contato",
      title: "9. Contato",
      content: (
        <>
          <p>
            Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail:{" "}
            <code className="px-2 py-1 bg-muted rounded text-sm">pqestudar.suporte@gmail.com</code>.
          </p>
        </>
      )
    }
  ];

  // SEO + JSON-LD
  useEffect(() => {
    console.log("[Termos] Página carregada - Configurando SEO");
    
    document.title = "Termos de Uso – PqEstudar";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Termos de Uso da PqEstudar. Última atualização: ${updatedAt}.`);
    }

    // Canonical is handled globally by GlobalSeo

    // JSON-LD
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Termos de Uso",
      "description": "Termos de Uso da plataforma PqEstudar",
      "url": "https://pqestudar.com.br/termos",
      "dateModified": "2025-10-28",
      "publisher": {
        "@type": "Organization",
        "name": "PqEstudar"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    script.id = 'terms-jsonld';
    document.head.appendChild(script);

    return () => {
      document.title = "pqestudar - Cursos Gratuitos com Certificado";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Plataforma educacional completa com cursos online gratuitos e certificados válidos. Transforme sua carreira com nossa curadoria especializada.');
      }
      const scriptToRemove = document.getElementById('terms-jsonld');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [updatedAt]);

  // Scroll spy for TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            console.log(`[Termos] Seção ativa: ${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExpandAll = () => {
    const allIds = sections.map((s) => s.id);
    setExpandedItems(allIds);
    console.log("[Termos] Todas as seções expandidas");
    toast({ title: "Todas as seções expandidas" });
  };

  const handleCollapseAll = () => {
    setExpandedItems([]);
    console.log("[Termos] Todas as seções recolhidas");
    toast({ title: "Todas as seções recolhidas" });
  };

  const handlePrint = () => {
    console.log("[Termos] Iniciando impressão/PDF");
    window.print();
    toast({ title: "Preparando para impressão..." });
  };

  const handleCopyLink = (sectionId: string) => {
    const url = `${window.location.origin}/termos#${sectionId}`;
    navigator.clipboard.writeText(url);
    console.log(`[Termos] Link copiado: ${url}`);
    toast({ title: "Link copiado!", description: "Link da seção copiado para a área de transferência." });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      console.log(`[Termos] Navegando para: ${sectionId}`);
    }
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
              <FileText className="w-3 h-3 mr-1" />
              Última atualização: {updatedAt}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Termos de Uso
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Leia atentamente os termos e condições que regem o uso da plataforma PqEstudar. 
              Transparência e clareza são fundamentais para nossa relação.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[300px,1fr] gap-8 lg:gap-12">
          {/* TOC Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start hidden lg:block">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Índice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-all hover:bg-accent",
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="space-y-8" ref={contentRef}>
            {/* Search + Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar nos termos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    console.log(`[Termos] Busca: "${e.target.value}"`);
                  }}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExpandAll}
                  className="gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Expandir Tudo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCollapseAll}
                  className="gap-2"
                >
                  <ChevronUp className="w-4 h-4" />
                  Recolher Tudo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir/PDF
                </Button>
              </div>
            </motion.div>

            {/* Critical Callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-primary bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Aviso Importante</h3>
                      <p className="text-sm text-muted-foreground">
                        Ao utilizar nossos serviços, você concorda integralmente com estes termos. 
                        Leia com atenção as seções destacadas que definem suas responsabilidades e direitos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Accordion Sections */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Accordion
                type="multiple"
                value={expandedItems}
                onValueChange={setExpandedItems}
                className="space-y-4"
              >
                {filteredSections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <AccordionItem
                      value={section.id}
                      id={section.id}
                      className={cn(
                        "border-2 rounded-2xl px-6 scroll-mt-24",
                        section.critical && "border-primary/30 bg-primary/5"
                      )}
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-6">
                        <div className="flex items-start justify-between w-full pr-4">
                          <div className="flex items-start gap-3">
                            {section.critical && (
                              <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            )}
                            <span className="font-semibold text-lg">
                              {section.title}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(section.id);
                            }}
                            className="shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Link2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                        {section.content}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Ainda tem dúvidas?
                  </CardTitle>
                  <CardDescription>
                    Nossa equipe está pronta para ajudar você.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="gap-2">
                      <a href="mailto:pqestudar.suporte@gmail.com">
                        <Mail className="w-4 h-4" />
                        Entrar em Contato
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <a href="/privacidade">
                        <Shield className="w-4 h-4" />
                        Política de Privacidade
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <a href="/configuracoes-cookies">
                        <Cookie className="w-4 h-4" />
                        Configurações de Cookies
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default Termos;
