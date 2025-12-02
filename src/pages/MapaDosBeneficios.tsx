import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Flame, CheckCircle, X, FileText, Users, Award, RefreshCw, Heart, Gift, Check, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// ============================================
// EDITABLE CONSTANTS - Change these as needed
// ============================================

// Framer Motion easing - typed as tuple
type EasingTuple = [number, number, number, number];
const ease: EasingTuple = [0.16, 1, 0.3, 1];
const CONFIG = {
  urgencyDate: "30/11/2025",
  checkoutBasico: "#CHECKOUT_LINK_BASICO",
  checkoutPremium: "#CHECKOUT_LINK_PREMIUM",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  videoPoster: "/placeholder.svg",
  timerEndDate: new Date(new Date().setHours(23, 59, 59, 999)),
  // End of today
  showStickyCta: true
};
const PRICES = {
  basicoAntigo: "R$ 67",
  basicoAtual: "R$ 9,90",
  premiumAntigo: "R$ 147",
  premiumAtual: "R$ 26,90",
  totalBonus: "R$ 97"
};
const BONUS_DATA = [{
  title: "50 Alongamentos Rápidos Antes das Dinâmicas",
  description: "Prepare seus alunos com alongamentos específicos para prevenir lesões e melhorar o desempenho",
  value: "R$ 27",
  icon: "🧘"
}, {
  title: "Jogos Interativos de Artes Marciais",
  description: "Atividades lúdicas que mantêm os alunos engajados no aprendizado",
  value: "R$ 37",
  icon: "🎮"
}, {
  title: "100 Questões de Artes Marciais",
  description: "Estimule técnica, estratégia e confiança nas artes marciais",
  value: "R$ 33",
  icon: "🎯"
}];
const TESTIMONIALS = [{
  name: "Maria Santos",
  role: "Instrutora de Artes Marciais",
  quote: '"Sempre foi difícil manter a atenção dos alunos nas aulas. Essas dinâmicas salvaram minhas aulas! Agora eles interagem, praticam com disciplina e o aprendizado flui naturalmente."',
  avatar: "/placeholder.svg"
}, {
  name: "Ana Costa",
  role: "Coordenadora de Academia",
  quote: '"Excelente para nossa academia! O material é bem elaborado e segue metodologias modernas de ensino de artes marciais."',
  avatar: "/placeholder.svg"
}, {
  name: "João Silva",
  role: "Pai de Aluno",
  quote: '"Meu filho se apaixonou pelas artes marciais com essas atividades. Vale muito a pena! Ele pede para treinar todos os dias."',
  avatar: "/placeholder.svg"
}];
const FAQ_DATA = [{
  question: "Como vou acessar o material após a compra?",
  answer: "Após a confirmação do pagamento, você receberá imediatamente por email o acesso ao material digital em PDF. Você poderá baixar e começar a usar as dinâmicas na mesma hora!"
}, {
  question: "Quais formas de pagamento são aceitas?",
  answer: "Aceitamos cartão de crédito, débito, PIX e boleto bancário. O acesso é liberado imediatamente após a confirmação do pagamento."
}, {
  question: "O material é realmente aplicável em qualquer estilo de artes marciais?",
  answer: "Sim! As dinâmicas foram desenvolvidas para serem adaptáveis a qualquer estilo de arte marcial, incluindo judô, jiu-jitsu, karatê, taekwondo, muay thai e outros."
}, {
  question: "Posso usar o material em minha academia/escola?",
  answer: "Sim! O material é ideal para uso em academias, escolas e centros de treinamento. Você pode aplicar as dinâmicas em suas aulas normalmente."
}, {
  question: "Como funciona a garantia de 7 dias?",
  answer: "Se por qualquer motivo você não ficar satisfeito com o material, basta solicitar o reembolso em até 7 dias após a compra. Devolvemos 100% do valor pago, sem perguntas."
}, {
  question: "As atividades servem para que idade?",
  answer: "As dinâmicas foram pensadas para todas as idades, desde crianças a partir de 4 anos até adultos. O material inclui adaptações para diferentes faixas etárias e níveis de habilidade."
}];

// Mock tracking function - replace with real analytics
const track = (event: string, data: Record<string, string>) => {
  console.log("[Analytics]", event, data);
  // TODO: Integrate with your analytics provider
};

// ============================================
// COMPONENTS
// ============================================

// Countdown Timer Hook
const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60) % 24),
          minutes: Math.floor(difference / 1000 / 60 % 60),
          seconds: Math.floor(difference / 1000 % 60)
        });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
};

