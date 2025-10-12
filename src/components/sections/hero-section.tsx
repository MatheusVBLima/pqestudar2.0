import matheusHero from "@/assets/matheus-hero.png";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-in max-w-7xl mx-auto">
          {/* Left Column - Image */}
          <div className="flex items-center justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-lg">
              <img 
                src={matheusHero} 
                alt="Matheus Dias - Fundador do PqEstudar" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6 text-left order-1 lg:order-2">
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Menos conteúdo, </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                mais aplicação.
              </span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Meu nome é <strong>Matheus Dias</strong> e por anos eu acreditei que precisava consumir mais para ter sucesso. A verdade é o oposto.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              O sucesso vem de <strong>aplicar o conhecimento certo, da forma mais rápida possível</strong>. O PqEstudar? nasceu para ser o seu filtro.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Aqui, compartilhamos apenas o que funciona no mundo real, para profissionais que não têm tempo a perder.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}