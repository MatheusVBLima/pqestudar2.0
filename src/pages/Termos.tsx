import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FileText } from "lucide-react";

const Termos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar a EduPlataforma, você concorda em cumprir e estar 
                vinculado a estes Termos de Uso. Se você não concorda com qualquer parte 
                destes termos, não deve utilizar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                A EduPlataforma é uma plataforma de ensino online que oferece cursos, 
                materiais educativos e recursos de aprendizagem. Reservamo-nos o direito 
                de modificar, suspender ou descontinuar qualquer aspecto do serviço a 
                qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Conta do Usuário</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Para utilizar determinados recursos, você deve criar uma conta fornecendo informações precisas e atualizadas.</p>
                <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
                <p>Você é responsável por todas as atividades que ocorrem em sua conta.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Uso Permitido</h2>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>Você pode utilizar nossos serviços apenas para:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Fins educacionais legítimos</li>
                  <li>Seu desenvolvimento pessoal e profissional</li>
                  <li>Atividades em conformidade com a legislação aplicável</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo disponibilizado na plataforma, incluindo textos, vídeos, 
                imagens e materiais didáticos, são protegidos por direitos autorais e 
                outras leis de propriedade intelectual. É proibida a reprodução não 
                autorizada deste conteúdo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A EduPlataforma não será responsável por quaisquer danos diretos, 
                indiretos, incidentais, especiais ou consequenciais resultantes do uso 
                ou impossibilidade de uso de nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Modificações dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor imediatamente após a publicação. 
                O uso continuado do serviço constitui aceitação dos termos modificados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco 
                através da página de contato ou pelo e-mail: legal@eduplataforma.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Termos;