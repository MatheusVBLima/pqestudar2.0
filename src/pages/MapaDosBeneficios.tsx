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
// BRAND_TOKENS - AJUSTE FÁCIL DE CORES E FONTES
// ============================================
// Esses valores herdam do design system do PqEstudar (index.css / tailwind.config.ts).
// Para customizar, altere os valores HSL abaixo.
// IMPORTANTE: Use formato HSL (ex: "300 100% 25%") sem "hsl()" wrapper.

const BRAND_TOKENS = {
  // Cores principais do PqEstudar
  primary: "300 100% 25%",        // Roxo principal (--primary do site)
  primaryLight: "300 80% 35%",    // Roxo mais claro para gradientes
  
  // Cores de ação
  green: "145 63% 42%",           // Verde dos CTAs (emerald-600 equivalente)
  greenHover: "145 63% 36%",      // Verde hover (emerald-700 equivalente)
  red: "0 84% 60%",               // Vermelho para preços (--destructive do site)
  orange: "25 95% 53%",           // Laranja para badges de urgência
  
  // Fundos e superfícies
  background: "0 0% 98%",         // Fundo claro (--background do site)
  card: "0 0% 100%",              // Fundo de cards
  muted: "300 10% 96%",           // Fundo muted (--muted do site)
  
  // Texto
  foreground: "0 0% 14%",         // Texto principal (--foreground do site)
  mutedForeground: "0 0% 45%",    // Texto secundário
  
  // Bordas e raios
  border: "300 20% 90%",          // Borda (--border do site)
  radius: "0.75rem",              // Raio padrão (12px)
  radiusLg: "1rem",               // Raio grande (16px)
  
  // Sombras
  shadow: "0 4px 20px -8px hsl(300 20% 20% / 0.1)",
  shadowLg: "0 10px 40px -15px hsl(300 100% 25% / 0.2)",
  
  // Fontes - herda do sistema do site
  fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
};

// ============================================
// EDITABLE CONSTANTS - Change these as needed
// ============================================

type EasingTuple = [number, number, number, number];
const ease: EasingTuple = [0.16, 1, 0.3, 1];

const CONFIG = {
  urgencyDate: "30/11/2025",
  checkoutBasico: "#CHECKOUT_LINK_BASICO",
  checkoutPremium: "#CHECKOUT_LINK_PREMIUM",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  videoPoster: "/placeholder.svg",
  timerEndDate: new Date(new Date().setHours(23, 59, 59, 999)),
  showStickyCta: true
};

const PRICES = {
  basicoAntigo: "R$ 47",
  basicoAtual: "R$ 10",
  premiumAntigo: "R$ 256",
  premiumAtual: "R$ 27,00",
  totalBonus: "R$ 111"
};

const BONUS_DATA = [{
  title: "Guia de Renegociação de Dívidas",
  description: "Scripts e estratégias para negociar suas dívidas com bancos e financeiras, conseguindo até 90% de desconto.",
  value: "R$ 37",
  icon: "📋"
}, {
  title: "Kit de Sites para Renda Extra",
  description: "Uma lista curada com 30 sites confiáveis para você ganhar dinheiro online nas suas horas vagas, como freelancer ou respondendo pesquisas.",
  value: "R$ 47",
  icon: "💰"
}, {
  title: "Checklist do Imposto de Renda para Iniciantes",
  description: "O passo a passo para declarar seu Imposto de Renda sem erros e evitar cair na malha fina, mesmo que seja sua primeira vez.",
  value: "R$ 27",
  icon: "✅"
}];

const TESTIMONIALS = [{
  name: "Maria S.",
  role: "Dona de Casa",
  quote: '"Eu nem imaginava que tinha direito à tarifa social de energia. Só com essa dica do Matheus, já economizei o valor do guia em um único mês. Incrível!"',
  avatar: "/placeholder.svg"
}, {
  name: "João P.",
  role: "Estudante",
  quote: '"Sempre quis fazer um curso técnico mas não podia pagar. Com o guia, descobri um programa de bolsas de 100% na minha cidade que eu nem sabia que existia. Já estou matriculado!"',
  avatar: "/placeholder.svg"
}, {
  name: "Carlos A.",
  role: "Autônomo",
  quote: '"Tinha um dinheiro do PIS esquecido há anos e não fazia ideia. O passo a passo do guia foi tão simples que resolvi em 10 minutos pelo celular. Valeu demais!"',
  avatar: "/placeholder.svg"
}];