// Urgency Bar Component
const UrgencyBar = ({
  date
}: {
  date: string;
}) => <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-2 px-4" role="status" aria-live="polite">
    <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm md:text-base">
      <Flame className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
      <span>DESCONTO SÓ HOJE NESSA PÁGINA {date}</span>
      <Flame className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
    </div>
  </div>;

// CTA Button Component
const CTAButton = ({
  children,
  href,
  section,
  plan,
  className,
  size = "lg"
}: {
  children: React.ReactNode;
  href: string;
  section: string;
  plan?: string;
  className?: string;
  size?: "default" | "lg";
}) => <motion.div whileHover={{
  scale: 1.02
}} whileTap={{
  scale: 0.98
}}>
    <Button asChild size={size} className={cn("bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 focus-visible:ring-emerald-500", size === "lg" && "text-lg px-8 py-6", className)} onClick={() => track("cta_click", {
    section,
    plan: plan || ""
  })} aria-label={children?.toString()}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </Button>
  </motion.div>;

// Hero Section
const HeroSection = () => <section className="relative py-12 md:py-20 px-4 bg-gradient-to-br from-rose-50 via-orange-50 to-rose-100">
    <div className="container max-w-5xl mx-auto text-center">
      <motion.p initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5,
      ease
    }} className="text-red-600 font-semibold text-sm md:text-base tracking-wide mb-4">
        OFERTA LIMITADA - ACESSO IMEDIATO
      </motion.p>

      <motion.h1 initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      delay: 0.1,
      ease
    }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
        <span className="text-foreground">+50 Benefícios</span>
        <br />
        <span className="text-red-600">Secretos do Governo que Você Pode Ter Direito</span>
        <br />
        <span className="text-foreground">+ Bônus</span>
      </motion.h1>

      <motion.p initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      delay: 0.2,
      ease
    }} className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
        <strong className="text-foreground">Acesso imediato ao guia completo</strong> que revela como acessar{" "}
        <strong className="text-foreground">auxílios, descontos, cursos e até dinheiro</strong> que já são seus por direito. 
        Material organizado <strong className="text-foreground">para qualquer cidadão, sem complicação</strong>.
      </motion.p>

      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.6,
      delay: 0.3,
      ease
    }} className="relative max-w-2xl mx-auto mb-6">
        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
          <iframe src={CONFIG.videoUrl} title="Apresentação das atividades interativas" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Apresentação das atividades interativas
        </p>
      </motion.div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      delay: 0.4,
      ease
    }}>
        <CTAButton href={CONFIG.checkoutPremium} section="hero" plan="premium">
          QUERO ACESSAR O MAPA SECRETO AGORA!
        </CTAButton>
      </motion.div>
    </div>
  </section>;

// What You'll Receive Section
const WhatYouReceiveSection = () => <section className="py-16 md:py-24 px-4 bg-background">
    <div className="container max-w-5xl mx-auto">
      <motion.h2 initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }} className="text-3xl md:text-4xl font-bold text-center mb-12 italic">
        O Que Você Vai Receber
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} whileInView={{
        opacity: 1,
        x: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        ease
      }}>
          <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">Material Completo em PDF</h3>
                  <ul className="space-y-2">
                    {["Mais de 50 benefícios, programas e auxílios compilados", "Link direto e instruções claras para cada benefício", "Acesso digital pelo celular, tablet ou computador", "Pronto para imprimir e consultar quando quiser"].map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2 */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} whileInView={{
        opacity: 1,
        x: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        delay: 0.1,
        ease
      }}>
          <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3">Para Qualquer Cidadão</h3>
                  <ul className="space-y-2">
                    {["Benefícios para jovens, adultos e idosos.", "Sem "juridiquês" ou termos técnicos."].map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  </section>;

// Why Choose Section
const WhyChooseSection = () => {
  const features = [{
    icon: Users,
    title: "Todas as Idades",
    description: "Atividades para todos os níveis de aprendizado de artes marciais"
  }, {
    icon: Award,
    title: "Metodologia Comprovada",
    description: "Material desenvolvido com técnicas pedagógicas modernas"
  }, {
    icon: RefreshCw,
    title: "Atualizações Mensais",
    description: "Novas atividades todos os meses, sem custo adicional"
  }, {
    icon: Heart,
    title: "Aprendizado Divertido",
    description: "Estratégias que tornam o ensino de artes marciais mais envolvente e interativo"
  }];
  return <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container max-w-5xl mx-auto">
        <motion.h2 initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        ease
      }} className="text-2xl md:text-4xl font-bold text-center mb-12 italic">
          Por Que Escolher as Dinâmicas de Artes Marciais?
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {features.map((feature, index) => <motion.div key={feature.title} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease
        }}>
              <Card className="h-full text-center shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>

        <div className="text-center">
          <CTAButton href={CONFIG.checkoutPremium} section="why-choose" plan="premium">
            QUERO AS DINÂMICAS DE ARTES MARCIAIS AGORA!
          </CTAButton>
        </div>
      </div>
    </section>;
};

