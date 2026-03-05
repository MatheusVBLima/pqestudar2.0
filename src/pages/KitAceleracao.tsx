import { Helmet } from "react-helmet-async";
import { KitHeroSection } from "@/components/sections/kit-hero-section";
import { PainPointsSection } from "@/components/sections/pain-points-section";
import { SystemSection } from "@/components/sections/system-section";
import { ArsenalSection } from "@/components/sections/arsenal-section";

const KitAceleracao = () => {
  return (
    <main className="flex-1">
      <KitHeroSection />
      <PainPointsSection />
      <SystemSection />
      <ArsenalSection />
    </main>
  );
};

export default KitAceleracao;
