import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Bookmark, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useSavedTools } from "@/hooks/useSavedTools";
import { Sparkles, Brain, Shield, GraduationCap, Wrench, Zap } from "lucide-react";

// Ícones padrão para categorias
const CATEGORY_ICONS: Record<string, any> = {
  "Inteligência Artificial": Brain,
  "Produtividade": Zap,
  "Segurança e Privacidade": Shield,
  "Cursos Gratuitos": GraduationCap,
  "Utilidades": Wrench,
};

export default function FerramentasSalvos() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { savedTools, loading, fetchSavedTools, toggleSave, isToggling, isSaved } = useSavedTools();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Fetch saved tools when component mounts
  useEffect(() => {
    if (user) {
      fetchSavedTools();
    }
  }, [user, fetchSavedTools]);

  const handleRemove = async (toolId: string) => {
    await toggleSave(toolId);
    // Refresh the list
    fetchSavedTools();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // User not authenticated - will redirect
  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Ferramentas Salvas — PqEstudar</title>
        <meta
          name="description"
          content="Suas ferramentas favoritas salvas para acesso rápido."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/ferramentas")}
                  aria-label="Voltar para Ferramentas"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Bookmark className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Ferramentas Salvas
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Suas ferramentas favoritas em um só lugar.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Tools Grid */}
          <section className="pb-24 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              {loading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="h-full">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-2">
                          <Skeleton className="w-16 h-16 rounded-full" />
                          <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-3">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-9 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : savedTools.length === 0 ? (
                // Empty state
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-16"
                >
                  <Bookmark className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Você ainda não salvou nenhuma ferramenta.
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Explore nosso arsenal e salve suas favoritas para acesso rápido.
                  </p>
                  <Button onClick={() => navigate("/ferramentas")}>
                    Ver ferramentas
                  </Button>
                </motion.div>
              ) : (
                // Tools grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {savedTools.map((tool, index) => {
                    const Icon = tool.tags[0] ? CATEGORY_ICONS[tool.tags[0]] || Sparkles : Sparkles;
                    const isRemoving = isToggling(tool.id);

                    return (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="h-full"
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
                          <CardHeader>
                            <div className="grid grid-cols-[auto,1fr] gap-4 items-center mb-2">
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border shadow-sm shrink-0">
                                {tool.icon_url ? (
                                  <img
                                    src={tool.icon_url}
                                    alt={`Logo de ${tool.name}`}
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <Icon 
                                  className="w-8 h-8 text-primary" 
                                  aria-hidden="true"
                                  style={{ display: tool.icon_url ? 'none' : 'block' }}
                                />
                              </div>
                              <CardTitle className="text-xl leading-tight mt-0">
                                {tool.name}
                              </CardTitle>
                            </div>
                            <CardDescription className="text-sm leading-relaxed flex-1">
                              {tool.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="mt-auto">
                            <div className="space-y-3">
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
                              <div className="flex gap-2">
                                {(() => {
                                  const attachmentUrl = (tool as any).attachment_url;
                                  const hasAttachment = attachmentUrl && attachmentUrl.trim();
                                  const linkUrl = hasAttachment ? attachmentUrl : tool.url;
                                  const buttonText = hasAttachment ? "Fazer download" : "Acessar";

                                  return linkUrl ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => window.open(linkUrl, '_blank', 'noopener,noreferrer')}
                                      aria-label={`${buttonText} ${tool.name}`}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      {buttonText}
                                    </Button>
                                  ) : null;
                                })()}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemove(tool.id)}
                                  disabled={isRemoving}
                                  aria-label="Remover dos salvos"
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Bookmark className="h-4 w-4 fill-current" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
