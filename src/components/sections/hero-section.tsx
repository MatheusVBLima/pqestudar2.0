import { NewsletterForm } from "@/components/ui/newsletter-form";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center animate-fade-in max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-4 md:space-y-6 text-left">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] md:leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Transforme Informação{" "}
              </span>
              <span className="text-foreground">em Resultado.</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Descubra métodos e ferramentas de produtividade para acelerar sua carreira e projetos, sem se afogar em conteúdo.
            </p>
          </div>

          {/* Right Column - Newsletter Card */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-elegant">
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