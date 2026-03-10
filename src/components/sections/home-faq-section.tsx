import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq-1",
    question: "O que é o PqEstudar?",
    answer:
      "O PqEstudar é uma plataforma gratuita que reúne ferramentas, concursos públicos e recursos educacionais em um só lugar — tudo pensado para quem quer estudar de forma mais inteligente.",
  },
  {
    id: "faq-2",
    question: "Preciso criar uma conta para usar?",
    answer:
      "Não. Você pode navegar por ferramentas, concursos e produtos sem precisar de conta. O cadastro é opcional e desbloqueia recursos extras, como salvar itens favoritos.",
  },
  {
    id: "faq-3",
    question: "O que encontro na seção de Ferramentas?",
    answer: (
      <>
        Uma curadoria de ferramentas úteis para estudos, produtividade e organização. Você pode filtrar por categoria, acessar diretamente cada ferramenta e salvar as que mais usar.{" "}
        <Link to="/ferramentas" className="text-primary underline underline-offset-2 hover:text-primary/80">
          Explorar ferramentas →
        </Link>
      </>
    ),
  },
  {
    id: "faq-4",
    question: "O que encontro na seção de Concursos?",
    answer: (
      <>
        Oportunidades de concursos públicos organizadas com filtros por área, escolaridade e situação. Cada concurso tem uma página com detalhes, links para editais e atualizações.{" "}
        <Link to="/concursos" className="text-primary underline underline-offset-2 hover:text-primary/80">
          Ver concursos →
        </Link>
      </>
    ),
  },
  {
    id: "faq-5",
    question: "Para que serve a página de Votações?",
    answer: (
      <>
        Nas Votações, você pode sugerir e votar em funcionalidades que gostaria de ver no PqEstudar. É a forma mais direta de influenciar o que vai ser desenvolvido.{" "}
        <Link to="/votacoes" className="text-primary underline underline-offset-2 hover:text-primary/80">
          Participar das votações →
        </Link>
      </>
    ),
  },
  {
    id: "faq-6",
    question: "O que são os Produtos do PqEstudar?",
    answer: (
      <>
        São guias e recursos prontos criados pela equipe do PqEstudar para acelerar seu progresso nos estudos. Você pode conferir os disponíveis na{" "}
        <Link to="/produtos" className="text-primary underline underline-offset-2 hover:text-primary/80">
          página de produtos
        </Link>
        .
      </>
    ),
  },
  {
    id: "faq-7",
    question: "Posso salvar ferramentas e concursos para ver depois?",
    answer:
      "Sim! Se estiver logado, você pode salvar ferramentas e concursos nos seus favoritos e acessá-los a qualquer momento pela sua área de salvos.",
  },
  {
    id: "faq-8",
    question: "O PqEstudar é gratuito?",
    answer:
      "Sim, o acesso à plataforma é gratuito. Você pode navegar por todo o conteúdo público sem nenhum custo.",
  },
  {
    id: "faq-9",
    question: "Como posso tirar dúvidas ou entrar em contato?",
    answer: (
      <>
        Você pode nos encontrar na{" "}
        <Link to="/sobre" className="text-primary underline underline-offset-2 hover:text-primary/80">
          página Sobre
        </Link>{" "}
        ou enviar um e-mail para{" "}
        <a
          href="mailto:suporte@pqestudar.com"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          suporte@pqestudar.com
        </a>
        .
      </>
    ),
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function HomeFaqSection() {
  return (
    <section className="pt-0 pb-16 md:pb-24">
      <div className="container mx-auto px-6">
        <Separator className="mb-14 md:mb-20 bg-border/50" />

        <div className="rounded-[1.2rem] border border-border/40 bg-muted/30 p-6 md:p-10 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10"
          >
            <div>
              <Badge variant="secondary" className="mb-4 text-xs">
                <HelpCircle className="h-3 w-3 mr-1" />
                Dúvidas frequentes
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Perguntas Frequentes
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg">
                Respostas rápidas sobre como usar o PqEstudar.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border border-border/60 rounded-xl px-5 bg-background/50"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-medium text-[0.95rem] leading-snug">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
