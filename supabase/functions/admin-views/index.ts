import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create user client to get user info
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if user is admin
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { oportunidadeId } = body;

    if (!oportunidadeId) {
      return new Response(JSON.stringify({ error: "oportunidadeId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: reset (zero counter)
    if (action === "reset") {
      // Reset views_total to 0
      const { error: resetError } = await adminClient
        .from("oportunidades")
        .update({ views_total: 0 })
        .eq("id", oportunidadeId);

      if (resetError) {
        return new Response(JSON.stringify({ error: resetError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Also reset all daily views to 0
      await adminClient
        .from("oportunidade_views")
        .update({ total: 0 })
        .eq("oportunidade_id", oportunidadeId);

      // Log audit
      await adminClient.from("admin_audit").insert({
        user_id: user.id,
        user_email: user.email,
        acao: "reset_views",
        oportunidade_id: oportunidadeId,
        payload: { action: "reset_views" },
      });

      return new Response(JSON.stringify({ success: true, views_total: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: recount (aggregate from daily views)
    if (action === "recount") {
      // Sum all daily views
      const { data: viewsData, error: viewsError } = await adminClient
        .from("oportunidade_views")
        .select("total")
        .eq("oportunidade_id", oportunidadeId);

      if (viewsError) {
        return new Response(JSON.stringify({ error: viewsError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newTotal = (viewsData || []).reduce((sum, row) => sum + (row.total || 0), 0);

      // Update views_total
      const { error: updateError } = await adminClient
        .from("oportunidades")
        .update({ views_total: newTotal })
        .eq("id", oportunidadeId);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log audit
      await adminClient.from("admin_audit").insert({
        user_id: user.id,
        user_email: user.email,
        acao: "recount_views",
        oportunidade_id: oportunidadeId,
        payload: { new_total: newTotal },
      });

      return new Response(JSON.stringify({ success: true, views_total: newTotal }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin views error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
