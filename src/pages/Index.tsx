import { HeroSection } from "@/components/sections/hero-section";
import { PainPointsSection } from "@/components/sections/pain-points-section";
import { SystemSection } from "@/components/sections/system-section";
import { ArsenalSection } from "@/components/sections/arsenal-section";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PainPointsSection />
        <SystemSection />
        <ArsenalSection />
      </main>
      <Footer isHomePage />
    </div>
  );
};

export default Index;
