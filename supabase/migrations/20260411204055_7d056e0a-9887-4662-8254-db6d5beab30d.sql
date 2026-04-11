ALTER TABLE public.guide_flow_knowledge
  ADD COLUMN source_type text NOT NULL DEFAULT 'manual',
  ADD COLUMN source_bucket text,
  ADD COLUMN source_path text,
  ADD COLUMN synced_at timestamptz;

-- Prevent duplicate imports from the same file
ALTER TABLE public.guide_flow_knowledge
  ADD CONSTRAINT uq_knowledge_source UNIQUE (source_bucket, source_path);