import { NewsletterForm } from "@/components/ui/newsletter-form";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center animate-fade-in max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left mx-auto lg:mx-0 max-w-2xl lg:max-w-none">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Transforme Informação{" "}
              </span>
              <span className="text-foreground">em Resultado.</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 lg:max-w-2xl">
              Descubra métodos e ferramentas de produtividade para acelerar sua carreira e projetos, sem se afogar em conteúdo.
            </p>
          </div>

          {/* Right Column - Newsletter Card */}
          <div className="flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-elegant mx-auto">
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