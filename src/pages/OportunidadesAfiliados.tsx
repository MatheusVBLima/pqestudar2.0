import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Target, Rocket, Award } from "lucide-react";

const OportunidadesAfiliados = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Oportunidades de Afiliados</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transforme seu conhecimento e influência em renda. Descubra oportunidades exclusivas de afiliação no mercado educacional.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold">R$ 10M+</h3>
              <p className="text-muted-foreground">Pagos em comissões</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold">5.000+</h3>
              <p className="text-muted-foreground">Afiliados ativos</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-2xl font-bold">45%</h3>
              <p className="text-muted-foreground">Comissão média</p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Opportunities */}
        <h2 className="text-2xl font-bold mb-6">Oportunidades em Destaque</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Hot</Badge>
                <Badge variant="outline">60% comissão</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Curso de Marketing Digital Avançado
              </CardTitle>
              <CardDescription>
                Programa completo com certificação internacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                <p>• Preço: R$ 2.997</p>
                <p>• Comissão: R$ 1.798 por venda</p>
                <p>• Taxa de conversão: 8.5%</p>
                <p>• Suporte completo para afiliados</p>
              </div>
              <Button className="w-full">Tornar-se Afiliado</Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Trending</Badge>
                <Badge variant="outline">40% comissão</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Bootcamp de Programação Full Stack
              </CardTitle>
              <CardDescription>
                6 meses de mentoria intensiva em desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                <p>• Preço: R$ 4.997</p>
                <p>• Comissão: R$ 1.999 por venda</p>
                <p>• Taxa de conversão: 12%</p>
                <p>• Material promocional incluso</p>
              </div>
              <Button variant="outline" className="w-full">Ver Detalhes</Button>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <h2 className="text-2xl font-bold mb-6">Categorias Disponíveis</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">💻</span>
              </div>
              <h3 className="font-semibold mb-1">Tecnologia</h3>
              <p className="text-xs text-muted-foreground">150+ produtos</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">💼</span>
              </div>
              <h3 className="font-semibold mb-1">Negócios</h3>
              <p className="text-xs text-muted-foreground">200+ produtos</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">🎨</span>
              </div>
              <h3 className="font-semibold mb-1">Design</h3>
              <p className="text-xs text-muted-foreground">80+ produtos</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">🚀</span>
              </div>
              <h3 className="font-semibold mb-1">Marketing</h3>
              <p className="text-xs text-muted-foreground">120+ produtos</p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Por que ser um Afiliado?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Vantagens Financeiras</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Comissões de 30% a 70%</li>
                  <li>• Pagamentos pontuais semanais</li>
                  <li>• Sem limite de ganhos</li>
                  <li>• Bonificações por performance</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Suporte e Recursos</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Material promocional profissional</li>
                  <li>• Treinamentos exclusivos</li>
                  <li>• Dashboard de acompanhamento</li>
                  <li>• Suporte dedicado ao afiliado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Como Começar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-1">Cadastro</h4>
                <p className="text-xs text-muted-foreground">Crie sua conta de afiliado gratuita</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-1">Escolha Produtos</h4>
                <p className="text-xs text-muted-foreground">Selecione produtos alinhados com seu público</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-1">Promova</h4>
                <p className="text-xs text-muted-foreground">Use nossos materiais para divulgar</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-1">Receba</h4>
                <p className="text-xs text-muted-foreground">Ganhe comissões por cada venda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OportunidadesAfiliados;