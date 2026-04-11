import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // LIST
    if (!action || action === "list") {
      const { data, error } = await supabase
        .from("guide_flow_knowledge")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SYNC — import files from Storage buckets into knowledge entries
    if (action === "sync") {
      const buckets = ["guide-structure", "guide-library"];
      const categoryMap: Record<string, string> = {
        "guide-structure": "estrutura",
        "guide-library": "referencia",
      };

      let totalFound = 0;
      let totalCreated = 0;
      let totalExisting = 0;
      let totalErrors = 0;
      const details: Array<{ bucket: string; file: string; status: string; error?: string }> = [];

      for (const bucket of buckets) {
        // List root files
        const { data: items, error: listErr } = await supabase.storage.from(bucket).list("", {
          sortBy: { column: "name", order: "asc" },
        });

        if (listErr) {
          totalErrors++;
          details.push({ bucket, file: "*", status: "error", error: listErr.message });
          continue;
        }

        // Filter real files (not placeholders, not folders)
        const files = (items ?? []).filter(
          (f) => f.name !== ".emptyFolderPlaceholder" && f.id
        );

        // Also list subfolders for guide-library
        const subfolderFiles: Array<{ name: string; path: string }> = [];
        if (bucket === "guide-library") {
          const folders = (items ?? []).filter(
            (f) => f.name !== ".emptyFolderPlaceholder" && !f.id && !f.metadata?.size
          );
          for (const folder of folders) {
            const { data: subItems } = await supabase.storage.from(bucket).list(folder.name, {
              sortBy: { column: "name", order: "asc" },
            });
            const subFiles = (subItems ?? []).filter(
              (f) => f.name !== ".emptyFolderPlaceholder" && f.id
            );
            for (const sf of subFiles) {
              subfolderFiles.push({ name: sf.name, path: `${folder.name}/${sf.name}` });
            }
          }
        }

        // Combine root files and subfolder files
        const allFiles = [
          ...files.map((f) => ({ name: f.name, path: f.name })),
          ...subfolderFiles,
        ];

        totalFound += allFiles.length;

        for (const file of allFiles) {
          // Check if already exists
          const { data: existing } = await supabase
            .from("guide_flow_knowledge")
            .select("id")
            .eq("source_bucket", bucket)
            .eq("source_path", file.path)
            .maybeSingle();

          if (existing) {
            // Update synced_at
            await supabase
              .from("guide_flow_knowledge")
              .update({ synced_at: new Date().toISOString() })
              .eq("id", existing.id);
            totalExisting++;
            details.push({ bucket, file: file.path, status: "existing" });
          } else {
            // Create new entry
            const titleFromName = file.name
              .replace(/\.[^.]+$/, "") // remove extension
              .replace(/[-_]/g, " ")
              .trim();

            const { error: insertErr } = await supabase
              .from("guide_flow_knowledge")
              .insert({
                title: titleFromName,
                content: `[Arquivo importado do Storage: ${bucket}/${file.path}]`,
                category: categoryMap[bucket] || "geral",
                is_active: true,
                sort_order: 0,
                source_type: "storage",
                source_bucket: bucket,
                source_path: file.path,
                synced_at: new Date().toISOString(),
                created_by: user.id,
              });

            if (insertErr) {
              totalErrors++;
              details.push({ bucket, file: file.path, status: "error", error: insertErr.message });
            } else {
              totalCreated++;
              details.push({ bucket, file: file.path, status: "created" });
            }
          }
        }
      }

      return new Response(
        JSON.stringify({
          totalFound,
          totalCreated,
          totalExisting,
          totalErrors,
          details,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CREATE
    if (action === "create") {
      const { title, content, category, is_active, sort_order } = body;
      if (!title?.trim() || !content?.trim()) {
        return new Response(JSON.stringify({ error: "Título e conteúdo são obrigatórios" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data, error } = await supabase
        .from("guide_flow_knowledge")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category: category?.trim() || "geral",
          is_active: is_active ?? true,
          sort_order: sort_order ?? 0,
          source_type: "manual",
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE
    if (action === "update") {
      const { id, title, content, category, is_active, sort_order } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (category !== undefined) updateData.category = category.trim();
      if (is_active !== undefined) updateData.is_active = is_active;
      if (sort_order !== undefined) updateData.sort_order = sort_order;

      const { data, error } = await supabase
        .from("guide_flow_knowledge")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE
    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: "ID é obrigatório" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase
        .from("guide_flow_knowledge")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("guide-flow-knowledge error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
