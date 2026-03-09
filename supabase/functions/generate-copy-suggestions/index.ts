import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CopyField {
  key: string;
  label: string;
  value: string;
  maxLength?: number;
  warnLength?: number;
}

interface CopyIssue {
  issue: string;
  category: string;
  evidence: string;
  fix: string;
}

interface RequestBody {
  url: string;
  fields: CopyField[];
  issues?: CopyIssue[];
  profileKey: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, fields, issues, profileKey } = (await req.json()) as RequestBody;

    if (!fields || fields.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhum campo fornecido para otimização" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context about current issues
    const issuesContext = issues && issues.length > 0
      ? `\n\nProblemas identificados na auditoria atual:\n${issues.map(i => `- ${i.category}: ${i.issue} — ${i.fix}`).join('\n')}`
      : '';

    // Build fields context
    const fieldsContext = fields.map(f => {
      const limits = [];
      if (f.warnLength) limits.push(`ideal: ${f.warnLength} caracteres`);
      if (f.maxLength) limits.push(`máximo: ${f.maxLength} caracteres`);
      const limitsStr = limits.length > 0 ? ` (${limits.join(', ')})` : '';
      return `- ${f.label}${limitsStr}: "${f.value || '(vazio)'}"`;
    }).join('\n');

    const systemPrompt = `Você é um especialista em copywriting para web, focado em conversão e clareza. Seu trabalho é melhorar textos de páginas web seguindo estas regras:

## Princípios de Copywriting

1. **Clareza > Criatividade**: Se precisar escolher, sempre seja claro.
2. **Benefícios > Features**: Descreva o que o usuário ganha, não o que o produto faz.
3. **Específico > Vago**: Evite termos genéricos como "inovador", "otimizar", "revolucionário", "completo", "melhor".
4. **Linguagem simples**: Use palavras comuns. "Use" ao invés de "utilize", "ajuda" ao invés de "facilita".
5. **Voz ativa**: "Geramos relatórios" ao invés de "Relatórios são gerados".
6. **Confiante**: Remova palavras como "quase", "muito", "realmente".
7. **Mostre, não conte**: Descreva resultados ao invés de usar adjetivos.

## Regras para cada tipo de campo

### Title Tag (SEO)
- Máximo 60 caracteres ideal, nunca ultrapasse o limite máximo informado
- Formato: [Benefício principal] | [Nome do site]
- Inclua a palavra-chave principal
- Seja específico sobre o conteúdo da página

### Meta Description
- 140-160 caracteres ideal
- Inclua um CTA implícito ou benefício claro
- Não use buzzwords vazios
- Deve complementar o título, não repetir

### Título do Hero (H1)
- Uma proposta de valor clara
- Benefício principal que o usuário obtém
- Sem jargões corporativos
- Máximo 90 caracteres ideal

### Descrição do Hero
- 1-2 frases curtas
- Expanda o benefício do H1
- Inclua prova social se possível (números, resultados)
- Termine com uma direção clara de ação

## Tom de voz do PqEstudar
- Profissional e direto
- Educativo sem ser condescendente
- Motivador sem hype exagerado
- Focado em resultados práticos para estudantes e concurseiros

## Importante
- Nunca invente números, estatísticas ou promessas falsas
- Respeite SEMPRE os limites de caracteres informados
- Mantenha coerência entre os campos (título, descrição, H1 devem se complementar)
- Se um campo já estiver bom, faça apenas ajustes mínimos`;

    const userPrompt = `Melhore os textos da página "${url}" (perfil: ${profileKey}).

Campos atuais:
${fieldsContext}
${issuesContext}

Retorne APENAS um JSON com as sugestões melhoradas, no formato:
{
  "suggestions": {
    "campo_key": "texto melhorado",
    ...
  },
  "reasoning": "breve explicação das mudanças (1-2 frases)"
}

Importante:
- Use exatamente as mesmas keys dos campos fornecidos
- Respeite os limites de caracteres de cada campo
- Se um campo já estiver bom, inclua-o com ajustes mínimos ou idêntico
- Seja conciso e direto`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro no serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from the response (handle markdown code blocks)
    let parsed;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Falha ao processar sugestões da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-copy-suggestions error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
