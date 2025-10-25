import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface FooterProps {
  isHomePage?: boolean;
}

export function Footer({ isHomePage = false }: FooterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const hidePartnersLink = ['/explorar-cursos', '/noticias', '/kit'].includes(location.pathname);
  
  return (
    <footer className="border-t-2 border-border bg-muted/30 mt-16 w-full overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">PqEstudar?</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6">
            {isHomePage && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/sobre")} className="h-8 px-0 hover:bg-transparent hover:text-primary">
                Sobre
              </Button>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => navigate("/termos")} className="h-8 px-0 hover:bg-transparent hover:text-primary">
              Termos de Uso
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => navigate("/privacidade")} className="h-8 px-0 hover:bg-transparent hover:text-primary">
              Política de Privacidade
            </Button>
            
            {!hidePartnersLink && isHomePage && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/parceiros")} className="h-8 px-0 hover:bg-transparent hover:text-primary">
                Parceiros
              </Button>
            )}
            
            {isHomePage && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/configuracoes-cookies")} className="h-8 px-0 hover:bg-transparent hover:text-primary">
                  Cookies
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => navigate("/faq")} className="h-8 px-0 hover:bg-transparent hover:text-primary">
                  FAQ
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => navigate("/contato")} className="h-8 px-0 hover:bg-transparent hover:text-primary">
                  Contato
                </Button>
              </>
            )}
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">© 2025 PqEstudar?</div>
        </div>
      </div>
    </footer>
  );
}