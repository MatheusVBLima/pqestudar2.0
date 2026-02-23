import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Menu, LogOut, User, Bookmark, Wrench, ScrollText, Info, Crown, BarChart3, Moon, Vote, ShoppingBag } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useSubscription } from "@/hooks/useSubscription";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useUserRoles();
  const { isActive } = useSubscription();
  const { isDark, toggleTheme } = useTheme();
  const [isClicked, setIsClicked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Show premium area for admins OR active subscribers
  const showPremiumArea = isAdmin || isActive();

  // Detecta se está no subdomínio kit
  const isOnKitSubdomain = window.location.hostname.startsWith("kit.");
  const mainDomain = isOnKitSubdomain ? "https://pqestudar.com.br" : "";

  const handleNavigation = (path: string) => {
    if (isOnKitSubdomain) {
      window.location.href = `${mainDomain}${path}`;
    } else {
      navigate(path);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
    handleNavigation('/');
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    /* Wrapper externo: full-width fixo, sem visual próprio */
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <nav className={cn(
        "mx-auto transition-all duration-300 ease-out",
        isScrolled
          ? "w-[85%] mt-2 px-3 rounded-[1.2rem] border border-border/40 bg-background/75 backdrop-blur-md shadow-sm"
          : "w-full bg-background border-b border-border/40"
      )}>
        <div className={cn(
          "flex items-center justify-between transition-all duration-300 ease-out px-4",
          isScrolled ? "h-14" : "h-16"
        )}>
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/")}
              className="group font-bold text-xl hover:bg-transparent p-2 transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <BookOpen className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                </div>
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/60 transition-all duration-300">
                  PqEstudar
                </span>
                <div 
                  className="relative ml-1 cursor-pointer transition-all duration-300 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsClicked(!isClicked);
                  }}
                >
                  <span className="text-primary font-bold text-xl group-hover:text-accent transition-colors duration-300">
                    {isClicked ? "!" : "?"}
                  </span>
                </div>
              </div>
            </Button>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/")}
              className="hover:bg-accent rounded-[1.2rem]"
            >
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/ferramentas")}
              className={`hover:bg-accent rounded-[1.2rem] ${location.pathname === "/ferramentas" ? "bg-accent text-accent-foreground" : ""}`}
            >
              <Wrench className="h-4 w-4 mr-2" aria-hidden="true" />
              Ferramentas
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/concursos")}
              className={`hover:bg-accent rounded-[1.2rem] ${location.pathname.startsWith("/concursos") ? "bg-accent text-accent-foreground" : ""}`}
              aria-label="Ir para Concursos"
              aria-current={location.pathname.startsWith("/concursos") ? "page" : undefined}
            >
              <ScrollText className="h-4 w-4 mr-2" aria-hidden="true" />
              Concursos
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/produtos")}
              className={`hover:bg-accent rounded-[1.2rem] ${location.pathname === "/produtos" ? "bg-accent text-accent-foreground" : ""}`}
            >
              <ShoppingBag className="h-4 w-4 mr-2" aria-hidden="true" />
              Produtos
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/votacoes")}
              className={`hover:bg-accent rounded-[1.2rem] ${location.pathname === "/votacoes" ? "bg-accent text-accent-foreground" : ""}`}
            >
              <Vote className="h-4 w-4 mr-2" aria-hidden="true" />
              Votações
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/sobre")}
              className={`hover:bg-accent rounded-[1.2rem] ${location.pathname === "/sobre" ? "bg-accent text-accent-foreground" : ""}`}
            >
              <Info className="h-4 w-4 mr-2" aria-hidden="true" />
              Sobre
            </Button>

            {user && <NotificationDropdown />}

            {/* Auth Button / User Menu - Desktop */}
            {!loading && (
              <>
                {!user ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleNavigation("/login")}
                    aria-label="Entrar"
                  >
                    Entrar
                  </Button>
                ) : (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative h-9 w-9 rounded-full p-0"
                        aria-label="Menu do usuário"
                        aria-haspopup="menu"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={user.user_metadata?.avatar_url} 
                            alt={getUserDisplayName()} 
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium text-sm">{getUserDisplayName()}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleNavigation("/ferramentas/salvos")}
                        className="cursor-pointer"
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        Salvos
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem 
                          onClick={() => handleNavigation("/admin")}
                          className="cursor-pointer"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard admin
                        </DropdownMenuItem>
                      )}
                      {showPremiumArea && (
                        <DropdownMenuItem 
                          onClick={() => handleNavigation("/premium")}
                          className="cursor-pointer"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Área Premium
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onSelect={(e) => { e.preventDefault(); toggleTheme(); }}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Tema escuro
                        </span>
                        <Switch checked={isDark} tabIndex={-1} className="pointer-events-none" />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationDropdown />}
            
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Menu de navegação">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuItem onClick={() => handleNavigation("/")}>
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/ferramentas")}>
                  <Wrench className="h-4 w-4 mr-2" aria-hidden="true" />
                  Ferramentas
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleNavigation("/concursos")}
                  aria-label="Ir para Concursos"
                  aria-current={location.pathname.startsWith("/concursos") ? "page" : undefined}
                >
                  <ScrollText className="h-4 w-4 mr-2" aria-hidden="true" />
                  Concursos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/produtos")}>
                  <ShoppingBag className="h-4 w-4 mr-2" aria-hidden="true" />
                  Produtos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/votacoes")}>
                  <Vote className="h-4 w-4 mr-2" aria-hidden="true" />
                  Votações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/sobre")}>
                  <Info className="h-4 w-4 mr-2" aria-hidden="true" />
                  Sobre
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Auth section in mobile menu */}
                {!loading && (
                  <>
                    {!user ? (
                      <DropdownMenuItem 
                        onClick={() => handleNavigation("/login")}
                        className="text-primary font-medium"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Entrar
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 p-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={user.user_metadata?.avatar_url} 
                              alt={getUserDisplayName()} 
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-0.5 leading-none">
                            <p className="font-medium text-sm">{getUserDisplayName()}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleNavigation("/ferramentas/salvos")}
                          className="cursor-pointer"
                        >
                          <Bookmark className="h-4 w-4 mr-2" />
                          Salvos
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem 
                            onClick={() => handleNavigation("/admin")}
                            className="cursor-pointer"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Dashboard admin
                          </DropdownMenuItem>
                        )}
                        {showPremiumArea && (
                          <DropdownMenuItem 
                            onClick={() => handleNavigation("/premium")}
                            className="cursor-pointer"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Área Premium
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={(e) => { e.preventDefault(); toggleTheme(); }}
                          className="cursor-pointer flex items-center justify-between"
                        >
                          <span className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            Tema escuro
                          </span>
                          <Switch checked={isDark} tabIndex={-1} className="pointer-events-none" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleSignOut}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </div>
  );
}
