import { HeroSection } from "@/components/sections/hero-section";
import { CurationSection } from "@/components/sections/curation-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CourseSuggestionSection } from "@/components/sections/course-suggestion-section";
import { FeaturesPreview } from "@/components/sections/features-preview";
import { PartnersSection } from "@/components/sections/partners-section";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CurationSection />
        <TestimonialsSection />
        <CourseSuggestionSection />
        <FeaturesPreview />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
