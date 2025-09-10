import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieSettings } from "@/components/ui/cookie-settings";

const ConfiguracoesCookies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <CookieSettings />
      </main>
      <Footer />
    </div>
  );
};

export default ConfiguracoesCookies;