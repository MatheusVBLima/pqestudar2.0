import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Menu, LogOut, User } from "lucide-react";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, signOut, loading } = useAuth();
  const [isClicked, setIsClicked] = useState(false);

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
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
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
              className="hover:bg-accent"
            >
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/ferramentas")}
              className={`hover:bg-accent ${location.pathname === "/ferramentas" ? "bg-accent text-accent-foreground" : ""}`}
            >
              Ferramentas
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation("/sobre")}
              className={`hover:bg-accent ${location.pathname === "/sobre" ? "bg-accent text-accent-foreground" : ""}`}
            >
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
                  <DropdownMenu>
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
            
            <DropdownMenu>
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
                  Ferramentas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/sobre")}>
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
      </div>
    </nav>
  );
}
