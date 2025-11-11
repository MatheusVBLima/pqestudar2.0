import { Helmet } from "react-helmet";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const Index = () => {
  const siteUrl = window.location.origin;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PqEstudar",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SubscribeAction",
      "target": `${siteUrl}/assine`,
      "name": "Assinar novidades"
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Helmet>
        <title>PqEstudar: Os Segredos da Internet, Revelados.</title>
        <meta 
          name="description" 
          content="O arsenal completo com os hacks, ferramentas secretas e benefícios que viralizaram. Explore nossa curadoria ou assine para receber as novidades." 
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SocialProofSection />
      </main>
      <Footer isHomePage />
    </div>
  );
};

export default Index;
