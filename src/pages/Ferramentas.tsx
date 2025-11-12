import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { X, Sparkles, Brain, Shield, GraduationCap, Wrench, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Tipos
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: typeof Brain;
  tags: string[];
}

// Dados mock
const CATEGORIES = [
  "Inteligência Artificial",
  "Produtividade",
  "Segurança e Privacidade",
  "Cursos Gratuitos",
  "Utilidades",
];

const MOCK_TOOLS: Tool[] = [
  {
    id: "1",
    name: "ChatGPT Plus",
    description: "IA conversacional avançada para automação de tarefas e criação de conteúdo.",
    icon: Brain,
    tags: ["Inteligência Artificial", "Produtividade"],
  },
  {
    id: "2",
    name: "Notion AI",
    description: "Workspace integrado com assistente de IA para organização e documentação.",
    icon: Sparkles,
    tags: ["Produtividade", "Inteligência Artificial"],
  },
  {
    id: "3",
    name: "ProtonVPN",
    description: "VPN segura e privada com servidores em todo o mundo.",
    icon: Shield,
    tags: ["Segurança e Privacidade"],
  },
  {
    id: "4",
    name: "Harvard CS50",
    description: "Curso gratuito de ciência da computação da Universidade de Harvard.",
    icon: GraduationCap,
    tags: ["Cursos Gratuitos"],
  },
  {
    id: "5",
    name: "Midjourney",
    description: "Gerador de imagens por IA com qualidade cinematográfica.",
    icon: Brain,
    tags: ["Inteligência Artificial"],
  },
  {
    id: "6",
    name: "Todoist",
    description: "Gerenciador de tarefas minimalista e poderoso.",
    icon: Wrench,
    tags: ["Produtividade"],
  },
  {
    id: "7",
    name: "Bitwarden",
    description: "Gerenciador de senhas open-source e seguro.",
    icon: Shield,
    tags: ["Segurança e Privacidade", "Utilidades"],
  },
  {
    id: "8",
    name: "Google Data Analytics",
    description: "Certificado profissional gratuito em análise de dados.",
    icon: GraduationCap,
    tags: ["Cursos Gratuitos"],
  },
  {
    id: "9",
    name: "Raycast",
    description: "Launcher poderoso com extensões e atalhos para macOS.",
    icon: Zap,
    tags: ["Produtividade", "Utilidades"],
  },
  {
    id: "10",
    name: "Perplexity AI",
    description: "Motor de busca com IA que fornece respostas contextualizadas.",
    icon: Brain,
    tags: ["Inteligência Artificial"],
  },
  {
    id: "11",
    name: "Signal",
    description: "Mensageiro criptografado end-to-end com foco em privacidade.",
    icon: Shield,
    tags: ["Segurança e Privacidade"],
  },
  {
    id: "12",
    name: "freeCodeCamp",
    description: "Plataforma completa de cursos gratuitos de programação e desenvolvimento.",
    icon: GraduationCap,
    tags: ["Cursos Gratuitos"],
  },
];

export default function Ferramentas() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filtragem por "OU" lógico
  const filteredTools =
    selectedTags.length === 0
      ? MOCK_TOOLS
      : MOCK_TOOLS.filter((tool) =>
          tool.tags.some((tag) => selectedTags.includes(tag))
        );

  const availableTags = CATEGORIES.filter((tag) => !selectedTags.includes(tag));

  const handleSelectTag = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleClearAll = () => {
    setSelectedTags([]);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    action: () => void
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      <Helmet>
        <title>O Arsenal de Ferramentas Secretas — PqEstudar</title>
        <meta
          name="description"
          content="A curadoria completa das ferramentas e hacks que viralizaram. Explore por categoria e acelere seus resultados."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6"
              >
                O Arsenal de Ferramentas Secretas.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
              >
                A curadoria completa das ferramentas e hacks que viralizaram.
                Explore por categoria e acelere seus resultados.
              </motion.p>
            </div>
          </section>

          {/* Filtros */}
          <section className="pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Categorias
                </h2>

                {/* Caixa de Seleção */}
                <div
                  className="mb-6 p-4 rounded-lg border-2 border-dashed border-border bg-muted/20 min-h-[80px] flex flex-wrap gap-2 items-start"
                  role="list"
                  aria-label="Categorias selecionadas"
                >
                  {selectedTags.length === 0 ? (
                    <p className="text-muted-foreground text-sm self-center">
                      Selecione uma ou mais categorias…
                    </p>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {selectedTags.map((tag) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          role="listitem"
                        >
                          <Badge
                            variant="secondary"
                            className="px-3 py-2 text-sm font-semibold rounded-2xl cursor-pointer hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-2"
                            tabIndex={0}
                            onClick={() => handleRemoveTag(tag)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, () => handleRemoveTag(tag))
                            }
                            aria-label={`Remover filtro ${tag}`}
                            data-evt="tag_remove"
                          >
                            {tag}
                            <X className="w-3 h-3" aria-hidden="true" />
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Pool de Tags */}
                <div
                  className="flex flex-wrap gap-2 mb-4"
                  role="list"
                  aria-label="Categorias disponíveis"
                >
                  <AnimatePresence mode="popLayout">
                    {availableTags.map((tag) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        role="listitem"
                      >
                        <Badge
                          variant="outline"
                          className="px-3 py-2 text-sm font-semibold rounded-2xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          tabIndex={0}
                          onClick={() => handleSelectTag(tag)}
                          onKeyDown={(e) =>
                            handleKeyDown(e, () => handleSelectTag(tag))
                          }
                          aria-label={`Adicionar filtro ${tag}`}
                          data-evt="tag_select"
                        >
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Botão Limpar Tudo */}
                {selectedTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-muted-foreground hover:text-foreground"
                      data-evt="clear_all"
                    >
                      Limpar tudo
                    </Button>
                  </motion.div>
                )}

                {/* Contador de Resultados */}
                <p
                  className="text-sm text-muted-foreground mt-4"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {filteredTools.length === MOCK_TOOLS.length
                    ? `Mostrando todas as ${MOCK_TOOLS.length} ferramentas`
                    : `Mostrando ${filteredTools.length} de ${MOCK_TOOLS.length} ferramentas`}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Grid de Ferramentas */}
          <section className="pb-24 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              {filteredTools.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16"
                >
                  <p className="text-lg text-muted-foreground mb-4">
                    Nenhuma ferramenta encontrada com os filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    data-evt="clear_all"
                  >
                    Limpar filtros
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <motion.div
                          key={tool.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                              <div className="flex items-start gap-4 mb-2">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                  <Icon className="w-6 h-6" aria-hidden="true" />
                                </div>
                                <CardTitle className="text-xl">
                                  {tool.name}
                                </CardTitle>
                              </div>
                              <CardDescription className="text-sm leading-relaxed">
                                {tool.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {tool.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
