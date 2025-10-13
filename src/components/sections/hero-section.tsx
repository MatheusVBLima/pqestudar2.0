import { NewsletterForm } from "@/components/ui/newsletter-form";

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
              <NewsletterForm 
                title="Receba Ferramentas de Resultado"
                description="Uma curadoria semanal das melhores ferramentas e métodos de produtividade, direto no seu e-mail."
                variant="default"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}