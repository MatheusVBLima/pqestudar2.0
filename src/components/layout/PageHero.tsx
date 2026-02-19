import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  description: string;
  /** Optional badge/element rendered above the H1 (e.g. "Última atualização") */
  badge?: ReactNode;
  /** Optional extra content rendered below the description (e.g. subscription info) */
  children?: ReactNode;
}

export function PageHero({ title, description, badge, children }: PageHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="container mx-auto px-6 py-16 md:py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {badge}
          <h1 className="max-w-full md:max-w-4xl lg:max-w-[1100px] text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </h1>
          <p className="max-w-full md:max-w-3xl lg:max-w-[900px] text-lg md:text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
