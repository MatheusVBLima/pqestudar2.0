import { Helmet } from "react-helmet";
import LinkHero from "@/components/sections/link-hero";
import LinkButton from "@/components/ui/link-button";
import SocialRow from "@/components/sections/social-row";
import { AlertCircle, BookOpen, Video, User, FileText } from "lucide-react";

const Links = () => {
  return (
    <>
      <Helmet>
        <title>Matheus - O Hacker dos Estudos | Links</title>
        <meta
          name="description"
          content="400k+ de Seguidores. Eu te mostro como passar usando IA. Acesse meus links principais e ferramentas secretas."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4 md:px-6">
        <div className="max-w-xl mx-auto space-y-10">
          {/* Hero com Foto e Títulos */}
          <LinkHero />

          {/* Lista de CTAs */}
          <div className="space-y-3.5" role="list">
            {/* 1. Arsenal Secreto - PRIORIDADE MÁXIMA */}
            <div role="listitem">
              <LinkButton
                to="/ferramentas"
                variant="solid"
                icon="🚨"
                dataId="arsenal-ia"
              >
                ARSENAL SECRETO DE IA (O Mais Pedido!)
              </LinkButton>
            </div>

            {/* 2. E-book Redação */}
            <div role="listitem">
              <LinkButton
                to="/hacks-redacao"
                variant="outline"
                icon={<BookOpen className="w-6 h-6" />}
                dataId="ebook-redacao"
              >
                E-book: 50 Prompts de IA para a Redação Perfeita
              </LinkButton>
            </div>

            {/* 3. Workshop IA */}
            <div role="listitem">
              <LinkButton
                to="/hacks-workshop"
                variant="outline"
                icon={<Video className="w-6 h-6" />}
                dataId="workshop-hacks"
              >
                Workshop IA para Passar: O Workshop de Hacks
              </LinkButton>
            </div>

            {/* 4. Minha História */}
            <div role="listitem">
              <LinkButton
                to="/sobre"
                variant="outline"
                icon={<User className="w-6 h-6" />}
                dataId="sobre"
              >
                Minha História: Do 12x36 ao Sucesso Online
              </LinkButton>
            </div>

            {/* 5. Link Patrocinado PDF */}
            <div role="listitem">
              <LinkButton
                to="{{PDF_AFFILIATE_URL}}"
                external
                variant="outline"
                icon={<FileText className="w-6 h-6" />}
                dataId="pdf-publi"
              >
                Ferramenta Essencial para PDF (Patrocinado)
              </LinkButton>
            </div>
          </div>

          {/* Separador */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-background px-5 text-muted-foreground font-medium">
                Redes Sociais
              </span>
            </div>
          </div>

          {/* Redes Sociais */}
          <SocialRow />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-10 pb-4">
            <p className="opacity-80">© {new Date().getFullYear()} Matheus - O Hacker dos Estudos</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Links;
