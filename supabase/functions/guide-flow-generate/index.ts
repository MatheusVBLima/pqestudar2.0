import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // ─── 1. Load guide-structure files ───
    const { data: structureList } = await supabase.storage.from("guide-structure").list("", { sortBy: { column: "name", order: "asc" } });
    const structureFiles = (structureList ?? []).filter((f: any) => f.name !== ".emptyFolderPlaceholder" && f.id);
    const structureContents: { name: string; content: string }[] = [];

    for (const file of structureFiles) {
      const content = await downloadTextFile(supabase, "guide-structure", file.name);
      if (content.trim()) {
        structureContents.push({ name: file.name, content: content.trim() });
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
        if (content.trim()) {
          libraryContents.push({ name: file.name, content: content.trim() });
        }
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

    // ─── 4. Build system prompt with Storage sources ───
    let structureSection = "";
    if (structureContents.length > 0) {
      const entries = structureContents.map(f => `### Diretriz: ${f.name}\n${f.content}`).join("\n\n---\n\n");
      structureSection = `\n\n## DIRETRIZES EDITORIAIS (guide-structure)\nOs arquivos abaixo definem as regras de estrutura, estilo, linguagem e validação. Você DEVE seguir todas essas diretrizes rigorosamente.\n\n${entries}`;
    }

    let librarySection = "";
    if (libraryContents.length > 0) {
      const entries = libraryContents.map(f => `### Fonte: ${f.name}\n${f.content}`).join("\n\n---\n\n");
      librarySection = `\n\n## BASE FACTUAL (guide-library: ${selectedLibrary})\nOs arquivos abaixo contêm a base factual e contextual. O conteúdo gerado DEVE ser fundamentado nessas fontes. Não invente informações que não estejam presentes aqui.\n\n${entries}`;
    }

    const sourceStatus = structureContents.length > 0 && libraryLoaded
      ? "AMBAS as fontes estão carregadas. Gere conteúdo fundamentado e aderente."
      : structureContents.length > 0
      ? "APENAS diretrizes editoriais carregadas. Sem base factual — marque claramente onde falta informação verificável."
      : libraryLoaded
      ? "APENAS base factual carregada. Sem diretrizes editoriais — use padrões genéricos de qualidade."
      : "NENHUMA fonte carregada. Geração genérica — não afirme conformidade editorial.";

    const systemPrompt = `Você é um editor assistente do portal PqEstudar, especializado em criar guias práticos e educativos para concurseiros.

## Status das fontes
${sourceStatus}

Arquivos de guide-structure carregados: ${structureContents.length > 0 ? structureContents.map(f => f.name).join(", ") : "nenhum"}
Biblioteca factual (guide-library): ${selectedLibrary ?? "nenhuma selecionada"}
Arquivos da biblioteca carregados: ${libraryContents.length > 0 ? libraryContents.map(f => f.name).join(", ") : "nenhum"}
${structureSection}
${librarySection}

## Diretrizes base (fallback se guide-structure não estiver carregado)
- Tom: direto, profissional, amigável e empático com quem estuda para concursos
- Idioma: PT-BR
- Estrutura: H2 para seções principais (sempre em negrito: ## **Título**), H3 para subseções
- Conteúdo: prático, acionável, sem enrolação
- Primeiro parágrafo: resposta rápida e direta ao tema
- Usar listas quando ajudar na escaneabilidade
- Imagens: sugerir onde inserir imagens com placeholder <img src="URL" alt="descrição" width="100%" />
- Separar seções com --- quando fizer sentido
- Incluir FAQ no final quando relevante
- Evitar buzzwords vazias (disruptivo, inovador, revolucionário, incrível)
- Evitar frases genéricas de abertura ("neste artigo vamos falar sobre...")
- Manter frases curtas (média de 22 palavras por frase)
- Usar voz ativa sempre que possível

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
  "cover_image_suggestion": "descrição da imagem de capa ideal",
  "sources_used": {
    "structure_files": ["nomes dos arquivos de guide-structure usados"],
    "library_files": ["nomes dos arquivos de guide-library usados"],
    "library_name": "${selectedLibrary || "nenhuma"}",
    "is_factually_grounded": ${libraryLoaded}
  }
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

    // Attach source metadata to response
    guideData._sources = {
      structure_files: structureContents.map(f => f.name),
      library_name: selectedLibrary || null,
      library_files: libraryContents.map(f => f.name),
      is_factually_grounded: libraryLoaded,
      structure_loaded: structureContents.length > 0,
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
