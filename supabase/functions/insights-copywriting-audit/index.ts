import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { auth: { persistSession: false }, global: { headers: { Authorization: authHeader } } },
  );
  const { data: adminCheck } = await userClient.rpc('is_admin');
  if (adminCheck !== true) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { findings } = await req.json();
    if (!Array.isArray(findings) || findings.length === 0) {
      return new Response(JSON.stringify({ error: 'No findings provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: run, error: runErr } = await supabaseAdmin
      .from('insights_audit_runs')
      .insert({ audit_type: 'copywriting', status: 'running', started_at: new Date().toISOString() })
      .select('id')
      .single();

    if (runErr || !run) throw new Error('Failed to create audit run');

    const runId = run.id;
    let totalScore = 0;
    const summaryIssues: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    let totalFindings = 0;

    for (const f of findings) {
      totalScore += f.score || 0;
      if (Array.isArray(f.issues)) {
        for (const iss of f.issues) {
          const impact = iss.impact as string;
          if (impact in summaryIssues) summaryIssues[impact]++;
        }
        totalFindings += f.issues.length;
      }
      await supabaseAdmin.from('insights_audit_findings').insert({
        run_id: runId,
        audit_type: 'copywriting',
        url: f.url,
        path: f.path,
        score: f.score || 0,
        issues: f.issues || [],
        raw: f.raw || {},
      });
    }

    const avgScore = Math.round(totalScore / findings.length);
    await supabaseAdmin
      .from('insights_audit_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        summary: { avg_score: avgScore, total_findings: totalFindings, issues: summaryIssues, urls_count: findings.length },
      })
      .eq('id', runId);

    return new Response(
      JSON.stringify({ success: true, run_id: runId, urls_audited: findings.length, avg_score: avgScore }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Copywriting audit store failed:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to store audit results', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