const FAQ_DATA = [{
  question: "Como vou acessar o material após a compra?",
  answer: "Após a confirmação do pagamento, você receberá imediatamente por e-mail o acesso ao material digital em PDF. Você poderá baixar e começar a descobrir seus benefícios na mesma hora!"
}, {
  question: "Quais formas de pagamento são aceitas?",
  answer: "Aceitamos Cartão de Crédito e PIX. O acesso é liberado imediatamente para compras no Cartão e PIX após a confirmação do pagamento."
}, {
  question: "Os benefícios servem para qualquer pessoa?",
  answer: "Sim! O guia foi desenvolvido para ser aplicável a todos os brasileiros. Ele inclui benefícios para diferentes faixas de renda, idades, situações profissionais (CLT, autônomo, estudante) e regiões do país."
}, {
  question: "Preciso ter conhecimento técnico para usar o guia?",
  answer: "Não! O material foi criado com uma linguagem 100% simples e com links diretos, pensando em quem não tem familiaridade com a burocracia do governo. O objetivo é ser fácil e direto."
}, {
  question: "Como funciona a garantia de 7 dias?",
  answer: "Se por qualquer motivo você não ficar satisfeito com o material, basta solicitar o reembolso em até 7 dias após a compra. Devolvemos 100% do valor pago, sem perguntas."
}, {
  question: "Para quem o guia é recomendado?",
  answer: "O guia foi pensado para todas as idades, desde jovens a partir dos 16 anos (ID Jovem, ProUni) até idosos (BPC, isenções). O material inclui benefícios que se adaptam a diferentes fases da vida e necessidades."
}];

const track = (event: string, data: Record<string, string>) => {
  console.log("[Analytics]", event, data);
};

// ============================================
// BRAND THEME WRAPPER - Escopo apenas nesta página
// ============================================

const BrandThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const brandStyles = {
    '--brand-primary': BRAND_TOKENS.primary,
    '--brand-primary-light': BRAND_TOKENS.primaryLight,
    '--brand-green': BRAND_TOKENS.green,
    '--brand-green-hover': BRAND_TOKENS.greenHover,
    '--brand-red': BRAND_TOKENS.red,
    '--brand-orange': BRAND_TOKENS.orange,
    '--brand-bg': BRAND_TOKENS.background,
    '--brand-card': BRAND_TOKENS.card,
    '--brand-muted': BRAND_TOKENS.muted,
    '--brand-foreground': BRAND_TOKENS.foreground,
    '--brand-muted-foreground': BRAND_TOKENS.mutedForeground,
    '--brand-border': BRAND_TOKENS.border,
    '--brand-radius': BRAND_TOKENS.radius,
    '--brand-radius-lg': BRAND_TOKENS.radiusLg,
    '--brand-shadow': BRAND_TOKENS.shadow,
    '--brand-shadow-lg': BRAND_TOKENS.shadowLg,
  } as React.CSSProperties;

  return (
    <div 
      className="brand-scope min-h-screen" 
      style={{
        ...brandStyles,
        fontFamily: BRAND_TOKENS.fontSans,
        background: `hsl(${BRAND_TOKENS.background})`,
        color: `hsl(${BRAND_TOKENS.foreground})`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// COMPONENTS
// ============================================

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
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
};

// Urgency Bar - Vermelho para urgência (psicologia das cores)
const UrgencyBar = ({ date }: { date: string }) => (
  <div 
    className="sticky top-0 z-50 py-2.5 px-4" 
    style={{ background: `hsl(${BRAND_TOKENS.red})` }}
    role="status" 
    aria-live="polite"
  >
    <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm md:text-base">
      <Flame className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
      <span>DESCONTO SÓ HOJE NESSA PÁGINA {date}</span>
      <Flame className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
    </div>
  </div>
);

// CTA Button - Verde do PqEstudar
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
}) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Button 
      asChild 
      size={size} 
      className={cn(
        "font-bold text-white transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        size === "lg" && "text-lg px-8 py-6",
        className
      )} 
      style={{
        background: `hsl(${BRAND_TOKENS.green})`,
        boxShadow: BRAND_TOKENS.shadowLg,
        borderRadius: BRAND_TOKENS.radiusLg,
      }}
      onClick={() => track("cta_click", { section, plan: plan || "" })} 
      aria-label={children?.toString()}
    >
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:opacity-90"
        style={{ '--tw-ring-color': `hsl(${BRAND_TOKENS.green})` } as React.CSSProperties}
      >
        {children}
      </a>
    </Button>
  </motion.div>
);