// Bonus Section
const BonusSection = () => <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
    <div className="container max-w-5xl mx-auto">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }} className="text-center mb-10">
        <Badge className="bg-red-600 text-white mb-4 text-sm px-4 py-1">
          🎁 BÔNUS EXCLUSIVOS - VALOR {PRICES.totalBonus}
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Receba 3 Bônus Incríveis GRÁTIS!
        </h2>
        <p className="text-muted-foreground">
          Materiais extras que vão transformar suas aulas em experiências inesquecíveis
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {BONUS_DATA.map((bonus, index) => <motion.div key={bonus.title} initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease
      }}>
            <Card className="h-full shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                <span className="text-6xl">{bonus.icon}</span>
              </div>
              <CardContent className="p-5 text-center">
                <span className="text-2xl mb-2 block">{bonus.icon}</span>
                <h3 className="font-bold text-lg mb-2">{bonus.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{bonus.description}</p>
                <p className="text-red-600 font-bold">VALOR: {bonus.value}</p>
              </CardContent>
            </Card>
          </motion.div>)}
      </div>

      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} whileInView={{
      opacity: 1,
      scale: 1
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.5,
      ease
    }} className="text-center">
        <Card className="inline-block shadow-lg">
          <CardContent className="p-6">
            <p className="text-lg font-semibold">
              Total em bônus:{" "}
              <span className="text-red-600 line-through">{PRICES.totalBonus}</span>
            </p>
            <p className="text-2xl font-bold text-emerald-600">HOJE: GRÁTIS!</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </section>;

// Pricing Section
const PricingSection = () => {
  const {
    hours,
    minutes,
    seconds
  } = useCountdown(CONFIG.timerEndDate);
  const basicFeatures = [{
    text: "+150 Dinâmicas Interativas de Artes Marciais PDF",
    included: true
  }, {
    text: "Acesso imediato",
    included: true
  }, {
    text: "Metodologia comprovada",
    included: true
  }, {
    text: "Garantia de 7 dias",
    included: true
  }, {
    text: "Bônus exclusivos",
    included: false
  }, {
    text: "Atualizações mensais",
    included: false
  }];
  const premiumFeatures = [{
    text: "+150 Dinâmicas Interativas de Artes Marciais PDF",
    included: true
  }, {
    text: "Acesso imediato",
    included: true
  }, {
    text: "Metodologia comprovada",
    included: true
  }, {
    text: "Garantia de 7 dias",
    included: true
  }, {
    text: "BÔNUS: 50 Alongamentos Rápidos",
    included: true,
    isBonus: true
  }, {
    text: "BÔNUS: Jogos Interativos de Artes Marciais",
    included: true,
    isBonus: true
  }, {
    text: "BÔNUS: 100 Questões de Artes Marciais",
    included: true,
    isBonus: true
  }, {
    text: "Atualizações mensais",
    included: true
  }];
  return <section className="py-16 md:py-24 px-4 bg-background">
      <div className="container max-w-5xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6,
        ease
      }} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 italic">Escolha Seu Plano</h2>
          <p className="text-muted-foreground mb-6">OFERTA LIMITADA - TERMINA EM:</p>

          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[{
            value: hours,
            label: "Horas"
          }, {
            value: minutes,
            label: "Minutos"
          }, {
            value: seconds,
            label: "Segundos"
          }].map((unit, i) => <React.Fragment key={unit.label}>
                {i > 0 && <span className="text-2xl font-bold text-red-600">:</span>}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-red-200 flex items-center justify-center bg-card">
                    <span className="text-2xl md:text-3xl font-bold text-red-600">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {unit.label}
                  </span>
                </div>
              </React.Fragment>)}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Basic Plan */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          ease
        }}>
            <Card className="h-full shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-2xl font-bold text-center mb-2">Plano Básico</h3>
                <div className="text-center mb-2">
                  <span className="text-red-600 line-through text-lg">{PRICES.basicoAntigo}</span>{" "}
                  <span className="text-4xl font-bold text-emerald-600">{PRICES.basicoAtual}</span>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-6">pagamento único</p>

                <ul className="space-y-3 mb-8">
                  {basicFeatures.map((feature, i) => <li key={i} className="flex items-start gap-2">
                      {feature.included ? <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" /> : <X className="h-5 w-5 text-red-500 flex-shrink-0" />}
                      <span className={cn("text-sm", !feature.included && "text-muted-foreground")}>
                        {feature.text}
                      </span>
                    </li>)}
                </ul>

                <CTAButton href={CONFIG.checkoutBasico} section="pricing" plan="basico" className="w-full">
                  QUERO O BÁSICO
                </CTAButton>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.1,
          ease
        }}>
            <Card className="h-full shadow-xl border-2 border-red-500 relative scale-[1.02]">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1">
                MAIS POPULAR
              </Badge>
              <CardContent className="p-6 md:p-8 pt-8">
                <h3 className="text-2xl font-bold text-center mb-1">Plano Premium</h3>
                <p className="text-center text-xs text-muted-foreground mb-2">
                  +1.253 pessoas escolheram essa oferta
                </p>
                <div className="text-center mb-2">
                  <span className="text-red-600 line-through text-lg">{PRICES.premiumAntigo}</span>{" "}
                  <span className="text-4xl font-bold text-emerald-600">{PRICES.premiumAtual}</span>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-6">pagamento único</p>

                <ul className="space-y-3 mb-8">
                  {premiumFeatures.map((feature, i) => <li key={i} className="flex items-start gap-2">
                      {feature.isBonus ? <Gift className="h-5 w-5 text-red-500 flex-shrink-0" /> : <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                      <span className={cn("text-sm", feature.isBonus && "font-medium")}>
                        {feature.text}
                      </span>
                    </li>)}
                </ul>

                <CTAButton href={CONFIG.checkoutPremium} section="pricing" plan="premium" className="w-full">
                  QUERO O PREMIUM!
                </CTAButton>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>;
};

