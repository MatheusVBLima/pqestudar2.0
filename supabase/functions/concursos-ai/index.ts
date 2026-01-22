import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface AIRequest {
  action: "healthcheck" | "process";
  items?: ProcessItem[];
  enabledFunctions?: {
    classify: boolean;
    extractFields: boolean;
    generateSummary: boolean;
    suggestTags: boolean;
    evaluateReliability: boolean;
  };
  basePrompt?: string;
  maxTokensPerItem?: number;
  maxItemsPerRound?: number;
  timeoutMs?: number;
  model?: string;
}

interface ProcessItem {
  id: string;
  source_url: string;
  source_title?: string;
  rawContent?: string;
}

interface AIResult {
  id: string;
  success: boolean;
  error?: string;
  data?: {
    categoria_detectada?: string;
    tipo_detectado?: string;
    situacao_detectada?: string;
    orgao_detectado?: string;
    banca_detectada?: string;
    escolaridade_detectada?: string;
    abrangencia_detectada?: string;
    ano_detectado?: number;
    titulo_sugerido?: string;
    resumo_editorial?: string;
    confiabilidade?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const body: AIRequest = await req.json();
    const { action } = body;

    // Get environment configs
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const OPENAI_BASE_URL = Deno.env.get("OPENAI_BASE_URL") || "https://api.openai.com/v1";
    const OPENAI_DEFAULT_MODEL = Deno.env.get("OPENAI_DEFAULT_MODEL") || "gpt-4o-mini";
    const OPENAI_TIMEOUT_MS = parseInt(Deno.env.get("OPENAI_TIMEOUT_MS") || "20000");
    const AI_MAX_TOKENS_PER_ITEM = parseInt(Deno.env.get("AI_MAX_TOKENS_PER_ITEM") || "2000");
    const AI_MAX_ITEMS_PER_ROUND = parseInt(Deno.env.get("AI_MAX_ITEMS_PER_ROUND") || "20");

    // HEALTHCHECK
    if (action === "healthcheck") {
      if (!OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ 
            status: "error", 
            message: "OPENAI_API_KEY não configurada no ambiente",
            hasKey: false,
            model: OPENAI_DEFAULT_MODEL,
            baseUrl: OPENAI_BASE_URL,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        // Minimal API call to verify the key works
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: OPENAI_DEFAULT_MODEL,
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[concursos-ai] Healthcheck failed:", response.status, errorText);
          
          if (response.status === 401) {
            return new Response(
              JSON.stringify({ 
                status: "error", 
                message: "Chave de API inválida ou expirada",
                hasKey: true,
                model: OPENAI_DEFAULT_MODEL,
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          if (response.status === 429) {
            return new Response(
              JSON.stringify({ 
                status: "warning", 
                message: "Rate limit atingido. Tente novamente em alguns segundos.",
                hasKey: true,
                model: OPENAI_DEFAULT_MODEL,
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({ 
              status: "warning", 
              message: `Erro na API: ${response.status}`,
              hasKey: true,
              model: OPENAI_DEFAULT_MODEL,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const elapsed = Date.now() - startTime;
        console.debug(`[concursos-ai] Healthcheck OK, ${elapsed}ms`);

        return new Response(
          JSON.stringify({ 
            status: "ok", 
            message: "Conexão com OpenAI funcionando",
            hasKey: true,
            model: OPENAI_DEFAULT_MODEL,
            responseTimeMs: elapsed,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (err) {
        console.error("[concursos-ai] Healthcheck error:", err);
        
        if (err.name === "AbortError") {
          return new Response(
            JSON.stringify({ 
              status: "warning", 
              message: "Timeout na conexão (10s)",
              hasKey: true,
              model: OPENAI_DEFAULT_MODEL,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ 
            status: "error", 
            message: err.message || "Erro ao conectar com OpenAI",
            hasKey: true,
            model: OPENAI_DEFAULT_MODEL,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // PROCESS items
    if (action === "process") {
      if (!OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ error: "OPENAI_API_KEY não configurada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { 
        items = [], 
        enabledFunctions = {}, 
        basePrompt = "",
        maxTokensPerItem = AI_MAX_TOKENS_PER_ITEM,
        maxItemsPerRound = AI_MAX_ITEMS_PER_ROUND,
        timeoutMs = OPENAI_TIMEOUT_MS,
        model = OPENAI_DEFAULT_MODEL,
      } = body;

      // Apply limits
      const effectiveMaxTokens = Math.min(maxTokensPerItem, AI_MAX_TOKENS_PER_ITEM);
      const effectiveMaxItems = Math.min(maxItemsPerRound, AI_MAX_ITEMS_PER_ROUND);
      const effectiveTimeout = Math.min(timeoutMs, OPENAI_TIMEOUT_MS);

      if (items.length === 0) {
        return new Response(
          JSON.stringify({ error: "Nenhum item para processar" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const hasEnabledFunctions = Object.values(enabledFunctions).some(Boolean);
      if (!hasEnabledFunctions) {
        return new Response(
          JSON.stringify({ error: "Nenhuma função de IA habilitada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Limit items per round
      const itemsToProcess = items.slice(0, effectiveMaxItems);
      const skippedCount = items.length - itemsToProcess.length;

      const results: AIResult[] = [];

      for (const item of itemsToProcess) {
        try {
          const result = await processItem({
            item,
            enabledFunctions,
            basePrompt,
            maxTokens: effectiveMaxTokens,
            timeout: effectiveTimeout,
            model,
            apiKey: OPENAI_API_KEY,
            baseUrl: OPENAI_BASE_URL,
          });
          results.push(result);
        } catch (err) {
          console.error(`[concursos-ai] Error processing item ${item.id}:`, err);
          results.push({
            id: item.id,
            success: false,
            error: err.message || "Erro desconhecido",
          });
        }
      }

      const elapsed = Date.now() - startTime;
      console.debug(`[concursos-ai] Processed ${results.length} items in ${elapsed}ms`);

      return new Response(
        JSON.stringify({ 
          results,
          processed: results.length,
          skipped: skippedCount,
          executionTimeMs: elapsed,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[concursos-ai] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processItem({
  item,
  enabledFunctions,
  basePrompt,
  maxTokens,
  timeout,
  model,
  apiKey,
  baseUrl,
}: {
  item: ProcessItem;
  enabledFunctions: AIRequest["enabledFunctions"];
  basePrompt: string;
  maxTokens: number;
  timeout: number;
  model: string;
  apiKey: string;
  baseUrl: string;
}): Promise<AIResult> {
  // Build the prompt based on enabled functions
  const functionPrompts: string[] = [];

  if (enabledFunctions?.classify) {
    functionPrompts.push(`
- CLASSIFICAR: Determine a categoria (Concurso, Políticas Públicas, Educação) e tipo (Concurso, Programa educacional, Processo seletivo).`);
  }

  if (enabledFunctions?.extractFields) {
    functionPrompts.push(`
- EXTRAIR CAMPOS: Identifique: órgão responsável, banca organizadora, situação (Previsto, Edital publicado, Aberto, Encerrado), escolaridade (Fundamental, Médio, Superior), abrangência (Nacional, Estadual, Municipal), ano.`);
  }

  if (enabledFunctions?.generateSummary) {
    functionPrompts.push(`
- RESUMO EDITORIAL: Crie um resumo curto (máx. 2 parágrafos) com as informações principais.`);
  }

  if (enabledFunctions?.suggestTags) {
    functionPrompts.push(`
- SUGERIR TÍTULO: Sugira um título claro e informativo para a oportunidade.`);
  }

  if (enabledFunctions?.evaluateReliability) {
    functionPrompts.push(`
- AVALIAR CONFIABILIDADE: Pontue de 0 a 100 a confiabilidade da fonte (gov.br = 90+, portais oficiais = 80+, blogs = 50-, etc).`);
  }

  const systemPrompt = `${basePrompt}

FUNÇÕES SOLICITADAS:
${functionPrompts.join("\n")}

RESPONDA EM JSON COM A SEGUINTE ESTRUTURA (apenas os campos solicitados):
{
  "categoria_detectada": "string ou null",
  "tipo_detectado": "string ou null",
  "situacao_detectada": "string ou null",
  "orgao_detectado": "string ou null",
  "banca_detectada": "string ou null",
  "escolaridade_detectada": "string ou null",
  "abrangencia_detectada": "string ou null",
  "ano_detectado": number ou null,
  "titulo_sugerido": "string ou null",
  "resumo_editorial": "string ou null",
  "confiabilidade": number (0-100) ou null
}

Se não conseguir determinar um campo, use null. NUNCA invente informações.`;

  const userContent = `
URL da fonte: ${item.source_url}
Título da fonte: ${item.source_title || "Não informado"}
${item.rawContent ? `\nConteúdo:\n${item.rawContent.slice(0, 3000)}` : ""}
`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      // Retry once on 429 or 5xx
      if (response.status === 429 || response.status >= 500) {
        console.debug(`[concursos-ai] Retrying after ${response.status}...`);
        await new Promise(r => setTimeout(r, 2000));
        
        const retryResponse = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            max_tokens: maxTokens,
            temperature: 0.3,
            response_format: { type: "json_object" },
          }),
        });

        if (!retryResponse.ok) {
          throw new Error(`API error: ${retryResponse.status}`);
        }

        const retryData = await retryResponse.json();
        const content = retryData.choices?.[0]?.message?.content;
        if (!content) throw new Error("No content in retry response");
        
        const parsed = JSON.parse(content);
        return { id: item.id, success: true, data: parsed };
      }

      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in response");
    }

    const parsed = JSON.parse(content);
    return { id: item.id, success: true, data: parsed };

  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err.name === "AbortError") {
      throw new Error("Timeout excedido");
    }
    throw err;
  }
}
