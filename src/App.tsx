import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";  
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { AuthProvider } from "@/hooks/useAuth";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import ExploreCourses from "./pages/ExploreCourses";
import CourseDetail from "./pages/CourseDetail";
import Noticias from "./pages/Noticias";
import NoticiaDetalhes from "./pages/NoticiaDetalhes";

import Suporte from "./pages/Suporte";
import MeuPerfil from "./pages/MeuPerfil";
import MeusMateriais from "./pages/MeusMateriais";
import RankingComunidade from "./pages/RankingComunidade";
import Sobre from "./pages/Sobre";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import FAQ from "./pages/FAQ";

import ConfiguracoesCookies from "./pages/ConfiguracoesCookies";

import Login from "./pages/Login";
import { ResetPassword } from "./pages/ResetPassword";
import AdminCourses from "./pages/AdminCourses";
import AdminBonusPages from "./pages/AdminBonusPages";
import BonusPage from "./pages/BonusPage";
import NotFound from "./pages/NotFound";
import KitAceleracao from "./pages/KitAceleracao";
import Parceiros from "./pages/Parceiros";
import Assine from "./pages/Assine";
import Ferramentas from "./pages/Ferramentas";
import FerramentasSalvos from "./pages/FerramentasSalvos";
import Links from "./pages/Links";
import MapaDosBeneficios from "./pages/MapaDosBeneficios";
import Concursos from "./pages/Concursos";
import ConcursoDetalhe from "./pages/ConcursoDetalhe";
import CuradoriaPublic from "./pages/CuradoriaPublic";
import AdminCuradoriasLista from "./pages/AdminCuradoriasLista";
import AdminCuradoriasForm from "./pages/AdminCuradoriasForm";

// Premium imports
import { RequireActiveSubscription } from "@/components/premium/RequireActiveSubscription";
import { RequirePremiumAdmin } from "@/components/premium/RequirePremiumAdmin";
import PremiumHome from "./pages/premium/PremiumHome";
import PremiumUpgrade from "./pages/premium/PremiumUpgrade";
import PremiumRedeem from "./pages/premium/PremiumRedeem";
import PremiumCourses from "./pages/premium/PremiumCourses";
import PremiumJobs from "./pages/premium/PremiumJobs";
import PremiumUpdates from "./pages/premium/PremiumUpdates";
import PremiumUpdateDetail from "./pages/premium/PremiumUpdateDetail";
import PremiumSaved from "./pages/premium/PremiumSaved";
import PremiumCurationPage from "./pages/premium/PremiumCurationPage";

// Admin Premium imports
import AdminPremiumDashboard from "./pages/admin/premium/AdminPremiumDashboard";
import AdminPremiumItems from "./pages/admin/premium/AdminPremiumItems";
import AdminPremiumItemForm from "./pages/admin/premium/AdminPremiumItemForm";
import AdminPremiumTokens from "./pages/admin/premium/AdminPremiumTokens";
import AdminPremiumUsers from "./pages/admin/premium/AdminPremiumUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

