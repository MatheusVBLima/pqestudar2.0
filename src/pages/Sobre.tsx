import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PartnersSection } from "@/components/sections/partners-section";
import { BookOpen, Users, Target, Award } from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Sobre a pqestudar</h1>
            <p className="text-xl text-muted-foreground">
              Transformando vidas através da educação de qualidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Nossa Missão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Democratizar o acesso à educação de qualidade, oferecendo cursos online 
                que preparam nossos estudantes para os desafios do mercado de trabalho 
                moderno e para a vida.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Nossa Visão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ser a principal plataforma de educação online do Brasil, 
                reconhecida pela excelência no ensino e pela transformação 
                de vidas através do conhecimento.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Nossa História
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Fundada em 2020, a pqestudar nasceu da necessidade de tornar 
                a educação mais acessível e flexível para todos. Com o mundo
                passando por transformações aceleradas, identificamos que era 
                essencial criar uma plataforma que conectasse conhecimento de 
                qualidade com praticidade.
              </p>
              <p>
                Desde então, já impactamos mais de 50.000 estudantes, oferecendo 
                cursos nas mais diversas áreas, sempre com foco na aplicação 
                prática do conhecimento.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">50.000+</h3>
              <p className="text-muted-foreground">Estudantes Formados</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">200+</h3>
              <p className="text-muted-foreground">Cursos Disponíveis</p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100+</h3>
              <p className="text-muted-foreground">Professores Especialistas</p>
            </div>
          </div>
        </div>
        
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Sobre;