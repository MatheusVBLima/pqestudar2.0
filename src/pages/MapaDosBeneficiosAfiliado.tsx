import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MapaDosBeneficios from "./MapaDosBeneficios";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
