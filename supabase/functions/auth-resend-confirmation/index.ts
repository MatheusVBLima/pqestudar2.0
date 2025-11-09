import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { email, redirectTo } = await req.json().catch(() => ({}));
    
    if (!email || typeof email !== "string") {
      console.error("Missing or invalid email");
      return json({ error: "E-mail obrigatório" }, 400);
    }

    console.log("Resending confirmation email to:", email);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: redirectTo ?? "https://pqestudar.com.br/login",
      },
    });

    if (error) {
      console.error("Resend error:", error);
      return json({ error: error.message }, 500);
    }

    console.log("Confirmation email sent successfully");
    return json({ ok: true, data });
  } catch (e) {
    console.error("Unexpected error:", e);
    return json({ error: String(e) }, 500);
  }
});
