import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Construction } from "lucide-react";

const EmBreve = () => {
  return (
    <>
      <Helmet>
        <title>Em breve | PqEstudar</title>
        <meta name="description" content="Esta página está em construção. Em breve você terá acesso a este conteúdo no PqEstudar." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="min-h-[60vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto"
          >
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Construction className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Em construção
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Estamos preparando algo útil para você. Esta página ainda não está
              pronta, mas em breve estará disponível. Volte em breve!
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default EmBreve;
