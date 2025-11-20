import { Helmet } from "react-helmet";
import LinkHero from "@/components/sections/link-hero";
import LinkButton from "@/components/ui/link-button";
import SocialRow from "@/components/sections/social-row";

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
          <ul className="max-w-xl w-full mx-auto flex flex-col gap-4">
            {/* 1. Arsenal Secreto - PRIORIDADE MÁXIMA */}
            <li>
              <LinkButton
                to="/ferramentas"
                variant="solid"
                icon="🚨"
                dataId="arsenal-ia"
              >
                ARSENAL SECRETO DE IA (O Mais Pedido!)
              </LinkButton>
            </li>

            {/* 2. E-book Redação */}
            <li>
              <LinkButton
                to="/hacks-redacao"
                variant="outline"
                dataId="ebook"
              >
                E-book: 50 Prompts de IA para a Redação Perfeita
              </LinkButton>
            </li>

            {/* 3. Workshop IA */}
            <li>
              <LinkButton
                to="/hacks-workshop"
                variant="outline"
                dataId="workshop"
              >
                Workshop IA para Passar: O Workshop de Hacks
              </LinkButton>
            </li>

            {/* 4. Minha História */}
            <li>
              <LinkButton
                to="/sobre"
                variant="outline"
                dataId="sobre"
              >
                Minha História: Do 12x36 ao Sucesso Online
              </LinkButton>
            </li>

            {/* 5. Link Patrocinado PDF */}
            <li>
              <LinkButton
                to="{{PDF_AFFILIATE_URL}}"
                external
                variant="outline"
                dataId="pdf-sponsor"
              >
                Ferramenta Essencial para PDF (Patrocinado)
              </LinkButton>
            </li>
          </ul>

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
