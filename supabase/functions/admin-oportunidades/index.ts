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

interface AtualizacaoInput {
  id?: string;
  data_atualizacao: string;
  texto: string;
}

interface OportunidadeInput {
  id?: string;
  categoria: "Concurso" | "Políticas Públicas" | "Educação";
  titulo: string;
  abrangencia: "Nacional" | "Estadual" | "Municipal";
  situacao: "Previsto" | "Edital publicado" | "Aberto" | "Encerrado";
  data_publicacao?: string;
  tipo: "Concurso" | "Programa educacional" | "Processo seletivo" | "Processo Seletivo Simplificado";
  escolaridade?: "Fundamental" | "Médio" | "Superior"; // Legacy
  escolaridades?: ("Fundamental" | "Médio" | "Superior")[]; // New multi-select
  link_edital?: string;
  orgao?: string;
  banca?: string;
  resumo_editorial?: string;
  conteudo_principal?: string;
  meta_title?: string;
  meta_description?: string;
  slug: string;
  publicado?: boolean;
  fontes?: FonteInput[];
  atualizacoes?: AtualizacaoInput[];
}

// Count words in text (stripping HTML)
function countWords(text: string): number {
  if (!text) return 0;
  const stripped = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
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
        .select("*, fontes_oportunidade(*), atualizacoes_oportunidade(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - Create new oportunidade
    if (req.method === "POST") {
      const body: OportunidadeInput = await req.json();

      // Normalize escolaridades: prefer array, fallback to legacy field
      const escolaridades = body.escolaridades?.length 
        ? body.escolaridades 
        : (body.escolaridade ? [body.escolaridade] : null);

      // Validate required fields
      if (!body.titulo || !body.slug || !body.categoria || !body.tipo || !escolaridades?.length || !body.abrangencia || !body.situacao) {
        return new Response(
          JSON.stringify({ error: "Campos obrigatórios faltando: titulo, slug, categoria, tipo, escolaridades, abrangencia, situacao" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate title length
      if (body.titulo.length < 30) {
        return new Response(
          JSON.stringify({ error: "Título deve ter pelo menos 30 caracteres" }),
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

      // Publication validations
      if (body.publicado) {
        // Check fontes
        if (!body.fontes || body.fontes.length === 0) {
          return new Response(
            JSON.stringify({ error: "Não é possível publicar sem pelo menos uma fonte oficial" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const hasOfficialSource = body.fontes.some(f => 
          ["oficial", "diario", "banca", "outro-oficial"].includes(f.source_tipo)
        );
        if (!hasOfficialSource) {
          return new Response(
            JSON.stringify({ error: "Não é possível publicar sem pelo menos uma fonte oficial (oficial, diário, banca ou outro-oficial)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check resumo editorial
        if (!body.resumo_editorial || body.resumo_editorial.length < 300) {
          return new Response(
            JSON.stringify({ error: "Resumo editorial deve ter pelo menos 300 caracteres para publicar" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check conteudo principal word count
        const wordCount = countWords(body.conteudo_principal || "");
        if (wordCount < 600) {
          return new Response(
            JSON.stringify({ error: `Conteúdo principal deve ter pelo menos 600 palavras para publicar (atual: ${wordCount})` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const { fontes, atualizacoes, ...oportunidadeData } = body;

      // Generate meta fields if not provided
      let metaTitle = body.meta_title;
      if (!metaTitle && body.titulo) {
        metaTitle = body.titulo.length > 65 
          ? body.titulo.substring(0, 62).replace(/\s+\S*$/, "") + "..."
          : body.titulo;
      }

      let metaDescription = body.meta_description;
      if (!metaDescription && body.resumo_editorial) {
        metaDescription = body.resumo_editorial.length > 155
          ? body.resumo_editorial.substring(0, 152).replace(/\s+\S*$/, "") + "..."
          : body.resumo_editorial;
      }

      // Insert oportunidade (initially unpublished to add fontes first)
      const { data: oportunidade, error: insertError } = await adminClient
        .from("oportunidades")
        .insert({
          ...oportunidadeData,
          meta_title: metaTitle,
          meta_description: metaDescription,
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

      // Insert atualizacoes if provided
      if (atualizacoes && atualizacoes.length > 0) {
        const atualizacoesData = atualizacoes.map(a => ({
          oportunidade_id: oportunidade.id,
          data_atualizacao: a.data_atualizacao,
          texto: a.texto,
          created_by: user.id,
        }));

        const { error: atualizacoesError } = await adminClient
          .from("atualizacoes_oportunidade")
          .insert(atualizacoesData);

        if (atualizacoesError) {
          console.error("Atualizacoes insert error:", atualizacoesError);
          // Don't rollback, just log - atualizacoes are optional
        }
      }

      // Now update to published if requested
      if (body.publicado) {
        const { error: publishError } = await adminClient
          .from("oportunidades")
          .update({ 
            publicado: true,
            published_at: new Date().toISOString(),
            slug_locked: true,
          })
          .eq("id", oportunidade.id);

        if (publishError) {
          return new Response(
            JSON.stringify({ error: publishError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Fetch complete record with fontes and atualizacoes
      const { data: completeRecord } = await adminClient
        .from("oportunidades")
        .select("*, fontes_oportunidade(*), atualizacoes_oportunidade(*)")
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

      // Validate title length
      if (body.titulo && body.titulo.length < 30) {
        return new Response(
          JSON.stringify({ error: "Título deve ter pelo menos 30 caracteres" }),
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

      // Get existing record to check slug changes
      const { data: existingRecord } = await adminClient
        .from("oportunidades")
        .select("slug, slug_locked, publicado, published_at")
        .eq("id", body.id)
        .single();

      // Check if slug is being changed on a locked item
      const isSlugLocked = existingRecord?.slug_locked || existingRecord?.publicado;
      if (isSlugLocked && body.slug !== existingRecord?.slug) {
        // Create redirect from old slug to new slug
        const { error: redirectError } = await adminClient
          .from("oportunidades_slug_redirects")
          .insert({
            oportunidade_id: body.id,
            old_slug: existingRecord.slug,
          });

        if (redirectError && !redirectError.message.includes("duplicate")) {
          console.error("Redirect insert error:", redirectError);
        }
      }

      const { fontes, atualizacoes, id, ...updateData } = body;

      // If trying to publish, validate requirements
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

        // Check resumo editorial
        if (!body.resumo_editorial || body.resumo_editorial.length < 300) {
          return new Response(
            JSON.stringify({ error: "Resumo editorial deve ter pelo menos 300 caracteres para publicar" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check conteudo principal word count
        const wordCount = countWords(body.conteudo_principal || "");
        if (wordCount < 600) {
          return new Response(
            JSON.stringify({ error: `Conteúdo principal deve ter pelo menos 600 palavras para publicar (atual: ${wordCount})` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Generate meta fields if not provided
      let metaTitle = body.meta_title;
      if (!metaTitle && body.titulo) {
        metaTitle = body.titulo.length > 65 
          ? body.titulo.substring(0, 62).replace(/\s+\S*$/, "") + "..."
          : body.titulo;
      }

      let metaDescription = body.meta_description;
      if (!metaDescription && body.resumo_editorial) {
        metaDescription = body.resumo_editorial.length > 155
          ? body.resumo_editorial.substring(0, 152).replace(/\s+\S*$/, "") + "..."
          : body.resumo_editorial;
      }

      // Update oportunidade (without publicado for now)
      const { publicado, ...safeUpdateData } = updateData;
      
      const { error: updateError } = await adminClient
        .from("oportunidades")
        .update({
          ...safeUpdateData,
          meta_title: metaTitle,
          meta_description: metaDescription,
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

      // Handle atualizacoes update
      if (atualizacoes !== undefined) {
        // Delete existing atualizacoes
        await adminClient
          .from("atualizacoes_oportunidade")
          .delete()
          .eq("oportunidade_id", id);

        // Insert new atualizacoes
        if (atualizacoes.length > 0) {
          const atualizacoesData = atualizacoes.map(a => ({
            oportunidade_id: id,
            data_atualizacao: a.data_atualizacao,
            texto: a.texto,
            created_by: user.id,
          }));

          const { error: atualizacoesError } = await adminClient
            .from("atualizacoes_oportunidade")
            .insert(atualizacoesData);

          if (atualizacoesError) {
            console.error("Atualizacoes update error:", atualizacoesError);
            // Don't fail the request for atualizacoes errors
          }
        }
      }

      // Now update publicado status
      if (body.publicado !== undefined) {
        const updateFields: any = { 
          publicado: body.publicado,
          updated_by: user.id,
        };

        // Set published_at and slug_locked when first publishing
        if (body.publicado && !existingRecord?.published_at) {
          updateFields.published_at = new Date().toISOString();
          updateFields.slug_locked = true;
        }

        const { error: publishError } = await adminClient
          .from("oportunidades")
          .update(updateFields)
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
        .select("*, fontes_oportunidade(*), atualizacoes_oportunidade(*)")
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

      // Fontes and atualizacoes will be deleted via CASCADE
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

      // If trying to publish, check all requirements
      if (publicado === true) {
        const { data: oportunidade } = await adminClient
          .from("oportunidades")
          .select("*, fontes_oportunidade(*)")
          .eq("id", id)
          .single();

        if (!oportunidade) {
          return new Response(
            JSON.stringify({ error: "Oportunidade não encontrada" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const fontes = oportunidade.fontes_oportunidade || [];
        const hasOfficialSource = fontes.some((f: any) => 
          ["oficial", "diario", "banca", "outro-oficial"].includes(f.source_tipo)
        );

        if (!hasOfficialSource) {
          return new Response(
            JSON.stringify({ error: "Não é possível publicar sem pelo menos uma fonte oficial" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check resumo editorial
        if (!oportunidade.resumo_editorial || oportunidade.resumo_editorial.length < 300) {
          return new Response(
            JSON.stringify({ error: "Resumo editorial deve ter pelo menos 300 caracteres para publicar" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check conteudo principal word count
        const wordCount = countWords(oportunidade.conteudo_principal || "");
        if (wordCount < 600) {
          return new Response(
            JSON.stringify({ error: `Conteúdo principal deve ter pelo menos 600 palavras para publicar (atual: ${wordCount})` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const updateFields: any = { 
        publicado, 
        updated_by: user.id 
      };

      // Set published_at and slug_locked when first publishing
      if (publicado) {
        const { data: existingRecord } = await adminClient
          .from("oportunidades")
          .select("published_at")
          .eq("id", id)
          .single();

        if (!existingRecord?.published_at) {
          updateFields.published_at = new Date().toISOString();
          updateFields.slug_locked = true;
        }
      }

      const { error } = await adminClient
        .from("oportunidades")
        .update(updateFields)
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
