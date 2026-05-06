import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MapaDosBeneficios from "./MapaDosBeneficios";
import { Skeleton } from "@/components/ui/skeleton";

interface AffiliatePage {
  affiliate_name: string;
  slug: string;
  basic_url: string;
  premium_url: string;
  is_active: boolean;
}

const MapaDosBeneficiosAfiliado = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliatePage | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("affiliate_pages")
        .select("affiliate_name, slug, basic_url, premium_url, is_active")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (!cancelled) {
        setAffiliate(data as AffiliatePage | null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-10 space-y-8">
          <section className="space-y-4">
            <Skeleton className="h-12 w-3/4 max-w-[780px]" />
            <Skeleton className="h-6 w-2/3 max-w-[620px]" />
          </section>
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-xl" />
            ))}
          </section>
        </main>
      </div>
    );
  }

  // Slug inválido ou afiliado inativo → redireciona para landing principal
  if (!affiliate) {
    return <Navigate to="/mapa-dos-beneficios" replace />;
  }

  return (
    <MapaDosBeneficios
      checkoutBasico={affiliate.basic_url}
      checkoutPremium={affiliate.premium_url}
      affiliateSlug={affiliate.slug}
    />
  );
};

export default MapaDosBeneficiosAfiliado;
