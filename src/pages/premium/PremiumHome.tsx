import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { usePageSettings } from '@/hooks/usePageSettings';
import { BookOpen, Briefcase, Calendar, Bookmark, ArrowRight } from 'lucide-react';

const PremiumHome = () => {
  const { subscription, getPlanName, getRemainingDays, isActive } = useSubscription();
  const ps = usePageSettings("/premium");

  const menuItems = [
    {
      title: 'Cursos Gratuitos',
      description: 'Cursos selecionados para você crescer na carreira',
      icon: BookOpen,
      href: '/premium/cursos',
      color: 'text-blue-500',
    },
    {
      title: 'Vagas de Emprego',
      description: 'Oportunidades exclusivas para assinantes',
      icon: Briefcase,
      href: '/premium/vagas',
      color: 'text-green-500',
    },
    {
      title: 'Atualizações Semanais',
      description: 'O que há de novo toda semana',
      icon: Calendar,
      href: '/premium/atualizacoes',
      color: 'text-purple-500',
    },
    {
      title: 'Meus Salvos',
      description: 'Itens que você salvou para ver depois',
      icon: Bookmark,
      href: '/premium/salvos',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container mx-auto px-6 py-16 md:py-20 relative">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {ps.headerTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {ps.headerDescription}
            </p>
            {isActive() && subscription && (
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  Plano {getPlanName()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {getRemainingDays()} dias restantes
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-12 md:pt-16 pb-8">

        {/* Menu Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Curadorias em Destaque</h2>
          <p className="text-muted-foreground">
            Em breve, curadorias especiais estarão disponíveis aqui.
          </p>
        </div>
      </main>

      
    </div>
  );
};

export default PremiumHome;
