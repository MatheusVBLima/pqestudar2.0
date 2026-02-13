import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { BookOpen, Briefcase, Calendar, Bookmark, ArrowRight, Crown } from 'lucide-react';

const PremiumHome = () => {
  const { subscription, getPlanName, getRemainingDays, isActive } = useSubscription();

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
      
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Área Premium</h1>
          </div>
          
          {isActive() && subscription && (
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Plano {getPlanName()}
              </span>
              <span className="text-sm">
                {getRemainingDays()} dias restantes
              </span>
            </div>
          )}
        </div>

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
