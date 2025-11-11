import { useRef } from "react";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Youtube, Facebook, Share2 } from "lucide-react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ease = [0.16, 1, 0.3, 1] as const;

interface SocialIcon {
  name: string;
  icon: React.ReactNode;
  href: string;
  tooltip: string;
  delay: number;
}

const leftIcons: SocialIcon[] = [
  {
    name: "Instagram",
    icon: <Instagram className="h-6 w-6" />,
    href: "https://www.instagram.com/mdias.ofc/",
    tooltip: "412k+ Seguidores",
    delay: 0.1,
  },
  {
    name: "Threads",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.836 8.716c-.426-.241-.9-.43-1.41-.564a6.252 6.252 0 0 0-3.276.031c-1.804.48-3.238 1.574-4.023 3.077-.394.754-.592 1.588-.592 2.478 0 .89.198 1.724.592 2.478.785 1.503 2.219 2.597 4.023 3.077a6.252 6.252 0 0 0 3.276.031c.51-.134.984-.323 1.41-.564.854-.483 1.544-1.173 2.042-2.042.241-.426.43-.9.564-1.41a6.252 6.252 0 0 0-.031-3.276c-.48-1.804-1.574-3.238-3.077-4.023a6.252 6.252 0 0 0-2.478-.592c-.89 0-1.724.198-2.478.592-1.503.785-2.597 2.219-3.077 4.023a6.252 6.252 0 0 0-.031 3.276c.134.51.323.984.564 1.41.483.854 1.173 1.544 2.042 2.042.426.241.9.43 1.41.564a6.252 6.252 0 0 0 3.276-.031c1.804-.48 3.238-1.574 4.023-3.077.394-.754.592-1.588.592-2.478 0-.89-.198-1.724-.592-2.478-.785-1.503-2.219-2.597-4.023-3.077zm-4.698 7.562c-.668-.668-1.002-1.502-1.002-2.502s.334-1.834 1.002-2.502c.668-.668 1.502-1.002 2.502-1.002s1.834.334 2.502 1.002c.668.668 1.002 1.502 1.002 2.502s-.334 1.834-1.002 2.502c-.668.668-1.502 1.002-2.502 1.002s-1.834-.334-2.502-1.002z"/>
      </svg>
    ),
    href: "https://www.threads.com/@mdias.ofc",
    tooltip: "70k+ Seguidores",
    delay: 0.2,
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="h-6 w-6" />,
    href: "https://www.linkedin.com/in/mdiasofc/",
    tooltip: "Conexões Profissionais",
    delay: 0.3,
  },
];

const rightIcons: SocialIcon[] = [
  {
    name: "YouTube",
    icon: <Youtube className="h-6 w-6" />,
    href: "https://www.youtube.com/@mdias-ofc",
    tooltip: "Inscreva-se no Canal",
    delay: 0.4,
  },
  {
    name: "TikTok",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    href: "https://www.tiktok.com/@mdias.ofc",
    tooltip: "2.8k+ Seguidores",
    delay: 0.5,
  },
  {
    name: "Facebook",
    icon: <Facebook className="h-6 w-6" />,
    href: "https://www.facebook.com/profile.php?id=61577754095302",
    tooltip: "2.3k+ Seguidores",
    delay: 0.6,
  },
];

export function SocialProofSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 bg-background">
      <div className="container">
        <div className="flex flex-col items-center gap-12">
          {/* Title and Support Text */}
          <div className="flex flex-col items-center gap-6 text-center max-w-3xl">
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
            >
              Aprovado por uma{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">Comunidade de Milhões.</span>
            </motion.h2>

            <motion.p
              className="text-muted-foreground sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease }}
            >
              O conteúdo que você encontra aqui é o mesmo que já alcançou milhões de pessoas, ajudando-as a estudar de
              forma mais inteligente e a acelerar suas carreiras.
            </motion.p>
          </div>

          {/* Animated Hub */}
          <div
            ref={containerRef}
            className="relative grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center justify-items-center"
            style={{ height: "500px" }}
          >
            {/* Left Icons Column */}
            <div className="flex h-full flex-col items-start justify-around">
              {leftIcons.map((social, index) => (
                <TooltipProvider key={social.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        ref={(el) => (leftRefs.current[index] = el)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: social.delay, duration: 0.5, ease }}
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary"
                          aria-label={`${social.name} de Matheus Dias`}
                        >
                          {social.icon}
                        </a>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{social.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Center Hub Column */}
            <motion.div
              ref={hubRef}
              className="relative w-28 sm:w-32 md:w-40 lg:w-48 aspect-square rounded-full z-10 flex items-center justify-center bg-background border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary hover:scale-[1.02]"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
              role="img"
              aria-label="Símbolo de redes sociais"
            >
              <Share2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-primary" strokeWidth={1.5} />
            </motion.div>

            {/* Right Icons Column */}
            <div className="flex h-full flex-col items-end justify-around">
              {rightIcons.map((social, index) => (
                <TooltipProvider key={social.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        ref={(el) => (rightRefs.current[index] = el)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: social.delay, duration: 0.5, ease }}
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary"
                          aria-label={`${social.name} de Matheus Dias`}
                        >
                          {social.icon}
                        </a>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{social.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Animated Beams - Rendered on top of the grid */}
            {leftRefs.current.map((ref, index) => {
              if (ref && hubRef.current && containerRef.current) {
                return (
                  <AnimatedBeam
                    key={`left-${index}`}
                    containerRef={containerRef}
                    fromRef={{ current: ref }}
                    toRef={hubRef}
                    curvature={50}
                    duration={3 + index}
                    delay={index * 0.3}
                    pathColor="hsl(var(--border))"
                    pathWidth={2}
                    pathOpacity={0.3}
                    gradientStartColor="hsl(var(--primary))"
                    gradientStopColor="hsl(var(--primary) / 0.5)"
                  />
                );
              }
              return null;
            })}

            {rightRefs.current.map((ref, index) => {
              if (ref && hubRef.current && containerRef.current) {
                return (
                  <AnimatedBeam
                    key={`right-${index}`}
                    containerRef={containerRef}
                    fromRef={hubRef}
                    toRef={{ current: ref }}
                    curvature={-50}
                    reverse={true}
                    duration={3 + index}
                    delay={index * 0.3}
                    pathColor="hsl(var(--border))"
                    pathWidth={2}
                    pathOpacity={0.3}
                    gradientStartColor="hsl(var(--primary))"
                    gradientStopColor="hsl(var(--primary) / 0.5)"
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
