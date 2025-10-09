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

    // Palavras-chave para busca de notícias sobre educação no Brasil
    const keywords = [
      "educação Brasil reforma ensino",
      "MEC ministério educação novas diretrizes",
      "ENEM vestibular mudanças 2025",
      "tecnologia educação ensino híbrido",
      "professores salário valorização Brasil"
    ];

    const allNews = [];

    // Buscar notícias para cada palavra-chave
    for (const keyword of keywords.slice(0, maxResults)) {
      console.log(`Searching news for: ${keyword}`);
      
      const searchPrompt = `Busque notícias REAIS e RECENTES (últimos 7 dias) sobre "${keyword}" especificamente no contexto da educação brasileira. 

IMPORTANTE: 
- Cite SEMPRE as fontes reais (G1, Folha, Estadão, UOL, etc.)
- Inclua a data exata da publicação
- Verifique se a notícia é de 2025
- Não invente informações

Retorne no formato JSON:
{
  "titulo": "título completo da notícia",
  "descricao": "resumo detalhado de 2-3 parágrafos",
  "categoria": "uma de: Políticas Públicas, Tecnologia, Vestibular, Carreira, Inovação",
  "fontes": ["Nome do Portal - URL completo", "Outro Portal - URL"],
  "dataPublicacao": "YYYY-MM-DD",
  "conteudo": "conteúdo expandido da notícia com mais detalhes"
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { 
              role: "system", 
              content: "Você é um assistente especializado em buscar notícias REAIS sobre educação no Brasil. Sempre cite fontes verificáveis e datas precisas. Nunca invente informações." 
            },
            { role: "user", content: searchPrompt }
          ],
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
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        console.warn(`No content generated for keyword: ${keyword}`);
        continue;
      }

      try {
        // Tentar extrair JSON do conteúdo
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn(`No JSON found in response for: ${keyword}`);
          continue;
        }

        const newsData = JSON.parse(jsonMatch[0]);
        
        // Validar campos obrigatórios
        if (!newsData.titulo || !newsData.descricao || !newsData.fontes || newsData.fontes.length === 0) {
          console.warn(`Invalid news data structure for: ${keyword}`);
          continue;
        }

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
          fontes: newsData.fontes,
          validationScore,
          isValidated: validationScore >= 66,
          keywords: [keyword]
        });

        console.log(`Successfully generated news: ${newsData.titulo.substring(0, 50)}...`);
        
      } catch (parseError) {
        console.error(`Failed to parse news data for ${keyword}:`, parseError);
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
