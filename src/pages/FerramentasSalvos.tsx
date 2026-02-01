import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Bookmark, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { SavedAccordion } from "@/components/saved/SavedAccordion";
import { SavedToolsPanel } from "@/components/saved/SavedToolsPanel";
import { SavedContestsPanel } from "@/components/saved/SavedContestsPanel";

export default function FerramentasSalvos() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { savedItems, loading, fetchSavedItems, getSavedByType } = useSavedItems();
  
  // Lazy load triggers
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [contestsExpanded, setContestsExpanded] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Fetch saved items when component mounts
  useEffect(() => {
    if (user) {
      fetchSavedItems();
    }
  }, [user, fetchSavedItems]);

  const savedTools = getSavedByType('tool');
  const savedContests = getSavedByType('contest');

  const handleToolsExpand = useCallback(() => {
    setToolsExpanded(true);
  }, []);

  const handleContestsExpand = useCallback(() => {
    setContestsExpanded(true);
  }, []);

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
        <title>Salvos — PqEstudar</title>
        <meta
          name="description"
          content="Seus itens salvos em um só lugar: ferramentas e concursos favoritos."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Bookmark className="h-7 w-7 text-primary" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Salvos
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Seus itens salvos em um só lugar.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Accordion Sections */}
          <section className="pb-24 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-5xl mx-auto">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-5 w-5 rounded" />
                          <Skeleton className="h-5 w-40" />
                        </div>
                        <Skeleton className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <SavedAccordion
                  toolsCount={savedTools.length}
                  contestsCount={savedContests.length}
                  toolsContent={
                    <SavedToolsPanel
                      savedItems={savedTools}
                      onRefresh={fetchSavedItems}
                      shouldLoad={toolsExpanded}
                    />
                  }
                  contestsContent={
                    <SavedContestsPanel
                      savedItems={savedContests}
                      onRefresh={fetchSavedItems}
                      shouldLoad={contestsExpanded}
                    />
                  }
                  toolsLoading={false}
                  contestsLoading={false}
                  onToolsExpand={handleToolsExpand}
                  onContestsExpand={handleContestsExpand}
                />
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
