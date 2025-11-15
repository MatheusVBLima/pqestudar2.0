import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useEffect } from "react";
import { motion } from "framer-motion";
import sobreImage from "@/assets/sobre-matheus-new.png";
import { AboutTimeline } from "@/components/sections/about-timeline";
import { AboutCTACards } from "@/components/sections/about-cta-cards";
import { AboutSocialLinks } from "@/components/sections/about-social-links";

const Sobre = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Split-Screen */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
          {/* Left Column - Purple Background + Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-primary flex items-center justify-center p-8 md:p-12 lg:p-16"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary-foreground)/0.05),transparent_70%)]" />
            <h1 className="relative text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-primary-foreground leading-[1.1] max-w-xl">
              Por que estudar? Para hackear o sistema e acelerar sua carreira. Eu te ensino como.
            </h1>
          </motion.div>

          {/* Right Column - Photo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden bg-muted"
          >
            <img
              src={sobreImage}
              alt="Foto de Matheus Dias (página Sobre)."
              width={768}
              height={768}
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </div>
      </section>

      {/* Introdução */}
      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <p className="text-lg md:text-xl leading-relaxed text-foreground/90">
            Você já se sentiu sobrecarregado com a quantidade de coisas que precisa aprender? Já passou horas estudando para sentir que não reteve quase nada? Eu já. Por muito tempo, acreditei que o sucesso vinha de estudar mais, de sacrificar noites de sono e de viver para os livros.
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-foreground/90 font-semibold">
            Eu estava errado.
          </p>
        </motion.div>
      </section>

      {/* Timeline */}
      <AboutTimeline />

      {/* CTAs */}
      <AboutCTACards />

      {/* Redes Sociais */}
      <AboutSocialLinks />

      <Footer />
    </div>
  );
};

export default Sobre;
