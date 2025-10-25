import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";  
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { AuthProvider } from "@/hooks/useAuth";
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
import NotFound from "./pages/NotFound";
import KitAceleracao from "./pages/KitAceleracao";
import Parceiros from "./pages/Parceiros";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieBanner />
        <BrowserRouter>
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
          <Route path="/kit" element={<KitAceleracao />} />
          <Route path="/parceiros" element={<Parceiros />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
