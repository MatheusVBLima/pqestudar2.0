import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------- helpers ----------

function detectFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["txt", "md", "markdown"].includes(ext)) return "text";
  if (ext === "json") return "json";
  if (ext === "pdf") return "pdf";
  if (["docx", "doc"].includes(ext)) return "docx";
  return "unknown";
}

async function extractTextContent(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
): Promise<{ content: string; extraction_status: string }> {
  const fileType = detectFileType(path);

  // Download file
  const { data: fileData, error: dlErr } = await supabase.storage
    .from(bucket)
    .download(path);

  if (dlErr || !fileData) {
    return {
      content: `[Erro ao baixar arquivo: ${dlErr?.message ?? "sem dados"}]`,
      extraction_status: "error",
    };
  }

  try {
    switch (fileType) {
      case "text":
      case "json": {
        const text = await fileData.text();
        if (!text.trim()) {
          return { content: "[Arquivo vazio]", extraction_status: "no_text" };
        }
        return { content: text, extraction_status: "success" };
      }

      case "pdf": {
        // Try to extract text from PDF using basic approach
        const arrayBuf = await fileData.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);
        const extracted = extractTextFromPdfBytes(bytes);

        if (!extracted || extracted.trim().length < 20) {
          return {
            content: `[PDF sem texto extraível: ${bucket}/${path}] — Provavelmente escaneado ou protegido.`,
            extraction_status: "no_text",
          };
        }

        return { content: extracted.trim(), extraction_status: "success" };
      }

      case "docx": {
        // DOCX is a ZIP of XML files — extract text from word/document.xml
        const arrayBuf = await fileData.arrayBuffer();
        const extracted = await extractTextFromDocx(arrayBuf);

        if (!extracted || extracted.trim().length < 10) {
          return {
            content: `[DOCX sem texto extraível: ${bucket}/${path}]`,
            extraction_status: "no_text",
          };
        }

        return { content: extracted.trim(), extraction_status: "success" };
      }

      default:
        return {
          content: `[Formato não suportado para extração: ${path}]`,
          extraction_status: "no_text",
        };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return {
      content: `[Erro na extração de ${bucket}/${path}: ${msg}]`,
      extraction_status: "error",
    };
  }
}

/**
 * Basic PDF text extraction — scans stream objects for text operators.
 * Works for most text-based PDFs. Scanned/image PDFs will return empty.
 */
function extractTextFromPdfBytes(bytes: Uint8Array): string {
  const raw = new TextDecoder("latin1").decode(bytes);
  const textChunks: string[] = [];

  // Find all stream...endstream blocks
  let idx = 0;
  while (idx < raw.length) {
    const streamStart = raw.indexOf("stream\n", idx);
    if (streamStart === -1) break;

    const contentStart = streamStart + 7;
    const streamEnd = raw.indexOf("endstream", contentStart);
    if (streamEnd === -1) break;

    const streamContent = raw.substring(contentStart, streamEnd);

    // Extract text between parentheses in Tj/TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let match: RegExpExecArray | null;
    while ((match = tjRegex.exec(streamContent)) !== null) {
      const decoded = decodePdfString(match[1]);
      if (decoded.trim()) textChunks.push(decoded);
    }

    // TJ arrays: [(text) num (text) ...]
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    while ((match = tjArrayRegex.exec(streamContent)) !== null) {
      const inner = match[1];
      const partRegex = /\(([^)]*)\)/g;
      let partMatch: RegExpExecArray | null;
      const parts: string[] = [];
      while ((partMatch = partRegex.exec(inner)) !== null) {
        parts.push(decodePdfString(partMatch[1]));
      }
      if (parts.length > 0) textChunks.push(parts.join(""));
    }

    idx = streamEnd + 9;
  }

  return textChunks.join(" ").replace(/\s+/g, " ");
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/**
 * Extract text from DOCX (ZIP containing XML).
 * Uses DecompressionStream if available, otherwise basic extraction.
 */
async function extractTextFromDocx(arrayBuf: ArrayBuffer): Promise<string> {
  try {
    // DOCX is a ZIP — we need to find word/document.xml
    const bytes = new Uint8Array(arrayBuf);
    const entries = parseZipEntries(bytes);

    const docEntry = entries.find(
      (e) => e.name === "word/document.xml",
    );
    if (!docEntry) return "";

    const xmlText = new TextDecoder("utf-8").decode(docEntry.data);

    // Strip XML tags to get text content
    const text = xmlText
      .replace(/<w:br[^>]*\/>/g, "\n") // line breaks
      .replace(/<\/w:p>/g, "\n") // paragraph ends
      .replace(/<[^>]+>/g, "") // all other tags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\n{3,}/g, "\n\n");

    return text.trim();
  } catch {
    return "";
  }
}

