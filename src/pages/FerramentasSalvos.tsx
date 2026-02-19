import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { SavedAccordion } from "@/components/saved/SavedAccordion";
import { SavedToolsPanel } from "@/components/saved/SavedToolsPanel";
import { SavedContestsPanel } from "@/components/saved/SavedContestsPanel";
import { usePageSettings } from "@/hooks/usePageSettings";
export default function FerramentasSalvos() {
  const ps = usePageSettings("/ferramentas/salvos");
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
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </main>
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
        <title>{ps.titleTag}</title>
        <meta
          name="description"
          content={ps.metaDescription}
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
            <div className="container mx-auto px-6 py-16 md:py-20 relative">
              <motion.div
                className="max-w-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  {ps.headerTitle}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {ps.headerDescription}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Accordion Sections */}
          <section className="pt-12 md:pt-16 pb-24 px-4 sm:px-6 lg:px-8">
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

        
      </div>
    </>
  );
}
