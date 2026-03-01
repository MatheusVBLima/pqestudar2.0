import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Menu, LogOut, User, Bookmark, Wrench, ScrollText, Info, Crown, BarChart3, Moon, Vote, ShoppingBag, ExternalLink, type LucideIcon } from "lucide-react";
import { useNavConfig, type NavItem } from "@/hooks/useNavConfig";
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

// Icon mapping for dynamic icons from DB
const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  wrench: Wrench,
  "scroll-text": ScrollText,
  "shopping-bag": ShoppingBag,
  vote: Vote,
  info: Info,
  "book-open": BookOpen,
};

function getIcon(name: string | null): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP[name.toLowerCase()] ?? null;
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useUserRoles();
  const { isActive } = useSubscription();
  const { isDark, toggleTheme } = useTheme();
  const { items: navItems, logos } = useNavConfig();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showPremiumArea = isAdmin || isActive();
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

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  const handleItemClick = (item: NavItem) => {
    if (item.is_external) {
      window.open(item.href, item.open_in_new_tab ? "_blank" : "_self", "noopener");
    } else {
      handleNavigation(item.href);
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.href === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.href);
  };

  return (
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
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center p-2 hover:opacity-80 transition-opacity duration-200"
              aria-label="Ir para a página inicial"
            >
              <img src={logos.light} alt="PqEstudar" className="h-8 sm:h-9 md:h-11 w-auto object-contain block dark:hidden" />
              <img src={logos.dark} alt="PqEstudar" className="h-8 sm:h-9 md:h-11 w-auto object-contain hidden dark:block" />
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const IconComp = getIcon(item.icon);
              const showIconDesktop = item.show_icon_desktop !== false;
              const showIconTablet = item.show_icon_tablet !== false;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "hover:bg-accent rounded-[1.2rem]",
                    isItemActive(item) && "bg-accent text-accent-foreground"
                  )}
                  aria-current={isItemActive(item) ? "page" : undefined}
                >
                  {IconComp && showIconDesktop && (
                    <IconComp className="h-4 w-4 mr-2 hidden lg:inline-flex" aria-hidden="true" />
                  )}
                  {IconComp && showIconTablet && (
                    <IconComp className="h-4 w-4 mr-2 inline-flex lg:hidden" aria-hidden="true" />
                  )}
                  {item.label}
                  {item.is_external && <ExternalLink className="h-3 w-3 ml-1 opacity-50" />}
                </Button>
              );
            })}

            {user && <NotificationDropdown />}

            {/* Auth Button / User Menu - Desktop */}
            {!loading && (
              <>
                {!user ? (
                  <Button variant="default" size="sm" onClick={() => handleNavigation("/login")} aria-label="Entrar">
                    Entrar
                  </Button>
                ) : (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full p-0" aria-label="Menu do usuário" aria-haspopup="menu">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getUserInitials()}</AvatarFallback>
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
                      <DropdownMenuItem onClick={() => handleNavigation("/ferramentas/salvos")} className="cursor-pointer">
                        <Bookmark className="h-4 w-4 mr-2" />Salvos
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => handleNavigation("/admin")} className="cursor-pointer">
                          <BarChart3 className="h-4 w-4 mr-2" />Dashboard admin
                        </DropdownMenuItem>
                      )}
                      {showPremiumArea && (
                        <DropdownMenuItem onClick={() => handleNavigation("/premium")} className="cursor-pointer">
                          <Crown className="h-4 w-4 mr-2" />Área Premium
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleTheme(); }} className="cursor-pointer flex items-center justify-between">
                        <span className="flex items-center"><Moon className="h-4 w-4 mr-2" />Tema escuro</span>
                        <Switch checked={isDark} tabIndex={-1} className="pointer-events-none" />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />Sair
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
                {navItems.map((item) => {
                  const IconComp = getIcon(item.icon);
                  const showIconMobile = item.show_icon_mobile !== false;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      aria-current={isItemActive(item) ? "page" : undefined}
                    >
                      {IconComp && showIconMobile && <IconComp className="h-4 w-4 mr-2" aria-hidden="true" />}
                      {item.label}
                      {item.is_external && <ExternalLink className="h-3 w-3 ml-1 opacity-50" />}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                {!loading && (
                  <>
                    {!user ? (
                      <DropdownMenuItem onClick={() => handleNavigation("/login")} className="text-primary font-medium">
                        <User className="h-4 w-4 mr-2" />Entrar
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 p-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getUserInitials()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-0.5 leading-none">
                            <p className="font-medium text-sm">{getUserDisplayName()}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleNavigation("/ferramentas/salvos")} className="cursor-pointer">
                          <Bookmark className="h-4 w-4 mr-2" />Salvos
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => handleNavigation("/admin")} className="cursor-pointer">
                            <BarChart3 className="h-4 w-4 mr-2" />Dashboard admin
                          </DropdownMenuItem>
                        )}
                        {showPremiumArea && (
                          <DropdownMenuItem onClick={() => handleNavigation("/premium")} className="cursor-pointer">
                            <Crown className="h-4 w-4 mr-2" />Área Premium
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleTheme(); }} className="cursor-pointer flex items-center justify-between">
                          <span className="flex items-center"><Moon className="h-4 w-4 mr-2" />Tema escuro</span>
                          <Switch checked={isDark} tabIndex={-1} className="pointer-events-none" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                          <LogOut className="h-4 w-4 mr-2" />Sair
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
