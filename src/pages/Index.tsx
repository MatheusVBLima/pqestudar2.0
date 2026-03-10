import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/sections/hero-section";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { usePageSettings } from "@/hooks/usePageSettings";

// Lazy-load below-fold sections to prioritize hero LCP
const DualTrackSection = lazy(() => import("@/components/sections/dual-track-section").then(m => ({ default: m.DualTrackSection })));
const HomeProductsSection = lazy(() => import("@/components/sections/home-products-section").then(m => ({ default: m.HomeProductsSection })));
const HomeFaqSection = lazy(() => import("@/components/sections/home-faq-section").then(m => ({ default: m.HomeFaqSection })));
const SocialProofSection = lazy(() => import("@/components/sections/social-proof-section").then(m => ({ default: m.SocialProofSection })));
const FinalCtaSection = lazy(() => import("@/components/sections/final-cta-section").then(m => ({ default: m.FinalCtaSection })));

const Index = () => {
  const { titleTag, metaDescription, headerTitle, headerDescription, isReady, isLoading } = usePageSettings("/");

  return (
    <>
      <GlobalSeo
        jsonLd={{
          pageType: "website",
          siteName: "PqEstudar",
        }}
      />
      {isReady && (
        <Helmet>
          <title>{titleTag}</title>
          <meta name="description" content={metaDescription} />
        </Helmet>
      )}

      <main className="flex-1">
        <HeroSection
          headerTitle={headerTitle}
          headerDescription={headerDescription}
          isLoading={isLoading}
        />
        <Suspense fallback={<div className="min-h-[200px]" />}>
          <DualTrackSection />
          <HomeProductsSection />
          <HomeFaqSection />
          <SocialProofSection />
          <FinalCtaSection />
        </Suspense>
      </main>
    </>
  );
};

export default Index;
