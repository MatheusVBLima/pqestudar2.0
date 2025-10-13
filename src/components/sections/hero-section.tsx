import { NewsletterForm } from "@/components/ui/newsletter-form";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-in max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-6 text-left order-2 lg:order-1">
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Transforme Informação{" "}
              </span>
              <span className="text-foreground">em Resultado.</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Descubra métodos e ferramentas de produtividade para acelerar sua carreira e projetos, sem se afogar em conteúdo.
            </p>
          </div>

          {/* Right Column - Newsletter Card */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 shadow-elegant">
              <div className="space-y-6">
                {/* Badge */}
                <Badge variant="secondary" className="text-sm font-semibold">
                  🎁 BÔNUS GRATUITO
                </Badge>
                
                {/* Card Title */}
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Receba Ferramentas de Resultado
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Uma curadoria semanal das melhores ferramentas e métodos de produtividade, direto no seu e-mail.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe de especialistas selecionou a dedo os melhores recursos para você economizar tempo e ir direto ao ponto.
                  </p>
                </div>

                {/* Newsletter Form */}
                <NewsletterForm 
                  variant="default"
                  className="w-full"
                />

                {/* Security Text */}
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Seus dados estão seguros e você pode cancelar a qualquer momento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}