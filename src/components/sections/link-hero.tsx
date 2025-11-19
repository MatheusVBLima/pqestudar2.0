import { motion } from "framer-motion";
import matheusHub from "@/assets/matheus-hub.png";

const ease = [0.16, 1, 0.3, 1] as const;

const LinkHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="flex flex-col items-center text-center space-y-4"
    >
      {/* Foto de Perfil */}
      <div className="relative">
        <div className="w-40 h-40 md:w-44 md:h-44 rounded-full ring-4 ring-primary/20 shadow-lg overflow-hidden">
          <img
            src={matheusHub}
            alt="Matheus - O Hacker dos Estudos"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Títulos */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Matheus - O Hacker dos Estudos
        </h1>
        <h2 className="text-base md:text-lg text-muted-foreground max-w-md">
          400k+ de Seguidores. Eu te mostro como passar usando IA.
        </h2>
      </div>
    </motion.div>
  );
};

export default LinkHero;
