import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface FonteInput {
  id?: string;
  source_url: string;
  source_title?: string;
  source_tipo: "oficial" | "diario" | "banca" | "outro-oficial";
  source_date?: string;
}

interface OportunidadeInput {
  id?: string;
  categoria: "Concurso" | "Políticas Públicas" | "Educação";
  titulo: string;
  abrangencia: "Nacional" | "Estadual" | "Municipal";
  situacao: "Previsto" | "Edital publicado" | "Aberto" | "Encerrado";
  data_publicacao?: string;
  tipo: "Concurso" | "Programa educacional" | "Processo seletivo";
  escolaridade: "Fundamental" | "Médio" | "Superior";
  link_edital?: string;
  orgao?: string;
  banca?: string;
  resumo_editorial?: string;
  slug: string;
  publicado?: boolean;
  fontes?: FonteInput[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to check admin status
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to check admin status
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET - List all oportunidades (including unpublished for admin)
    if (req.method === "GET") {
      const { data, error } = await adminClient
        .from("oportunidades")
        .select("*, fontes_oportunidade(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - Create new oportunidade
    if (req.method === "POST") {
      const body: OportunidadeInput = await req.json();

      // Validate required fields
      if (!body.titulo || !body.slug || !body.categoria || !body.tipo || !body.escolaridade || !body.abrangencia || !body.situacao) {
        return new Response(
          JSON.stringify({ error: "Campos obrigatórios faltando: titulo, slug, categoria, tipo, escolaridade, abrangencia, situacao" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate link_edital requirement
      if ((body.situacao === "Aberto" || body.situacao === "Edital publicado") && !body.link_edital) {
        return new Response(
          JSON.stringify({ error: "Link do edital é obrigatório quando a situação é 'Aberto' ou 'Edital publicado'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate URL format
      if (body.link_edital && !/^https?:\/\//.test(body.link_edital)) {
        return new Response(
          JSON.stringify({ error: "Link do edital deve ser uma URL válida (http:// ou https://)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If trying to publish, check fontes
      if (body.publicado && (!body.fontes || body.fontes.length === 0)) {
        return new Response(
          JSON.stringify({ error: "Não é possível publicar sem pelo menos uma fonte oficial" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (body.publicado && body.fontes) {
        const hasOfficialSource = body.fontes.some(f => 
          ["oficial", "diario", "banca", "outro-oficial"].includes(f.source_tipo)
        );
        if (!hasOfficialSource) {
          return new Response(
            JSON.stringify({ error: "Não é possível publicar sem pelo menos uma fonte oficial (oficial, diário, banca ou outro-oficial)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const { fontes, ...oportunidadeData } = body;

      // Insert oportunidade (initially unpublished to add fontes first)
      const { data: oportunidade, error: insertError } = await adminClient
        .from("oportunidades")
        .insert({
          ...oportunidadeData,
          publicado: false, // Start unpublished
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert fontes if provided
      if (fontes && fontes.length > 0) {
        const fontesData = fontes.map(f => ({
          oportunidade_id: oportunidade.id,
          source_url: f.source_url,
          source_title: f.source_title,
          source_tipo: f.source_tipo,
          source_date: f.source_date,
        }));

        const { error: fontesError } = await adminClient
          .from("fontes_oportunidade")
          .insert(fontesData);

        if (fontesError) {
          console.error("Fontes insert error:", fontesError);
          // Rollback - delete the oportunidade
          await adminClient.from("oportunidades").delete().eq("id", oportunidade.id);
          return new Response(
            JSON.stringify({ error: `Erro ao inserir fontes: ${fontesError.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Now update to published if requested
      if (body.publicado) {
        const { error: publishError } = await adminClient
          .from("oportunidades")
          .update({ publicado: true })
          .eq("id", oportunidade.id);

        if (publishError) {
          return new Response(
            JSON.stringify({ error: publishError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Fetch complete record with fontes
      const { data: completeRecord } = await adminClient
        .from("oportunidades")
        .select("*, fontes_oportunidade(*)")
        .eq("id", oportunidade.id)
        .single();

      return new Response(JSON.stringify(completeRecord), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT - Update oportunidade
    if (req.method === "PUT") {
      const body: OportunidadeInput = await req.json();

      if (!body.id) {
        return new Response(
          JSON.stringify({ error: "ID é obrigatório para atualização" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate link_edital requirement
      if ((body.situacao === "Aberto" || body.situacao === "Edital publicado") && !body.link_edital) {
        return new Response(
          JSON.stringify({ error: "Link do edital é obrigatório quando a situação é 'Aberto' ou 'Edital publicado'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate URL format
      if (body.link_edital && !/^https?:\/\//.test(body.link_edital)) {
        return new Response(
          JSON.stringify({ error: "Link do edital deve ser uma URL válida (http:// ou https://)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { fontes, id, ...updateData } = body;

      // If trying to publish, first check if there will be fontes
      if (body.publicado) {
        // Check existing fontes or new fontes
        const { data: existingFontes } = await adminClient
          .from("fontes_oportunidade")
          .select("source_tipo")
          .eq("oportunidade_id", id);

        const allFontes = [...(existingFontes || []), ...(fontes || [])];
        const hasOfficialSource = allFontes.some(f => 
          ["oficial", "diario", "banca", "outro-oficial"].includes(f.source_tipo)
        );

        if (!hasOfficialSource) {
          return new Response(
            JSON.stringify({ error: "Não é possível publicar sem pelo menos uma fonte oficial (oficial, diário, banca ou outro-oficial)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Update oportunidade (without publicado for now)
      const { publicado, ...safeUpdateData } = updateData;
      
      const { error: updateError } = await adminClient
        .from("oportunidades")
        .update({
          ...safeUpdateData,
          updated_by: user.id,
        })
        .eq("id", id);

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Handle fontes update
      if (fontes !== undefined) {
        // Delete existing fontes
        await adminClient
          .from("fontes_oportunidade")
          .delete()
          .eq("oportunidade_id", id);

        // Insert new fontes
        if (fontes.length > 0) {
          const fontesData = fontes.map(f => ({
            oportunidade_id: id,
            source_url: f.source_url,
            source_title: f.source_title,
            source_tipo: f.source_tipo,
            source_date: f.source_date,
          }));

          const { error: fontesError } = await adminClient
            .from("fontes_oportunidade")
            .insert(fontesData);

          if (fontesError) {
            console.error("Fontes update error:", fontesError);
            return new Response(
              JSON.stringify({ error: `Erro ao atualizar fontes: ${fontesError.message}` }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }

      // Now update publicado status
      if (body.publicado !== undefined) {
        const { error: publishError } = await adminClient
          .from("oportunidades")
          .update({ publicado: body.publicado })
          .eq("id", id);

        if (publishError) {
          return new Response(
            JSON.stringify({ error: publishError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Fetch updated record
      const { data: updatedRecord } = await adminClient
        .from("oportunidades")
        .select("*, fontes_oportunidade(*)")
        .eq("id", id)
        .single();

      return new Response(JSON.stringify(updatedRecord), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE - Delete oportunidade
    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID é obrigatório para exclusão" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fontes will be deleted via CASCADE
      const { error: deleteError } = await adminClient
        .from("oportunidades")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Toggle visibility
    if (action === "toggle") {
      const { id, publicado } = await req.json();
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If trying to publish, check fontes
      if (publicado === true) {
        const { data: fontes } = await adminClient
          .from("fontes_oportunidade")
          .select("source_tipo")
          .eq("oportunidade_id", id);

        const hasOfficialSource = fontes?.some(f => 
          ["oficial", "diario", "banca", "outro-oficial"].includes(f.source_tipo)
        );

        if (!hasOfficialSource) {
          return new Response(
            JSON.stringify({ error: "Não é possível publicar sem pelo menos uma fonte oficial" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const { error } = await adminClient
        .from("oportunidades")
        .update({ publicado, updated_by: user.id })
        .eq("id", id);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment views
    if (action === "view") {
      const { id } = await req.json();
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await adminClient.rpc("increment_oportunidade_views", { oportunidade_id: id });

      // Fallback if RPC doesn't exist
      if (error) {
        await adminClient
          .from("oportunidades")
          .update({ visualizacoes: adminClient.sql`visualizacoes + 1` })
          .eq("id", id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});