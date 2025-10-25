import { BookOpen, Users, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const benefits = [
  {
    icon: BookOpen,
    title: "Acesso a Conteúdo Exclusivo",
    description: "E-books aprofundados e outros conteúdos exclusivos para você dominar sua área."
  },
  {
    icon: Users, 
    title: "Benefícios para Membros Ativos",
    description: "Descontos em plataformas parceiras, acesso antecipado a novos cursos e grupos VIP de networking."
  },
  {
    icon: DollarSign,
    title: "Recomende e Ganhe",
    description: "Descubra produtos e cursos de parceiros e ganhe comissões por cada indicação, utilizando plataformas externas como Hotmart, Eduzz ou Kiwify."
  }
];

export function FeaturesPreview() {
  const navigate = useNavigate();

  const handleButtonClick = (title: string) => {
    if (title === "Benefícios para Membros Ativos") {
      navigate('/programas-beneficios');
    } else if (title === "Recomende e Ganhe") {
      navigate('/oportunidades-afiliados');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Recursos Exclusivos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Acelere sua Jornada Profissional
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Para quem busca um diferencial ainda maior, a PqEstudar? oferece recursos exclusivos 
            e parcerias estratégicas que impulsionarão sua carreira. Descubra como:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={benefit.title}
              className="group hover:shadow-lg transition-all duration-300 text-center bg-card/80 border-border/50 flex flex-col h-full"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <CardDescription className="text-sm leading-relaxed mb-6 flex-1">
                  {benefit.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-auto"
                  onClick={() => handleButtonClick(benefit.title)}
                >
                  {benefit.title === "Acesso a Conteúdo Exclusivo" && "Saiba Mais"}
                  {benefit.title === "Benefícios para Membros Ativos" && "Conheça os Benefícios"}
                  {benefit.title === "Recomende e Ganhe" && "Conheça as Plataformas"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button size="lg" className="w-full sm:w-auto">
              Começar Agora
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Ver Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}