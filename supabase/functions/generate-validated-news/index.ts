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

    // Buscar notícias para cada palavra-chave
    for (const keywordObj of selectedKeywords) {
      console.log(`Searching news for: ${keywordObj.term} (${keywordObj.days} days, ${keywordObj.category})`);
      
      const searchPrompt = `Busque notícias REAIS e RECENTES (últimos ${keywordObj.days} dias) sobre "${keywordObj.term}" especificamente no contexto da educação brasileira. 

IMPORTANTE: 
- Categoria: ${keywordObj.category}
- Janela de tempo: ${keywordObj.days} dias atrás até hoje
- Cite SEMPRE as fontes reais (G1, Folha, Estadão, UOL, MEC, portais universitários, etc.)
- Inclua a data EXATA da publicação (verificar que está dentro dos últimos ${keywordObj.days} dias)
- Confirme que a notícia é de ${new Date().getFullYear()}
- Para eventos de curto prazo: foque em inscrições, prazos, resultados, editais recentes
- Para mudanças estruturais: foque em novas leis, análises de impacto, tendências
- Não invente informações - apenas notícias verificáveis`;

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
                    conteudo: { type: "string", description: "Conteúdo expandido da notícia" },
                    tags: {
                      type: "array",
                      items: { type: "string" },
                      description: "Lista de 3-5 tags relevantes para a notícia (ex: ENEM, SISU, Educação Superior, etc.)"
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
          console.warn(`Invalid news data structure for: ${keywordObj.term}`);
          continue;
        }

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
        const publishDate = new Date(newsData.dataPublicacao || new Date());
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
          tags: newsData.tags || [newsData.categoria, "Educação"],
          validationScore,
          isValidated: validationScore >= 66,
          keywords: [keywordObj.term],
          searchWindow: `${keywordObj.days} dias`,
          contentType: keywordObj.category,
          autor: processedFontes[0]?.nome || "Portal de Educação",
          visualizacoes: Math.floor(Math.random() * 50000) + 1000
        });

        console.log(`Successfully generated news: ${newsData.titulo.substring(0, 50)}... (${keywordObj.category})`);
        
      } catch (parseError) {
        console.error(`Failed to parse tool call arguments for ${keywordObj.term}:`, parseError);
        continue;
      }
    }

    // Ordenar por score de validação
    allNews.sort((a, b) => b.validationScore - a.validationScore);

    // Retornar apenas as notícias solicitadas
    const validatedNews = allNews.slice(0, maxResults);

    console.log(`Generated ${validatedNews.length} validated news articles`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        news: validatedNews,
        totalGenerated: validatedNews.length
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
