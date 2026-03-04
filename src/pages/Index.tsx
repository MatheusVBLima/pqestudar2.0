import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/sections/hero-section";
import { DualTrackSection } from "@/components/sections/dual-track-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { GlobalSeo } from "@/components/seo/GlobalSeo";

const Index = () => {
  return (
    <>
      <GlobalSeo
        jsonLd={{
          pageType: "website",
          siteName: "PqEstudar",
        }}
      />
      <Helmet>
        <title>PqEstudar: Os Segredos da Internet, Revelados.</title>
        <meta 
          name="description" 
          content="O arsenal completo com os hacks, ferramentas secretas e benefícios que viralizaram. Explore nossa curadoria ou assine para receber as novidades." 
        />
      </Helmet>

      <main className="flex-1">
        <HeroSection />
        <DualTrackSection />
        <SocialProofSection />
      </main>
    </>
  );
};

export default Index;