// Styled Card - usa tokens da marca
const BrandCard = ({ 
  children, 
  className,
  highlight = false,
  highlightGreen = false
}: { 
  children: React.ReactNode; 
  className?: string;
  highlight?: boolean;
  highlightGreen?: boolean;
}) => (
  <Card 
    className={cn("h-full transition-shadow", className)} 
    style={{
      background: `hsl(${BRAND_TOKENS.card})`,
      borderRadius: BRAND_TOKENS.radiusLg,
      boxShadow: (highlight || highlightGreen) ? BRAND_TOKENS.shadowLg : BRAND_TOKENS.shadow,
      border: highlightGreen 
        ? `2px solid hsl(${BRAND_TOKENS.green})` 
        : highlight 
          ? `2px solid hsl(${BRAND_TOKENS.primary})` 
          : `1px solid hsl(${BRAND_TOKENS.border})`,
    }}
  >
    {children}
  </Card>
);

// Price Display - Preço antigo em vermelho, atual em verde
const PriceDisplay = ({ 
  oldPrice, 
  currentPrice, 
  showOld = true 
}: { 
  oldPrice: string; 
  currentPrice: string; 
  showOld?: boolean;
}) => (
  <div className="mb-2">
    {showOld && (
      <span 
        className="line-through text-lg mr-2" 
        style={{ color: `hsl(${BRAND_TOKENS.red})` }}
      >
        {oldPrice}
      </span>
    )}
    <span 
      className="text-4xl font-bold" 
      style={{ color: `hsl(${BRAND_TOKENS.green})` }}
    >
      {currentPrice}
    </span>
  </div>
);

// Hero Section
const HeroSection = () => (
  <section 
    className="relative py-12 md:py-20 px-4"
    style={{ 
      background: `linear-gradient(135deg, hsl(${BRAND_TOKENS.muted}), hsl(${BRAND_TOKENS.background}))` 
    }}
  >
    <div className="container max-w-5xl mx-auto text-center">
      <motion.p 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease }}
        className="font-semibold text-sm md:text-base tracking-wide mb-4"
        style={{ color: `hsl(${BRAND_TOKENS.primary})` }}
      >
        OFERTA LIMITADA - ACESSO IMEDIATO
      </motion.p>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
        style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
      >
        <span>+50 Benefícios</span>
        <br />
        <span style={{ color: `hsl(${BRAND_TOKENS.primary})` }}>
          Secretos do Governo que Você Pode Ter Direito
        </span>
        <br />
        <span>+ Bônus</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.2, ease }}
        className="text-base md:text-lg max-w-2xl mx-auto mb-8"
        style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}
      >
        <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>Acesso imediato ao guia completo</strong> que revela como acessar{" "}
        <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>auxílios, descontos, cursos e até dinheiro</strong> que já são seus por direito. 
        Material organizado <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>para qualquer cidadão, sem complicação</strong>.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.6, delay: 0.3, ease }}
        className="relative max-w-2xl mx-auto mb-6"
      >
        <div 
          className="aspect-video overflow-hidden bg-black"
          style={{ 
            borderRadius: BRAND_TOKENS.radiusLg, 
            boxShadow: BRAND_TOKENS.shadowLg 
          }}
        >
          <iframe 
            src={CONFIG.videoUrl} 
            title="Apresentação das atividades interativas" 
            className="w-full h-full" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen 
            loading="lazy" 
          />
        </div>
        <p 
          className="text-sm mt-3"
          style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}
        >
          Apresentação das atividades interativas
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.4, ease }}
      >
        <CTAButton href={CONFIG.checkoutPremium} section="hero" plan="premium">
          QUERO ACESSAR O MAPA SECRETO AGORA!
        </CTAButton>
      </motion.div>
    </div>
  </section>
);

