import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-education.jpg";
import { BookOpen, Award, Users, Zap, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: BookOpen,
    title: "Cursos Gratuitos",
    description: "Centenas de cursos online com certificado válido"
  },
  {
    icon: Award,
    title: "Certificados Reconhecidos",
    description: "Certificações aceitas pelo mercado de trabalho"
  },
  {
    icon: Users,
    title: "Comunidade Ativa",
    description: "Acesso a grupos exclusivos e networking"
  },
  {
    icon: Zap,
    title: "Atualizações Automáticas",
    description: "Alertas sobre novos cursos e oportunidades"
  }
];

const stats = [
  { label: "Cursos Disponíveis", value: "500+" },
  { label: "Usuários Ativos", value: "10K+" },
  { label: "Certificados Emitidos", value: "25K+" },
  { label: "Taxa de Aprovação", value: "95%" }
];

export function HeroSection() {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-background to-accent/20 overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10 w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Star className="h-3 w-3 mr-1" />
                Plataforma #1 em Educação Gratuita
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Menos Esforço,
                </span>
                {" "}
                <span className="text-foreground">Mais Resultados.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                O primeiro Kit de Ferramentas para profissionais que querem acelerar a carreira. Receba os templates e processos para executar ideias, otimizar seu tempo e gerar valor real.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-border/50 w-full">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center space-y-1">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 shadow-purple text-base px-8"
                onClick={() => navigate('/explorar-cursos')}
              >
                COMEÇAR A GERAR RESULTADOS
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary/20 text-primary hover:bg-primary/5"
                onClick={() => navigate('/explorar-cursos')}
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Ver Categorias
              </Button>
            </div>
          </div>

          {/* Right Column - Newsletter Form */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-card-custom">
              <NewsletterForm 
                variant="hero"
                className="max-w-md mx-auto"
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Hero Image Overlay */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-background via-transparent to-transparent">
        <img 
          src={heroImage} 
          alt="Plataforma educacional online"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}