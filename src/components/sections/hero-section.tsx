import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import HeroBadge from "@/components/ui/hero-badge";
import { Sparkles } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden w-full bg-gradient-to-br from-background to-accent/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>

      <div className="container relative">
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-8 px-4 md:px-8 lg:px-12">
          <div className="flex flex-col gap-4 w-full max-w-4xl text-center">
            {/* Badge */}
            <div className="flex justify-center">
              <HeroBadge
                text="Aprovado por +400 mil seguidores"
                icon={<Sparkles className="h-4 w-4" />}
                variant="outline"
                size="md"
              />
            </div>

            {/* Title */}
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              Os Segredos da Internet,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Revelados.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="max-w-[42rem] mx-auto leading-normal text-muted-foreground sm:text-xl sm:leading-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease }}
            >
              O arsenal completo com os hacks, ferramentas e benefícios que já foram vistos por milhões de pessoas. Explore ou receba as novas descobertas no seu e-mail.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease }}
            >
              <Button
                size="lg"
                onClick={() => navigate("/parceiros")}
                className={cn(
                  "gap-2 w-full sm:w-auto justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Explorar o Arsenal
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/assine")}
                className={cn(
                  "gap-2 w-full sm:w-auto justify-center border-primary text-primary hover:bg-primary/10"
                )}
              >
                Receber os Segredos
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}