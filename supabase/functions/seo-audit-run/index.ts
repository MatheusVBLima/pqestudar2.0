import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_BASE = 'https://pqestudar-prototipo.lovable.app';
const STATIC_PATHS = ['/', '/ferramentas', '/concursos'];
const MAX_SLUG_SAMPLE = 10;

// ─── HTML parser helpers (regex-based, no DOM) ───

function extractTag(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m ? m[1].trim() : null;
}

function countTags(html: string, tag: string): number {
  const re = new RegExp(`<${tag}[\\s>]`, 'gi');
  return (html.match(re) || []).length;
}

function extractFirst(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = html.match(re);
  return m ? m[1].replace(/<[^>]*>/g, '').trim() : null;
}

function hasOgTags(html: string): boolean {
  return /property=["']og:(title|description|image)["']/i.test(html);
}

function extractSchemaTypes(html: string): string[] {
  const types: string[] = [];
  const scriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      const items = Array.isArray(obj) ? obj : [obj];
      for (const item of items) {
        if (item['@type']) {
          const t = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
          types.push(...t);
        }
      }
    } catch { /* skip invalid JSON-LD */ }
  }
  return [...new Set(types)];
}

// ─── Scoring ───

interface ParsedPage {
  status_code: number;
  ttfb_ms: number;
  content_type: string | null;
  canonical: string | null;
  robots_meta: string | null;
  title: string | null;
  meta_description: string | null;
  h1: string | null;
  h1_count: number;
  h2_count: number;
  og_present: boolean;
  schema_types: string[];
}

interface Finding {
  category: string;
  issue: string;
  impact: string;
  evidence: string;
  fix: string;
  priority: number;
  meta: Record<string, unknown>;
}

