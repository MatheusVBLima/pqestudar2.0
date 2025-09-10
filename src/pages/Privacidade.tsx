import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Shield } from "lucide-react";

const Privacidade = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Compromisso com sua Privacidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A EduPlataforma está comprometida em proteger sua privacidade e dados pessoais. 
                Esta política descreve como coletamos, usamos, armazenamos e protegemos suas 
                informações quando você utiliza nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">Informações Fornecidas por Você:</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Nome, e-mail e informações de perfil</li>
                    <li>Dados de pagamento (processados por terceiros seguros)</li>
                    <li>Conteúdo que você compartilha na plataforma</li>
                    <li>Comunicações conosco</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">Informações Coletadas Automaticamente:</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Dados de uso e navegação</li>
                    <li>Informações do dispositivo e navegador</li>
                    <li>Endereço IP e localização aproximada</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Como Utilizamos suas Informações</h2>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Fornecer e melhorar nossos serviços educacionais</li>
                  <li>Personalizar sua experiência de aprendizagem</li>
                  <li>Processar pagamentos e gerenciar sua conta</li>
                  <li>Comunicar sobre cursos, atualizações e promoções</li>
                  <li>Garantir a segurança da plataforma</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Não vendemos suas informações pessoais. Podemos compartilhar dados apenas com:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground mt-2">
                <li>Provedores de serviços que nos auxiliam nas operações</li>
                <li>Autoridades legais, quando exigido por lei</li>
                <li>Em caso de fusão, aquisição ou venda de ativos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos</h2>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>Você tem o direito de:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Acessar e atualizar suas informações pessoais</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Revogar consentimentos dados anteriormente</li>
                  <li>Portabilidade de dados</li>
                  <li>Ser informado sobre violações de dados</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais adequadas para proteger 
                suas informações contra acesso não autorizado, alteração, divulgação ou 
                destruição. Utilizamos criptografia, controles de acesso e monitoramento 
                contínuo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento da plataforma e cookies 
                analíticos para melhorar nossos serviços. Você pode gerenciar suas 
                preferências de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos suas informações pelo tempo necessário para fornecer nossos 
                serviços, cumprir obrigações legais e resolver disputas. Dados inativos 
                são excluídos conforme nossa política de retenção.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                entre em contato conosco:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground mt-2">
                <li>E-mail: privacidade@eduplataforma.com</li>
                <li>Telefone: (11) 1234-5678</li>
                <li>Endereço: Rua da Educação, 123 - São Paulo, SP</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacidade;