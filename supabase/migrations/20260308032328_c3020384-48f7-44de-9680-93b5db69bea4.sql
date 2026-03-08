
-- Table: content_versions (central versioning for Copy Audit / SEO Audit)
CREATE TABLE public.content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  profile_key text NOT NULL,
  field_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'manual',
  summary text,
  previous_version_id uuid REFERENCES public.content_versions(id) ON DELETE SET NULL,
  audit_score_before integer,
  audit_score_after integer
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage content_versions"
  ON public.content_versions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_content_versions_url ON public.content_versions(url);
CREATE INDEX idx_content_versions_entity ON public.content_versions(entity_type, entity_id);
CREATE INDEX idx_content_versions_created ON public.content_versions(created_at DESC);
