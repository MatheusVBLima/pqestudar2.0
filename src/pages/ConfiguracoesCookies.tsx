import { CookieSettings } from "@/components/ui/cookie-settings";

const ConfiguracoesCookies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <CookieSettings />
      </main>
    </div>
  );
};

export default ConfiguracoesCookies;
