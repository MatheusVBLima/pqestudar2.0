import { HeroSection } from "@/components/sections/hero-section";
import { ManifestoSection } from "@/components/sections/manifesto-section";
import { EcosystemSection } from "@/components/sections/ecosystem-section";
import { PremiumCTASection } from "@/components/sections/premium-cta-section";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

import { sanitizeHtml, escapeHtml, safeHighlight, cn } from "@/lib/utils";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ManifestoSection />
        <EcosystemSection />
        <PremiumCTASection />
      </main>
      <Footer isHomePage />
    </div>
  );
};

export default Index;
