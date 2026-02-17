
-- Fix: add security_invoker to the view
DROP VIEW IF EXISTS public.feature_requests_with_votes;
CREATE VIEW public.feature_requests_with_votes
WITH (security_invoker = true)
AS
SELECT
  fr.*,
  COALESCE(v.vote_count, 0)::int AS votes_count
FROM public.feature_requests fr
LEFT JOIN (
  SELECT feature_id, COUNT(*)::int AS vote_count
  FROM public.feature_votes
  GROUP BY feature_id
) v ON v.feature_id = fr.id;