// Testimonials Section
const TestimonialsSection = () => <section className="py-16 md:py-24 px-4 bg-muted/30">
    <div className="container max-w-5xl mx-auto">
      <motion.h2 initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }} className="text-3xl md:text-4xl font-bold text-center mb-12 italic">
        O Que Dizem Nossos Instrutores
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, index) => <motion.div key={testimonial.name} initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease
      }}>
            <Card className="h-full shadow-md text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-400 mx-auto mb-4 overflow-hidden">
                  <img src={testimonial.avatar} alt={`Avatar de ${testimonial.name}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="font-bold">{testimonial.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{testimonial.role}</p>
                <p className="text-sm italic text-muted-foreground">{testimonial.quote}</p>
              </CardContent>
            </Card>
          </motion.div>)}
      </div>
    </div>
  </section>;

// About Author Section
const AboutAuthorSection = () => <section className="py-16 md:py-24 px-4 bg-background">
    <div className="container max-w-4xl mx-auto">
      <motion.h2 initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }} className="text-3xl md:text-4xl font-bold text-center mb-12 italic">
        Sobre o Autor
      </motion.h2>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }}>
        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-10">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="text-center">
                <div className="w-40 h-40 rounded-full ring-4 ring-red-500 mx-auto mb-4 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                  <img src="/placeholder.svg" alt="Mestre Carlos Ferreira" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold text-red-600">15+</p>
                    <p className="text-sm text-muted-foreground">Anos de Experiência</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">2.000+</p>
                    <p className="text-sm text-muted-foreground">Instrutores Formados</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-4" size="sm">
                  Faixa Preta
                </Button>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-1">Mestre Carlos Ferreira</h3>
                <p className="text-red-600 font-medium mb-4">Especialista em Artes Marciais</p>
                <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                  <p>
                    Graduado em <strong className="text-foreground">Educação Física</strong> pela{" "}
                    <strong className="text-foreground">Universidade Federal</strong> e especialista em{" "}
                    <strong className="text-foreground">Pedagogia das Artes Marciais</strong>, o Mestre
                    Carlos acumula mais de 15 anos de vivência com crianças e adultos em academias e
                    escolas.
                  </p>
                  <p>
                    Desenvolveu o{" "}
                    <strong className="text-foreground">Método Dinâmicas Interativas de Artes Marciais</strong>{" "}
                    após anos observando como os alunos aprendem técnicas marciais de forma mais efetiva:
                    através de jogos, atividades práticas e exercícios lúdicos.
                  </p>
                  <p>
                    Já formou mais de 2.000 instrutores em todo o Brasil e suas atividades são utilizadas
                    em centenas de academias e escolas para o ensino de disciplina, respeito e técnicas de
                    defesa pessoal.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </section>;

// FAQ Section
const FAQSection = () => <section className="py-16 md:py-24 px-4 bg-muted/30">
    <div className="container max-w-3xl mx-auto">
      <motion.h2 initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }} className="text-3xl md:text-4xl font-bold text-center mb-12">
        Perguntas Frequentes
      </motion.h2>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }}>
        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
          {FAQ_DATA.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-lg border shadow-sm px-4">
              <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>)}
        </Accordion>
      </motion.div>
    </div>
  </section>;

// Guarantee Section
const GuaranteeSection = () => <section className="py-16 md:py-24 px-4 bg-background">
    <div className="container max-w-4xl mx-auto">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }} className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <div className="w-40 h-40 flex items-center justify-center">
            <Shield className="w-32 h-32 text-amber-500" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Garantia Incondicional de 7 Dias
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Teste o material por 7 dias. Se não ficar 100% satisfeito, devolvemos seu dinheiro! Sem
            perguntas, sem complicações. Sua satisfação é nossa prioridade.
          </p>
        </div>
      </motion.div>
    </div>
  </section>;

// Final CTA Section
const FinalCTASection = () => <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
    <div className="container max-w-3xl mx-auto">
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} whileInView={{
      opacity: 1,
      scale: 1
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6,
      ease
    }}>
        <Card className="shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Não Perca Esta Oportunidade!
            </h2>
            <p className="text-muted-foreground mb-6">
              Ensine artes marciais de um jeito fácil e envolvente: são mais de 150 atividades prontas
              para tornar suas aulas inesquecíveis!
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Oferta limitada - acaba em breve!</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Garantia incondicional de 7 dias</span>
              </div>
            </div>

            <CTAButton href={CONFIG.checkoutPremium} section="final-cta" plan="premium" className="text-lg px-10 py-7">
              QUERO GARANTIR MINHA OFERTA AGORA!
            </CTAButton>

            <p className="text-xs text-muted-foreground mt-6">
              Acesso imediato • Pagamento 100% seguro • Garantia de 7 dias
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </section>;

// Sticky Mobile CTA
const StickyCTA = () => <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur border-t shadow-lg z-40 md:hidden">
    <CTAButton href={CONFIG.checkoutPremium} section="sticky" plan="premium" className="w-full" size="default">
      QUERO AGORA!
    </CTAButton>
  </div>;

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const MapaDosBeneficios = () => {
  return <>
      <Helmet>
        <title>+150 Dinâmicas Interativas de Artes Marciais | Oferta Especial</title>
        <meta name="description" content="Acesso imediato a mais de 150 dinâmicas interativas de artes marciais para instrutores, professores e academias. Material completo em PDF + 3 bônus exclusivos." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="+150 Dinâmicas Interativas de Artes Marciais" />
        <meta property="og:description" content="Acesso imediato a atividades interativas que estimulam técnica, disciplina e desenvolvimento." />
        <meta property="og:type" content="product" />
        <link rel="canonical" href="https://pqestudar.com.br/mapa-dos-beneficios" />
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "+150 Dinâmicas Interativas de Artes Marciais",
          description: "Material completo em PDF com mais de 150 dinâmicas interativas de artes marciais para instrutores, professores e academias.",
          offers: [{
            "@type": "Offer",
            name: "Plano Básico",
            price: "9.90",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock"
          }, {
            "@type": "Offer",
            name: "Plano Premium",
            price: "26.90",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock"
          }]
        })}
        </script>
      </Helmet>

      <main className="min-h-screen">
        <UrgencyBar date={CONFIG.urgencyDate} />
        <HeroSection />
        <WhatYouReceiveSection />
        <WhyChooseSection />
        <BonusSection />
        <PricingSection />
        <TestimonialsSection />
        <AboutAuthorSection />
        <FAQSection />
        <GuaranteeSection />
        <FinalCTASection />
        {CONFIG.showStickyCta && <StickyCTA />}
      </main>
    </>;
};
export default MapaDosBeneficios;