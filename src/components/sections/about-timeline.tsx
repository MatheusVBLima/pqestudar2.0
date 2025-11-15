import { useScroll, motion } from "framer-motion";
import { useRef } from "react";
import marcador1 from "@/assets/sobre-marcador-1.png";
import marcador2 from "@/assets/sobre-marcador-2.png";
import marcador3 from "@/assets/sobre-marcador-3.png";
import marcador4 from "@/assets/sobre-marcador-4.png";
interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  image?: string;
}
const timelineData: TimelineEntry[] = [{
  title: "A Frustração (2023)",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Por muito tempo, acreditei que o sucesso vinha de estudar mais, de sacrificar noites de sono e de viver para os livros. Eu estava errado. O resultado era sobrecarga, frustração e a sensação de não reter quase nada. Foi o ponto de partida para buscar uma forma mais inteligente de aprender.
        </p>
      </div>,
  image: marcador1
}, {
  title: "A Virada de Chave (2023)",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Descobri que o jogo não é sobre estudar mais, é sobre encontrar as ferramentas certas, os métodos corretos e os atalhos que a maioria das pessoas não conhece. Foi aí que tudo mudou para mim. Comecei a desvendar os segredos que ninguém compartilha: técnicas de memorização, automações que economizam horas e plataformas que entregam resultados reais.
        </p>
      </div>,
  image: marcador2
}, {
  title: "A Missão (2024)",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Quando comecei a compartilhar essas descobertas nas minhas redes sociais, algo incrível aconteceu: milhões de pessoas começaram a me acompanhar. Esse projeto nasceu desse propósito: democratizar o acesso aos segredos que aceleram carreiras e transformam vidas. Aqui, você não encontra promessas vazias. Você encontra ferramentas testadas, métodos validados e hacks que realmente funcionam.
        </p>
      </div>,
  image: marcador3
}, {
  title: "O Convite (2025)",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Agora é a sua vez. Se você está cansado do método tradicional e quer aprender o que realmente importa, este é o seu lugar. Explore as ferramentas, inscreva-se para receber os hacks semanais ou simplesmente comece a aplicar o que você encontrar aqui. Porque o conhecimento só é poderoso quando você age.
        </p>
      </div>,
  image: marcador4
}];
export function AboutTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 15%", "end 85%"]
  });
  return (
    <section 
      id="sobre-timeline" 
      ref={containerRef} 
      className="relative max-w-7xl mx-auto py-20 px-4 md:px-8"
    >
      {timelineData.map((item, index) => (
        <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
          <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
            <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-background flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-primary border-2 border-primary shadow-lg" />
            </div>
            <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-muted-foreground">
              {item.title}
            </h3>
          </div>

          <div className="relative pl-20 pr-4 md:pl-4 w-full">
            <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-foreground">
              {item.title}
            </h3>
            <div className="space-y-6">
              {item.content}
              {item.image && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="rounded-lg overflow-hidden shadow-lg"
                >
                  <img 
                    src={item.image} 
                    alt={`Ilustração: ${item.title}`} 
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Trilho estático */}
      <div 
        aria-hidden="true"
        className="absolute left-8 top-0 h-full w-[2px] bg-border/30"
      />
      
      {/* Linha de progresso dinâmica */}
      <motion.div
        aria-hidden="true"
        style={{ 
          scaleY: scrollYProgress, 
          transformOrigin: "top" 
        }}
        className="absolute left-8 top-0 h-full w-[2px] bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-full"
      />
    </section>
  );
}