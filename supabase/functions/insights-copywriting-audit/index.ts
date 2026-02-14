import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_BASE = 'https://pqestudar-prototipo.lovable.app';
const STATIC_PATHS = ['/', '/ferramentas', '/concursos'];
const MAX_SLUG_SAMPLE = 10;

// ─── Copywriting checks (deterministic) ───

interface Issue {
  category: string;
  issue: string;
  impact: 'High' | 'Medium' | 'Low';
  evidence: string;
  fix: string;
  priority: number;
}

interface RawData {
  status_code: number;
  h1: string | null;
  h1_count: number;
  h2_count: number;
  headings_total: number;
  word_count: number;
  avg_sentence_length: number;
  has_lists: boolean;
  cta_buttons: string[];
  paragraphs_count: number;
  long_paragraphs: number;
  buzzwords_found: string[];
  social_proof_signals: string[];
  cta_positions: string[]; // 'top' | 'middle' | 'bottom'
  penalties: { issue: string; points: number }[];
}

const WEAK_CTAS = [
  'saiba mais', 'clique aqui', 'enviar', 'entrar', 'submit', 'sign up',
  'learn more', 'click here', 'get started', 'começar',
];

const VAGUE_TERMS = [
  'inovador', 'otimizar', 'melhor', 'completo', 'incrível', 'revolucionário',
  'líder', 'top', 'excelente', 'fantástico', 'único', 'exclusivo',
  'solução completa', 'plataforma integrada', 'all-in-one',
];

const BUZZWORDS = [
  'streamline', 'optimize', 'innovative', 'cutting-edge', 'world-class',
  'best-in-class', 'leverage', 'synergy', 'paradigm', 'disruptive',
  'otimizar', 'inovador', 'sinergia', 'paradigma', 'disruptivo',
  'revolucionário', 'next-gen', 'state-of-the-art',
];

const SOCIAL_PROOF_TERMS = [
  'depoimento', 'avaliações', 'avaliação', 'alunos', 'usuários',
  'clientes', 'empresas', 'estrelas', 'nota', 'aprovados',
  'testimonial', 'review', 'rating', 'students', 'users',
];

// ─── HTML extraction helpers ───

function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractH1(html: string): { text: string | null; count: number } {
  const matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const count = matches.length;
  const text = count > 0
    ? matches[0].replace(/<[^>]*>/g, '').trim()
    : null;
  return { text, count };
}

function countHeadings(html: string): number {
  return (html.match(/<h[1-6][\s>]/gi) || []).length;
}

function countH2(html: string): number {
  return (html.match(/<h2[\s>]/gi) || []).length;
}

function hasLists(html: string): boolean {
  return /<(ul|ol)[\s>]/i.test(html);
}

function extractCTAButtons(html: string): string[] {
  const btns: string[] = [];
  const re = /<(button|a)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]*>/g, '').trim();
    if (text.length > 0 && text.length < 60) {
      btns.push(text);
    }
  }
  return btns;
}

function estimateCTAPositions(html: string): string[] {
  const positions: string[] = [];
  const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
  if (!bodyMatch) return ['unknown'];
  const body = bodyMatch[0];
  const totalLen = body.length;
  const re = /<(button|a)[^>]*class="[^"]*btn[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const pos = m.index / totalLen;
    if (pos < 0.33) positions.push('top');
    else if (pos < 0.66) positions.push('middle');
    else positions.push('bottom');
  }
  // Also check for <a> or <button> elements broadly
  if (positions.length === 0) {
    const reBroad = /<(button)[^>]*>([\s\S]*?)<\/\1>/gi;
    while ((m = reBroad.exec(body)) !== null) {
      const pos = m.index / totalLen;
      if (pos < 0.33) positions.push('top');
      else if (pos < 0.66) positions.push('middle');
      else positions.push('bottom');
    }
  }
  return [...new Set(positions)];
}

function countParagraphs(html: string): { total: number; long: number } {
  const paras = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  let long = 0;
  for (const p of paras) {
    const text = p.replace(/<[^>]*>/g, '').trim();
    if (text.split(/\s+/).length > 60) long++;
  }
  return { total: paras.length, long };
}

function avgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0);
  return Math.round(totalWords / sentences.length);
}

function findBuzzwords(text: string): string[] {
  const lower = text.toLowerCase();
  return BUZZWORDS.filter(b => lower.includes(b.toLowerCase()));
}

