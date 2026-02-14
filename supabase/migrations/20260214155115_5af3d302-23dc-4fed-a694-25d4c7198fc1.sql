
-- ═══ Generic Insights Audit tables (multi-skill: seo, copywriting, etc.) ═══

-- 1) insights_audit_runs
CREATE TABLE public.insights_audit_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  audit_type text NOT NULL, -- 'seo' | 'copywriting'
  status text NOT NULL DEFAULT 'running', -- running | completed | failed
  started_at timestamptz,
  finished_at timestamptz,
  scheduled_for timestamptz,
  summary jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.insights_audit_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on insights_audit_runs"
  ON public.insights_audit_runs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_insights_audit_runs_type_created
  ON public.insights_audit_runs (audit_type, created_at DESC);

-- 2) insights_audit_findings
CREATE TABLE public.insights_audit_findings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  run_id uuid NOT NULL REFERENCES public.insights_audit_runs(id) ON DELETE CASCADE,
  audit_type text NOT NULL, -- denormalized for fast filtering
  url text NOT NULL,
  path text NOT NULL,
  score integer NOT NULL DEFAULT 100,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.insights_audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on insights_audit_findings"
  ON public.insights_audit_findings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX idx_insights_audit_findings_run
  ON public.insights_audit_findings (run_id);
CREATE INDEX idx_insights_audit_findings_type_url
  ON public.insights_audit_findings (audit_type, url);