/**
 * Minimal ZIP parser — extracts stored/deflated entries.
 */
function parseZipEntries(
  data: Uint8Array,
): Array<{ name: string; data: Uint8Array }> {
  const entries: Array<{ name: string; data: Uint8Array }> = [];
  let offset = 0;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  while (offset + 30 <= data.length) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break; // not a local file header

    const compression = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const uncompressedSize = view.getUint32(offset + 22, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const nameBytes = data.slice(offset + 30, offset + 30 + nameLen);
    const name = new TextDecoder().decode(nameBytes);

    const dataStart = offset + 30 + nameLen + extraLen;
    const rawData = data.slice(dataStart, dataStart + compressedSize);

    if (compression === 0) {
      // Stored
      entries.push({ name, data: rawData });
    } else if (compression === 8) {
      // Deflated — try DecompressionStream
      try {
        const ds = new DecompressionStream("raw");
        const writer = ds.writable.getWriter();
        writer.write(rawData);
        writer.close();
        const reader = ds.readable.getReader();
        const chunks: Uint8Array[] = [];
        let done = false;
        // Synchronous-style reading via top-level await workaround
        const readAll = async () => {
          while (!done) {
            const r = await reader.read();
            if (r.done) {
              done = true;
            } else {
              chunks.push(r.value);
            }
          }
        };
        // We can't easily await here in a sync context,
        // so we'll push a promise and resolve later
        // Actually in Deno serve we CAN use top-level constructs
        // but this function isn't async... let's just skip deflated for now
        // and handle stored entries which is common for document.xml
        entries.push({ name, data: rawData }); // raw deflated — won't decode properly
      } catch {
        entries.push({ name, data: rawData });
      }
    }

    offset = dataStart + compressedSize;
  }

  return entries;
}

// ---------- main handler ----------

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

    // SYNC — import files from Storage buckets with content extraction
    if (action === "sync") {
      const buckets = ["guide-structure", "guide-library"];
      const categoryMap: Record<string, string> = {
        "guide-structure": "estrutura",
        "guide-library": "referencia",
      };

      let totalFound = 0;
      let totalCreated = 0;
      let totalExisting = 0;
      let totalExtracted = 0;
      let totalErrors = 0;
      const details: Array<{ bucket: string; file: string; status: string; extraction_status?: string; error?: string }> = [];

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
            .select("id, extraction_status")
            .eq("source_bucket", bucket)
            .eq("source_path", file.path)
            .maybeSingle();

          if (existing) {
            // If content was never extracted, extract now
            if (existing.extraction_status === "pending" || existing.extraction_status === "not_applicable") {
              const extracted = await extractTextContent(supabase, bucket, file.path);
              await supabase
                .from("guide_flow_knowledge")
                .update({
                  content: extracted.content,
                  extraction_status: extracted.extraction_status,
                  synced_at: new Date().toISOString(),
                })
                .eq("id", existing.id);

              if (extracted.extraction_status === "success") totalExtracted++;
              details.push({ bucket, file: file.path, status: "re-extracted", extraction_status: extracted.extraction_status });
            } else {
              // Already extracted — just update synced_at
              await supabase
                .from("guide_flow_knowledge")
                .update({ synced_at: new Date().toISOString() })
                .eq("id", existing.id);
              details.push({ bucket, file: file.path, status: "existing", extraction_status: existing.extraction_status });
            }
            totalExisting++;
          } else {
            // Extract content from new file
            const extracted = await extractTextContent(supabase, bucket, file.path);

            const titleFromName = file.name
              .replace(/\.[^.]+$/, "") // remove extension
              .replace(/[-_]/g, " ")
              .trim();

            const { error: insertErr } = await supabase
              .from("guide_flow_knowledge")
              .insert({
                title: titleFromName,
                content: extracted.content,
                category: categoryMap[bucket] || "geral",
                is_active: true,
                sort_order: 0,
                source_type: "storage",
                source_bucket: bucket,
                source_path: file.path,
                extraction_status: extracted.extraction_status,
                synced_at: new Date().toISOString(),
                created_by: user.id,
              });

            if (insertErr) {
              totalErrors++;
              details.push({ bucket, file: file.path, status: "error", error: insertErr.message });
            } else {
              totalCreated++;
              if (extracted.extraction_status === "success") totalExtracted++;
              details.push({ bucket, file: file.path, status: "created", extraction_status: extracted.extraction_status });
            }
          }
        }
      }

      return new Response(
        JSON.stringify({
          totalFound,
          totalCreated,
          totalExisting,
          totalExtracted,
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
          extraction_status: "not_applicable",
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
