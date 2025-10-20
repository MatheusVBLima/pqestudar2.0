import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratorConfig {
  max_age_days: number;
  min_category_distance: number;
  duplicate_similarity_threshold: number;
  topic_similarity_threshold: number;
  topic_repost_days: number;
  max_candidates: number;
  target_news_count: number;
}

interface NewsCandidate {
  title: string;
  summary: string;
  category: string;
  topic: string;
  published_at: string;
  source: string;
  source_url: string;
  image_url?: string;
  author?: string;
}

interface DecisionLog {
  candidate: NewsCandidate;
  decision: 'published' | 'discarded';
  reason: string;
}

const CATEGORIES = ['ENEM', 'Concursos', 'SISU', 'ProUni', 'FIES', 'Vestibular', 'Educação Geral'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Verificar se é admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      throw new Error('Only admins can generate news');
    }

    // Buscar configuração
    const { data: config } = await supabaseClient
      .from('news_generator_config')
      .select('*')
      .single();

    if (!config) {
      throw new Error('Generator config not found');
    }

    const generatorConfig: GeneratorConfig = config;
    
    // Logs de decisão
    const decisionLogs: DecisionLog[] = [];
    let stats = {
      candidates_fetched: 0,
      discarded_old: 0,
      discarded_duplicate_hash: 0,
      discarded_duplicate_url: 0,
      discarded_duplicate_semantic: 0,
      discarded_duplicate_topic: 0,
      published_count: 0,
    };

    // Buscar últimas notícias para verificar categoria e duplicatas
    const { data: recentNews } = await supabaseClient
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    const lastCategory = recentNews?.[0]?.category || null;
    const lastCategoryIndex = lastCategory ? CATEGORIES.indexOf(lastCategory) : -1;

    // Determinar categoria prioritária (round-robin)
    let priorityCategory = CATEGORIES[0];
    if (lastCategoryIndex >= 0) {
      const nextIndex = (lastCategoryIndex + 1) % CATEGORIES.length;
      priorityCategory = CATEGORIES[nextIndex];
    }

    console.log(`Priority category: ${priorityCategory}`);

    // Gerar candidatos usando Lovable AI
    const candidates = await generateCandidates(
      priorityCategory,
      generatorConfig.max_candidates
    );
    stats.candidates_fetched = candidates.length;

    console.log(`Fetched ${candidates.length} candidates`);

    const publishedNews: any[] = [];
    
    for (const candidate of candidates) {
      if (publishedNews.length >= generatorConfig.target_news_count) {
        console.log('Target news count reached, stopping early');
        break;
      }

      // 1. Verificar recência
      const publishedDate = new Date(candidate.published_at);
      const maxAge = new Date();
      maxAge.setDate(maxAge.getDate() - generatorConfig.max_age_days);

      if (publishedDate < maxAge) {
        stats.discarded_old++;
        decisionLogs.push({
          candidate,
          decision: 'discarded',
          reason: `Too old: published ${publishedDate.toISOString()}, max age is ${generatorConfig.max_age_days} days`,
        });
        console.log(`Discarded (old): ${candidate.title}`);
        continue;
      }

      // 2. Verificar URL duplicada
      const { data: urlCheck } = await supabaseClient
        .from('news')
        .select('id')
        .eq('source_url', candidate.source_url)
        .maybeSingle();

      if (urlCheck) {
        stats.discarded_duplicate_url++;
        decisionLogs.push({
          candidate,
          decision: 'discarded',
          reason: 'Duplicate URL',
        });
        console.log(`Discarded (duplicate URL): ${candidate.title}`);
        continue;
      }

      // 3. Criar hash do título normalizado
      const titleHash = await createTitleHash(candidate.title, candidate.source);

      const { data: hashCheck } = await supabaseClient
        .from('news')
        .select('id')
        .eq('title_hash', titleHash)
        .maybeSingle();

      if (hashCheck) {
        stats.discarded_duplicate_hash++;
        decisionLogs.push({
          candidate,
          decision: 'discarded',
          reason: 'Duplicate title hash',
        });
        console.log(`Discarded (duplicate hash): ${candidate.title}`);
        continue;
      }

      // 4. Verificar similaridade semântica com embeddings
      const embedding = await generateEmbedding(candidate.title);
      
      if (recentNews && recentNews.length > 0) {
        let isDuplicateSemantic = false;
        
        for (const existingNews of recentNews) {
          if (!existingNews.embedding) continue;
          
          const similarity = cosineSimilarity(embedding, existingNews.embedding);
          
          if (similarity >= generatorConfig.duplicate_similarity_threshold) {
            stats.discarded_duplicate_semantic++;
            decisionLogs.push({
              candidate,
              decision: 'discarded',
              reason: `Semantic duplicate: ${similarity.toFixed(2)} similarity with "${existingNews.title}"`,
            });
            console.log(`Discarded (semantic duplicate): ${candidate.title} (similarity: ${similarity})`);
            isDuplicateSemantic = true;
            break;
          }
        }
        
        if (isDuplicateSemantic) continue;
      }

      // 5. Anti-loop de tópico
      const topicEmbedding = await generateEmbedding(candidate.topic);
      const topicCutoff = new Date();
      topicCutoff.setDate(topicCutoff.getDate() - generatorConfig.topic_repost_days);

      const { data: recentTopics } = await supabaseClient
        .from('news')
        .select('topic, embedding')
        .gte('created_at', topicCutoff.toISOString());

      if (recentTopics && recentTopics.length > 0) {
        let isDuplicateTopic = false;
        
        for (const existingTopic of recentTopics) {
          if (!existingTopic.embedding) continue;
          
          const topicSimilarity = cosineSimilarity(topicEmbedding, existingTopic.embedding);
          
          if (topicSimilarity >= generatorConfig.topic_similarity_threshold) {
            stats.discarded_duplicate_topic++;
            decisionLogs.push({
              candidate,
              decision: 'discarded',
              reason: `Duplicate topic: ${topicSimilarity.toFixed(2)} similarity with topic "${existingTopic.topic}" in last ${generatorConfig.topic_repost_days} days`,
            });
            console.log(`Discarded (duplicate topic): ${candidate.topic} (similarity: ${topicSimilarity})`);
            isDuplicateTopic = true;
            break;
          }
        }
        
        if (isDuplicateTopic) continue;
      }

      // Tudo OK, publicar notícia
      const { data: inserted, error: insertError } = await supabaseClient
        .from('news')
        .insert({
          title: candidate.title,
          summary: candidate.summary,
          category: candidate.category,
          topic: candidate.topic,
          published_at: candidate.published_at,
          source: candidate.source,
          source_url: candidate.source_url,
          image_url: candidate.image_url,
          author: candidate.author,
          title_hash: titleHash,
          embedding: embedding,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting news:', insertError);
        decisionLogs.push({
          candidate,
          decision: 'discarded',
          reason: `Database error: ${insertError.message}`,
        });
        continue;
      }

      stats.published_count++;
      publishedNews.push(inserted);
      decisionLogs.push({
        candidate,
        decision: 'published',
        reason: 'Passed all validations',
      });
      console.log(`Published: ${candidate.title}`);
    }

    // Salvar log de execução
    await supabaseClient.from('news_generation_logs').insert({
      executed_by: user.id,
      candidates_fetched: stats.candidates_fetched,
      discarded_old: stats.discarded_old,
      discarded_duplicate_hash: stats.discarded_duplicate_hash,
      discarded_duplicate_url: stats.discarded_duplicate_url,
      discarded_duplicate_semantic: stats.discarded_duplicate_semantic,
      discarded_duplicate_topic: stats.discarded_duplicate_topic,
      published_count: stats.published_count,
      execution_details: { decision_logs: decisionLogs },
    });

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        published: publishedNews,
        logs: decisionLogs,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-news function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateCandidates(
  category: string,
  maxCandidates: number
): Promise<NewsCandidate[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const systemPrompt = `Você é um gerador de notícias sobre educação no Brasil. Gere notícias REAIS e RECENTES (últimos 14 dias) sobre a categoria "${category}".

IMPORTANTE:
- Use apenas fontes confiáveis: G1, UOL, Folha, Estadão, MEC, INEP
- Data de publicação deve ser dos últimos 14 dias
- Extraia o tópico principal (ex: "inscrições SISU", "resultados ENEM")
- Seja factual e preciso`;

  const userPrompt = `Gere ${maxCandidates} notícias REAIS sobre ${category} publicadas nos últimos 14 dias. Retorne em formato JSON array.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_news_batch',
              description: 'Create a batch of education news articles',
              parameters: {
                type: 'object',
                properties: {
                  news: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        summary: { type: 'string' },
                        category: { type: 'string' },
                        topic: { type: 'string' },
                        published_at: { type: 'string', format: 'date-time' },
                        source: { type: 'string' },
                        source_url: { type: 'string' },
                        image_url: { type: 'string' },
                        author: { type: 'string' },
                      },
                      required: ['title', 'summary', 'category', 'topic', 'published_at', 'source', 'source_url'],
                    },
                  },
                },
                required: ['news'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'create_news_batch' } },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const newsData = JSON.parse(toolCall.function.arguments);
    return newsData.news || [];
  } catch (error) {
    console.error('Error generating candidates:', error);
    return [];
  }
}

async function createTitleHash(title: string, source: string): Promise<string> {
  const normalized = normalizeText(title);
  const domain = new URL(source).hostname;
  const input = `${normalized}_${domain}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizeText(text: string): string {
  const stopwords = ['o', 'a', 'de', 'da', 'do', 'em', 'para', 'com', 'e', 'ou', 'que', 'no', 'na'];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !stopwords.includes(word))
    .join(' ');
}

async function generateEmbedding(text: string): Promise<number[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: normalizeText(text),
        dimensions: 384,
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Retorna vetor zero em caso de erro
    return new Array(384).fill(0);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
