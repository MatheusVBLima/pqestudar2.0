import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "PQ Estudar <noreply@resend.dev>",
      to: [email],
      subject: "Redefinir sua senha - PQ Estudar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">🔒 Redefinição de Senha</h1>
          
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          
          <p>Se foi você, clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #0066cc; color: white; padding: 14px 28px; 
                      border-radius: 8px; text-decoration: none; font-weight: bold;">
              Redefinir minha senha
            </a>
          </div>
          
          <p>Se não foi você quem solicitou, ignore este e-mail. Sua senha atual continuará válida.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; 
                      font-size: 12px; color: #777; text-align: center;">
            <p>PQ Estudar | Suporte de Conta</p>
          </div>
        </div>
      `,
    });

    console.log("Email de recuperação enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de recuperação:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);