function analyze(parsed: ParsedPage, path: string): { score: number; health: string; findings: Finding[] } {
  let score = 100;
  const findings: Finding[] = [];

  const add = (f: Omit<Finding, 'meta'> & { meta?: Record<string, unknown> }) => {
    findings.push({ meta: {}, ...f });
  };

  if (parsed.status_code !== 200) {
    score -= 50;
    add({ category: 'crawlability', issue: `HTTP status ${parsed.status_code}`, impact: 'High', evidence: `Status code: ${parsed.status_code}`, fix: 'Ensure the page returns 200.', priority: 1 });
  }

  if (parsed.robots_meta && /noindex/i.test(parsed.robots_meta)) {
    const secretPaths = ['/acesso-kit-partida-8h3z', '/curadoria-conteudo-ia-k4f9', '/acervo-video-prod-b7g1', '/metodos-automacao-w2p5', '/recursos-alta-performance-z9x0'];
    if (!secretPaths.includes(path)) {
      score -= 40;
      add({ category: 'indexation', issue: 'Page has noindex directive', impact: 'High', evidence: `robots meta: ${parsed.robots_meta}`, fix: 'Remove noindex if this page should be indexed.', priority: 1 });
    }
  }

  if (!parsed.title) {
    score -= 15;
    add({ category: 'on-page', issue: 'Missing title tag', impact: 'High', evidence: 'No <title> found.', fix: 'Add a unique, descriptive title tag under 60 characters.', priority: 1 });
  } else {
    const len = parsed.title.length;
    if (len > 60) {
      score -= 5;
      add({ category: 'on-page', issue: 'Title too long', impact: 'Medium', evidence: `Title length: ${len} chars`, fix: 'Shorten title to under 60 characters.', priority: 3, meta: { length: len } });
    } else if (len < 10) {
      score -= 5;
      add({ category: 'on-page', issue: 'Title too short', impact: 'Medium', evidence: `Title length: ${len} chars`, fix: 'Make title more descriptive (30-60 chars recommended).', priority: 3, meta: { length: len } });
    }
  }

  if (!parsed.meta_description) {
    score -= 10;
    add({ category: 'on-page', issue: 'Missing meta description', impact: 'Medium', evidence: 'No meta description found.', fix: 'Add a compelling meta description under 160 characters.', priority: 2 });
  } else {
    const len = parsed.meta_description.length;
    if (len > 160) {
      score -= 3;
      add({ category: 'on-page', issue: 'Meta description too long', impact: 'Low', evidence: `Length: ${len} chars`, fix: 'Shorten to under 160 characters.', priority: 4, meta: { length: len } });
    }
  }

  if (!parsed.canonical) {
    score -= 10;
    add({ category: 'indexation', issue: 'Missing canonical tag', impact: 'Medium', evidence: 'No <link rel="canonical"> found.', fix: 'Add a self-referencing canonical tag.', priority: 2 });
  }

  if (parsed.h1_count === 0) {
    score -= 10;
    add({ category: 'on-page', issue: 'Missing H1', impact: 'Medium', evidence: 'No H1 tag found on page.', fix: 'Add exactly one H1 tag with the primary keyword.', priority: 2 });
  } else if (parsed.h1_count > 1) {
    score -= 8;
    add({ category: 'on-page', issue: 'Multiple H1 tags', impact: 'Medium', evidence: `Found ${parsed.h1_count} H1 tags.`, fix: 'Use exactly one H1 per page.', priority: 3, meta: { count: parsed.h1_count } });
  }

  if (!parsed.og_present) {
    score -= 5;
    add({ category: 'on-page', issue: 'Missing Open Graph tags', impact: 'Low', evidence: 'No og:title/og:description/og:image found.', fix: 'Add OG tags for better social sharing.', priority: 4 });
  }

  if (parsed.schema_types.length === 0) {
    score -= 5;
    add({ category: 'technical', issue: 'No structured data (JSON-LD)', impact: 'Low', evidence: 'No JSON-LD scripts found.', fix: 'Add relevant schema.org structured data.', priority: 4 });
  }

  if (parsed.ttfb_ms > 2500) {
    score -= 5;
    add({ category: 'technical', issue: 'Slow TTFB', impact: 'Medium', evidence: `TTFB: ${parsed.ttfb_ms}ms`, fix: 'Optimize server response time to under 800ms.', priority: 3, meta: { ttfb_ms: parsed.ttfb_ms } });
  }

  score = Math.max(0, score);
  const health = score >= 85 ? 'good' : score >= 65 ? 'ok' : 'poor';
  return { score, health, findings };
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

  // Check admin
  const authHeader = req.headers.get('Authorization');
  let isScheduled = false;

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    isScheduled = body.scheduled === true;
  } catch { /* ignore */ }

  if (!isScheduled) {
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false }, global: { headers: { Authorization: authHeader } } }
    );
    const { data: adminCheck } = await userClient.rpc('is_admin');
    if (adminCheck !== true) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  }

  // Create run in the UNIFIED insights_audit_runs table
  const { data: run, error: runErr } = await supabaseAdmin
    .from('insights_audit_runs')
    .insert({
      audit_type: 'seo',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (runErr || !run) {
    console.error('Failed to create run:', runErr);
    return new Response(JSON.stringify({ error: 'Failed to create audit run' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const runId = run.id;

  try {
    // Build URL list
    const urls = STATIC_PATHS.map(p => ({ url: `${SITE_BASE}${p}`, path: p }));

    // Sample concursos slugs
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
    } catch { /* ignore analytics errors */ }

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
          if (o.slug && !slugs.includes(o.slug)) {
            slugs.push(o.slug);
          }
        }
      }
    }

    // Resolve UUIDs to slugs
    const resolvedSlugs: string[] = [];
    for (const s of slugs) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
        const { data: op } = await supabaseAdmin
          .from('oportunidades')
          .select('slug')
          .eq('id', s)
          .single();
        if (op?.slug) resolvedSlugs.push(op.slug);
      } else {
        resolvedSlugs.push(s);
      }
    }

    for (const slug of resolvedSlugs.slice(0, MAX_SLUG_SAMPLE)) {
      urls.push({ url: `${SITE_BASE}/concursos/${slug}`, path: `/concursos/${slug}` });
    }

    // Audit each URL
    const summaryByImpact = { High: 0, Medium: 0, Low: 0 };
    let totalScore = 0;

    for (const target of urls) {
      let parsed: ParsedPage;
      try {
        const startTime = Date.now();
        const resp = await fetch(target.url, {
          redirect: 'follow',
          headers: { 'User-Agent': 'PqEstudar-SEO-Audit/1.0' },
        });
        const ttfb = Date.now() - startTime;
        const html = await resp.text();

        parsed = {
          status_code: resp.status,
          ttfb_ms: ttfb,
          content_type: resp.headers.get('content-type'),
          canonical: extractTag(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i),
          robots_meta: extractTag(html, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i),
          title: extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
          meta_description: extractTag(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i),
          h1: extractFirst(html, 'h1'),
          h1_count: countTags(html, 'h1'),
          h2_count: countTags(html, 'h2'),
          og_present: hasOgTags(html),
          schema_types: extractSchemaTypes(html),
        };
      } catch (fetchErr) {
        console.error(`Failed to fetch ${target.url}:`, fetchErr);
        parsed = {
          status_code: 0, ttfb_ms: 0, content_type: null,
          canonical: null, robots_meta: null, title: null,
          meta_description: null, h1: null, h1_count: 0,
          h2_count: 0, og_present: false, schema_types: [],
        };
      }

      const { score, health, findings } = analyze(parsed, target.path);
      totalScore += score;

      for (const f of findings) {
        summaryByImpact[f.impact as keyof typeof summaryByImpact] = (summaryByImpact[f.impact as keyof typeof summaryByImpact] || 0) + 1;
      }

      // Insert into UNIFIED insights_audit_findings table
      const issuesJsonb = findings.map(f => ({
        category: f.category,
        issue: f.issue,
        impact: f.impact,
        evidence: f.evidence,
        fix: f.fix,
        priority: f.priority,
      }));

      const { error: findingErr } = await supabaseAdmin
        .from('insights_audit_findings')
        .insert({
          run_id: runId,
          audit_type: 'seo',
          url: target.url,
          path: target.path,
          score,
          issues: issuesJsonb,
          raw: { parsed, health },
        });

      if (findingErr) {
        console.error(`Failed to insert finding for ${target.path}:`, findingErr);
      }
    }

    // Update run summary
    const avgScore = urls.length > 0 ? Math.round(totalScore / urls.length) : 0;
    await supabaseAdmin
      .from('insights_audit_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        summary: {
          avg_score: avgScore,
          health: avgScore >= 85 ? 'good' : avgScore >= 65 ? 'ok' : 'poor',
          issues: summaryByImpact,
          total_findings: summaryByImpact.High + summaryByImpact.Medium + summaryByImpact.Low,
          urls_count: urls.length,
        },
      })
      .eq('id', runId);

    return new Response(
      JSON.stringify({ success: true, run_id: runId, urls_audited: urls.length, avg_score: avgScore }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Audit failed:', err);
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
