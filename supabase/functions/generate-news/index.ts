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

interface ExecutionDetail {
  title?: string;
  source?: string;
  status: string;
  reason: string;
  date_detected?: string | null;
  similar_to?: string;
  topic?: string;
  similar_topic?: string;
  category?: string;
  similarity?: string;
}

interface NewsCandidate {
  title: string;
  summary: string;
  source: string;
  source_url: string;
  published_at: string;
  image_url?: string | null;
  author?: string | null;
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

    const maxAgeDays = config?.max_age_days || 15;
    const minCategoryDistance = config?.min_category_distance || 3;
    const duplicateSimilarityThreshold = config?.duplicate_similarity_threshold || 0.85;
    const topicSimilarityThreshold = config?.topic_similarity_threshold || 0.85;
    const topicRepostDays = config?.topic_repost_days || 7;
    const maxCandidates = config?.max_candidates || 8;
    const targetNewsCount = config?.target_news_count || 3;

    // Estatísticas da execução
    const stats = {
      candidates_fetched: 0,
      discarded_old: 0,
      discarded_invalid_date: 0,
      discarded_duplicate_hash: 0,
      discarded_duplicate_url: 0,
      discarded_duplicate_semantic: 0,
      discarded_duplicate_topic: 0,
      published_count: 0,
      execution_details: [] as ExecutionDetail[]
    };

    // Buscar últimas 5 notícias para verificação de diversidade de tema
    const { data: recentNews } = await supabaseClient
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(5);

    const publishedNews: NewsCandidate[] = [];
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

      const candidate = JSON.parse(toolCall.function.arguments) as NewsCandidate;
      
      // Validação 1: Data obrigatória e válida
      if (!candidate.published_at) {
        stats.discarded_invalid_date++;
        stats.execution_details.push({
          title: candidate.title,
          source: candidate.source,
          status: 'Descartado',
          reason: 'Sem data de publicação - data obrigatória',
          date_detected: null
        });
        continue;
      }

      const publishedDate = new Date(candidate.published_at);
      const now = new Date();
      const maxAgeDate = new Date();
      maxAgeDate.setDate(maxAgeDate.getDate() - maxAgeDays);
      
      // Validar: não pode ser data inválida, futura ou muito antiga (>365 dias)
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      
      if (isNaN(publishedDate.getTime())) {
        stats.discarded_invalid_date++;
        stats.execution_details.push({
          title: candidate.title,
          source: candidate.source,
          status: 'Descartado',
          reason: 'Data de publicação inválida (formato incorreto)',
          date_detected: candidate.published_at
        });
        continue;
      }
      
      if (publishedDate > now) {
        stats.discarded_invalid_date++;
        stats.execution_details.push({
          title: candidate.title,
          source: candidate.source,
          status: 'Descartado',
          reason: 'Data de publicação no futuro (não confiável)',
          date_detected: candidate.published_at
        });
        continue;
      }
      
      if (publishedDate < oneYearAgo) {
        stats.discarded_old++;
        stats.execution_details.push({
          title: candidate.title,
          source: candidate.source,
          status: 'Descartado',
          reason: `Data muito antiga (> 365 dias): ${publishedDate.toISOString().split('T')[0]}`,
          date_detected: candidate.published_at
        });
        continue;
      }
      
      // Validação 2: Janela de frescor obrigatória (parametrizável)
      if (publishedDate < maxAgeDate) {
        stats.discarded_old++;
        stats.execution_details.push({
          title: candidate.title,
          source: candidate.source,
          status: 'Descartado',
          reason: `Fora da janela de frescor (> ${maxAgeDays} dias): ${publishedDate.toISOString().split('T')[0]}`,
          date_detected: candidate.published_at
        });
        continue;
      }

      // Validação 3: Deduplicação por URL
      if (recentNews?.some(n => n.source_url === candidate.source_url)) {
        stats.discarded_duplicate_url++;
        stats.execution_details.push({
          title: candidate.title,
          source: candidate.source,
          status: 'Descartado',
          reason: 'URL duplicada',
          date_detected: candidate.published_at
        });
        continue;
      }

