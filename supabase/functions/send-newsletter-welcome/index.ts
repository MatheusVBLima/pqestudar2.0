import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email }: NewsletterRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert into newsletter_subscribers table
    const { data, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])
      .select();

    if (dbError) {
      console.error("Database error:", dbError);
      
      // Check if it's a duplicate email error
      if (dbError.code === '23505') {
        return new Response(
          JSON.stringify({ error: "Este email já está cadastrado em nossa lista!" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      throw dbError;
    }

    console.log("User subscribed successfully:", data);

    // Send welcome email with PDF
    const emailResponse = await resend.emails.send({
      from: "pqestudar <onboarding@resend.dev>",
      to: [email],
      subject: "🎓 Sua Lista de Cursos Gratuitos Chegou!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">pqestudar</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sua jornada de aprendizado começa agora!</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Olá! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Obrigado por se inscrever em nossa newsletter! Estamos muito felizes em ter você conosco.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Como prometido, aqui está sua <strong>lista exclusiva de cursos gratuitos com certificado</strong>, 
              cuidadosamente selecionada por nossa equipe de especialistas.
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
              <h3 style="color: #333; margin-top: 0;">📚 O que você vai encontrar:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Sites confiáveis com cursos 100% gratuitos</li>
                <li>Certificados reconhecidos pelo mercado</li>
                <li>Cursos em diversas áreas: tecnologia, negócios, idiomas e mais</li>
                <li>Plataformas nacionais e internacionais</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              <strong>Nota:</strong> O PDF será enviado em breve como anexo em um próximo email.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://pqestudar.lovable.app/explorar-cursos" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Explorar Cursos na Plataforma
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Continue acompanhando nossos emails para receber:
            </p>
            
            <ul style="color: #666; line-height: 1.8;">
              <li>Novos cursos adicionados semanalmente</li>
              <li>Dicas de estudo e carreira</li>
              <li>Oportunidades de emprego</li>
              <li>Conteúdo exclusivo</li>
            </ul>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              Qualquer dúvida, é só responder este email!
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Bons estudos!<br>
              <strong>Equipe pqestudar</strong>
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Você está recebendo este email porque se inscreveu em nossa newsletter.
              <br>
              <a href="#" style="color: #667eea;">Cancelar inscrição</a>
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Email sending error:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cadastro realizado com sucesso! Verifique seu email.",
        data: data 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter-welcome function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);