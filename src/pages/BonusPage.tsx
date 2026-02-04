import { useEffect, useState } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/integrations/supabase/client";
import { BonusPage as BonusPageType } from "@/hooks/useBonusPages";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Helmet } from "react-helmet";
import { BonusToolCard } from "@/components/ui/bonus-tool-card";
const BonusPage = () => {
  const {
    slug: paramSlug
  } = useParams<{
    slug: string;
  }>();
  const location = useLocation();
  const [page, setPage] = useState<BonusPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const {
    isAdmin
  } = useUserRoles();
  useEffect(() => {
    const fetchPage = async () => {
      // Use location.pathname for exact routes, or construct from param for dynamic routes
      const slugToFetch = paramSlug ? `/${paramSlug}` : location.pathname;
      if (!slugToFetch) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const {
          data,
          error
        } = await supabase.from('newsletter_bonus_pages').select('*').eq('slug', slugToFetch).maybeSingle();
        if (error) throw error;
        if (!data) {
          setNotFound(true);
        } else if (data.status === 'hidden' && !isAdmin) {
          setNotFound(true);
        } else {
          setPage(data as unknown as BonusPageType);
        }
      } catch (error) {
        console.error('Error fetching bonus page:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [paramSlug, location.pathname, isAdmin]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>;
  }
  if (notFound || !page) {
    return <Navigate to="/404" replace />;
  }
  return <>
      <Helmet>
        <title>{page.title} – PqEstudar</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content={page.intro} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent py-[10px]">
                {page.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {page.intro}
              </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {page.cards.map((tool, index) => (
                <BonusToolCard
                  key={index}
                  id={`bonus-${page.slug}-${index}`}
                  logoUrl={tool.logoUrl}
                  logoAlt={tool.logoAlt}
                  title={tool.toolTitle}
                  description={tool.toolDescription}
                  tags={tool.tags || []}
                  url={tool.toolLink}
                />
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>;
};
export default BonusPage;