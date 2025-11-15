import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/mdias.ofc/",
    label: "412k+ Seguidores",
  },
  {
    name: "TikTok",
    icon: () => (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    href: "https://www.tiktok.com/@mdias.ofc",
    label: "2.8k+ Seguidores",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://www.youtube.com/@mdias-ofc",
    label: "YouTube",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/in/mdiasofc/",
    label: "LinkedIn",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61577754095302",
    label: "2.3k+ Seguidores",
  },
];

export function AboutSocialLinks() {
  return (
    <section className="w-full py-16 md:py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              Conecte-se Comigo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acompanhe as novidades, hacks e conteúdos diários nas redes sociais.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-lg ring-2 ring-transparent hover:ring-primary/30"
                >
                  <Icon className="h-6 w-6" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
