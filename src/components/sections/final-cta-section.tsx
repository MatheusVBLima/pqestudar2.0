import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.16, 1, 0.3, 1] as const;

export function FinalCtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="rounded-[1.2rem] border border-border/40 bg-muted/30 p-8 md:p-14 lg:p-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="flex flex-col items-center gap-6 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Encontre o próximo recurso certo para você
            </h2>
            <p className="text-muted-foreground sm:text-lg leading-relaxed">
              Ferramentas, concursos e conteúdos práticos reunidos em um só lugar para você aprender, se organizar e avançar mais rápido.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link to="/ferramentas">
                <Button size="lg" className="gap-2 rounded-[1.2rem] w-full sm:w-auto">
                  <Search className="h-4 w-4" />
                  Explorar Ferramentas
                </Button>
              </Link>
              <Link to="/concursos">
                <Button size="lg" variant="outline" className="gap-2 rounded-[1.2rem] w-full sm:w-auto">
                  Ver Concursos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
