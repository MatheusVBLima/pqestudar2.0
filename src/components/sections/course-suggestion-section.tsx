import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function CourseSuggestionSection() {
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestion.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite sua sugestão de curso.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Verificar rate limiting - 1 sugestão por hora por usuário
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      let rateLimitQuery = supabase
        .from('course_suggestions')
        .select('id')
        .gte('created_at', oneHourAgo.toISOString());
      
      // Se usuário logado, filtrar por user_id, senão não verificamos rate limit
      if (user?.id) {
        rateLimitQuery = rateLimitQuery.eq('user_id', user.id);
      }
      
      const { data: recentSuggestions, error: rateLimitError } = await rateLimitQuery;
      
      if (rateLimitError) {
        throw rateLimitError;
      }
      
      // Se usuário logado e já enviou sugestão na última hora
      if (user?.id && recentSuggestions && recentSuggestions.length > 0) {
        toast({
          title: "Limite atingido",
          description: "Você pode enviar apenas 1 sugestão por hora. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      // Preparar dados para inserção
      const suggestionData = {
        suggestion: suggestion.trim(),
        user_id: user?.id || null,
        user_email: user?.email || null
      };

      // Inserir no banco de dados
      const { error } = await supabase
        .from('course_suggestions')
        .insert([suggestionData]);

      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      setSuggestion("");
      
      toast({
        title: "Sugestão enviada com sucesso!",
        description: "Obrigado pela sua sugestão. Nossa equipe irá analisá-la.",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao salvar sugestão:', error);
      toast({
        title: "Erro ao enviar sugestão",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Sua opinião é importante!</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Qual tema de curso você mais gostaria de ver por aqui?
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-center">Envie sua sugestão</CardTitle>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sugestão enviada!</h3>
                <p className="text-muted-foreground">
                  Obrigado pelo seu feedback. Nossa equipe irá analisar sua sugestão.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="course-suggestion">
                    Descreva o tema ou área de curso que gostaria de ver na plataforma
                  </Label>
                  <Input
                    id="course-suggestion"
                    placeholder="Ex: Inteligência Artificial, Marketing Digital, Programação Python..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="min-h-[50px]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Sugestão
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}