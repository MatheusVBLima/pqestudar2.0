import { useMotionValueEvent, useScroll, useTransform, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  title: "A Frustração",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Você já se sentiu sobrecarregado com a quantidade de coisas que precisa aprender? Já passou horas estudando para sentir que não reteve quase nada? Eu já. Por muito tempo, acreditei que o sucesso vinha de estudar mais, de sacrificar noites de sono e de viver para os livros.
        </p>
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Eu estava errado.
        </p>
      </div>,
  image: marcador1
}, {
  title: "A Virada de Chave",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Descobri que o jogo não é sobre estudar mais, é sobre estudar de forma mais inteligente. É sobre encontrar as ferramentas certas, os métodos corretos e os atalhos que a maioria das pessoas não conhece.
        </p>
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Foi aí que tudo mudou para mim. Comecei a desvendar os segredos que ninguém compartilha: técnicas de memorização, automações que economizam horas e plataformas que entregam resultados reais.
        </p>
      </div>,
  image: marcador2
}, {
  title: "A Missão",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Quando comecei a compartilhar essas descobertas nas minhas redes sociais, algo incrível aconteceu: milhões de pessoas começaram a me acompanhar. Não porque eu era especial, mas porque eu estava mostrando o que funciona de verdade.
        </p>
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Esse projeto nasceu desse propósito: democratizar o acesso aos segredos que aceleram carreiras e transformam vidas. Aqui, você não encontra promessas vazias. Você encontra ferramentas testadas, métodos validados e hacks que realmente funcionam.
        </p>
      </div>,
  image: marcador3
}, {
  title: "O Convite",
  content: <div className="space-y-4">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Agora é a sua vez. Se você está cansado do método tradicional e quer aprender o que realmente importa, este é o seu lugar.
        </p>
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Explore as ferramentas, inscreva-se para receber os hacks semanais ou simplesmente comece a aplicar o que você encontrar aqui. Porque o conhecimento só é poderoso quando você age.
        </p>
      </div>,
  image: marcador4
}];
export function AboutTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);
  const {
    scrollYProgress
  } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"]
  });
  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  return <div className="w-full bg-background font-sans md:px-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-3xl md:text-4xl mb-4 font-bold text-foreground max-w-4xl">
          Minha Jornada
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mb-8">
          Você já se sentiu sobrecarregado com a quantidade de coisas que precisa aprender? Já passou horas estudando para sentir que não reteve quase nada? Eu já. Por muito tempo, acreditei que o sucesso vinha de estudar mais, de sacrificar noites de sono e de viver para os livros.


Eu estava errado.


Descobri que o jogo não é sobre estudar mais, é sobre estudar de forma mais inteligente. É sobre encontrar as ferramentas certas, os métodos corretos e os atalhos que a maioria das pessoas não conhece.


        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {timelineData.map((item, index) => <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
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
                {item.image && <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} viewport={{
              once: true,
              margin: "-100px"
            }} className="rounded-lg overflow-hidden shadow-lg">
                    <img src={item.image} alt={`Ilustração: ${item.title}`} loading="lazy" className="w-full h-auto object-cover" />
                  </motion.div>}
              </div>
            </div>
          </div>)}
        <div style={{
        height: height + "px"
      }} className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-border to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">
          <motion.div style={{
          height: heightTransform,
          opacity: opacityTransform
        }} className="absolute inset-x-0 top-0 w-[2px] bg-primary rounded-full" />
        </div>
      </div>
    </div>;
}