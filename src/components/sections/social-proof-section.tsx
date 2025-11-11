import { useRef } from "react";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Youtube, Facebook } from "lucide-react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import matheusHub from "@/assets/matheus-hub.png";

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
        <path d="M12.186 3.008c-1.964 0-3.672.488-5.093 1.453-.977.663-1.755 1.55-2.314 2.636l2.152 1.242c.394-.768.934-1.39 1.606-1.85.998-.683 2.246-1.029 3.71-1.029 1.293 0 2.361.27 3.178.803.817.534 1.226 1.28 1.226 2.238 0 .676-.216 1.23-.646 1.657-.43.426-1.082.76-1.946 1.004-1.37.39-2.407.894-3.113 1.51-.706.616-1.059 1.452-1.059 2.508 0 .982.312 1.82.934 2.51.622.69 1.47 1.148 2.542 1.374.286.06.579.108.878.142-.002.086-.004.172-.004.258 0 1.326.328 2.404.984 3.233.656.83 1.586 1.245 2.79 1.245 1.37 0 2.42-.512 3.148-1.536.728-1.024 1.092-2.422 1.092-4.194v-.258c1.646-.226 2.934-.792 3.864-1.698.93-.906 1.395-2.058 1.395-3.456 0-1.704-.629-3.05-1.887-4.04-1.258-.99-2.962-1.485-5.112-1.485zm0 1.5c1.87 0 3.346.426 4.428 1.278 1.082.852 1.623 1.992 1.623 3.42 0 1.11-.353 1.99-1.06 2.64-.707.65-1.708 1.078-3.004 1.284v-2.362c0-1.326-.328-2.404-.984-3.233-.656-.83-1.586-1.245-2.79-1.245-1.37 0-2.42.512-3.148 1.536-.728 1.024-1.092 2.422-1.092 4.194v.258c-1.646.226-2.934.792-3.864 1.698-.93.906-1.395 2.058-1.395 3.456 0 1.704.629 3.05 1.887 4.04 1.258.99 2.962 1.485 5.112 1.485 1.964 0 3.672-.488 5.093-1.453.977-.663 1.755-1.55 2.314-2.636l-2.152-1.242c-.394.768-.934 1.39-1.606 1.85-.998.683-2.246 1.029-3.71 1.029-1.293 0-2.361-.27-3.178-.803-.817-.534-1.226-1.28-1.226-2.238 0-.676.216-1.23.646-1.657.43-.426 1.082-.76 1.946-1.004 1.37-.39 2.407-.894 3.113-1.51.706-.616 1.059-1.452 1.059-2.508 0-.982-.312-1.82-.934-2.51-.622-.69-1.47-1.148-2.542-1.374-.286-.06-.579-.108-.878-.142.002-.086.004-.172.004-.258 0-1.326-.328-2.404-.984-3.233-.656-.83-1.586-1.245-2.79-1.245z" />
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
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Comunidade de Milhões.
              </span>
            </motion.h2>
            
            <motion.p
              className="text-muted-foreground sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease }}
            >
              O conteúdo que você encontra aqui é o mesmo que já alcançou milhões
              de pessoas, ajudando-as a estudar de forma mais inteligente e a
              acelerar suas carreiras.
            </motion.p>
          </div>

          {/* Animated Hub */}
          <div
            ref={containerRef}
            className="relative w-full max-w-6xl h-[400px] md:h-[500px] flex items-center justify-center"
          >
            {/* Left Icons */}
            <div className="absolute left-0 md:left-8 lg:left-16 flex flex-col gap-8 md:gap-12">
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

            {/* Center Hub */}
            <motion.div
              ref={hubRef}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
              className="relative z-10 aspect-square shrink-0 w-28 sm:w-32 md:w-40 lg:w-48 rounded-full ring-4 ring-primary overflow-hidden"
            >
              <img
                src={matheusHub}
                alt="Foto de Matheus Dias"
                className="w-full h-full object-cover object-center scale-105"
              />
            </motion.div>

            {/* Right Icons */}
            <div className="absolute right-0 md:right-8 lg:right-16 flex flex-col gap-8 md:gap-12">
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

            {/* Animated Beams - Left to Hub */}
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

            {/* Animated Beams - Hub to Right */}
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
