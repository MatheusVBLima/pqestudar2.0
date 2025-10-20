import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para normalizar título (remover stopwords, pontuação, lowercase)
function normalizeTitle(title: string): string {
  const stopwords = ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'e'];
  
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .split(/\s+/)
    .filter(word => !stopwords.includes(word))
    .join(' ')
    .trim();
}

// Função para criar hash SHA-256
async function createTitleHash(normalizedTitle: string, sourceDomain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedTitle + sourceDomain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Função para extrair domínio da URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Função para calcular similaridade de cosseno entre vetores
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;
  
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (mag1 * mag2);
}

// Função para gerar embedding usando Lovable AI
async function generateEmbedding(text: string): Promise<number[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 384
    }),
  });

  if (!response.ok) {
    console.error('Embedding API error:', await response.text());
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Função para extrair tópico principal
function extractTopic(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  
  const topics = [
    { keywords: ['sisu', 'inscri'], topic: 'inscrições do SISU' },
    { keywords: ['enem', 'resulta'], topic: 'resultados ENEM' },
    { keywords: ['prouni', 'bolsa'], topic: 'bolsas ProUni' },
    { keywords: ['fies', 'financiamento'], topic: 'financiamento FIES' },
    { keywords: ['vestibular', 'prova'], topic: 'vestibular' },
    { keywords: ['concurso', 'edital'], topic: 'concursos públicos' },
  ];

  for (const { keywords, topic } of topics) {
    if (keywords.some(kw => text.includes(kw))) {
      return topic;
    }
  }

  return normalizeTitle(title).split(' ').slice(0, 3).join(' ');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticação e permissão admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar configurações
    const { data: config } = await supabaseClient
      .from('news_generator_config')
      .select('*')
      .single();

    const maxAgeDays = config?.max_age_days || 14;
    const minCategoryDistance = config?.min_category_distance || 3;
    const duplicateSimilarityThreshold = config?.duplicate_similarity_threshold || 0.88;
    const topicSimilarityThreshold = config?.topic_similarity_threshold || 0.90;
    const topicRepostDays = config?.topic_repost_days || 7;
    const maxCandidates = config?.max_candidates || 8;
    const targetNewsCount = config?.target_news_count || 3;

    // Estatísticas da execução
    const stats = {
      candidates_fetched: 0,
      discarded_old: 0,
      discarded_duplicate_hash: 0,
      discarded_duplicate_url: 0,
      discarded_duplicate_semantic: 0,
      discarded_duplicate_topic: 0,
      published_count: 0,
      execution_details: [] as any[]
    };

    // Buscar últimas notícias para verificação de duplicatas e diversidade
    const { data: recentNews } = await supabaseClient
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(200);

    const publishedNews: any[] = [];
    const categories = ['ENEM', 'Concursos', 'SISU', 'ProUni', 'FIES', 'Vestibular', 'Educação Geral'];
    let currentCategoryIndex = 0;

    // Determinar categoria inicial baseada na última notícia
    if (recentNews && recentNews.length > 0) {
      const lastCategory = recentNews[0].category;
      const lastIndex = categories.indexOf(lastCategory);
      if (lastIndex !== -1) {
        currentCategoryIndex = (lastIndex + 1) % categories.length;
      }
    }

    // Gerar candidatos usando Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    for (let i = 0; i < maxCandidates && publishedNews.length < targetNewsCount; i++) {
      stats.candidates_fetched++;
      
      const targetCategory = categories[currentCategoryIndex];
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `Você é um jornalista especializado em educação no Brasil. Gere uma notícia REAL e RECENTE sobre ${targetCategory}.`
            },
            {
              role: 'user',
              content: `Crie uma notícia sobre ${targetCategory} que seja relevante e atual. Inclua: título, resumo (máximo 200 caracteres), fonte (site de notícias brasileiro real), URL da fonte, data de publicação (nos últimos ${maxAgeDays} dias), URL de imagem (se disponível) e autor (se disponível). IMPORTANTE: A notícia deve ser de uma fonte real e verificável.`
            }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'create_news_article',
              description: 'Criar um artigo de notícia sobre educação',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Título da notícia' },
                  summary: { type: 'string', description: 'Resumo da notícia (máximo 200 caracteres)' },
                  source: { type: 'string', description: 'Nome da fonte (ex: G1, Folha, UOL)' },
                  source_url: { type: 'string', description: 'URL completa da notícia' },
                  published_at: { type: 'string', description: 'Data de publicação no formato ISO 8601' },
                  image_url: { type: 'string', description: 'URL da imagem (opcional)' },
                  author: { type: 'string', description: 'Nome do autor (opcional)' }
                },
                required: ['title', 'summary', 'source', 'source_url', 'published_at']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'create_news_article' } }
        }),
      });

      if (!response.ok) {
        console.error('AI API error:', await response.text());
        continue;
      }

      const aiData = await response.json();
      const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.error('No tool call in AI response');
        continue;
      }

      const candidate = JSON.parse(toolCall.function.arguments);
      
      // Validação 1: Recência
      const publishedDate = new Date(candidate.published_at);
      const maxAgeDate = new Date();
      maxAgeDate.setDate(maxAgeDate.getDate() - maxAgeDays);
      
      if (publishedDate < maxAgeDate || isNaN(publishedDate.getTime())) {
        stats.discarded_old++;
        stats.execution_details.push({
          title: candidate.title,
          reason: 'Data de publicação muito antiga ou inválida',
          published_at: candidate.published_at
        });
        continue;
      }

      // Validação 2: Deduplicação por URL
      if (recentNews?.some(n => n.source_url === candidate.source_url)) {
        stats.discarded_duplicate_url++;
        stats.execution_details.push({
          title: candidate.title,
          reason: 'URL duplicada'
        });
        continue;
      }

      // Validação 3: Deduplicação por hash
      const normalizedTitle = normalizeTitle(candidate.title);
      const sourceDomain = extractDomain(candidate.source_url);
      const titleHash = await createTitleHash(normalizedTitle, sourceDomain);

      if (recentNews?.some(n => n.title_hash === titleHash)) {
        stats.discarded_duplicate_hash++;
        stats.execution_details.push({
          title: candidate.title,
          reason: 'Hash de título duplicado'
        });
        continue;
      }

      // Validação 4: Deduplicação semântica com embeddings
      const titleEmbedding = await generateEmbedding(candidate.title);
      
      let isDuplicateSemantic = false;
      for (const existingNews of recentNews || []) {
        if (existingNews.embedding) {
          const similarity = cosineSimilarity(titleEmbedding, existingNews.embedding as number[]);
          if (similarity >= duplicateSimilarityThreshold) {
            isDuplicateSemantic = true;
            stats.discarded_duplicate_semantic++;
            stats.execution_details.push({
              title: candidate.title,
              reason: `Duplicata semântica (similaridade: ${similarity.toFixed(3)})`,
              similar_to: existingNews.title
            });
            break;
          }
        }
      }

      if (isDuplicateSemantic) continue;

      // Validação 5: Anti-loop de tópico
      const topic = extractTopic(candidate.title, candidate.summary);
      const topicCutoffDate = new Date();
      topicCutoffDate.setDate(topicCutoffDate.getDate() - topicRepostDays);

      let isDuplicateTopic = false;
      for (const existingNews of recentNews || []) {
        if (new Date(existingNews.published_at) < topicCutoffDate) break;
        
        if (existingNews.topic && existingNews.embedding) {
          const topicEmbedding = await generateEmbedding(topic);
          const existingTopicEmbedding = await generateEmbedding(existingNews.topic);
          const topicSimilarity = cosineSimilarity(topicEmbedding, existingTopicEmbedding);
          
          if (topicSimilarity >= topicSimilarityThreshold) {
            isDuplicateTopic = true;
            stats.discarded_duplicate_topic++;
            stats.execution_details.push({
              title: candidate.title,
              reason: `Tópico duplicado (similaridade: ${topicSimilarity.toFixed(3)})`,
              topic,
              similar_topic: existingNews.topic
            });
            break;
          }
        }
      }

      if (isDuplicateTopic) continue;

      // Publicar notícia
      const { error: insertError } = await supabaseClient
        .from('news')
        .insert({
          title: candidate.title,
          summary: candidate.summary.substring(0, 200),
          category: targetCategory,
          topic,
          published_at: publishedDate.toISOString(),
          source: candidate.source,
          source_url: candidate.source_url,
          image_url: candidate.image_url || null,
          author: candidate.author || null,
          title_hash: titleHash,
          embedding: titleEmbedding,
          created_by: user.id
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        stats.execution_details.push({
          title: candidate.title,
          reason: `Erro ao inserir: ${insertError.message}`
        });
        continue;
      }

      stats.published_count++;
      publishedNews.push(candidate);
      stats.execution_details.push({
        title: candidate.title,
        reason: 'Publicada com sucesso',
        category: targetCategory,
        topic
      });

      // Avançar para próxima categoria (round-robin)
      currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    }

    // Salvar log de execução
    await supabaseClient
      .from('news_generation_logs')
      .insert({
        executed_by: user.id,
        ...stats
      });

    return new Response(JSON.stringify({
      success: true,
      stats,
      published: publishedNews
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-news function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});