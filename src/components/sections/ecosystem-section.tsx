import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EcosystemSection() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: GraduationCap,
      title: "Explore Cursos",
      description: "Uma curadoria dos melhores cursos gratuitos de plataformas do governo e instituições de renome para você se qualificar sem custos.",
      cta: "Acessar Cursos",
      link: "/explorar-cursos",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: Newspaper,
      title: "Fique por Dentro",
      description: "As notícias mais relevantes sobre educação, carreira e tecnologia, validadas pela nossa comunidade e por IA para você não cair em fake news.",
      cta: "Ler Notícias",
      link: "/noticias",
      gradient: "from-accent/10 to-accent/5"
    }
  ];

  return (
    <section className="py-20 bg-accent/5 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
            O <span className="bg-gradient-primary bg-clip-text text-transparent">Ecossistema</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:max-w-2xl">
            Duas áreas integradas para transformar conhecimento em resultado prático.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {cards.map((card) => (
            <Card 
              key={card.title}
              className="group hover:shadow-elegant transition-all duration-300 border-border/50 hover:border-primary/20"
            >
              <CardHeader className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-4">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-xl sm:text-2xl">{card.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {card.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center md:justify-start md:pl-20">
                <Button 
                  onClick={() => navigate(card.link)}
                  className="w-full sm:w-auto min-w-[200px] bg-gradient-primary hover:opacity-90 transition-opacity duration-300"
                  size="lg"
                >
                  {card.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
