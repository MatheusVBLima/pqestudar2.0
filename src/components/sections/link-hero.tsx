import { motion } from "framer-motion";
import matheusHub from "@/assets/matheus-hub.png";

const ease = [0.16, 1, 0.3, 1] as const;

const LinkHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="flex flex-col items-center text-center space-y-6 mb-2"
    >
      {/* Foto de Perfil */}
      <div className="relative mx-auto inline-block p-[6px] rounded-full ring-2 ring-purple-500/70 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950 shadow-[0_10px_30px_rgba(140,0,255,.15)]">
        {/* Glow suave atrás */}
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-purple-500/20 blur-2xl" />
        <img
          src={matheusHub}
          alt="Foto de perfil de Matheus"
          width={176}
          height={176}
          className="size-40 md:size-44 rounded-full object-cover object-center"
        />
      </div>

      {/* Títulos */}
      <div className="space-y-3 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Matheus - O Hacker dos Estudos
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          400k+ de Seguidores. Eu te mostro como passar usando IA.
        </p>
      </div>
    </motion.div>
  );
};

export default LinkHero;
