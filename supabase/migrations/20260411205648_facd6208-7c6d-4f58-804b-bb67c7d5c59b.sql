ALTER TABLE public.guide_flow_knowledge
  ADD COLUMN extraction_status text NOT NULL DEFAULT 'not_applicable';

COMMENT ON COLUMN public.guide_flow_knowledge.extraction_status IS 'Content extraction status: pending, success, partial, no_text, error, not_applicable';

-- Set existing storage entries to pending
UPDATE public.guide_flow_knowledge
SET extraction_status = 'pending'
WHERE source_type = 'storage';