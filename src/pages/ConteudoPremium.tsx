import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Shield, Users, BookOpen, Award, Star, Clock } from "lucide-react";

const ConteudoPremium = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Conteúdo Premium</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Desbloqueie todo o potencial da sua educação com acesso exclusivo a conteúdos avançados, mentoria personalizada e certificações reconhecidas.
          </p>
        </div>

        {/* Premium Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle>Acesso Antecipado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a acessar novos cursos e conteúdos antes do lançamento público.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Mentoria Exclusiva</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sessões de mentoria 1:1 com especialistas da área para acelerar seu aprendizado.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <CardTitle>Conteúdo Exclusivo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Materiais complementares, estudos de caso e projetos práticos disponíveis apenas para membros premium.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                <CardTitle>Certificações</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Certificados reconhecidos pelo mercado para comprovar suas competências.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Suporte Prioritário</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Atendimento prioritário e suporte técnico 24/7 para resolver qualquer dúvida.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <CardTitle>Acesso Vitalício</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Uma vez adquirido, tenha acesso permanente aos conteúdos e suas atualizações.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <h2 className="text-2xl font-bold text-center mb-8">Planos Premium</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Starter
                <Badge variant="secondary">Mais Popular</Badge>
              </CardTitle>
              <CardDescription>Ideal para iniciantes</CardDescription>
              <div className="text-3xl font-bold">R$ 49<span className="text-sm font-normal">/mês</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Acesso a 50+ cursos premium
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Certificados de conclusão
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Suporte por email
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Acesso mobile offline
                </li>
              </ul>
              <Button className="w-full">Começar Agora</Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Professional
                <Badge>Recomendado</Badge>
              </CardTitle>
              <CardDescription>Para profissionais em crescimento</CardDescription>
              <div className="text-3xl font-bold">R$ 99<span className="text-sm font-normal">/mês</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Tudo do plano Starter
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Acesso a 200+ cursos premium
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  2 sessões de mentoria/mês
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Projetos práticos exclusivos
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Suporte prioritário
                </li>
              </ul>
              <Button className="w-full">Escolher Professional</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Enterprise
              </CardTitle>
              <CardDescription>Para equipes e empresas</CardDescription>
              <div className="text-3xl font-bold">R$ 199<span className="text-sm font-normal">/mês</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Tudo do plano Professional
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Acesso ilimitado a todos os cursos
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Mentoria ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Relatórios de progresso detalhados
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  API e integrações
                </li>
              </ul>
              <Button className="w-full">Contactar Vendas</Button>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>O que dizem nossos membros premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">MC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Maria Clara</h4>
                    <p className="text-xs text-muted-foreground">Desenvolvedora Frontend</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "O conteúdo premium me ajudou a conseguir uma promoção em apenas 6 meses. As mentorias foram fundamentais!"
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">RS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Roberto Silva</h4>
                    <p className="text-xs text-muted-foreground">Product Manager</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "A qualidade dos projetos práticos é excepcional. Aplicei tudo no meu trabalho atual!"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Pronto para acelerar sua carreira?</CardTitle>
            <CardDescription className="text-lg">
              Junte-se a milhares de profissionais que já transformaram suas carreiras com nosso conteúdo premium.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" className="mr-4">
              Começar Teste Gratuito de 7 Dias
            </Button>
            <Button variant="outline" size="lg">
              Ver Demonstração
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ConteudoPremium;