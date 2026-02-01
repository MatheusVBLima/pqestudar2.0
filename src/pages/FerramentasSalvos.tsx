import { useEffect } from "react";
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
import { SavedToolsSection } from "@/components/saved/SavedToolsSection";
import { SavedContestsSection } from "@/components/saved/SavedContestsSection";

export default function FerramentasSalvos() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { savedItems, loading, fetchSavedItems, getSavedByType } = useSavedItems();

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
          <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
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
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Bookmark className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    Salvos
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Seus itens salvos em um só lugar.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Sections */}
          <section className="pb-24 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto space-y-16">
              {loading ? (
                <div className="space-y-16">
                  {/* Tools skeleton */}
                  <div>
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={`tool-${i}`} className="h-64 rounded-lg" />
                      ))}
                    </div>
                  </div>
                  {/* Contests skeleton */}
                  <div>
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={`contest-${i}`} className="h-48 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Ferramentas Salvas Section */}
                  <SavedToolsSection 
                    savedItems={savedTools} 
                    onRefresh={fetchSavedItems}
                  />

                  {/* Concursos Salvos Section */}
                  <SavedContestsSection 
                    savedItems={savedContests} 
                    onRefresh={fetchSavedItems}
                  />
                </>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
