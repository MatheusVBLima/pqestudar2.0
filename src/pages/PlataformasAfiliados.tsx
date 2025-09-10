import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, DollarSign, TrendingUp, Star } from "lucide-react";

const PlataformasAfiliados = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Plataformas de Afiliados</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore as melhores plataformas para monetizar seu conhecimento e expandir seu alcance através de programas de afiliados educacionais.
          </p>
        </div>

        {/* Featured Platform - Cakto */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary" />
                  Cakto - Plataforma Destaque
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  A maior plataforma de cursos online do Brasil
                </CardDescription>
              </div>
              <Button asChild>
                <a href="https://www.cakto.com.br/" target="_blank" rel="noopener noreferrer">
                  Visitar Cakto
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Ampla Audiência</h3>
                  <p className="text-sm text-muted-foreground">Milhões de usuários ativos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Comissões Atrativas</h3>
                  <p className="text-sm text-muted-foreground">Até 50% de comissão</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Ferramentas Completas</h3>
                  <p className="text-sm text-muted-foreground">Analytics e suporte</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Platforms */}
        <h2 className="text-2xl font-bold mb-6">Outras Plataformas Recomendadas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Udemy</CardTitle>
              <CardDescription>Plataforma global de cursos online</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Comissões de 15-50%</li>
                <li>• Mercado internacional</li>
                <li>• Programa de afiliados robusto</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hotmart</CardTitle>
              <CardDescription>Marketplace de produtos digitais</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Comissões até 70%</li>
                <li>• Foco no mercado brasileiro</li>
                <li>• Suporte completo ao afiliado</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eduzz</CardTitle>
              <CardDescription>Plataforma de infoprodutos</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Comissões competitivas</li>
                <li>• Interface intuitiva</li>
                <li>• Comunidade ativa</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vantagens dos Programas de Afiliados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Para Criadores de Conteúdo</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Monetização adicional do seu conhecimento</li>
                  <li>• Renda passiva através de indicações</li>
                  <li>• Expansão da sua rede de contatos</li>
                  <li>• Acesso a materiais promocionais</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Para Sua Audiência</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Acesso a cursos de qualidade</li>
                  <li>• Recomendações confiáveis</li>
                  <li>• Preços especiais através de parcerias</li>
                  <li>• Suporte e acompanhamento</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Start */}
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
                <h4 className="font-semibold mb-1">Escolha a Plataforma</h4>
                <p className="text-xs text-muted-foreground">Selecione a que melhor se adequa ao seu público</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-1">Cadastre-se</h4>
                <p className="text-xs text-muted-foreground">Complete o processo de registro como afiliado</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-1">Escolha Produtos</h4>
                <p className="text-xs text-muted-foreground">Selecione cursos alinhados com seu conteúdo</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-1">Comece a Divulgar</h4>
                <p className="text-xs text-muted-foreground">Use suas redes e conteúdos para promover</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PlataformasAfiliados;
