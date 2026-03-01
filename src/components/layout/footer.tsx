import { Link } from "react-router-dom";
import { Instagram, Youtube, Music, Facebook, Linkedin, Twitter } from "lucide-react";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

const socialLinks = [
  { icon: Instagram, url: "{{URL_INSTAGRAM}}", label: "Instagram" },
  { icon: Youtube, url: "{{URL_YOUTUBE}}", label: "YouTube" },
  { icon: Music, url: "{{URL_TIKTOK}}", label: "TikTok" },
  { icon: Facebook, url: "{{URL_FACEBOOK}}", label: "Facebook" },
  { icon: Linkedin, url: "{{URL_LINKEDIN}}", label: "LinkedIn" },
  { icon: Twitter, url: "{{URL_TWITTER}}", label: "Twitter" },
];

const navLinksTop = [
  { label: "Produtos", to: "/produtos" },
  { label: "Sobre", to: "/sobre" },
];

const navLinksBottom = [
  { label: "Privacidade", to: "/privacidade" },
  { label: "Termos", to: "/termos" },
  { label: "Cookies", to: "/configuracoes-cookies" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16 w-full">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Top row: logo + socials */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" aria-label="Ir para a página inicial">
            <img src={logoLight} alt="PqEstudar" className="h-8 sm:h-9 md:h-11 block dark:hidden" />
            <img src={logoDark} alt="PqEstudar" className="h-8 sm:h-9 md:h-11 hidden dark:block" />
          </Link>

          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Seguir no ${s.label}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <s.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Bottom row: copyright + nav links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-6">
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>© 2025 PqEstudar</p>
            <p>Todos os direitos reservados</p>
          </div>

          <nav className="flex flex-col items-start sm:items-end gap-1 text-sm">
            <div className="flex flex-wrap gap-4">
              {navLinksTop.map((l) => (
                <Link key={l.to} to={l.to} className="text-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {navLinksBottom.map((l) => (
                <Link key={l.to} to={l.to} className="text-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
