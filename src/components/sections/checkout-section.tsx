import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";

const benefits = [
  "Sistema Operacional completo para sua carreira",
  "Templates e planilhas prontas para usar",
  "Métodos de aprendizado acelerado",
  "Ferramentas de gestão de tempo e produtividade",
  "Acesso vitalício com todas as atualizações",
  "Garantia de 7 dias - satisfação total ou seu dinheiro de volta"
];

export function CheckoutSection() {
  return (
    <section id="checkout-section" className="py-20 px-4 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Crown className="h-5 w-5" />
            <span className="font-semibold">Oferta Exclusiva</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Kit de Ferramentas: <span className="bg-gradient-primary bg-clip-text text-transparent">Produtividade Exponencial</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme sua carreira com o sistema completo de execução e resultados
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-sm shadow-card-custom animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">O que você vai receber:</h3>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-gradient-primary/10 border-2 border-primary/20">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground line-through">De R$ 497</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-sm">Por apenas</span>
                      <span className="text-4xl font-bold text-primary">R$ 97</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Pagamento único • Acesso vitalício</p>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-center gap-2 text-sm text-primary mb-4">
                      <Zap className="h-4 w-4" />
                      <span className="font-semibold">Vagas limitadas neste preço</span>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-primary hover:opacity-90 shadow-purple text-base font-bold"
                    >
                      GARANTIR MINHA VAGA AGORA
                    </Button>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      🔒 Ambiente 100% seguro
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-accent/20">
                <p className="text-sm font-semibold text-foreground">
                  ⚡ Bônus Exclusivo: Comunidade Vitalícia
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Networking e suporte contínuo com outros profissionais de alta performance
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Mais de <span className="font-semibold text-foreground">500 profissionais</span> já estão usando o Kit de Ferramentas para acelerar suas carreiras
          </p>
        </div>
      </div>
    </section>
  );
}
