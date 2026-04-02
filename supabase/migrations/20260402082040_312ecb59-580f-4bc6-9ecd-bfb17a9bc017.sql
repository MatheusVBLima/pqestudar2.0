
-- Add view counter to guides
ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

-- RPC to safely increment guide view count (no client-side write needed)
CREATE OR REPLACE FUNCTION public.increment_guide_view(p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.guides
  SET views_count = views_count + 1
  WHERE slug = p_slug AND is_published = true;
END;
$$;

-- Allow anon and authenticated to call the RPC
GRANT EXECUTE ON FUNCTION public.increment_guide_view(text) TO anon, authenticated;
