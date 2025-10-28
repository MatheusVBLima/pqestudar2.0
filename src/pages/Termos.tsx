import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useEffect } from "react";

const Termos = () => {
  const updatedAt = "28 de outubro de 2025";

  useEffect(() => {
    // SEO meta tags
    document.title = "Termos de Uso – PqEstudar";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Termos de Uso da PqEstudar. Última atualização: ${updatedAt}.`);
    }

    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    linkCanonical.setAttribute('href', 'https://pqestudar.com.br/termos');
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(linkCanonical);
    }

    return () => {
      // Reset to default on unmount
      document.title = "pqestudar - Cursos Gratuitos com Certificado";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Plataforma educacional completa com cursos online gratuitos e certificados válidos. Transforme sua carreira com nossa curadoria especializada.');
      }
    };
  }, [updatedAt]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-6 py-10 max-w-3xl">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Termos de Uso – PqEstudar
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">Última atualização:</span> {updatedAt}
            </p>
          </header>

          <section className="prose prose-neutral max-w-none prose-headings:scroll-mt-20">
            <h2 id="1-aceitacao-dos-termos">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o site <code>pqestudar.com.br</code> ("Plataforma"), você concorda em cumprir e
              estar vinculado a estes Termos de Uso e à nossa Política de Privacidade e Cookies. Se você não
              concorda com qualquer parte destes documentos, não deve utilizar nossos serviços.
            </p>

            <h2 id="2-descricao-dos-servicos">2. Descrição dos Serviços</h2>
            <p>
              A PqEstudar é uma plataforma de conteúdo e educação que oferece os seguintes serviços:
            </p>
            <ul>
              <li>
                <strong>Conteúdo Informativo:</strong> Disponibilização de notícias, artigos e guias sobre educação,
                carreira e desenvolvimento profissional.
              </li>
              <li>
                <strong>Curadoria de Cursos:</strong> Apresentação e direcionamento para cursos e materiais educacionais,
                gratuitos ou pagos, hospedados em plataformas de terceiros. A PqEstudar não se responsabiliza pelo
                conteúdo ou pela certificação desses cursos externos.
              </li>
              <li>
                <strong>Produtos Digitais:</strong> Venda de produtos próprios, como o "Kit de Aceleração", que incluem
                ferramentas, templates e métodos para desenvolvimento profissional.
              </li>
              <li>
                <strong>Comunicação por E-mail:</strong> Envio de newsletters, conteúdos exclusivos e ofertas para usuários
                que se inscreverem em nossas listas.
              </li>
            </ul>
            <p>
              Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto dos serviços a qualquer
              momento, sem aviso prévio.
            </p>

            <h2 id="3-cadastro-e-conta-do-usuario">3. Cadastro e Conta do Usuário</h2>
            <ul>
              <li>
                <strong>Acesso ao Conteúdo:</strong> A maior parte do conteúdo da Plataforma pode ser acessada sem a
                necessidade de criação de uma conta.
              </li>
              <li>
                <strong>Compra de Produtos e Acesso a Conteúdo Restrito:</strong> Para comprar nossos produtos digitais ou
                acessar áreas restritas, pode ser necessário criar uma conta, fornecendo informações precisas e atualizadas.
              </li>
              <li>
                <strong>Responsabilidades:</strong> Você é responsável por manter a confidencialidade de suas credenciais de
                acesso e por todas as atividades que ocorrem em sua conta.
              </li>
            </ul>

            <h2 id="4-regras-de-uso-e-conduta">4. Regras de Uso e Conduta</h2>
            <p>Ao utilizar nossos serviços, você concorda em não:</p>
            <ul>
              <li>
                Reproduzir, distribuir, modificar ou criar obras derivadas do conteúdo da Plataforma sem nossa autorização
                expressa por escrito.
              </li>
              <li>Utilizar a Plataforma para quaisquer fins ilegais ou não autorizados.</li>
              <li>Tentar obter acesso não autorizado aos nossos sistemas ou a contas de outros usuários.</li>
            </ul>

            <h2 id="5-propriedade-intelectual">5. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo original disponibilizado na Plataforma, incluindo, mas não se limitando a, textos, design,
              vídeos, imagens, e os produtos digitais como o "Kit de Aceleração", são de propriedade exclusiva da PqEstudar
              e protegidos por direitos autorais. O conteúdo de terceiros, como notícias e cursos externos, terá sua fonte
              devidamente citada, e os direitos pertencem aos seus respectivos proprietários.
            </p>

            <h2 id="6-links-terceiros-e-isencao">6. Links para Terceiros e Isenção de Responsabilidade</h2>
            <p>
              A Plataforma contém links para sites e serviços de terceiros (por exemplo, plataformas de cursos). Não temos
              controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou práticas de quaisquer
              sites ou serviços de terceiros. O uso desses serviços é por sua conta e risco.
            </p>

            <h2 id="7-limitacao-de-responsabilidade">7. Limitação de Responsabilidade</h2>
            <p>
              A PqEstudar não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais
              resultantes do uso ou da impossibilidade de uso de nossos serviços, incluindo decisões de carreira ou
              educacionais baseadas no conteúdo apresentado. Nosso conteúdo tem caráter informativo e não constitui
              aconselhamento profissional.
            </p>

            <h2 id="8-modificacoes-dos-termos">8. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor
              imediatamente após a publicação da versão atualizada no site. É sua responsabilidade revisar os termos
              periodicamente. O uso continuado do serviço após as modificações constitui sua aceitação dos novos termos.
            </p>

            <h2 id="9-contato">9. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail:
              <code> pqestudar.suporte@gmail.com</code>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Termos;