// What You'll Receive Section
const WhatYouReceiveSection = () => (
  <section 
    className="py-16 md:py-24 px-4"
    style={{ background: `hsl(${BRAND_TOKENS.background})` }}
  >
    <div className="container max-w-5xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
        className="text-3xl md:text-4xl font-bold text-center mb-12"
        style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
      >
        O Que Você Vai Receber
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.5, ease }}
        >
          <BrandCard>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `hsl(${BRAND_TOKENS.primary} / 0.1)` }}
                >
                  <FileText className="h-6 w-6" style={{ color: `hsl(${BRAND_TOKENS.primary})` }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>
                    Material Completo em PDF
                  </h3>
                  <ul className="space-y-2">
                    {["Mais de 50 benefícios, programas e auxílios compilados", "Link direto e instruções claras para cada benefício", "Acesso digital pelo celular, tablet ou computador", "Pronto para imprimir e consultar quando quiser"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: `hsl(${BRAND_TOKENS.green})` }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </BrandCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          <BrandCard>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `hsl(${BRAND_TOKENS.primary} / 0.1)` }}
                >
                  <Users className="h-6 w-6" style={{ color: `hsl(${BRAND_TOKENS.primary})` }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>
                    Para Qualquer Cidadão
                  </h3>
                  <ul className="space-y-2">
                    {["Benefícios para jovens, adultos e idosos.", "Sem 'juridiquês' ou termos técnicos.", "Ideal para trabalhadores, estudantes, autônomos e aposentados.", "Economize tempo e dinheiro com informações que valem ouro."].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                        <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: `hsl(${BRAND_TOKENS.green})` }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </BrandCard>
        </motion.div>
      </div>
    </div>
  </section>
);

// Why Choose Section
const WhyChooseSection = () => {
  const features = [{
    icon: Gift,
    title: "Economia Real",
    description: "Descubra como pagar contas de luz mais baratas, conseguir medicamentos de graça e acessar dinheiro esquecido."
  }, {
    icon: Award,
    title: "Oportunidades Únicas",
    description: "Acesse vagas em cursos gratuitos, programas de moradia e financiamentos com juros baixos que não são divulgados na mídia."
  }, {
    icon: FileText,
    title: "Fim da Burocracia",
    description: "Chega de se sentir perdido em sites do governo. Nós te damos o link direto e o passo a passo exato do que fazer."
  }, {
    icon: Shield,
    title: "Conhecimento é Poder",
    description: "Pare de perder dinheiro e oportunidades por falta de informação. Tenha o controle dos seus direitos na palma da sua mão."
  }];

  return (
    <section 
      className="py-16 md:py-24 px-4"
      style={{ background: `hsl(${BRAND_TOKENS.muted})` }}
    >
      <div className="container max-w-5xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6, ease }}
          className="text-2xl md:text-4xl font-bold text-center mb-12"
          style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
        >
          Por Que Você Precisa Desse Mapa?
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: index * 0.1, ease }}
            >
              <BrandCard>
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: `hsl(${BRAND_TOKENS.primary} / 0.1)` }}
                  >
                    <feature.icon className="h-7 w-7" style={{ color: `hsl(${BRAND_TOKENS.primary})` }} />
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                    {feature.description}
                  </p>
                </CardContent>
              </BrandCard>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <CTAButton href={CONFIG.checkoutPremium} section="why-choose" plan="premium">
            QUERO MEUS BENEFÍCIOS AGORA!
          </CTAButton>
        </div>
      </div>
    </section>
  );
};

