import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";  
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { AuthProvider } from "@/hooks/useAuth";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import Index from "./pages/Index";

import { usePageViewTracker } from "@/hooks/usePageViewTracker";
import { ScrollToTop } from "@/components/ScrollToTop";

// Lazy-loaded routes — keeps initial bundle small for Home performance
const ExploreCourses = React.lazy(() => import("./pages/ExploreCourses"));
const CourseDetail = React.lazy(() => import("./pages/CourseDetail"));
const Noticias = React.lazy(() => import("./pages/Noticias"));
const NoticiaDetalhes = React.lazy(() => import("./pages/NoticiaDetalhes"));
const MeuPerfil = React.lazy(() => import("./pages/MeuPerfil"));
const MeusMateriais = React.lazy(() => import("./pages/MeusMateriais"));
const RankingComunidade = React.lazy(() => import("./pages/RankingComunidade"));
const SobrePqEstudar = React.lazy(() => import("./pages/SobrePqEstudar"));
const Termos = React.lazy(() => import("./pages/Termos"));
const Privacidade = React.lazy(() => import("./pages/Privacidade"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const ConfiguracoesCookies = React.lazy(() => import("./pages/ConfiguracoesCookies"));
const Login = React.lazy(() => import("./pages/Login"));
const AdminCourses = React.lazy(() => import("./pages/AdminCourses"));
const AdminBonusPages = React.lazy(() => import("./pages/AdminBonusPages"));
const BonusPage = React.lazy(() => import("./pages/BonusPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const EmBreve = React.lazy(() => import("./pages/EmBreve"));
const KitAceleracao = React.lazy(() => import("./pages/KitAceleracao"));
const Assine = React.lazy(() => import("./pages/Assine"));
const Ferramentas = React.lazy(() => import("./pages/Ferramentas"));
const FerramentasSalvos = React.lazy(() => import("./pages/FerramentasSalvos"));
const MapaDosBeneficios = React.lazy(() => import("./pages/MapaDosBeneficios"));
const Concursos = React.lazy(() => import("./pages/Concursos"));
const ConcursoDetalhe = React.lazy(() => import("./pages/ConcursoDetalhe"));
const Votacoes = React.lazy(() => import("./pages/Votacoes"));
const Produtos = React.lazy(() => import("./pages/Produtos"));
const CuradoriaPublic = React.lazy(() => import("./pages/CuradoriaPublic"));
const Guias = React.lazy(() => import("./pages/Guias"));
const GuiaDetalhe = React.lazy(() => import("./pages/GuiaDetalhe"));
const AdminCuradoriasLista = React.lazy(() => import("./pages/AdminCuradoriasLista"));
const AdminCuradoriasForm = React.lazy(() => import("./pages/AdminCuradoriasForm"));

// Premium imports
const RequireActiveSubscription = React.lazy(() => import("@/components/premium/RequireActiveSubscription").then(m => ({ default: m.RequireActiveSubscription })));
const PremiumHome = React.lazy(() => import("./pages/premium/PremiumHome"));
const PremiumUpgrade = React.lazy(() => import("./pages/premium/PremiumUpgrade"));
const PremiumRedeem = React.lazy(() => import("./pages/premium/PremiumRedeem"));
const PremiumCourses = React.lazy(() => import("./pages/premium/PremiumCourses"));
const PremiumJobs = React.lazy(() => import("./pages/premium/PremiumJobs"));
const PremiumUpdates = React.lazy(() => import("./pages/premium/PremiumUpdates"));
const PremiumUpdateDetail = React.lazy(() => import("./pages/premium/PremiumUpdateDetail"));
const PremiumSaved = React.lazy(() => import("./pages/premium/PremiumSaved"));
const PremiumCurationPage = React.lazy(() => import("./pages/premium/PremiumCurationPage"));

// Admin Dashboard imports
const AdminLayout = React.lazy(() => import("@/components/admin/dashboard/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminOverview = React.lazy(() => import("./pages/admin/dashboard/AdminOverview"));
const InsightsFerramentas = React.lazy(() => import("./pages/admin/dashboard/InsightsFerramentas"));
const InsightsConcursosLeitura = React.lazy(() => import("./pages/admin/dashboard/InsightsConcursosLeitura"));
const InsightsConcursosEventos = React.lazy(() => import("./pages/admin/dashboard/InsightsConcursosEventos"));
const InsightsSeoAudit = React.lazy(() => import("./pages/admin/dashboard/InsightsSeoAudit"));
const InsightsCopyAudit = React.lazy(() => import("./pages/admin/dashboard/InsightsCopyAudit"));
const AdminPages = React.lazy(() => import("./pages/admin/AdminPages"));
const AdminMenu = React.lazy(() => import("./pages/admin/AdminMenu"));
const AdminLegal = React.lazy(() => import("./pages/admin/AdminLegal"));

// Admin Concursos imports
const AdminConcursosIndex = React.lazy(() => import("./pages/admin/concursos/index"));
const AdminConcursosColeta = React.lazy(() => import("./pages/admin/concursos/coleta"));
const AdminConcursosCuradoria = React.lazy(() => import("./pages/admin/concursos/curadoria"));
const AdminConcursosBusca = React.lazy(() => import("./pages/admin/concursos/busca"));
const AdminConcursosAntiRepeticao = React.lazy(() => import("./pages/admin/concursos/anti-repeticao"));
const AdminConcursosOrquestracaoIA = React.lazy(() => import("./pages/admin/concursos/orquestracao-ia"));
const AdminConcursosHistorico = React.lazy(() => import("./pages/admin/concursos/historico"));
const AdminGuideFlow = React.lazy(() => import("./pages/admin/GuideFlow"));

// Admin Premium imports
const AdminPremiumDashboard = React.lazy(() => import("./pages/admin/premium/AdminPremiumDashboard"));
const AdminPremiumItems = React.lazy(() => import("./pages/admin/premium/AdminPremiumItems"));
const AdminPremiumItemForm = React.lazy(() => import("./pages/admin/premium/AdminPremiumItemForm"));
const AdminPremiumTokens = React.lazy(() => import("./pages/admin/premium/AdminPremiumTokens"));
const AdminPremiumUsers = React.lazy(() => import("./pages/admin/premium/AdminPremiumUsers"));

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

// Minimal suspense fallback — avoids layout shift
const SuspenseFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[200px]">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Inner component that uses hooks requiring Router context
const AppWithPixel = () => {
  // Initialize Meta Pixel with SPA support
  useMetaPixel();
  usePageViewTracker();
  
  return (
    <React.Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Standalone pages (no shared Navbar/Footer) */}
        <Route path="/login" element={<><GlobalSeo /><Login /></>} />
        <Route path="/assine" element={<><GlobalSeo /><Assine /></>} />
        <Route path="/mapa-dos-beneficios" element={<><GlobalSeo /><MapaDosBeneficios /></>} />

        {/* Admin Dashboard (standalone layout with sidebar) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="insights/ferramentas" element={<InsightsFerramentas />} />
          <Route path="insights/concursos-leitura" element={<InsightsConcursosLeitura />} />
          <Route path="insights/concursos-eventos" element={<InsightsConcursosEventos />} />
          <Route path="insights/seo-audit" element={<InsightsSeoAudit />} />
          <Route path="insights/copy-audit" element={<InsightsCopyAudit />} />
          <Route path="curadorias" element={<AdminCuradoriasLista />} />
          <Route path="curadorias/new" element={<AdminCuradoriasForm />} />
          <Route path="curadorias/:id" element={<AdminCuradoriasForm />} />
          <Route path="premium" element={<AdminPremiumDashboard />} />
          <Route path="premium/itens" element={<AdminPremiumItems />} />
          <Route path="premium/itens/:id" element={<AdminPremiumItemForm />} />
          <Route path="premium/tokens" element={<AdminPremiumTokens />} />
          <Route path="premium/usuarios" element={<AdminPremiumUsers />} />
          <Route path="cursos" element={<AdminCourses />} />
          <Route path="bonus" element={<AdminBonusPages />} />
          {/* Admin Concursos */}
          <Route path="concursos" element={<AdminConcursosIndex />} />
          <Route path="concursos/coleta" element={<AdminConcursosColeta />} />
          <Route path="concursos/curadoria" element={<AdminConcursosCuradoria />} />
          <Route path="concursos/busca" element={<AdminConcursosBusca />} />
          <Route path="concursos/anti-repeticao" element={<AdminConcursosAntiRepeticao />} />
          <Route path="concursos/orquestracao-ia" element={<AdminConcursosOrquestracaoIA />} />
          <Route path="concursos/historico" element={<AdminConcursosHistorico />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="legal" element={<AdminLegal />} />
          <Route path="fluxo-guias" element={<AdminGuideFlow />} />
        </Route>

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
          
          <Route path="/sobre-pqestudar" element={<SobrePqEstudar />} />
          <Route path="/breve" element={<EmBreve />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/faq" element={<FAQ />} />
          
          <Route path="/configuracoes-cookies" element={<ConfiguracoesCookies />} />
          
          <Route path="/kit" element={<KitAceleracao />} />
          
          <Route path="/ferramentas" element={<Ferramentas />} />
          <Route path="/ferramentas/salvos" element={<FerramentasSalvos />} />
          <Route path="/concursos" element={<Concursos />} />
          <Route path="/concursos/:slug" element={<ConcursoDetalhe />} />
          <Route path="/votacoes" element={<Votacoes />} />
          <Route path="/produtos" element={<Produtos />} />
          
          {/* Curadoria Dinâmica */}
          <Route path="/curadoria/:slug" element={<CuradoriaPublic />} />
          
          {/* Guias */}
          <Route path="/guias" element={<Guias />} />
          <Route path="/guias/:slug" element={<GuiaDetalhe />} />
          
          {/* Premium Routes - Public */}
          <Route path="/premium/upgrade" element={<PremiumUpgrade />} />
          <Route path="/premium/resgatar" element={<PremiumRedeem />} />
          
          {/* Premium Routes - Protected by subscription */}
          <Route path="/premium" element={<React.Suspense fallback={<SuspenseFallback />}><RequireActiveSubscription><PremiumHome /></RequireActiveSubscription></React.Suspense>} />
          <Route path="/premium/cursos" element={<React.Suspense fallback={<SuspenseFallback />}><RequireActiveSubscription><PremiumCourses /></RequireActiveSubscription></React.Suspense>} />
          <Route path="/premium/vagas" element={<React.Suspense fallback={<SuspenseFallback />}><RequireActiveSubscription><PremiumJobs /></RequireActiveSubscription></React.Suspense>} />
          <Route path="/premium/atualizacoes" element={<React.Suspense fallback={<SuspenseFallback />}><RequireActiveSubscription><PremiumUpdates /></RequireActiveSubscription></React.Suspense>} />
          <Route path="/premium/atualizacoes/:slug" element={<React.Suspense fallback={<SuspenseFallback />}><RequireActiveSubscription><PremiumUpdateDetail /></RequireActiveSubscription></React.Suspense>} />
          <Route path="/premium/salvos" element={<React.Suspense fallback={<SuspenseFallback />}><RequireActiveSubscription><PremiumSaved /></RequireActiveSubscription></React.Suspense>} />
          <Route path="/premium/p/:slug" element={<React.Suspense fallback={<SuspenseFallback />}><RequireActiveSubscription><PremiumCurationPage /></RequireActiveSubscription></React.Suspense>} />
          
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
    </React.Suspense>
  );
};

const AppContent = () => {
  // Initialize Google Analytics with Consent Mode v2
  useGoogleAnalytics();

  return (
    <>
      <CookieBanner />
      <BrowserRouter>
        <ScrollToTop />
        <AppWithPixel />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