function findSocialProof(text: string): string[] {
  const lower = text.toLowerCase();
  return SOCIAL_PROOF_TERMS.filter(t => lower.includes(t));
}

// ─── Analysis ───

function analyze(html: string, _path: string): { score: number; issues: Issue[]; raw: RawData } {
  const issues: Issue[] = [];
  const penalties: { issue: string; points: number }[] = [];
  let score = 100;

  const plainText = extractText(html);
  const wordCount = plainText.split(/\s+/).length;
  const { text: h1Text, count: h1Count } = extractH1(html);
  const h2Count = countH2(html);
  const headingsTotal = countHeadings(html);
  const listsPresent = hasLists(html);
  const ctaButtons = extractCTAButtons(html);
  const ctaPositions = estimateCTAPositions(html);
  const { total: paraCount, long: longParas } = countParagraphs(html);
  const avgSentLen = avgSentenceLength(plainText);
  const buzzwords = findBuzzwords(plainText);
  const socialProof = findSocialProof(plainText);

  const add = (issue: Issue, pts: number) => {
    issues.push(issue);
    penalties.push({ issue: issue.issue, points: pts });
    score -= pts;
  };

  // ═══ 1) Headline ═══
  if (h1Count === 0) {
    add({
      category: 'Headline', issue: 'H1 ausente',
      impact: 'High', evidence: 'Nenhum H1 encontrado na página.',
      fix: 'Adicione um H1 claro com a proposta de valor principal.', priority: 1,
    }, 15);
  } else {
    if (h1Text && h1Text.length > 90) {
      add({
        category: 'Headline', issue: 'H1 muito longo',
        impact: 'Medium', evidence: `H1 tem ${h1Text.length} caracteres: "${h1Text.slice(0, 60)}…"`,
        fix: 'Reduza o H1 para no máximo 90 caracteres mantendo a proposta de valor.', priority: 3,
      }, 8);
    } else if (h1Text && h1Text.length < 15) {
      add({
        category: 'Headline', issue: 'H1 muito curto',
        impact: 'Low', evidence: `H1 tem apenas ${h1Text.length} caracteres: "${h1Text}"`,
        fix: 'Expanda o H1 para comunicar a proposta de valor de forma mais específica.', priority: 4,
      }, 3);
    }
    if (h1Text) {
      const h1Lower = h1Text.toLowerCase();
      const vagueMatch = VAGUE_TERMS.filter(t => h1Lower.includes(t));
      if (vagueMatch.length > 0) {
        add({
          category: 'Headline', issue: 'H1 genérico/vago',
          impact: 'Medium', evidence: `H1 contém termos vagos: ${vagueMatch.join(', ')}. H1: "${h1Text}"`,
          fix: 'Substitua termos genéricos por benefícios concretos e específicos. Ex: "Corte 4h de relatórios para 15min" > "Otimize seu workflow".', priority: 2,
        }, 8);
      }
    }
    if (h1Count > 1) {
      add({
        category: 'Headline', issue: 'Múltiplos H1',
        impact: 'Low', evidence: `Encontrados ${h1Count} tags H1.`,
        fix: 'Use apenas um H1 por página. Use H2/H3 para seções secundárias.', priority: 4,
      }, 3);
    }
  }

  // ═══ 2) CTA ═══
  const actionVerbs = ['acess', 'começ', 'inscreva', 'crie', 'descubra', 'baixe', 'receba', 'garanta', 'experimente', 'conheça', 'veja', 'explore', 'start', 'get', 'create', 'download', 'try'];
  const hasActionCTA = ctaButtons.some(btn => {
    const lower = btn.toLowerCase();
    return actionVerbs.some(v => lower.includes(v));
  });

  if (ctaButtons.length === 0) {
    add({
      category: 'CTA', issue: 'CTA principal ausente',
      impact: 'High', evidence: 'Nenhum botão ou link de ação detectado.',
      fix: 'Adicione pelo menos um CTA com verbo de ação + benefício. Ex: "Acesse as Ferramentas Gratuitas".', priority: 1,
    }, 15);
  } else {
    if (!hasActionCTA) {
      add({
        category: 'CTA', issue: 'CTA sem verbo de ação claro',
        impact: 'Medium', evidence: `CTAs encontrados: ${ctaButtons.slice(0, 5).join(', ')}`,
        fix: 'Use a fórmula [Verbo de Ação] + [O que a pessoa ganha]. Ex: "Baixe o Guia Completo".', priority: 2,
      }, 8);
    }
    const weakFound = ctaButtons.filter(btn => WEAK_CTAS.some(w => btn.toLowerCase().includes(w)));
    if (weakFound.length > 0) {
      add({
        category: 'CTA', issue: 'CTA fraco detectado',
        impact: 'Medium', evidence: `CTAs fracos: ${weakFound.slice(0, 3).join(', ')}`,
        fix: 'Substitua CTAs genéricos ("Saiba mais", "Clique aqui") por CTAs que descrevam o benefício.', priority: 2,
      }, 8);
    }
    if (!ctaPositions.includes('bottom') && ctaPositions.length > 0) {
      add({
        category: 'Conversão', issue: 'CTA ausente no final da página',
        impact: 'Low', evidence: `CTAs encontrados apenas em: ${ctaPositions.join(', ')}`,
        fix: 'Adicione um CTA de encerramento no final da página com recap da proposta de valor.', priority: 4,
      }, 3);
    }
  }

  // ═══ 3) Clareza ═══
  if (avgSentLen > 22) {
    add({
      category: 'Clareza', issue: 'Sentenças muito longas',
      impact: 'Medium', evidence: `Média de ${avgSentLen} palavras por sentença.`,
      fix: 'Reduza sentenças para no máximo 20 palavras. Quebre ideias complexas em frases curtas.', priority: 3,
    }, 8);
  }
  if (buzzwords.length >= 3) {
    add({
      category: 'Clareza', issue: 'Excesso de buzzwords/jargão',
      impact: 'Low', evidence: `Termos encontrados: ${buzzwords.join(', ')}`,
      fix: 'Substitua buzzwords por linguagem concreta e benefícios tangíveis.', priority: 4,
    }, 3);
  } else if (buzzwords.length > 0) {
    add({
      category: 'Clareza', issue: 'Buzzwords detectados',
      impact: 'Low', evidence: `Termos: ${buzzwords.join(', ')}`,
      fix: 'Considere substituir por linguagem mais simples e direta.', priority: 5,
    }, 3);
  }

  // ═══ 4) Estrutura / Escaneabilidade ═══
  if (headingsTotal <= 1 && wordCount > 200) {
    add({
      category: 'Estrutura', issue: 'Poucos headings para o volume de texto',
      impact: 'Medium', evidence: `Apenas ${headingsTotal} heading(s) para ${wordCount} palavras.`,
      fix: 'Adicione H2/H3 a cada seção para melhorar a escaneabilidade. Regra: 1 heading a cada ~300 palavras.', priority: 3,
    }, 8);
  }
  if (wordCount > 500 && !listsPresent) {
    add({
      category: 'Estrutura', issue: 'Ausência de listas em página longa',
      impact: 'Medium', evidence: `Página com ${wordCount} palavras sem nenhuma lista (ul/ol).`,
      fix: 'Quebre informações em listas/bullets para facilitar a leitura. Benefícios, features e passos funcionam bem em listas.', priority: 3,
    }, 8);
  }
  if (longParas > 2) {
    add({
      category: 'Estrutura', issue: 'Parágrafos excessivamente longos',
      impact: 'Low', evidence: `${longParas} parágrafos com mais de 60 palavras.`,
      fix: 'Quebre parágrafos longos em blocos menores (máx. 3-4 linhas). Uma ideia por parágrafo.', priority: 4,
    }, 3);
  }

  // ═══ 5) Conversão ═══
  if (socialProof.length === 0 && wordCount > 300) {
    add({
      category: 'Conversão', issue: 'Falta de prova social',
      impact: 'Medium', evidence: 'Nenhum sinal de prova social detectado (depoimentos, avaliações, números de usuários).',
      fix: 'Adicione elementos de prova social: números de alunos/usuários, depoimentos, logos de parceiros, avaliações.', priority: 3,
    }, 8);
  }

  score = Math.max(0, score);

  const raw: RawData = {
    status_code: 0,
    h1: h1Text, h1_count: h1Count, h2_count: h2Count,
    headings_total: headingsTotal, word_count: wordCount,
    avg_sentence_length: avgSentLen, has_lists: listsPresent,
    cta_buttons: ctaButtons.slice(0, 10), paragraphs_count: paraCount,
    long_paragraphs: longParas, buzzwords_found: buzzwords,
    social_proof_signals: socialProof, cta_positions: ctaPositions,
    penalties,
  };

  return { score, issues, raw };
}