// Bonus Section
const BonusSection = () => (
  <section 
    className="py-16 md:py-24 px-4"
    style={{ 
      background: `linear-gradient(135deg, hsl(${BRAND_TOKENS.muted}), hsl(${BRAND_TOKENS.background}))` 
    }}
  >
    <div className="container max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
        className="text-center mb-10"
      >
        <Badge 
          className="mb-4 text-sm px-4 py-1 text-white"
          style={{ 
            background: `hsl(${BRAND_TOKENS.primary})`,
            borderRadius: BRAND_TOKENS.radius,
          }}
        >
          🎁 BÔNUS EXCLUSIVOS - VALOR TOTAL {PRICES.totalBonus}
        </Badge>
        <h2 
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
        >
          Receba 3 Guias Incríveis GRÁTIS
        </h2>
        <p style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
          Materiais extras que vão colocar ainda mais dinheiro no seu bolso e proteger seu futuro.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {BONUS_DATA.map((bonus, index) => (
          <motion.div 
            key={bonus.title} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5, delay: index * 0.1, ease }}
          >
            <BrandCard className="overflow-hidden">
              <div 
                className="h-48 flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, hsl(${BRAND_TOKENS.primary} / 0.2), hsl(${BRAND_TOKENS.primaryLight} / 0.3))` 
                }}
              >
                <span className="text-6xl">{bonus.icon}</span>
              </div>
              <CardContent className="p-5 text-center">
                <span className="text-2xl mb-2 block">{bonus.icon}</span>
                <h3 className="font-bold text-lg mb-2" style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>
                  {bonus.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                  {bonus.description}
                </p>
                <p className="font-bold" style={{ color: `hsl(${BRAND_TOKENS.red})` }}>
                  VALOR: {bonus.value}
                </p>
              </CardContent>
            </BrandCard>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        whileInView={{ opacity: 1, scale: 1 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.5, ease }}
        className="text-center"
      >
        <BrandCard className="inline-block">
          <CardContent className="p-6">
            <p className="text-lg font-semibold" style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>
              Total em bônus:{" "}
              <span className="line-through" style={{ color: `hsl(${BRAND_TOKENS.red})` }}>
                {PRICES.totalBonus}
              </span>
            </p>
            <p className="text-2xl font-bold" style={{ color: `hsl(${BRAND_TOKENS.green})` }}>
              HOJE: GRÁTIS!
            </p>
          </CardContent>
        </BrandCard>
      </motion.div>
    </div>
  </section>
);

