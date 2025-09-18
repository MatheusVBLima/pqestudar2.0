import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  HelpCircle,
  BookOpen,
  Video,
  FileText,
  Search,
  Users,
  Shield
} from "lucide-react";

const Suporte = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('feedback-name') as string || 'Anônimo';
    const email = formData.get('feedback-email') as string || 'não informado';
    const type = formData.get('feedback-type') as string;
    const message = formData.get('feedback-message') as string;
    
    // Criar o corpo do email
    const emailBody = `
Novo feedback da Central de Suporte:

Nome: ${name}
Email: ${email}
Tipo: ${type}
Mensagem: ${message}

Enviado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();
    
    const subject = `Feedback da Central de Suporte - ${type}`;
    const mailtoLink = `mailto:suporte@pqestudar.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Tentar múltiplas formas de abrir o cliente de email
    let emailOpened = false;
    
    try {
      // Método 1: window.open (mais provável de funcionar)
      const emailWindow = window.open(mailtoLink, '_self');
      if (emailWindow) {
        emailOpened = true;
      }
    } catch (error) {
      console.log('window.open failed:', error);
    }
    
    if (!emailOpened) {
      try {
        // Método 2: Criar link e simular clique
        const link = document.createElement('a');
        link.href = mailtoLink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        emailOpened = true;
      } catch (error) {
        console.log('Link click failed:', error);
      }
    }
    
    // Sempre copiar para área de transferência como backup
    navigator.clipboard.writeText(`Para: suporte@pqestudar.com\nAssunto: ${subject}\n\n${emailBody}`).catch(() => {
      console.log('Clipboard access denied');
    });
    
    // Mostrar mensagem apropriada
    toast({
      title: emailOpened ? "Cliente de email aberto!" : "Conteúdo copiado!",
      description: emailOpened 
        ? "Seu cliente de email foi aberto com o feedback preenchido."
        : "O feedback foi copiado para área de transferência. Cole em seu email e envie para: suporte@pqestudar.com",
      duration: 6000,
    });
    
    // Fechar o modal
    setIsDialogOpen(false);
    
    // Reset do formulário
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Central de Suporte
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Estamos aqui para ajudar! Encontre respostas rápidas ou entre em contato conosco.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-card transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Chat ao Vivo</CardTitle>
              <CardDescription>
                Fale conosco em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                Iniciar Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Base de Conhecimento</CardTitle>
              <CardDescription>
                Artigos e tutoriais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Explorar Artigos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-card transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Tutoriais em Vídeo</CardTitle>
              <CardDescription>
                Aprenda através de vídeos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Assistir Vídeos
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Perguntas Frequentes</h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger>Como faço para me inscrever em um curso?</AccordionTrigger>
                <AccordionContent>
                  Para se inscrever em um curso, navegue até a página "Explorar Cursos", 
                  encontre o curso desejado e clique em "Inscrever-se". Você precisará 
                  criar uma conta ou fazer login para completar a inscrição.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Posso cancelar minha inscrição?</AccordionTrigger>
                <AccordionContent>
                  Sim, você pode cancelar sua inscrição em até 30 dias após a compra 
                  para obter reembolso total. Após esse período, você ainda terá acesso 
                  vitalício ao conteúdo do curso.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Como acesso meus certificados?</AccordionTrigger>
                <AccordionContent>
                  Seus certificados estão disponíveis em "Meu Perfil" &gt; "Certificados" 
                  assim que você completar 100% do curso e passar na avaliação final.
                  Você pode fazer download em PDF ou compartilhar no LinkedIn.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Qual é a política de reembolso?</AccordionTrigger>
                <AccordionContent>
                  Oferecemos garantia de 30 dias para todos os cursos. Se não ficar 
                  satisfeito, basta entrar em contato conosco para solicitar o reembolso 
                  integral, sem perguntas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Os cursos têm prazo para conclusão?</AccordionTrigger>
                <AccordionContent>
                  Não! Uma vez inscrito, você tem acesso vitalício ao curso. Pode 
                  estudar no seu próprio ritmo, pausar e retomar quando quiser.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact Form */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Entre em Contato</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Envie sua Mensagem</CardTitle>
                <CardDescription>
                  Não encontrou o que procurava? Envie-nos uma mensagem e responderemos em breve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Nome Completo
                      </label>
                      <Input id="name" placeholder="Seu nome completo" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        E-mail
                      </label>
                      <Input id="email" type="email" placeholder="seu@email.com" required />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Assunto
                    </label>
                    <Input id="subject" placeholder="Qual o motivo do contato?" required />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Mensagem
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Descreva sua dúvida ou problema em detalhes..."
                      rows={4}
                      required 
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Outras Formas de Contato</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>E-mail</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">suporte@pqestudar.com</p>
                <Badge variant="secondary">Resposta em até 24h</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Telefone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">(11) 9999-9999</p>
                <Badge variant="secondary">Seg-Sex 9h às 18h</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sua opinião é importante para nós! Ajude-nos a melhorar nossa plataforma.
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Enviar Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Enviar Feedback</DialogTitle>
                      <DialogDescription>
                        Compartilhe sua experiência e sugestões conosco. Sua opinião nos ajuda a melhorar!
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="feedback-name" className="block text-sm font-medium mb-2">
                          Nome (opcional)
                        </label>
                        <Input id="feedback-name" name="feedback-name" placeholder="Seu nome" />
                      </div>
                      <div>
                        <label htmlFor="feedback-email" className="block text-sm font-medium mb-2">
                          E-mail (opcional)
                        </label>
                        <Input id="feedback-email" name="feedback-email" type="email" placeholder="seu@email.com" />
                      </div>
                      <div>
                        <label htmlFor="feedback-type" className="block text-sm font-medium mb-2">
                          Tipo de feedback
                        </label>
                        <select 
                          id="feedback-type" 
                          name="feedback-type"
                          className="w-full p-2 border border-input rounded-md bg-background"
                          required
                        >
                          <option value="">Selecione o tipo</option>
                          <option value="sugestao">Sugestão</option>
                          <option value="problema">Problema/Bug</option>
                          <option value="elogio">Elogio</option>
                          <option value="recurso">Solicitação de recurso</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="feedback-message" className="block text-sm font-medium mb-2">
                          Sua mensagem
                        </label>
                        <Textarea 
                          id="feedback-message" 
                          name="feedback-message"
                          placeholder="Conte-nos sobre sua experiência, sugestões ou problemas..."
                          rows={4}
                          required 
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Enviar Feedback
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status */}
        <div className="mt-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-600">Todos os Sistemas Operacionais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Última verificação há 2 minutos
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Suporte;