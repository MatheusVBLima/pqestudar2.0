
-- ============================================
-- SEO Audit tables
-- ============================================

-- 1) seo_audit_runs
CREATE TABLE public.seo_audit_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'running',
  scheduled boolean NOT NULL DEFAULT false,
  started_at timestamptz,
  finished_at timestamptz,
  urls_count int NOT NULL DEFAULT 0,
  summary jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.seo_audit_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_audit_runs"
  ON public.seo_audit_runs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_seo_audit_runs_created_at ON public.seo_audit_runs (created_at DESC);

-- 2) seo_audit_urls
CREATE TABLE public.seo_audit_urls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.seo_audit_runs(id) ON DELETE CASCADE,
  url text NOT NULL,
  path text NOT NULL,
  status_code int,
  ttfb_ms int,
  content_type text,
  canonical text,
  robots_meta text,
  title text,
  meta_description text,
  h1 text,
  h1_count int NOT NULL DEFAULT 0,
  h2_count int NOT NULL DEFAULT 0,
  og_present boolean NOT NULL DEFAULT false,
  schema_types text[] NOT NULL DEFAULT '{}',
  score int NOT NULL DEFAULT 0,
  health text NOT NULL DEFAULT 'poor'
);

ALTER TABLE public.seo_audit_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_audit_urls"
  ON public.seo_audit_urls FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_seo_audit_urls_run_score ON public.seo_audit_urls (run_id, score);
CREATE INDEX idx_seo_audit_urls_run_path ON public.seo_audit_urls (run_id, path);

-- 3) seo_audit_findings
CREATE TABLE public.seo_audit_findings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid NOT NULL REFERENCES public.seo_audit_runs(id) ON DELETE CASCADE,
  url_id uuid NOT NULL REFERENCES public.seo_audit_urls(id) ON DELETE CASCADE,
  category text NOT NULL,
  issue text NOT NULL,
  impact text NOT NULL,
  evidence text,
  fix text,
  priority int NOT NULL DEFAULT 3,
  meta jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.seo_audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_audit_findings"
  ON public.seo_audit_findings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_seo_audit_findings_run_impact ON public.seo_audit_findings (run_id, impact, priority);
CREATE INDEX idx_seo_audit_findings_url_id ON public.seo_audit_findings (url_id);

-- Grant service role implicit access (RLS bypassed by service role)
-- Grant authenticated basic access (RLS will filter)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_audit_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_audit_urls TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_audit_findings TO authenticated;
