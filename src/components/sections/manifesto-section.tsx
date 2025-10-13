import matheusProfile from "@/assets/matheus-profile.png";

export function ManifestoSection() {
  return (
    <section className="pb-0 pt-20 bg-background w-full overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Foto */}
          <div className="relative flex items-end justify-center h-full">
            <img 
              src={matheusProfile}
              alt="Matheus Dias - Fundador do PqEstudar?"
              className="w-full h-auto object-contain object-bottom"
            />
          </div>

          {/* Texto */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Menos conteúdo,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                mais aplicação.
              </span>
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Meu nome é <span className="text-foreground font-semibold">Matheus Dias</span> e por anos eu acreditei que precisava consumir mais para ter sucesso. A verdade é o oposto.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                O sucesso vem de <span className="text-foreground font-semibold">aplicar o conhecimento certo, da forma mais rápida possível</span>. O PqEstudar? nasceu para ser o seu filtro.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Aqui, compartilhamos apenas o que funciona no mundo real, para profissionais que não têm tempo a perder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
