import { NewsletterForm } from "@/components/ui/newsletter-form";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10 w-full max-w-4xl">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Transforme Informação
            </span>
            {" "}
            <span className="text-foreground">em Resultado.</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Descubra métodos e ferramentas de produtividade para acelerar sua carreira e projetos, sem se afogar em conteúdo.
          </p>

          {/* Newsletter Form */}
          <div className="max-w-2xl mx-auto pt-8">
            <NewsletterForm 
              title="Receba Ferramentas de Resultado"
              description="Uma curadoria semanal das melhores ferramentas e métodos de produtividade, direto no seu e-mail."
              variant="hero"
              className="max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}