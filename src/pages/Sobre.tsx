import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import sobreImage from "@/assets/sobre-matheus.png";

const Sobre = () => {
  const navigate = useNavigate();

  // SEO
  useEffect(() => {
    document.title = "Sobre — PqEstudar";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Por que estudar? Para hackear o sistema e acelerar sua carreira. Matheus Dias te ensina como.');
    }

    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    linkCanonical.setAttribute('href', 'https://pqestudar.com.br/sobre');
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(linkCanonical);
    }

    return () => {
      document.title = "pqestudar - Cursos Gratuitos com Certificado";
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Plataforma educacional completa com cursos online gratuitos e certificados válidos. Transforme sua carreira com nossa curadoria especializada.');
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto px-6 py-16 md:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Por que estudar? Para hackear o sistema e acelerar sua carreira. Eu te ensino como.
            </h1>
            
            <div className="flex justify-center">
              <img
                src={sobreImage}
                alt="Foto de Matheus Dias (página Sobre)."
                width={768}
                height={768}
                loading="lazy"
                className="max-w-3xl w-full rounded-2xl shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-12"
        >
          {/* A Dor Compartilhada */}
          <motion.section variants={itemVariants} className="space-y-4">
            <p className="text-lg leading-relaxed text-foreground/90">
              Você já se sentiu sobrecarregado com a quantidade de coisas que precisa aprender? Já passou horas estudando para sentir que não reteve quase nada? Eu já. Por muito tempo, acreditei que o sucesso vinha de estudar mais, de sacrificar noites de sono e de viver para os livros.
            </p>
            <p className="text-lg leading-relaxed text-foreground/90 font-semibold">
              Eu estava errado.
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              Descobri que o jogo não é sobre estudar mais, é sobre estudar de forma mais inteligente. É sobre encontrar as ferramentas certas, os métodos corretos e os atalhos que a maioria das pessoas não conhece.
            </p>
          </motion.section>

          {/* A Virada de Chave */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">A Virada de Chave</h2>
            <p className="text-lg leading-relaxed text-foreground/90">
              Meu nome é Matheus Dias e, nos últimos anos, me tornei obcecado por produtividade e aprendizado acelerado. O que começou como uma necessidade pessoal para otimizar meus próprios estudos, virou uma paixão. Mergulhei de cabeça para descobrir e testar centenas de ferramentas de IA, métodos de organização e hacks de produtividade.
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              Comecei a compartilhar essas descobertas de forma despretensiosa nas redes sociais e, para minha surpresa, uma comunidade com mais de 500 mil pessoas se formou em torno dessa ideia. Foi quando eu percebi que a minha busca não era só minha. A frustração com o modelo tradicional de educação era coletiva.
            </p>
          </motion.section>

          {/* A Missão */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">A Missão</h2>
            <p className="text-lg leading-relaxed text-foreground/90">
              Foi por isso que criei o PqEstudar?. Não para te dar mais matéria para decorar, mas para te entregar um arsenal de "superpoderes". Minha missão é curar e simplificar o conhecimento, te entregando apenas as ferramentas e estratégias que realmente funcionam para que você economize tempo, aprenda mais rápido e se destaque na sua carreira.
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              A resposta para a pergunta "Por que estudar?" mudou. Hoje, a resposta é: para se tornar um mestre em resolver problemas, para usar a tecnologia a seu favor e para construir a vida que você deseja, com mais resultado e menos esforço.
            </p>
          </motion.section>

          {/* Como posso te ajudar */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Como posso te ajudar hoje?</h2>
            <p className="text-lg leading-relaxed text-foreground/90">
              Se você também acredita que existe uma forma mais inteligente de aprender e crescer, aqui estão os melhores lugares para começar:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* Newsletter CTA */}
              <div className="space-y-4 p-6 border-2 border-primary/20 rounded-lg bg-primary/5 hover:border-primary/40 transition-colors">
                <h3 className="text-xl font-semibold">Assine a Curadoria Semanal</h3>
                <p className="text-muted-foreground">
                  Este é o coração do meu trabalho. Toda semana, envio no seu e-mail os melhores hacks e ferramentas que eu encontro. É conteúdo exclusivo que não compartilho em nenhum outro lugar.
                </p>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.location.href = 'https://pqestudar.com.br/assine'}
                >
                  QUERO RECEBER OS HACKS
                </Button>
              </div>

              {/* Create Account CTA */}
              <div className="space-y-4 p-6 border-2 border-border rounded-lg hover:border-primary/40 transition-colors">
                <h3 className="text-xl font-semibold">Explore a Plataforma</h3>
                <p className="text-muted-foreground">
                  Crie sua conta gratuita e tenha acesso à nossa área de materiais, onde você pode encontrar guias, apostilas e participar da nossa comunidade gamificada.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  CRIAR MINHA CONTA
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-semibold">Conecte-se nas Redes Sociais</h3>
              <p className="text-muted-foreground">
                Para dicas rápidas e os bastidores do dia a dia, me siga nas redes:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open('https://instagram.com/mdias.ofc', '_blank', 'noopener,noreferrer')}
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open('https://facebook.com/pqestudar', '_blank', 'noopener,noreferrer')}
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </Button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Sobre;
