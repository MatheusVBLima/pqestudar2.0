ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS cta_top_text text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cta_middle_text text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cta_final_text text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS internal_links jsonb DEFAULT '[]'::jsonb;