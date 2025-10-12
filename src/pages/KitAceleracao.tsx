import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { KitHeroSection } from "@/components/sections/kit-hero-section";
import { PainPointsSection } from "@/components/sections/pain-points-section";
import { SystemSection } from "@/components/sections/system-section";
import { ArsenalSection } from "@/components/sections/arsenal-section";

const KitAceleracao = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <KitHeroSection />
        <PainPointsSection />
        <SystemSection />
        <ArsenalSection />
      </main>
      <Footer />
    </div>
  );
};

export default KitAceleracao;
