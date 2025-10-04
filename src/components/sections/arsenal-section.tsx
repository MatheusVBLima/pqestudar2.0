import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Headphones, FileStack, Users, Presentation, Shield } from "lucide-react";

const components = [
  {
    icon: BookOpen,
    title: "A Trilha de Aprendizagem Acelerada",
    value: "R$ 997",
    description: "Nós analisamos mais de 200 horas de conteúdo e condensamos o conhecimento essencial em uma trilha de 4 semanas. Aulas curtas e diretas ao ponto para você dominar o sistema em 30 minutos por dia, sem enrolação."
  },
  {
    icon: FileText,
    title: "A Biblioteca de Templates \"Produtividade Imediata\"",
    value: "R$ 697",
    description: "Chega de começar do zero. Você recebe acesso a templates \"copie e cole\" para planejamento semanal, gestão de projetos, resumo de conteúdo e relatórios de impacto. É só preencher e usar."
  },
  {
    icon: Headphones,
    title: "O Kit de Foco (Áudios e Mapas Mentais)",
    value: "R$ 397",
    description: "Transformamos os conceitos-chave em resumos em áudio de 10 minutos para você ouvir no trânsito e mapas mentais para revisar em 60 segundos. Aprenda e reforce o sistema em qualquer lugar."
  },
  {
    icon: FileStack,
    title: "O Cofre de Estudos de Caso",
    value: "R$ 497",
    description: "Veja na prática como profissionais como você aplicaram este sistema para organizar projetos complexos, ganhar visibilidade e acelerar suas carreiras. É a prova de que o método funciona no mundo real."
  }
];

const bonuses = [
  {
    icon: Users,
    title: "Acesso à Comunidade de Executores",
    value: "R$ 597/ano",
    description: "Junte-se a um grupo exclusivo de profissionais que, como você, estão aplicando o sistema. Um ambiente para networking estratégico, troca de ideias e responsabilidade mútua."
  },
  {
    icon: Presentation,
    title: "Workshop Gravado \"Destravando o Notion\"",
    value: "R$ 297",
    description: "Um treinamento prático de 90 minutos que te ensinará a usar o Notion para construir seu \"segundo cérebro\" e personalizar seus templates, mesmo que você nunca tenha usado a ferramenta antes."
  }
];

export function ArsenalSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Torne-se um <span className="bg-gradient-primary bg-clip-text text-transparent">Executor de Alta Performance</span>: Aqui está seu Arsenal Completo
          </h2>
        </div>

        {/* Componentes Principais */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {components.map((component, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/80 backdrop-blur-sm hover:shadow-card-custom transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <component.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg">Componente #{index + 1}</h3>
                    <Badge variant="secondary" className="text-sm font-semibold">
                      {component.value}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-base mb-2">{component.title}</h4>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {component.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Bônus */}
        <div className="mb-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="text-center mb-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-lg px-6 py-2 mb-4">
              BÔNUS EXCLUSIVOS
            </Badge>
            <h3 className="text-2xl font-bold">
              E se você agir agora, também receberá acesso a estes bônus exclusivos:
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {bonuses.map((bonus, index) => (
              <Card 
                key={index}
                className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-card-custom transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <bonus.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg">BÔNUS #{index + 1}</h3>
                      <Badge className="bg-primary text-primary-foreground text-sm font-semibold">
                        {bonus.value}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-base mb-2">{bonus.title}</h4>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {bonus.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Garantia */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-primary/30 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">
                  SUA GARANTIA INCONDICIONAL DE PRODUTIVIDADE
                </h3>
                <Badge variant="secondary" className="text-sm font-semibold">
                  Valor: Incalculável
                </Badge>
              </div>
              <p className="text-lg leading-relaxed">
                Nós temos tanta confiança no sistema que o risco é todo nosso. Adquira o Kit de Ferramentas hoje, aplique o método da Semana 1. Se em <strong>30 dias</strong> você não sentir uma transformação real na sua clareza e organização, basta nos enviar um e-mail e nós devolveremos <strong className="text-primary">100% do seu investimento</strong>. Sem perguntas.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
