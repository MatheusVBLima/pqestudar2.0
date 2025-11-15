import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AboutCTACards() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !consent) {
      toast.error("Preencha o e-mail e aceite os termos.");
      return;
    }

    setIsLoading(true);

    try {
      // Capturar UTMs se existirem
      const params = new URLSearchParams(window.location.search);
      const utms = {
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_term: params.get("utm_term") || undefined,
        utm_content: params.get("utm_content") || undefined,
      };

      const { data, error } = await supabase.functions.invoke(
        "subscribe-newsletter-brevo",
        {
          body: { email, ...utms },
        }
      );

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Inscrito com sucesso! Verifique seu e-mail.");
      
      setTimeout(() => {
        setEmail("");
        setConsent(false);
        setIsSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao inscrever:", error);
      toast.error(error.message || "Erro ao inscrever. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section className="w-full py-16 md:py-24 bg-accent/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha como você quer acessar os segredos que vão acelerar sua carreira.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <Card className="h-full border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Receba os Hacks</CardTitle>
                <CardDescription className="text-base">
                  Toda semana, os melhores segredos, ferramentas e métodos direto no seu e-mail.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-primary animate-scale-in" />
                    <p className="text-lg font-semibold text-center">
                      Inscrito com sucesso!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newsletter-email">E-mail</Label>
                      <Input
                        id="newsletter-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="newsletter-consent"
                        checked={consent}
                        onCheckedChange={(checked) => setConsent(checked as boolean)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="newsletter-consent"
                        className="text-sm text-muted-foreground leading-tight cursor-pointer"
                      >
                        Aceito receber e-mails com conteúdos e novidades.
                      </label>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isLoading || !consent}
                    >
                      {isLoading ? (
                        "Inscrevendo..."
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Quero Receber os Hacks
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Card Ferramentas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease }}
          >
            <Card className="h-full border-2 hover:border-primary/40 transition-colors duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Explore Agora</CardTitle>
                <CardDescription className="text-base">
                  Acesse o arsenal completo de ferramentas secretas que já impactaram milhões.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-end flex-1">
                <div className="space-y-4 mb-6">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Ferramentas de IA e automação
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Plataformas de aprendizagem
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      Hacks de produtividade
                    </li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => navigate("/ferramentas")}
                >
                  Ver Ferramentas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