      // Validação 4: Deduplicação por hash
      const normalizedTitle = normalizeTitle(candidate.title);
      const sourceDomain = extractDomain(candidate.source_url);
      const titleHash = await createTitleHash(normalizedTitle, sourceDomain);

      if (recentNews?.some(n => n.title_hash === titleHash)) {
        stats.discarded_duplicate_hash++;
        stats.execution_details.push({
          title: candidate.title,
          source: candidate.source,
          status: 'Descartado',
          reason: 'Hash de título duplicado',
          date_detected: candidate.published_at
        });
        continue;
      }

      // Validação 5: Deduplicação semântica (últimas 5 notícias, threshold 0.85)
      const titleEmbedding = await generateEmbedding(candidate.title);
      
      let isDuplicateSemantic = false;
      let maxSimilarity = 0;
      let similarTitle = '';
      
      for (const existingNews of recentNews || []) {
        if (existingNews.embedding) {
          const similarity = cosineSimilarity(titleEmbedding, existingNews.embedding as number[]);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            similarTitle = existingNews.title;
          }
          
          if (similarity >= duplicateSimilarityThreshold) {
            isDuplicateSemantic = true;
            stats.discarded_duplicate_semantic++;
            stats.execution_details.push({
              title: candidate.title,
              source: candidate.source,
              status: 'Descartado',
              reason: `Tema repetido (similaridade: ${(similarity * 100).toFixed(1)}%)`,
              similar_to: existingNews.title,
              date_detected: candidate.published_at
            });
            break;
          }
        }
      }

      if (isDuplicateSemantic) continue;

      // Validação 6: Anti-loop de tópico
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
              source: candidate.source,
              status: 'Descartado',
              reason: `Tópico duplicado (similaridade: ${topicSimilarity.toFixed(3)})`,
              topic,
              similar_topic: existingNews.topic,
              date_detected: candidate.published_at
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
          source: candidate.source,
          status: 'Erro',
          reason: `Erro ao inserir: ${insertError.message}`,
          date_detected: candidate.published_at
        });
        continue;
      }

      stats.published_count++;
      publishedNews.push(candidate);
      stats.execution_details.push({
        title: candidate.title,
        source: `${candidate.source} (${candidate.source_url})`,
        status: 'Publicado',
        reason: 'Aprovada',
        category: targetCategory,
        topic,
        date_detected: new Date(candidate.published_at).toISOString().split('T')[0],
        similarity: maxSimilarity ? `${(maxSimilarity * 100).toFixed(1)}%` : 'N/A'
      });

      // Avançar para próxima categoria (round-robin)
      currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    }

    // Verificar se não encontrou nenhuma notícia válida
    if (stats.published_count === 0 && stats.candidates_fetched > 0) {
      const message = `Nenhuma notícia recente encontrada (≤ ${maxAgeDays} dias). ` +
        `Candidatos avaliados: ${stats.candidates_fetched}. ` +
        `Descartados: ${stats.discarded_old} (velhas), ${stats.discarded_invalid_date} (data inválida), ` +
        `${stats.discarded_duplicate_url + stats.discarded_duplicate_hash + stats.discarded_duplicate_semantic + stats.discarded_duplicate_topic} (duplicatas). ` +
        `Tente outra categoria ou ampliar a janela de frescor.`;
      
      // Salvar log mesmo quando não publicou nada
      await supabaseClient
        .from('news_generation_logs')
        .insert({
          executed_by: user.id,
          ...stats
        });

      return new Response(JSON.stringify({
        success: false,
        message,
        stats,
        published: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Salvar log de execução
    await supabaseClient
      .from('news_generation_logs')
      .insert({
        executed_by: user.id,
        ...stats
      });

    // Resumo para o usuário
    const summary = `Publicadas ${stats.published_count} | Descartadas ${stats.candidates_fetched - stats.published_count} ` +
      `(${stats.discarded_old} velhas, ${stats.discarded_invalid_date} sem data válida, ` +
      `${stats.discarded_duplicate_url} URL duplicada, ${stats.discarded_duplicate_hash} hash duplicado, ` +
      `${stats.discarded_duplicate_semantic} semântica, ${stats.discarded_duplicate_topic} tópico)`;

    return new Response(JSON.stringify({
      success: true,
      summary,
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
