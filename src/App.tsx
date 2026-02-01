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
import Index from "./pages/Index";
import ExploreCourses from "./pages/ExploreCourses";
import CourseDetail from "./pages/CourseDetail";
import Noticias from "./pages/Noticias";
import NoticiaDetalhes from "./pages/NoticiaDetalhes";
import FavoritosNovo from "./pages/FavoritosNovo";
import Suporte from "./pages/Suporte";
import MeuPerfil from "./pages/MeuPerfil";
import MeusMateriais from "./pages/MeusMateriais";
import RankingComunidade from "./pages/RankingComunidade";
import Sobre from "./pages/Sobre";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import FAQ from "./pages/FAQ";
import Contato from "./pages/Contato";
import ConfiguracoesCookies from "./pages/ConfiguracoesCookies";
import Notificacoes from "./pages/Notificacoes";
import ProgramasBeneficios from "./pages/ProgramasBeneficios";
import OportunidadesAfiliados from "./pages/OportunidadesAfiliados";
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

const queryClient = new QueryClient();

// Inner component that uses hooks requiring Router context
const AppWithPixel = () => {
  // Initialize Meta Pixel with SPA support
  useMetaPixel();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/explorar-cursos" element={<ExploreCourses />} />
      <Route path="/curso/:id" element={<CourseDetail />} />
      <Route path="/noticias" element={<Noticias />} />
      <Route path="/noticia/:id" element={<NoticiaDetalhes />} />
      <Route path="/favoritos" element={<FavoritosNovo />} />
      <Route path="/meus-materiais" element={<MeusMateriais />} />
      <Route path="/meu-perfil" element={<MeuPerfil />} />
      <Route path="/ranking-comunidade" element={<RankingComunidade />} />
      <Route path="/suporte" element={<Suporte />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/configuracoes-cookies" element={<ConfiguracoesCookies />} />
      <Route path="/notificacoes" element={<Notificacoes />} />
      <Route path="/programas-beneficios" element={<ProgramasBeneficios />} />
      <Route path="/oportunidades-afiliados" element={<OportunidadesAfiliados />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/cursos" element={<AdminCourses />} />
      <Route path="/admin/bonus" element={<AdminBonusPages />} />
      <Route path="/kit" element={<KitAceleracao />} />
      <Route path="/parceiros" element={<Parceiros />} />
      <Route path="/assine" element={<Assine />} />
      <Route path="/ferramentas" element={<Ferramentas />} />
      <Route path="/ferramentas/salvos" element={<FerramentasSalvos />} />
      <Route path="/links" element={<Links />} />
      <Route path="/mapa-dos-beneficios" element={<MapaDosBeneficios />} />
      <Route path="/concursos" element={<Concursos />} />
      <Route path="/concursos/:slug" element={<ConcursoDetalhe />} />
      {/* Bonus Pages - Exact Routes (noindex) */}
      <Route path="/acesso-kit-partida-8h3z" element={<BonusPage />} />
      <Route path="/curadoria-conteudo-ia-k4f9" element={<BonusPage />} />
      <Route path="/acervo-video-prod-b7g1" element={<BonusPage />} />
      <Route path="/metodos-automacao-w2p5" element={<BonusPage />} />
      <Route path="/recursos-alta-performance-z9x0" element={<BonusPage />} />
      
      {/* Bonus Pages - Dynamic route for future pages */}
      <Route path="/bonus/:slug" element={<BonusPage />} />
      
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
