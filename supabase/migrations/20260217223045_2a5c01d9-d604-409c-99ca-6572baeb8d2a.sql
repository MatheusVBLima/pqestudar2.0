
-- Backfill: insert the existing SEO audit run into insights_audit_runs
INSERT INTO public.insights_audit_runs (id, audit_type, status, started_at, finished_at, created_at, summary)
SELECT
  r.id,
  'seo',
  CASE WHEN r.status = 'success' THEN 'completed' ELSE r.status END,
  r.started_at,
  r.finished_at,
  r.created_at,
  r.summary
FROM public.seo_audit_runs r
WHERE NOT EXISTS (
  SELECT 1 FROM public.insights_audit_runs iar WHERE iar.id = r.id
);

-- Backfill: insert findings aggregated per URL
INSERT INTO public.insights_audit_findings (run_id, audit_type, url, path, score, issues, raw)
SELECT
  u.run_id,
  'seo',
  u.url,
  u.path,
  u.score,
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object(
      'category', f.category,
      'issue', f.issue,
      'impact', f.impact,
      'evidence', f.evidence,
      'fix', f.fix,
      'priority', f.priority
    ))
    FROM public.seo_audit_findings f
    WHERE f.url_id = u.id),
    '[]'::jsonb
  ),
  jsonb_build_object('health', u.health, 'status_code', u.status_code, 'ttfb_ms', u.ttfb_ms)
FROM public.seo_audit_urls u
WHERE NOT EXISTS (
  SELECT 1 FROM public.insights_audit_findings iaf
  WHERE iaf.run_id = u.run_id AND iaf.url = u.url AND iaf.audit_type = 'seo'
);
