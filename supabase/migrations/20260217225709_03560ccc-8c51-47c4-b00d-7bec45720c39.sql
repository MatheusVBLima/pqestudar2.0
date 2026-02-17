
DROP FUNCTION IF EXISTS public.insights_audit_latest_findings(text);

CREATE OR REPLACE FUNCTION public.insights_audit_latest_findings(p_audit_type text)
 RETURNS TABLE(url text, path text, score integer, issue_count bigint, run_date timestamp with time zone, issues jsonb, raw jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_latest_run_id uuid;
  v_run_date timestamptz;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT id, created_at INTO v_latest_run_id, v_run_date
  FROM public.insights_audit_runs
  WHERE audit_type = p_audit_type AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_latest_run_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    f.url,
    f.path,
    f.score,
    jsonb_array_length(f.issues)::bigint AS issue_count,
    v_run_date AS run_date,
    f.issues,
    f.raw
  FROM public.insights_audit_findings f
  WHERE f.run_id = v_latest_run_id
  ORDER BY f.score ASC
  LIMIT 50;
END;
$function$;
