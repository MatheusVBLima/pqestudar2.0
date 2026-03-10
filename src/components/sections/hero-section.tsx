import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeroBadge from "@/components/ui/hero-badge";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { renderHighlightedTitle } from "@/lib/highlight-title";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface HeroSectionProps {
  headerTitle?: string;
  headerDescription?: string;
  isLoading?: boolean;
}

export function HeroSection({ headerTitle, headerDescription, isLoading }: HeroSectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!EMAIL_RE.test(email.trim())) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter-brevo", {
        body: {
          email: email.trim(),
          consent: true,
          utmSource: urlParams.get("utm_source") || undefined,
          utmMedium: urlParams.get("utm_medium") || undefined,
          utmCampaign: urlParams.get("utm_campaign") || undefined,
          utmContent: urlParams.get("utm_content") || undefined,
          utmTerm: urlParams.get("utm_term") || undefined,
          pageSlug: "home_hero",
        },
      });

      if (error) throw error;

      if (data?.alreadySubscribed) {
        toast.success("Você já está na lista. Verifique sua caixa de entrada.");
      } else {
        toast.success("Inscrição realizada! ✅");
        setEmail("");
      }
    } catch {
      toast.error("Não foi possível cadastrar seu e-mail. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Always show text immediately — fallback from usePageSettings is used while loading.
  // This ensures the H1 (LCP element) renders on first paint without waiting for network.
  const displayTitle = headerTitle || "PqEstudar";
  const displayDescription = headerDescription || "Conteúdo organizado para você evoluir mais rápido.";

  return (
    <section className="relative overflow-hidden w-full bg-gradient-to-br from-background to-accent/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>

      <div className="container relative">
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-start pt-16 md:pt-20 pb-12 px-4 md:px-8 lg:px-12">
          <div className="flex flex-col gap-6 w-full max-w-4xl text-center">
            {/* Badge */}
            <div className="flex justify-center">
              <HeroBadge
                text="Aprovado por +400 mil seguidores"
                icon={<Sparkles className="h-4 w-4" />}
                variant="outline"
                size="md"
              />
            </div>

            {/* 
              Title — Always rendered immediately (no skeleton).
              The fallback text from usePageSettings is available synchronously.
              When the Supabase query resolves, the text updates in-place.
              min-h prevents CLS when text length changes between fallback and real value.
            */}
            <h1
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl min-h-[2.4em] sm:min-h-[2em]"
            >
              {renderHighlightedTitle(displayTitle)}
            </h1>

            {/* Description — always rendered, min-h for stability */}
            <p
              className="max-w-[42rem] mx-auto leading-normal text-muted-foreground sm:text-xl sm:leading-8 min-h-[3em] sm:min-h-[2em]"
            >
              {displayDescription}
            </p>

            {/* Email capture form */}
            <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
              <form
                onSubmit={handleSubmit}
                className="flex w-full items-center gap-1 rounded-full border border-border bg-card/60 backdrop-blur-sm px-2 py-2 shadow-md"
              >
                <Input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm px-3"
                  aria-label="Seu e-mail"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="rounded-full px-5 shrink-0 gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    "Receber novidades úteis"
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground/70 text-center">
                Sem spam. Você pode sair quando quiser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
