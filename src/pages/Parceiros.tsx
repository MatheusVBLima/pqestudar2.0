import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PartnersSection } from "@/components/sections/partners-section";

const Parceiros = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1">
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Parceiros;
