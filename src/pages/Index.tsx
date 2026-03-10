import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/sections/hero-section";
import { DualTrackSection } from "@/components/sections/dual-track-section";
import { HomeProductsSection } from "@/components/sections/home-products-section";
import { HomeFaqSection } from "@/components/sections/home-faq-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { usePageSettings } from "@/hooks/usePageSettings";

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
        <DualTrackSection />
        <HomeProductsSection />
        <HomeFaqSection />
        <SocialProofSection />
      </main>
    </>
  );
};

export default Index;
