import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, HelpCircle, Search, BookOpen, Bell, User, Menu, Heart, Newspaper, Trophy } from "lucide-react";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="font-semibold text-lg"
            >
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              EduPlataforma
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {!isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-accent"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/explorar-cursos")}
              className={`hover:bg-accent ${location.pathname === "/explorar-cursos" ? "bg-accent text-accent-foreground" : ""}`}
            >
              <Search className="h-4 w-4 mr-2" />
              Explorar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/noticias")}
              className={`hover:bg-accent ${location.pathname === "/noticias" ? "bg-accent text-accent-foreground" : ""}`}
            >
              <Newspaper className="h-4 w-4 mr-2" />
              Notícias
            </Button>


            <NotificationDropdown />
          </div>

          {/* User Menu & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-accent">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/meu-perfil")}>
                  <User className="h-4 w-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/meus-materiais")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Meus Materiais
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favoritos")}>
                  <Heart className="h-4 w-4 mr-2" />
                  Minha atividade
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/ranking-comunidade")}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Ranking da Comunidade
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/notificacoes")}>
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/suporte")}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Central de Ajuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {!isHomePage && (
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <Home className="h-4 w-4 mr-2" />
                      Início
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/explorar-cursos")}>
                    <Search className="h-4 w-4 mr-2" />
                    Explorar Cursos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/noticias")}>
                    <Newspaper className="h-4 w-4 mr-2" />
                    Notícias
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/favoritos")}>
                    <Heart className="h-4 w-4 mr-2" />
                    Minha atividade
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/ranking-comunidade")}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Ranking da Comunidade
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/notificacoes")}>
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}