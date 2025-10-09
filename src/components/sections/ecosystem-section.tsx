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
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            O <span className="bg-gradient-primary bg-clip-text text-transparent">Ecossistema</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore as diferentes áreas do portal e encontre o que você precisa
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {cards.map((card) => (
            <Card 
              key={card.title}
              className="group hover:shadow-elegant transition-all duration-300 border-border/50 hover:border-primary/20"
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{card.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(card.link)}
                  className="w-full bg-gradient-primary hover:opacity-90"
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
