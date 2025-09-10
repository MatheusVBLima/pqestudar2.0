import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Crown, Users, Zap, CheckCircle, Star } from "lucide-react";

const ProgramasBeneficios = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Programas de Benefícios</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubra programas exclusivos de benefícios que oferecem vantagens especiais, descontos e acesso privilegiado a conteúdos educacionais premium.
          </p>
        </div>

        {/* Featured Program */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="h-6 w-6 text-primary" />
                  Programa VIP Educacional
                  <Badge variant="secondary" className="ml-2">Destaque</Badge>
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Acesso exclusivo aos melhores conteúdos educacionais
                </CardDescription>
              </div>
              <Button>
                Inscrever-se
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Descontos Exclusivos</h3>
                  <p className="text-sm text-muted-foreground">Até 70% em cursos selecionados</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Acesso Prioritário</h3>
                  <p className="text-sm text-muted-foreground">Conteúdos antes do lançamento público</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Comunidade VIP</h3>
                  <p className="text-sm text-muted-foreground">Networking com outros membros</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Categories */}
        <h2 className="text-2xl font-bold mb-6">Categorias de Benefícios</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Estudantes
              </CardTitle>
              <CardDescription>Benefícios especiais para estudantes ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  50% desconto em cursos técnicos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Acesso gratuito a workshops
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Mentoria personalizada
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Profissionais
              </CardTitle>
              <CardDescription>Vantagens para desenvolvimento profissional</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Certificações reconhecidas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Networking empresarial
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Trilhas de carreira
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Empresas
              </CardTitle>
              <CardDescription>Soluções corporativas educacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Licenças em volume
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Dashboard de acompanhamento
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Suporte dedicado
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-1">Escolha seu Plano</h4>
                <p className="text-xs text-muted-foreground">Selecione o programa que melhor se adequa ao seu perfil</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-1">Faça sua Inscrição</h4>
                <p className="text-xs text-muted-foreground">Complete o cadastro e validação</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-1">Acesse os Benefícios</h4>
                <p className="text-xs text-muted-foreground">Aproveite todas as vantagens disponíveis</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-1">Renove Anualmente</h4>
                <p className="text-xs text-muted-foreground">Mantenha seus benefícios ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Termos e Condições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Os benefícios são válidos apenas durante o período de vigência da assinatura</p>
              <p>• Alguns benefícios podem ter limitações de uso mensal ou anual</p>
              <p>• A elegibilidade para certos programas pode exigir comprovação de status (estudante, profissional, etc.)</p>
              <p>• Os termos podem ser alterados com aviso prévio de 30 dias</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProgramasBeneficios;