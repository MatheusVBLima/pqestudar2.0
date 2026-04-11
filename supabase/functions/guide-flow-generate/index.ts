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
    // Auth check
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

    // Admin check
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
    const { tema, tipo, categoria, palavraChave, intencao, contextoAdicional } = body;

    if (!tema || !categoria) {
      return new Response(JSON.stringify({ error: "Tema e categoria são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch real data for contextual suggestions
    const [guidesRes, toolsRes, contestsRes] = await Promise.all([
      supabase.from("guides").select("id, title, slug, category, short_description").eq("is_published", true).limit(30),
      supabase.from("tools").select("id, name, description, url").eq("is_visible", true).limit(30),
      supabase.from("oportunidades").select("id, titulo, slug, situacao, tipo").eq("publicado", true).limit(20),
    ]);

    const existingGuides = (guidesRes.data ?? []).map((g: any) => `- "${g.title}" (/guias/${g.slug}) [${g.category}]`).join("\n");
    const existingTools = (toolsRes.data ?? []).map((t: any) => `- "${t.name}": ${t.description?.slice(0, 80) ?? ""} (${t.url})`).join("\n");
    const existingContests = (contestsRes.data ?? []).map((c: any) => `- "${c.titulo}" (/concursos/${c.slug}) [${c.situacao}]`).join("\n");

    const systemPrompt = `Você é um editor assistente do portal PqEstudar, especializado em criar guias práticos e educativos para concurseiros.

## Diretrizes editoriais
- Tom: direto, profissional, amigável e empático com quem estuda para concursos
- Idioma: PT-BR
- Estrutura: H2 para seções principais (sempre em negrito: ## **Título**), H3 para subseções
- Conteúdo: prático, acionável, sem enrolação
- Primeiro parágrafo: resposta rápida e direta ao tema
- Usar listas quando ajudar na escaneabilidade
- Imagens: sugerir onde inserir imagens com placeholder <img src="URL" alt="descrição" width="100%" />
- Separar seções com --- quando fizer sentido
- Incluir FAQ no final quando relevante

## CTAs contextuais
- CTA superior: mais leve, convite suave (ex: newsletter, kit gratuito)
- CTA intermediária: relacionada ao conteúdo sendo lido (ex: ferramenta, curadoria)
- CTA final: mais forte, conversão direta (ex: premium, curso)
- Todas devem ter relação real com o tema do guia

## Dados reais disponíveis para links e CTAs

### Guias existentes (para links úteis e referências cruzadas):
${existingGuides || "Nenhum guia publicado ainda."}

### Ferramentas disponíveis (para CTAs e recomendações):
${existingTools || "Nenhuma ferramenta disponível."}

### Concursos ativos (para contextualização):
${existingContests || "Nenhum concurso publicado."}

## Regras de output
Retorne EXCLUSIVAMENTE um JSON válido (sem markdown code fences) com a estrutura abaixo. Não inclua texto fora do JSON.`;

    const userPrompt = `Gere um guia completo com base nos seguintes inputs:

- **Tema**: ${tema}
- **Tipo de guia**: ${tipo || "prático"}
- **Categoria**: ${categoria}
- **Palavra-chave principal**: ${palavraChave || tema}
- **Intenção do conteúdo**: ${intencao || "informar e orientar"}
${contextoAdicional ? `- **Contexto/biblioteca adicional**: ${contextoAdicional}` : ""}

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
  "cta_top": {
    "label": "texto do botão",
    "url": "/caminho-interno",
    "text": "texto descritivo acima do botão (Markdown)"
  },
  "cta_middle": {
    "label": "texto do botão",
    "url": "/caminho-interno",
    "text": "texto descritivo acima do botão (Markdown)"
  },
  "cta_final": {
    "label": "texto do botão",
    "url": "/caminho-interno",
    "text": "texto descritivo acima do botão (Markdown)"
  },
  "internal_links": [
    { "label": "texto do link", "url": "/guias/slug-do-guia-relacionado" }
  ],
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

    // Parse JSON from response (handle potential markdown fences)
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
