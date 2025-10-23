import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PremiumCTASection() {
  const navigate = useNavigate();
  
  const handleCTAClick = () => {
    navigate('/kit');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background w-full relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <div className="text-center space-y-6 md:space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary shadow-purple">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
            Pronto para um{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Sistema
            </span>
            , não apenas dicas?
          </h2>

          {/* Text */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:max-w-2xl">
            Para profissionais que buscam um método completo para transformar teoria em resultado prático, nós criamos o{" "}
            <span className="text-foreground font-semibold">Kit de Ferramentas: Produtividade Exponencial</span>.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button 
              onClick={handleCTAClick}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-purple text-lg px-10 py-6 h-auto"
            >
              CONHECER O KIT PREMIUM
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
