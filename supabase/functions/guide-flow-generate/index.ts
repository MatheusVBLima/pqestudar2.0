import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Explicit file-to-function mapping ───
const DIMENSION_MAP: Record<string, { label: string; pattern: string }> = {
  titulos:   { label: "Títulos",             pattern: "estilo de titulos" },
  estrutura: { label: "Estrutura Textual",   pattern: "estrutura textual" },
  imagens:   { label: "Imagens",             pattern: "diretriz editorial de imagens" },
  tipo_guia: { label: "Tipo de Guia",        pattern: "funcao de cada tipo de guia" },
  linguagem: { label: "Linguagem",           pattern: "linguagem padrao" },
  ritmo:     { label: "Ritmo de Leitura",    pattern: "ritmo de leitura" },
  links:     { label: "Links Internos",      pattern: "sistema de links internos" },
};

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function downloadTextFile(supabase: any, bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) return "";
  return await data.text();
}

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
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { tema, tipo, categoria, palavraChave, intencao, contextoAdicional, selectedLibrary } = body;

    if (!tema || !categoria) {
      return new Response(JSON.stringify({ error: "Tema e categoria são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── 1. Load guide-structure files and map explicitly ───
    const { data: structureList } = await supabase.storage.from("guide-structure").list("", { sortBy: { column: "name", order: "asc" } });
    const structureFiles = (structureList ?? []).filter((f: any) => f.name !== ".emptyFolderPlaceholder");

    // Resolve each dimension to its matching file
    const dimensionResolved: Record<string, { file: string | null; content: string }> = {};

    for (const [key, dim] of Object.entries(DIMENSION_MAP)) {
      const match = structureFiles.find((f: any) => normalize(f.name).includes(dim.pattern));
      dimensionResolved[key] = { file: match?.name ?? null, content: "" };
    }

    // Download matched files
    for (const [key, info] of Object.entries(dimensionResolved)) {
      if (info.file) {
        info.content = (await downloadTextFile(supabase, "guide-structure", info.file)).trim();
      }
    }

    // Also download any extra structure files not matched by the mapping
    const mappedFiles = new Set(Object.values(dimensionResolved).map(d => d.file).filter(Boolean));
    const extraStructure: { name: string; content: string }[] = [];
    for (const file of structureFiles) {
      if (!mappedFiles.has(file.name)) {
        const content = (await downloadTextFile(supabase, "guide-structure", file.name)).trim();
        if (content) extraStructure.push({ name: file.name, content });
      }
    }

    // ─── 2. Load guide-library files (selected folder) ───
    const libraryContents: { name: string; content: string }[] = [];
    let libraryLoaded = false;

    if (selectedLibrary) {
      const { data: libFiles } = await supabase.storage.from("guide-library").list(selectedLibrary, { sortBy: { column: "name", order: "asc" } });
      const validFiles = (libFiles ?? []).filter((f: any) => f.name !== ".emptyFolderPlaceholder" && f.id);
      for (const file of validFiles) {
        const content = await downloadTextFile(supabase, "guide-library", `${selectedLibrary}/${file.name}`);
        if (content.trim()) libraryContents.push({ name: file.name, content: content.trim() });
      }
      libraryLoaded = libraryContents.length > 0;
    }

    // ─── 3. Fetch real data for links/CTAs ───
    const [guidesRes, toolsRes, contestsRes] = await Promise.all([
      supabase.from("guides").select("id, title, slug, category, short_description").eq("is_published", true).limit(30),
      supabase.from("tools").select("id, name, description, url").eq("is_visible", true).limit(30),
      supabase.from("oportunidades").select("id, titulo, slug, situacao, tipo").eq("publicado", true).limit(20),
    ]);

    const existingGuides = (guidesRes.data ?? []).map((g: any) => `- "${g.title}" (/guias/${g.slug}) [${g.category}]`).join("\n");
    const existingTools = (toolsRes.data ?? []).map((t: any) => `- "${t.name}": ${t.description?.slice(0, 80) ?? ""} (${t.url})`).join("\n");
    const existingContests = (contestsRes.data ?? []).map((c: any) => `- "${c.titulo}" (/concursos/${c.slug}) [${c.situacao}]`).join("\n");

    // ─── 4. Build system prompt with explicit dimension mapping ───
    const dimensionSections = Object.entries(DIMENSION_MAP).map(([key, dim]) => {
      const info = dimensionResolved[key];
      if (!info.file || !info.content) {
        return `### ${dim.label}\n⚠ ARQUIVO NÃO ENCONTRADO — aplique boas práticas genéricas para esta dimensão.`;
      }
      return `### ${dim.label}\n**Arquivo fonte:** ${info.file}\n\n${info.content}`;
    }).join("\n\n---\n\n");

    let extraSection = "";
    if (extraStructure.length > 0) {
      const entries = extraStructure.map(f => `### ${f.name}\n${f.content}`).join("\n\n---\n\n");
      extraSection = `\n\n## DIRETRIZES ADICIONAIS (sem mapeamento fixo)\n${entries}`;
    }

    let librarySection = "";
    if (libraryContents.length > 0) {
      const entries = libraryContents.map(f => `### Fonte: ${f.name}\n${f.content}`).join("\n\n---\n\n");
      librarySection = `\n\n## BASE FACTUAL (guide-library: ${selectedLibrary})\nOs arquivos abaixo contêm a base factual e contextual. O conteúdo gerado DEVE ser fundamentado nessas fontes. Não invente informações que não estejam presentes aqui.\n\n${entries}`;
    }

    // Build mapping status for the response
    const mappingStatus: Record<string, { label: string; file: string | null; found: boolean }> = {};
    for (const [key, dim] of Object.entries(DIMENSION_MAP)) {
      mappingStatus[key] = { label: dim.label, file: dimensionResolved[key].file, found: !!dimensionResolved[key].file };
    }

    const allMapped = Object.values(dimensionResolved).every(d => !!d.file);
    const mappedCount = Object.values(dimensionResolved).filter(d => !!d.file).length;
    const totalDims = Object.keys(DIMENSION_MAP).length;

    const systemPrompt = `Você é um editor assistente do portal PqEstudar, especializado em criar guias práticos e educativos para concurseiros.

## Status do mapeamento editorial
${mappedCount}/${totalDims} dimensões mapeadas a arquivos reais.
${!allMapped ? "⚠ Dimensões sem arquivo fonte devem usar boas práticas genéricas — mas o conteúdo NÃO será considerado plenamente validado nessas áreas." : "✅ Todas as dimensões possuem fonte explícita."}
Biblioteca factual: ${selectedLibrary ?? "nenhuma selecionada"}${!libraryLoaded ? " (⚠ sem base factual — NÃO afirme fatos sem fonte)" : ""}

## DIRETRIZES EDITORIAIS POR DIMENSÃO
Abaixo estão as regras organizadas por função. Para cada dimensão, siga RIGOROSAMENTE o conteúdo do arquivo vinculado.

${dimensionSections}
${extraSection}
${librarySection}

## CTAs contextuais
- CTA superior: mais leve, convite suave (ex: newsletter, kit gratuito)
- CTA intermediária: relacionada ao conteúdo sendo lido (ex: ferramenta, curadoria)
- CTA final: mais forte, conversão direta (ex: premium, curso)
- Todas devem ter relação real com o tema do guia
- Labels de CTA devem ser específicas e acionáveis
- URLs de CTA devem ser internas (começar com /)

## Dados reais disponíveis para links e CTAs

### Guias existentes:
${existingGuides || "Nenhum guia publicado ainda."}

### Ferramentas disponíveis:
${existingTools || "Nenhuma ferramenta disponível."}

### Concursos ativos:
${existingContests || "Nenhum concurso publicado."}

## Regras de output
Retorne EXCLUSIVAMENTE um JSON válido (sem markdown code fences) com a estrutura abaixo. Não inclua texto fora do JSON.`;

    const userPrompt = `Gere um guia completo com base nos seguintes inputs:

- **Tema**: ${tema}
- **Tipo de guia**: ${tipo || "prático"}
- **Categoria**: ${categoria}
- **Palavra-chave principal**: ${palavraChave || tema}
- **Intenção do conteúdo**: ${intencao || "informar e orientar"}
${contextoAdicional ? `- **Contexto adicional**: ${contextoAdicional}` : ""}
${selectedLibrary ? `- **Biblioteca factual**: ${selectedLibrary}` : "- **ATENÇÃO**: Nenhuma biblioteca factual selecionada — geração será genérica"}

Retorne um JSON com esta estrutura exata:
{
  "title": "título do guia",
  "slug": "slug-do-guia",
  "short_description": "descrição curta (max 160 chars)",
  "seo_title": "título SEO (max 60 chars)",
  "seo_description": "meta description (max 160 chars)",
  "category": "${categoria}",
  "author_name": "Equipe PqEstudar",
  "content_markdown": "conteúdo completo em Markdown com H2 em negrito (## **Título**), H3, listas, FAQ, etc.",
  "cta_top": { "label": "texto do botão", "url": "/caminho-interno", "text": "texto descritivo (Markdown)" },
  "cta_middle": { "label": "texto do botão", "url": "/caminho-interno", "text": "texto descritivo (Markdown)" },
  "cta_final": { "label": "texto do botão", "url": "/caminho-interno", "text": "texto descritivo (Markdown)" },
  "internal_links": [{ "label": "texto do link", "url": "/guias/slug" }],
  "cover_image_suggestion": "descrição da imagem de capa ideal"
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      return new Response(JSON.stringify({ error: "Erro ao gerar conteúdo com IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

    let guideData;
    try {
      const cleaned = rawContent.replace(/^```json\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      guideData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent.slice(0, 500));
      return new Response(JSON.stringify({ error: "Erro ao processar resposta da IA. Tente novamente.", raw: rawContent.slice(0, 1000) }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Attach explicit mapping metadata
    guideData._sources = {
      mapping: mappingStatus,
      mapped_count: mappedCount,
      total_dimensions: totalDims,
      all_mapped: allMapped,
      extra_structure_files: extraStructure.map(f => f.name),
      library_name: selectedLibrary || null,
      library_files: libraryContents.map(f => f.name),
      is_factually_grounded: libraryLoaded,
    };

    return new Response(JSON.stringify(guideData), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("guide-flow-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
