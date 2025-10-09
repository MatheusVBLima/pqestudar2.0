import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  token_hash: string;
  type: string;
  redirect_to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as ConfirmationEmailRequest;
    const { email, token_hash, type, redirect_to } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${type}${redirect_to ? `&redirect_to=${redirect_to}` : ''}`;

    let subject = "";
    let htmlContent = "";

    if (type === "signup") {
      subject = "Confirme seu email - PQEstudar";
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">PQEstudar</h1>
            </div>
            <div style="background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Bem-vindo ao PQEstudar!</h2>
              <p style="font-size: 16px; color: #666;">
                Obrigado por se cadastrar. Para começar a usar sua conta, por favor confirme seu endereço de email clicando no botão abaixo:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Confirmar Email
                </a>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                Se você não criou uma conta no PQEstudar, pode ignorar este email com segurança.
              </p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                Este é um email automático. Por favor, não responda.
              </p>
            </div>
          </body>
        </html>
      `;
    } else if (type === "recovery") {
      subject = "Recuperação de senha - PQEstudar";
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">PQEstudar</h1>
            </div>
            <div style="background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Recuperação de Senha</h2>
              <p style="font-size: 16px; color: #666;">
                Você solicitou a recuperação de senha da sua conta. Clique no botão abaixo para criar uma nova senha:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Redefinir Senha
                </a>
              </div>
              <p style="font-size: 14px; color: #999; margin-top: 30px;">
                Se você não solicitou a recuperação de senha, pode ignorar este email com segurança.
              </p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                Este é um email automático. Por favor, não responda.
              </p>
            </div>
          </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "PQEstudar <noreply@news.pqestudar.com>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email de confirmação enviado:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de confirmação:", error);
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