// Inner component that uses hooks requiring Router context
const AppWithPixel = () => {
  // Initialize Meta Pixel with SPA support
  useMetaPixel();
  
  return (
    <Routes>
      {/* Standalone pages (no shared Navbar/Footer) */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/links" element={<Links />} />
      <Route path="/assine" element={<Assine />} />
      <Route path="/mapa-dos-beneficios" element={<MapaDosBeneficios />} />

      {/* All pages with persistent Navbar + Footer layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/explorar-cursos" element={<ExploreCourses />} />
        <Route path="/curso/:id" element={<CourseDetail />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticia/:id" element={<NoticiaDetalhes />} />
        
        <Route path="/meus-materiais" element={<MeusMateriais />} />
        <Route path="/meu-perfil" element={<MeuPerfil />} />
        <Route path="/ranking-comunidade" element={<RankingComunidade />} />
        <Route path="/suporte" element={<Suporte />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/faq" element={<FAQ />} />
        
        <Route path="/configuracoes-cookies" element={<ConfiguracoesCookies />} />
        
        <Route path="/admin/cursos" element={<AdminCourses />} />
        <Route path="/admin/bonus" element={<AdminBonusPages />} />
        <Route path="/kit" element={<KitAceleracao />} />
        <Route path="/parceiros" element={<Parceiros />} />
        <Route path="/ferramentas" element={<Ferramentas />} />
        <Route path="/ferramentas/salvos" element={<FerramentasSalvos />} />
        <Route path="/concursos" element={<Concursos />} />
        <Route path="/concursos/:slug" element={<ConcursoDetalhe />} />
        
        {/* Curadoria Dinâmica */}
        <Route path="/curadoria/:slug" element={<CuradoriaPublic />} />
        <Route path="/admin/curadorias" element={<AdminCuradoriasLista />} />
        <Route path="/admin/curadorias/new" element={<AdminCuradoriasForm />} />
        <Route path="/admin/curadorias/:id" element={<AdminCuradoriasForm />} />
        
        {/* Premium Routes - Public */}
        <Route path="/premium/upgrade" element={<PremiumUpgrade />} />
        <Route path="/premium/resgatar" element={<PremiumRedeem />} />
        
        {/* Premium Routes - Protected by subscription */}
        <Route path="/premium" element={<RequireActiveSubscription><PremiumHome /></RequireActiveSubscription>} />
        <Route path="/premium/cursos" element={<RequireActiveSubscription><PremiumCourses /></RequireActiveSubscription>} />
        <Route path="/premium/vagas" element={<RequireActiveSubscription><PremiumJobs /></RequireActiveSubscription>} />
        <Route path="/premium/atualizacoes" element={<RequireActiveSubscription><PremiumUpdates /></RequireActiveSubscription>} />
        <Route path="/premium/atualizacoes/:slug" element={<RequireActiveSubscription><PremiumUpdateDetail /></RequireActiveSubscription>} />
        <Route path="/premium/salvos" element={<RequireActiveSubscription><PremiumSaved /></RequireActiveSubscription>} />
        <Route path="/premium/p/:slug" element={<RequireActiveSubscription><PremiumCurationPage /></RequireActiveSubscription>} />
        
        {/* Admin Premium Routes */}
        <Route path="/admin/premium" element={<RequirePremiumAdmin><AdminPremiumDashboard /></RequirePremiumAdmin>} />
        <Route path="/admin/premium/itens" element={<RequirePremiumAdmin><AdminPremiumItems /></RequirePremiumAdmin>} />
        <Route path="/admin/premium/itens/:id" element={<RequirePremiumAdmin><AdminPremiumItemForm /></RequirePremiumAdmin>} />
        <Route path="/admin/premium/tokens" element={<RequirePremiumAdmin><AdminPremiumTokens /></RequirePremiumAdmin>} />
        <Route path="/admin/premium/usuarios" element={<RequirePremiumAdmin><AdminPremiumUsers /></RequirePremiumAdmin>} />
        
        {/* Bonus Pages - Exact Routes (noindex) */}
        <Route path="/acesso-kit-partida-8h3z" element={<BonusPage />} />
        <Route path="/curadoria-conteudo-ia-k4f9" element={<BonusPage />} />
        <Route path="/acervo-video-prod-b7g1" element={<BonusPage />} />
        <Route path="/metodos-automacao-w2p5" element={<BonusPage />} />
        <Route path="/recursos-alta-performance-z9x0" element={<BonusPage />} />
        
        {/* Bonus Pages - Dynamic route for future pages */}
        <Route path="/bonus/:slug" element={<BonusPage />} />
      </Route>
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  // Initialize Google Analytics with Consent Mode v2
  useGoogleAnalytics();

  return (
    <>
      <CookieBanner />
      <BrowserRouter>
        <AppWithPixel />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
