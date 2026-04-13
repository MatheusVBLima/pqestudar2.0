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
  ritmo:     { label: "Ritmo de Leitura",     pattern: "ritmo de leitura" },
  links:     { label: "Links Internos",      pattern: "sistema de links internos" },
};

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
    const {
      tema, tipo, categoria, palavraChave, intencao, contextoAdicional,
      selectedLibrary, structureContext, libraryContext, editorialMeta,
      visualMode,
    } = body;

    // visualMode: "generate" (default) or "prompt_only"
    const shouldGenerateImages = visualMode !== "prompt_only";

    if (!tema || !categoria) {
      return new Response(JSON.stringify({ error: "Tema e categoria são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── 1. Use pre-built context from the client (Biblioteca entries) ───
    const hasStructure = !!structureContext?.trim();
    const hasLibrary = !!libraryContext?.trim();

    // Check if image directive is present in structure context
    const hasImageDirective = hasStructure && normalize(structureContext).includes(normalize("diretriz editorial de imagens"));

    // ─── 2. Fetch real data for links/CTAs ───
    const [guidesRes, toolsRes, contestsRes] = await Promise.all([
      supabase.from("guides").select("id, title, slug, category, short_description").eq("is_published", true).limit(30),
      supabase.from("tools").select("id, name, description, url").eq("is_visible", true).limit(30),
      supabase.from("oportunidades").select("id, titulo, slug, situacao, tipo").eq("publicado", true).limit(20),
    ]);

    const existingGuides = (guidesRes.data ?? []).map((g: any) => `- "${g.title}" (/guias/${g.slug}) [${g.category}]`).join("\n");
    const existingTools = (toolsRes.data ?? []).map((t: any) => `- "${t.name}": ${t.description?.slice(0, 80) ?? ""} (${t.url})`).join("\n");
    const existingContests = (contestsRes.data ?? []).map((c: any) => `- "${c.titulo}" (/concursos/${c.slug}) [${c.situacao}]`).join("\n");

    // ─── 3. Build editorial modulation section ───
    let editorialModulation = "";
    if (editorialMeta) {
      const parts: string[] = [];

      if (editorialMeta.tipo) {
        parts.push(`### Tipo de Guia: ${editorialMeta.tipo.label}
${editorialMeta.tipo.meaning || ""}
**Impacto na geração:** ${editorialMeta.tipo.impact}`);
      }

      if (editorialMeta.categoria) {
        parts.push(`### Categoria: ${editorialMeta.categoria.label}
${editorialMeta.categoria.context || ""}
${editorialMeta.categoria.impact ? `**Impacto na geração:** ${editorialMeta.categoria.impact}` : ""}`);
      }

      if (editorialMeta.intencao) {
        parts.push(`### Intenção: ${editorialMeta.intencao.label}
**Impacto na geração:** ${editorialMeta.intencao.impact}`);
      }

      if (parts.length > 0) {
        editorialModulation = `\n\n## PARÂMETROS EDITORIAIS DE MODULAÇÃO
Os parâmetros abaixo modulam o tom, a organização e o foco do conteúdo. Eles NÃO substituem as diretrizes editoriais acima — apenas ajustam a geração dentro da estrutura-base definida pelas diretrizes.

REGRA DE CONFLITO: Se houver conflito entre estes parâmetros e as diretrizes editoriais, as DIRETRIZES EDITORIAIS SEMPRE vencem.

${parts.join("\n\n")}`;
      }
    }

    // ─── 4. Build image prompts instruction ───
    const imageInstruction = hasImageDirective
      ? `\n\n## GERAÇÃO DE PROMPTS VISUAIS
A diretriz editorial de imagens está ativa. Você DEVE gerar prompts visuais para as imagens do guia.

Para cada imagem necessária (conforme a diretriz), inclua no campo "image_prompts" do JSON:
- "type": "cover" para a imagem de capa, "internal" para imagens internas
- "position": "cover" para capa, ou "after_section_N" (ex: "after_section_0") para internas
- "prompt": descrição visual detalhada em inglês para geração por IA (estilo flat illustration, cores vibrantes, sem texto na imagem, fundo limpo). OBRIGATÓRIO: cada prompt DEVE começar com "Wide 16:9 landscape format." para garantir a proporção correta.
- "alt_text": texto alternativo em português para acessibilidade
- "editorial_function": breve descrição da função editorial da imagem no contexto do guia (ex: "Ilustrar o conceito principal de organização de estudos")

Regras dos prompts visuais:
- PROPORÇÃO OBRIGATÓRIA: todas as imagens devem ser geradas em formato 16:9 (landscape, widescreen). Nunca gerar imagens quadradas ou verticais.
- Estilo consistente: flat illustration, moderno, com cores vibrantes e fundo limpo
- NÃO incluir texto na imagem — a imagem deve comunicar visualmente o conceito
- Cada prompt deve ser específico ao conteúdo da seção correspondente
- A imagem de capa deve representar o tema principal do guia
- Imagens internas devem complementar visualmente o conteúdo da seção anterior
- Gere entre 2 e 4 prompts no total (1 capa + 1-3 internas), conforme a extensão e necessidade do guia`
      : "";

    // ─── 5. Build system prompt ───
    const systemPrompt = `Você é um editor assistente do portal PqEstudar, especializado em criar guias práticos e educativos para concurseiros.

## HIERARQUIA DE PRIORIDADE DA GERAÇÃO
A geração do conteúdo deve seguir esta ordem de prioridade:
1. Diretrizes editoriais (arquivos de referência ativos) — BASE OBRIGATÓRIA
2. Tema do guia
3. Palavra-chave
4. Tipo de guia
5. Categoria
6. Intenção
7. Contexto adicional

As diretrizes editoriais definem o padrão estrutural obrigatório. Os demais campos modulam essa base, mas NUNCA a substituem.

## DIRETRIZES EDITORIAIS (BASE OBRIGATÓRIA)
${hasStructure ? `As diretrizes abaixo são a base estrutural OBRIGATÓRIA. Siga RIGOROSAMENTE cada uma delas.

${structureContext}` : "⚠ NENHUMA DIRETRIZ EDITORIAL FORNECIDA — aplique boas práticas genéricas, mas o conteúdo NÃO será considerado plenamente validado."}

## BASE FACTUAL (BIBLIOTECA)
${hasLibrary ? `Os arquivos abaixo contêm a base factual e contextual. O conteúdo gerado DEVE ser fundamentado nessas fontes. Não invente informações que não estejam presentes aqui.

${libraryContext}` : `⚠ Nenhuma biblioteca factual selecionada — NÃO afirme fatos sem fonte. Geração será genérica.`}
${editorialModulation}
${imageInstruction}

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

## Formato obrigatório de FAQ
Se o guia incluir FAQ, siga RIGOROSAMENTE esta estrutura no markdown:

1. Título fixo e OBRIGATÓRIO: \`## FAQ — Perguntas Frequentes\` (sem negrito, sem asteriscos, nível H2 sempre)
2. NUNCA use \`### FAQ\` ou \`## **FAQ**\` — o título é SEMPRE \`## FAQ — Perguntas Frequentes\` exatamente assim
3. Linha horizontal \`---\` logo abaixo do título
4. Cada bloco pergunta+resposta separado do próximo por \`---\`
5. NÃO inserir \`---\` após o último item

Exemplo:
\`\`\`
## FAQ — Perguntas Frequentes

---

### Pergunta 1?

Resposta 1.

---

### Pergunta 2?

Resposta 2.
\`\`\`

## Regras de output
Retorne EXCLUSIVAMENTE um JSON válido (sem markdown code fences) com a estrutura abaixo. Não inclua texto fora do JSON.`;

    const imageSchema = hasImageDirective
      ? `,
  "image_prompts": [
    { "type": "cover", "position": "cover", "prompt": "Wide 16:9 landscape format. detailed visual description in English for AI image generation", "alt_text": "texto alternativo em português", "editorial_function": "função editorial da imagem" },
    { "type": "internal", "position": "after_section_0", "prompt": "Wide 16:9 landscape format. ...", "alt_text": "...", "editorial_function": "..." }
  ]`
      : `,
  "cover_image_suggestion": "descrição da imagem de capa ideal"`;

    const userPrompt = `Gere um guia completo com base nos seguintes inputs:

- **Tema**: ${tema}
- **Tipo de guia**: ${editorialMeta?.tipo?.label || tipo || "prático"}
- **Categoria**: ${editorialMeta?.categoria?.label || categoria}
- **Palavra-chave principal**: ${palavraChave || tema}
- **Intenção do conteúdo**: ${editorialMeta?.intencao?.label || intencao || "informar e orientar"}
${contextoAdicional ? `- **Contexto adicional**: ${contextoAdicional}` : ""}
${selectedLibrary ? `- **Biblioteca factual**: ${selectedLibrary}` : "- **ATENÇÃO**: Nenhuma biblioteca factual selecionada — geração será genérica"}

Retorne um JSON com esta estrutura exata:
{
  "title": "título do guia",
  "slug": "slug-do-guia",
  "short_description": "descrição curta (max 160 chars)",
  "seo_title": "título SEO (max 60 chars)",
  "seo_description": "meta description (max 160 chars)",
  "category": "${editorialMeta?.categoria?.label || categoria}",
  "author_name": "Matheus Dias",
  "content_markdown": "conteúdo completo em Markdown com H2 em negrito (## **Título**), H3, listas, FAQ, etc.",
  "cta_top": { "label": "texto do botão", "url": "/caminho-interno", "text": "texto descritivo (Markdown)" },
  "cta_middle": { "label": "texto do botão", "url": "/caminho-interno", "text": "texto descritivo (Markdown)" },
  "cta_final": { "label": "texto do botão", "url": "/caminho-interno", "text": "texto descritivo (Markdown)" },
  "internal_links": [{ "label": "texto do link", "url": "/guias/slug" }]${imageSchema}
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

    // ─── Generate images if prompts are available AND visual mode allows it ───
    // Ensure all image_prompts always exist as nodes (even on failure)
    if (guideData.image_prompts && Array.isArray(guideData.image_prompts) && guideData.image_prompts.length > 0 && shouldGenerateImages) {
      console.log(`Generating ${guideData.image_prompts.length} images...`);
      const generatedImages: any[] = [];

      for (const imgPrompt of guideData.image_prompts) {
        // Ensure prompt enforces 16:9 landscape
        let visualPrompt = imgPrompt.prompt || "";
        if (!visualPrompt.toLowerCase().includes("16:9") && !visualPrompt.toLowerCase().includes("landscape")) {
          visualPrompt = `Wide 16:9 landscape format. ${visualPrompt}`;
        }

        // Base node data — always present regardless of generation outcome
        const nodeBase = {
          type: imgPrompt.type,
          position: imgPrompt.position,
          prompt: visualPrompt,
          alt_text: imgPrompt.alt_text || "",
          editorial_function: imgPrompt.editorial_function || "",
        };

        try {
          const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content: `${visualPrompt}\n\nIMPORTANT: The image MUST be in 16:9 widescreen landscape aspect ratio (e.g. 1344x768 or similar). Do NOT generate a square image.` }],
              modalities: ["image", "text"],
            }),
          });

          if (!imgResponse.ok) {
            console.error(`Image generation failed for ${imgPrompt.position}: ${imgResponse.status}`);
            generatedImages.push({ ...nodeBase, status: "error", error: `HTTP ${imgResponse.status}` });
            continue;
          }

          const imgData = await imgResponse.json();
          const base64Url = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (!base64Url) {
            console.error(`No image data returned for ${imgPrompt.position}`);
            generatedImages.push({ ...nodeBase, status: "error", error: "No image data returned" });
            continue;
          }

          // Upload to Storage
          const base64Data = base64Url.replace(/^data:image\/\w+;base64,/, "");
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const slug = guideData.slug || "guide";
          const fileName = imgPrompt.type === "cover"
            ? `${slug}-cover-${Date.now()}.png`
            : `${slug}-${imgPrompt.position}-${Date.now()}.png`;

          const { error: uploadErr } = await supabase.storage
            .from("guide-covers")
            .upload(fileName, imageBytes, { contentType: "image/png", upsert: false });

          if (uploadErr) {
            console.error(`Upload failed for ${fileName}:`, uploadErr.message);
            generatedImages.push({ ...nodeBase, status: "error", error: `Upload failed: ${uploadErr.message}` });
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from("guide-covers")
            .getPublicUrl(fileName);

          generatedImages.push({
            ...nodeBase,
            status: "success",
            url: publicUrlData.publicUrl,
            storage_path: fileName,
          });

          // Auto-set cover_image_url
          if (imgPrompt.type === "cover" && publicUrlData.publicUrl) {
            guideData.cover_image_url = publicUrlData.publicUrl;
          }

          console.log(`Image uploaded: ${fileName} (16:9 enforced)`);
        } catch (imgErr) {
          console.error(`Image generation error for ${imgPrompt.position}:`, imgErr);
          generatedImages.push({
            ...nodeBase,
            status: "error",
            error: imgErr instanceof Error ? imgErr.message : "Unknown error",
          });
        }
      }

      guideData.generated_images = generatedImages;
    }

    // Attach source metadata
    guideData._sources = {
      has_structure: hasStructure,
      has_library: hasLibrary,
      has_image_directive: hasImageDirective,
      library_name: selectedLibrary || null,
      editorial_meta: editorialMeta || null,
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
