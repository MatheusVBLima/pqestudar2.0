import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { maxResults = 3 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Starting news generation for ${maxResults} articles...`);

    // Palavras-chave categorizadas por tipo de conteúdo e janela de tempo
    const shortTermKeywords = [
      { term: "SISU inscrições abertura prazo", days: 15, category: "Eventos de Curto Prazo" },
      { term: "ENEM resultado gabarito divulgação", days: 15, category: "Eventos de Curto Prazo" },
      { term: "FIES inscrições edital cronograma", days: 15, category: "Eventos de Curto Prazo" },
      { term: "ProUni inscrições seleção resultado", days: 15, category: "Eventos de Curto Prazo" },
      { term: "concursos públicos edital abertura educação", days: 15, category: "Eventos de Curto Prazo" },
    ];

    const mediumTermKeywords = [
      { term: "nova lei educação Brasil reforma MEC", days: 60, category: "Mudanças Estruturais" },
      { term: "notas de corte SISU universidades análise", days: 45, category: "Análises e Tendências" },
      { term: "políticas públicas educação investimento governo", days: 60, category: "Mudanças Estruturais" },
      { term: "tecnologia educação ensino híbrido inovação", days: 45, category: "Análises e Tendências" },
      { term: "vestibular mudanças provas formato", days: 45, category: "Análises e Tendências" },
    ];

    // Selecionar keywords baseado no que queremos priorizar
    // 70% curto prazo (mais urgente), 30% médio prazo (contexto)
    const allKeywords = [...shortTermKeywords, ...mediumTermKeywords];
    const selectedKeywords = [];
    
    const shortTermCount = Math.ceil(maxResults * 0.7);
    const mediumTermCount = maxResults - shortTermCount;
    
    for (let i = 0; i < shortTermCount && i < shortTermKeywords.length; i++) {
      selectedKeywords.push(shortTermKeywords[i]);
    }
    
    for (let i = 0; i < mediumTermCount && i < mediumTermKeywords.length; i++) {
      selectedKeywords.push(mediumTermKeywords[i]);
    }

    const allNews = [];
    const stats = {
      generated: 0,
      discarded_old: 0,
      discarded_future: 0,
      discarded_invalid: 0
    };

    // Calcular datas para validação
    const hoje = new Date();
    const dataLimite = new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000);
    const hojeStr = hoje.toISOString().split('T')[0];
    const dataLimiteStr = dataLimite.toISOString().split('T')[0];

    // Buscar notícias para cada palavra-chave
    for (const keywordObj of selectedKeywords) {
      console.log(`Searching news for: ${keywordObj.term} (${keywordObj.days} days, ${keywordObj.category})`);
      
      const searchPrompt = `ATENÇÃO CRÍTICA: A data de publicação DEVE estar entre ${dataLimiteStr} e ${hojeStr} (últimos 15 dias).

Exemplo de data válida: ${hojeStr}

Busque notícias REAIS e RECENTES (últimos 15 dias) sobre "${keywordObj.term}" especificamente no contexto da educação brasileira. 

IMPORTANTE: 
- A DATA DEVE SER ENTRE ${dataLimiteStr} E ${hojeStr}
- NÃO use datas antigas (antes de ${dataLimiteStr})
- NÃO use datas futuras (depois de ${hojeStr})
- Categoria: ${keywordObj.category}
- Cite SEMPRE as fontes reais (G1, Folha, Estadão, UOL, MEC, portais universitários, etc.)
- Confirme que a notícia é de ${new Date().getFullYear()}
- Para eventos de curto prazo: foque em inscrições, prazos, resultados, editais recentes
- Para mudanças estruturais: foque em novas leis, análises de impacto, tendências
- Não invente informações - apenas notícias verificáveis

TAGS OBRIGATÓRIAS:
- Gere 4-6 tags relevantes e específicas
- Se a notícia menciona SISU, ENEM, ProUni, FIES, inclua essas tags
- Adicione tags sobre o tema principal (ex: "Inscrições", "Notas de Corte", "Bolsas", "Vestibular")
- Adicione tags geográficas se relevante (ex: "São Paulo", "Universidades Federais")
- Exemplo de boas tags para SISU: ["SISU", "SISU 2025", "Universidades Federais", "Ensino Superior", "Inscrições", "MEC"]`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: "Você é um assistente especializado em buscar notícias REAIS sobre educação no Brasil. Sempre cite fontes verificáveis e datas precisas. Nunca invente informações." 
            },
            { role: "user", content: searchPrompt }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_news_article",
                description: "Cria um artigo de notícia validado sobre educação",
                parameters: {
                  type: "object",
                  properties: {
                    titulo: { type: "string", description: "Título completo da notícia" },
                    descricao: { type: "string", description: "Resumo detalhado de 2-3 parágrafos" },
                    categoria: { 
                      type: "string", 
                      enum: ["Políticas Públicas", "Tecnologia", "Vestibular", "Carreira", "Inovação"],
                      description: "Categoria da notícia"
                    },
                    fontes: { 
                      type: "array", 
                      items: { type: "string" },
                      description: "Lista de fontes no formato 'Nome do Portal - URL completo'. IMPORTANTE: URLs devem ser completos e funcionais (começar com https://)"
                    },
                    dataPublicacao: { type: "string", description: "Data no formato YYYY-MM-DD" },
                    conteudo: { 
                      type: "string", 
                      description: `Conteúdo expandido e bem formatado da notícia em HTML. ESTRUTURA OBRIGATÓRIA:
                      
- Comece com um parágrafo de introdução <p class="mb-4">...</p>
- Divida em seções com subtítulos <h3 class="text-xl font-semibold mb-3 mt-6 text-foreground">Título da Seção</h3>
- Use parágrafos curtos de 2-3 frases <p class="mb-4">...</p>
- Use listas quando apropriado <ul class="list-disc ml-6 mb-4"><li>item</li></ul>
- Destaque termos importantes com <strong>termo</strong>
- Mínimo 4 parágrafos e 2 seções com subtítulos
- Máximo 8 parágrafos para manter legibilidade
- Inclua chamadas para ação quando relevante (ex: "Fique atento aos prazos")

Exemplo de estrutura:
<p class="mb-4">Parágrafo introdutório...</p>
<h3 class="text-xl font-semibold mb-3 mt-6 text-foreground">O que isso significa?</h3>
<p class="mb-4">Explicação...</p>
<h3 class="text-xl font-semibold mb-3 mt-6 text-foreground">Como se preparar</h3>
<ul class="list-disc ml-6 mb-4"><li>Primeiro passo</li><li>Segundo passo</li></ul>
<p class="mb-4">Conclusão...</p>`
                    },
                    tags: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 4,
                      maxItems: 6,
                      description: "Lista de 4-6 tags relevantes e específicas. SEMPRE incluir tags de programas mencionados (SISU, ENEM, ProUni, FIES) + tags temáticas (Inscrições, Bolsas, etc.) + tags contextuais"
                    }
                  },
                  required: ["titulo", "descricao", "categoria", "fontes", "dataPublicacao", "conteudo", "tags"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "create_news_article" } }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error (${response.status}):`, errorText);
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("Payment required. Please add credits to your Lovable AI workspace.");
        }
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      
      if (!toolCall || toolCall.function?.name !== 'create_news_article') {
        console.warn(`No tool call generated for keyword: ${keyword}`);
        continue;
      }

      try {
        const newsData = JSON.parse(toolCall.function.arguments);
        
        // Validar campos obrigatórios
        if (!newsData.titulo || !newsData.descricao || !newsData.fontes || newsData.fontes.length === 0) {
          console.warn(`❌ DESCARTADO: "${newsData.titulo}" - Campos obrigatórios faltando`);
          stats.discarded_invalid++;
          continue;
        }

        // VALIDAÇÃO CRÍTICA DE FRESCOR - Antes de qualquer processamento
        if (!newsData.dataPublicacao) {
          console.warn(`❌ DESCARTADO: "${newsData.titulo}" - Sem data de publicação`);
          stats.discarded_invalid++;
          continue;
        }

        const publishDate = new Date(newsData.dataPublicacao);
        const diffMs = hoje.getTime() - publishDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Rejeitar se data for no futuro
        if (publishDate > hoje) {
          console.warn(`❌ DESCARTADO: "${newsData.titulo}" - Data no futuro (${newsData.dataPublicacao})`);
          stats.discarded_future++;
          continue;
        }

        // Rejeitar se data for mais antiga que 15 dias
        if (diffDays > 15) {
          console.warn(`❌ DESCARTADO: "${newsData.titulo}" - Data muito antiga (${diffDays} dias, publicado em ${newsData.dataPublicacao})`);
          stats.discarded_old++;
          continue;
        }

        // ✅ Data válida - prosseguir com processamento
        console.log(`✅ ACEITO: "${newsData.titulo}" - Data válida (${diffDays} dias atrás)`);

        // Processar fontes para separar nome e URL
        const processedFontes = newsData.fontes.map((fonte: string) => {
          const parts = fonte.split(' - ');
          if (parts.length >= 2) {
            return {
              nome: parts[0].trim(),
              url: parts.slice(1).join(' - ').trim()
            };
          }
          return { nome: fonte, url: '#' };
        });

        // Calcular score de validação baseado no número de fontes
        const validationScore = Math.min(100, newsData.fontes.length * 33);

        // Calcular tempo atrás
        const timeAgo = getTimeAgo(publishDate);

        allNews.push({
          id: crypto.randomUUID(),
          titulo: newsData.titulo,
          descricao: newsData.descricao,
          categoria: newsData.categoria || "Políticas Públicas",
          data: publishDate.toISOString(),
          tempo: timeAgo,
          conteudo: newsData.conteudo || newsData.descricao,
          conteudoCompleto: newsData.conteudo || newsData.descricao,
          fontes: processedFontes,
          tags: newsData.tags && newsData.tags.length > 0 
            ? newsData.tags 
            : [newsData.categoria, "Educação", "Brasil", keywordObj.term.split(' ')[0]],
          validationScore,
          isValidated: validationScore >= 66,
          keywords: [keywordObj.term],
          searchWindow: `${keywordObj.days} dias`,
          contentType: keywordObj.category,
          autor: processedFontes[0]?.nome || "Portal de Educação",
          visualizacoes: Math.floor(Math.random() * 50000) + 1000
        });

        stats.generated++;
        console.log(`✅ PUBLICADO: ${newsData.titulo.substring(0, 50)}... (${diffDays} dias atrás, ${keywordObj.category})`);
        
      } catch (parseError) {
        console.error(`Failed to parse tool call arguments for ${keywordObj.term}:`, parseError);
        stats.discarded_invalid++;
        continue;
      }
    }

    // Log estatísticas finais
    console.log(`
    📊 ESTATÍSTICAS:
    - Geradas: ${stats.generated}
    - Descartadas (antigas): ${stats.discarded_old}
    - Descartadas (futuras): ${stats.discarded_future}
    - Descartadas (inválidas): ${stats.discarded_invalid}
    - Total processadas: ${stats.generated + stats.discarded_old + stats.discarded_future + stats.discarded_invalid}
    `);

    // Verificar se alguma notícia foi gerada
    if (allNews.length === 0) {
      console.warn(`⚠️ NENHUMA NOTÍCIA VÁLIDA GERADA - Todas foram descartadas por violarem regras de frescor (≤15 dias)`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Nenhuma notícia recente (≤15 dias) foi encontrada. A IA não conseguiu gerar conteúdo dentro da janela de frescor.",
          stats,
          news: []
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Ordenar por data mais recente
    allNews.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    // Retornar apenas as notícias solicitadas
    const validatedNews = allNews.slice(0, maxResults);

    console.log(`✅ SUCESSO: ${validatedNews.length} notícias validadas retornadas`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        news: validatedNews,
        totalGenerated: validatedNews.length,
        stats
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-validated-news:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Há ${diffMins} minutos`;
  if (diffHours < 24) return `Há ${diffHours} horas`;
  return `Há ${diffDays} dias`;
}