// ─── Main handler ───

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { auth: { persistSession: false }, global: { headers: { Authorization: authHeader } } }
  );
  const { data: adminCheck } = await userClient.rpc('is_admin');
  if (adminCheck !== true) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create run
  const { data: run, error: runErr } = await supabaseAdmin
    .from('insights_audit_runs')
    .insert({ audit_type: 'copywriting', status: 'running', started_at: new Date().toISOString() })
    .select('id')
    .single();

  if (runErr || !run) {
    console.error('Failed to create run:', runErr);
    return new Response(JSON.stringify({ error: 'Failed to create audit run' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const runId = run.id;

  try {
    // Build URL list
    const urls = STATIC_PATHS.map(p => ({ url: `${SITE_BASE}${p}`, path: p }));

    // Sample concurso slugs (same logic as SEO audit)
    let slugs: string[] = [];
    try {
      const { data: topConcursos } = await supabaseAdmin
        .from('analytics_events')
        .select('entity_id')
        .eq('entity_type', 'concurso')
        .eq('event_name', 'concurso_detail_open')
        .order('created_at', { ascending: false })
        .limit(100);

      if (topConcursos && topConcursos.length > 0) {
        const counts: Record<string, number> = {};
        for (const e of topConcursos) {
          if (e.entity_id) counts[e.entity_id] = (counts[e.entity_id] || 0) + 1;
        }
        slugs = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, MAX_SLUG_SAMPLE)
          .map(([id]) => id);
      }
    } catch { /* ignore */ }

    if (slugs.length < MAX_SLUG_SAMPLE) {
      const needed = MAX_SLUG_SAMPLE - slugs.length;
      const { data: recent } = await supabaseAdmin
        .from('oportunidades')
        .select('slug')
        .eq('publicado', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .limit(needed);
      if (recent) {
        for (const o of recent) {
          if (o.slug && !slugs.includes(o.slug)) slugs.push(o.slug);
        }
      }
    }

    // Resolve UUIDs to slugs
    const resolvedSlugs: string[] = [];
    for (const s of slugs) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
        const { data: op } = await supabaseAdmin.from('oportunidades').select('slug').eq('id', s).single();
        if (op?.slug) resolvedSlugs.push(op.slug);
      } else {
        resolvedSlugs.push(s);
      }
    }

    for (const slug of resolvedSlugs.slice(0, MAX_SLUG_SAMPLE)) {
      urls.push({ url: `${SITE_BASE}/concursos/${slug}`, path: `/concursos/${slug}` });
    }

    // Audit each URL
    let totalScore = 0;
    const summaryIssues = { High: 0, Medium: 0, Low: 0 };
    let totalFindings = 0;

    for (const target of urls) {
      let html = '';
      let statusCode = 0;
      try {
        const resp = await fetch(target.url, {
          redirect: 'follow',
          headers: { 'User-Agent': 'PqEstudar-Copywriting-Audit/1.0' },
        });
        statusCode = resp.status;
        html = await resp.text();
      } catch (fetchErr) {
        console.error(`Failed to fetch ${target.url}:`, fetchErr);
      }

      const { score, issues, raw } = analyze(html, target.path);
      raw.status_code = statusCode;
      totalScore += score;

      for (const iss of issues) {
        summaryIssues[iss.impact] = (summaryIssues[iss.impact] || 0) + 1;
      }
      totalFindings += issues.length;

      await supabaseAdmin.from('insights_audit_findings').insert({
        run_id: runId,
        audit_type: 'copywriting',
        url: target.url,
        path: target.path,
        score,
        issues,
        raw,
      });
    }

    const avgScore = urls.length > 0 ? Math.round(totalScore / urls.length) : 0;

    await supabaseAdmin
      .from('insights_audit_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        summary: { avg_score: avgScore, total_findings: totalFindings, issues: summaryIssues, urls_count: urls.length },
      })
      .eq('id', runId);

    return new Response(
      JSON.stringify({ success: true, run_id: runId, urls_audited: urls.length, avg_score: avgScore }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Copywriting audit failed:', err);
    await supabaseAdmin
      .from('insights_audit_runs')
      .update({ status: 'failed', finished_at: new Date().toISOString() })
      .eq('id', runId);
    return new Response(
      JSON.stringify({ error: 'Audit failed', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