// Pricing Section
const PricingSection = () => {
  const { hours, minutes, seconds } = useCountdown(CONFIG.timerEndDate);
  
  const basicFeatures = [
    { text: "+50 Benefícios Ocultos PDF", included: true },
    { text: "Acesso imediato", included: true },
    { text: "Garantia de 7 dias", included: true },
    { text: "Bônus exclusivos", included: false },
    { text: "Atualizações futuras", included: false }
  ];
  
  const premiumFeatures = [
    { text: "+50 Benefícios Ocultos PDF", included: true },
    { text: "Acesso imediato", included: true },
    { text: "Garantia de 7 dias", included: true },
    { text: "BÔNUS: Guia de Renegociação", included: true, isBonus: true },
    { text: "BÔNUS: Kit Renda Extra", included: true, isBonus: true },
    { text: "BÔNUS: Checklist do IR", included: true, isBonus: true },
    { text: "Atualizações por 1 ano", included: true }
  ];

  return (
    <section 
      className="py-16 md:py-24 px-4"
      style={{ background: `hsl(${BRAND_TOKENS.background})` }}
    >
      <div className="container max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6, ease }}
          className="text-center mb-10"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
          >
            Escolha Seu Plano
          </h2>
          
          {/* Timer - Vermelho para urgência (psicologia das cores) */}
          <div 
            className="flex flex-col items-center px-8 py-4 md:px-12 md:py-5 w-full max-w-xl mx-auto"
            style={{ 
              background: `hsl(${BRAND_TOKENS.red})`,
              borderRadius: BRAND_TOKENS.radiusLg,
              boxShadow: `0 10px 40px -15px hsl(${BRAND_TOKENS.red} / 0.4)`,
            }}
            role="timer"
            aria-label="Tempo restante da oferta"
          >
            <p className="text-white/90 text-sm md:text-base font-medium mb-2">
              OFERTA LIMITADA - TERMINA EM:
            </p>
            <div className="flex items-center gap-3 md:gap-4">
              {[
                { value: hours, label: "HORAS" },
                { value: minutes, label: "MINUTOS" },
                { value: seconds, label: "SEGUNDOS" }
              ].map((unit, i) => (
                <React.Fragment key={unit.label}>
                  {i > 0 && <span className="text-2xl md:text-3xl font-bold text-white">:</span>}
                  <div className="text-center">
                    <span className="text-3xl md:text-4xl font-bold text-white block">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] md:text-xs text-white/80 font-medium">
                      {unit.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Basic Plan */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5, ease }}
          >
            <BrandCard>
              <CardContent className="p-6 md:p-8">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
                >
                  Plano Básico
                </h3>
                <PriceDisplay oldPrice={PRICES.basicoAntigo} currentPrice={PRICES.basicoAtual} />
                <p 
                  className="text-sm mb-6"
                  style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}
                >
                  pagamento único
                </p>

                <ul className="space-y-3 mb-8">
                  {basicFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 flex-shrink-0" style={{ color: `hsl(${BRAND_TOKENS.green})` }} />
                      ) : (
                        <X className="h-5 w-5 flex-shrink-0" style={{ color: `hsl(${BRAND_TOKENS.red})` }} />
                      )}
                      <span 
                        className={cn("text-sm")}
                        style={{ color: feature.included ? `hsl(${BRAND_TOKENS.foreground})` : `hsl(${BRAND_TOKENS.mutedForeground})` }}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <CTAButton href={CONFIG.checkoutBasico} section="pricing" plan="basico" className="w-full">
                  QUERO O BÁSICO
                </CTAButton>
              </CardContent>
            </BrandCard>
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <BrandCard highlightGreen className="relative scale-[1.02]">
              <Badge 
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-white px-4 py-1"
                style={{ 
                  background: `hsl(${BRAND_TOKENS.green})`,
                  borderRadius: BRAND_TOKENS.radius,
                }}
              >
                MAIS POPULAR
              </Badge>
              <CardContent className="p-6 md:p-8 pt-8">
                <p 
                  className="text-xs mb-1"
                  style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}
                >
                  +1.253 pessoas escolheram essa oferta
                </p>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
                >
                  Plano Premium
                </h3>
                <PriceDisplay oldPrice={PRICES.premiumAntigo} currentPrice={PRICES.premiumAtual} />
                <p 
                  className="text-sm mb-6"
                  style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}
                >
                  pagamento único
                </p>

                <ul className="space-y-3 mb-8">
                  {premiumFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.isBonus ? (
                        <Gift className="h-5 w-5 flex-shrink-0" style={{ color: `hsl(${BRAND_TOKENS.primary})` }} />
                      ) : (
                        <Check className="h-5 w-5 flex-shrink-0" style={{ color: `hsl(${BRAND_TOKENS.green})` }} />
                      )}
                      <span 
                        className={cn("text-sm", feature.isBonus && "font-medium")}
                        style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <CTAButton href={CONFIG.checkoutPremium} section="pricing" plan="premium" className="w-full">
                  QUERO O PREMIUM!
                </CTAButton>
              </CardContent>
            </BrandCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => (
  <section 
    className="py-16 md:py-24 px-4"
    style={{ background: `hsl(${BRAND_TOKENS.muted})` }}
  >
    <div className="container max-w-5xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
        className="text-3xl md:text-4xl font-bold text-center mb-12"
        style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
      >
        O Que Dizem Nossos Leitores
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div 
            key={testimonial.name} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.5, delay: index * 0.1, ease }}
          >
            <BrandCard className="text-center">
              <CardContent className="p-6">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${BRAND_TOKENS.primary}), hsl(${BRAND_TOKENS.primaryLight}))` 
                  }}
                >
                  <img 
                    src={testimonial.avatar} 
                    alt={`Avatar de ${testimonial.name}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                  />
                </div>
                <h3 className="font-bold" style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>
                  {testimonial.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                  {testimonial.role}
                </p>
                <p className="text-sm italic" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                  {testimonial.quote}
                </p>
              </CardContent>
            </BrandCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// About Author Section
const AboutAuthorSection = () => (
  <section 
    className="py-16 md:py-24 px-4"
    style={{ background: `hsl(${BRAND_TOKENS.background})` }}
  >
    <div className="container max-w-4xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
        className="text-3xl md:text-4xl font-bold text-center mb-12"
        style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
      >
        Sobre o Autor
      </motion.h2>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
      >
        <BrandCard highlight>
          <CardContent className="p-6 md:p-10">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="text-center">
                <div 
                  className="w-40 h-40 rounded-full mx-auto mb-4 overflow-hidden"
                  style={{ 
                    boxShadow: `0 0 0 4px hsl(${BRAND_TOKENS.primary})`,
                    background: `linear-gradient(135deg, hsl(${BRAND_TOKENS.muted}), hsl(${BRAND_TOKENS.border}))`,
                  }}
                >
                  <img 
                    alt="Matheus Dias" 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                    src="/lovable-uploads/eef30a09-d048-4db6-994f-c33c8dee49e8.png" 
                  />
                </div>
                <div className="space-y-2">
                  {[
                    { value: "4+", label: "Anos de Experiência" },
                    { value: "50+", label: "Milhões de Visualizações" },
                    { value: "400+", label: "Mil Seguidores" }
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-3xl font-bold" style={{ color: `hsl(${BRAND_TOKENS.primary})` }}>
                        {stat.value}
                      </p>
                      <p className="text-sm" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>
                  Matheus Dias
                </h3>
                <p className="font-medium mb-4" style={{ color: `hsl(${BRAND_TOKENS.primary})` }}>
                  Especialista em Tecnologia e Oportunidades Digitais
                </p>
                <div className="space-y-3 text-sm leading-relaxed" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
                  <p>
                    Com <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>mais de 4 anos de experiência</strong> e{" "}
                    <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>somando mais de 50 milhões de visualizações</strong> em seus vídeos,
                    Matheus Dias se tornou <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>um dos maiores especialistas do Brasil</strong> em{" "}
                    <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>"descomplicar a tecnologia e a vida"</strong> para milhões de pessoas.
                  </p>
                  <p>
                    Depois que seus <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>vídeos sobre benefícios do governo viralizaram</strong> e{" "}
                    <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>ajudaram milhões de brasileiros</strong>, ele percebeu que a falta de informação
                    era o maior obstáculo para as pessoas acessarem seus direitos.
                  </p>
                  <p>
                    Hoje, com uma <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>comunidade de mais de 400 mil seguidores</strong>, ele continua sua
                    missão de usar a tecnologia para <strong style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>trazer conhecimento e poder para a palma da mão</strong> de
                    quem mais precisa.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </BrandCard>
      </motion.div>
    </div>
  </section>
);

// FAQ Section
const FAQSection = () => (
  <section 
    className="py-16 md:py-24 px-4"
    style={{ background: `hsl(${BRAND_TOKENS.muted})` }}
  >
    <div className="container max-w-3xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
        className="text-3xl md:text-4xl font-bold text-center mb-12"
        style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
      >
        Perguntas Frequentes
      </motion.h2>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
      >
        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
          {FAQ_DATA.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="px-4"
              style={{
                background: `hsl(${BRAND_TOKENS.card})`,
                borderRadius: BRAND_TOKENS.radius,
                border: `1px solid hsl(${BRAND_TOKENS.border})`,
                boxShadow: BRAND_TOKENS.shadow,
              }}
            >
              <AccordionTrigger 
                className="text-left font-medium py-4 hover:no-underline"
                style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent 
                className="pb-4"
                style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}
              >
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

// Guarantee Section
const GuaranteeSection = () => (
  <section 
    className="py-16 md:py-24 px-4"
    style={{ background: `hsl(${BRAND_TOKENS.background})` }}
  >
    <div className="container max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
        className="flex flex-col md:flex-row items-center gap-8"
      >
        <div className="flex-shrink-0">
          <div className="w-40 h-40 flex items-center justify-center">
            <Shield className="w-32 h-32" style={{ color: `hsl(${BRAND_TOKENS.orange})` }} />
          </div>
        </div>
        <div>
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
          >
            Garantia Incondicional de 7 Dias
          </h2>
          <p style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }} className="leading-relaxed">
            Teste o material por 7 dias. Se não ficar 100% satisfeito, devolvemos seu dinheiro! 
            Sem perguntas, sem complicações. Sua satisfação é nossa prioridade e o risco é todo nosso!
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

// Final CTA Section
const FinalCTASection = () => (
  <section 
    className="py-16 md:py-24 px-4"
    style={{ 
      background: `linear-gradient(135deg, hsl(${BRAND_TOKENS.primary}), hsl(${BRAND_TOKENS.primaryLight}))` 
    }}
  >
    <div className="container max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        whileInView={{ opacity: 1, scale: 1 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6, ease }}
      >
        <BrandCard highlight>
          <CardContent className="p-8 md:p-12 text-center">
            <h2 
              className="text-2xl md:text-4xl font-bold mb-4"
              style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}
            >
              Não Perca Esta Oportunidade!
            </h2>
            <p className="mb-6" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
              Pare de deixar dinheiro na mesa: são mais de 50 benefícios e direitos prontos para você acessar!
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" style={{ color: `hsl(${BRAND_TOKENS.green})` }} />
                <span style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>Oferta limitada - acaba em breve!</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" style={{ color: `hsl(${BRAND_TOKENS.green})` }} />
                <span style={{ color: `hsl(${BRAND_TOKENS.foreground})` }}>Garantia incondicional de 7 dias</span>
              </div>
            </div>

            <CTAButton 
              href={CONFIG.checkoutPremium} 
              section="final-cta" 
              plan="premium" 
              className="text-lg px-10 py-7"
            >
              QUERO GARANTIR MINHA OFERTA AGORA!
            </CTAButton>

            <p className="text-xs mt-6" style={{ color: `hsl(${BRAND_TOKENS.mutedForeground})` }}>
              Acesso imediato • Pagamento 100% seguro • Garantia de 7 dias
            </p>
          </CardContent>
        </BrandCard>
      </motion.div>
    </div>
  </section>
);

// Sticky Mobile CTA
const StickyCTA = () => (
  <div 
    className="fixed bottom-0 left-0 right-0 p-3 backdrop-blur border-t z-40 md:hidden"
    style={{ 
      background: `hsl(${BRAND_TOKENS.background} / 0.95)`,
      borderColor: `hsl(${BRAND_TOKENS.border})`,
      boxShadow: BRAND_TOKENS.shadowLg,
    }}
  >
    <CTAButton href={CONFIG.checkoutPremium} section="sticky" plan="premium" className="w-full" size="default">
      QUERO AGORA!
    </CTAButton>
  </div>
);

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const MapaDosBeneficios = () => {
  return (
    <BrandThemeWrapper>
      <Helmet>
        <title>Mapa dos Benefícios Ocultos | +50 Direitos Secretos do Governo</title>
        <meta 
          name="description" 
          content="Descubra mais de 50 benefícios, auxílios e direitos que você pode ter acesso agora. Guia completo com passo a passo para cada programa do governo." 
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

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
    </BrandThemeWrapper>
  );
};

export default MapaDosBeneficios;
