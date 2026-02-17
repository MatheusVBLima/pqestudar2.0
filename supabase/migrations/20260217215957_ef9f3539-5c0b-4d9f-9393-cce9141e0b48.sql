
-- 1. Unified tools ranking for Insights → Ferramentas
CREATE OR REPLACE FUNCTION public.insights_tools_ranking(
  start_at timestamptz DEFAULT NULL,
  end_at timestamptz DEFAULT NULL
)
RETURNS TABLE(tool_id text, tool_name text, clicks bigint, outbound bigint, saves bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  WITH tool_clicks AS (
    SELECT
      ae.entity_id,
      COUNT(*) FILTER (WHERE ae.event_name = 'tool_card_click') AS click_count,
      COUNT(*) FILTER (WHERE ae.event_name = 'tool_outbound_click') AS outbound_count
    FROM public.analytics_events ae
    WHERE ae.entity_type = 'tool'
      AND ae.event_name IN ('tool_card_click', 'tool_outbound_click')
      AND (start_at IS NULL OR ae.created_at >= start_at)
      AND (end_at IS NULL OR ae.created_at < end_at)
    GROUP BY ae.entity_id
  ),
  tool_saves AS (
    SELECT st.tool_id::text AS entity_id, COUNT(*) AS save_count
    FROM public.saved_tools st
    WHERE (start_at IS NULL OR st.created_at >= start_at)
      AND (end_at IS NULL OR st.created_at < end_at)
    GROUP BY st.tool_id
  )
  SELECT
    COALESCE(tc.entity_id, ts.entity_id) AS tool_id,
    COALESCE(t.name, COALESCE(tc.entity_id, ts.entity_id)) AS tool_name,
    COALESCE(tc.click_count, 0)::bigint AS clicks,
    COALESCE(tc.outbound_count, 0)::bigint AS outbound,
    COALESCE(ts.save_count, 0)::bigint AS saves
  FROM tool_clicks tc
  FULL OUTER JOIN tool_saves ts ON tc.entity_id = ts.entity_id
  LEFT JOIN public.tools t ON t.id::text = COALESCE(tc.entity_id, ts.entity_id)
  ORDER BY COALESCE(tc.click_count, 0) + COALESCE(tc.outbound_count, 0) DESC
  LIMIT 50;
END;
$$;

-- 2. Concurso scroll depth stats for Insights → Concursos Leitura
CREATE OR REPLACE FUNCTION public.insights_concurso_scroll_stats(
  start_at timestamptz DEFAULT NULL,
  end_at timestamptz DEFAULT NULL
)
RETURNS TABLE(entity_id text, concurso_label text, avg_max_scroll numeric, total_sessions bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  WITH session_max AS (
    SELECT
      ae.entity_id,
      ae.session_id,
      MAX((ae.meta->>'scroll_depth')::int) AS max_depth
    FROM public.analytics_events ae
    WHERE ae.event_name = 'concurso_scroll_depth'
      AND ae.entity_type = 'concurso'
      AND (start_at IS NULL OR ae.created_at >= start_at)
      AND (end_at IS NULL OR ae.created_at < end_at)
    GROUP BY ae.entity_id, ae.session_id
  )
  SELECT
    sm.entity_id,
    COALESCE(MAX(ae_open.meta->>'concurso_slug'), sm.entity_id) AS concurso_label,
    ROUND(AVG(sm.max_depth), 0) AS avg_max_scroll,
    COUNT(DISTINCT sm.session_id) AS total_sessions
  FROM session_max sm
  LEFT JOIN LATERAL (
    SELECT meta
    FROM public.analytics_events ae_open
    WHERE ae_open.entity_id = sm.entity_id
      AND ae_open.event_name = 'concurso_detail_open'
      AND ae_open.entity_type = 'concurso'
    ORDER BY ae_open.created_at DESC
    LIMIT 1
  ) ae_open ON true
  GROUP BY sm.entity_id
  ORDER BY avg_max_scroll DESC
  LIMIT 50;
END;
$$;

-- 3. Audit score history for charts (works for both seo and copywriting)
CREATE OR REPLACE FUNCTION public.insights_audit_history(
  p_audit_type text,
  start_at timestamptz DEFAULT NULL,
  end_at timestamptz DEFAULT NULL
)
RETURNS TABLE(run_id uuid, run_date timestamptz, avg_score numeric, total_findings bigint, status text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    r.id AS run_id,
    r.created_at AS run_date,
    COALESCE(ROUND(AVG(f.score), 1), 0) AS avg_score,
    COUNT(f.id) AS total_findings,
    r.status
  FROM public.insights_audit_runs r
  LEFT JOIN public.insights_audit_findings f ON f.run_id = r.id
  WHERE r.audit_type = p_audit_type
    AND (start_at IS NULL OR r.created_at >= start_at)
    AND (end_at IS NULL OR r.created_at < end_at)
  GROUP BY r.id, r.created_at, r.status
  ORDER BY r.created_at DESC
  LIMIT 50;
END;
$$;

-- 4. Audit issues by category for the latest run
CREATE OR REPLACE FUNCTION public.insights_audit_issues_by_category(
  p_audit_type text
)
RETURNS TABLE(category text, issue_count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_latest_run_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT id INTO v_latest_run_id
  FROM public.insights_audit_runs
  WHERE audit_type = p_audit_type AND status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_latest_run_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    issue_obj->>'category' AS category,
    COUNT(*) AS issue_count
  FROM public.insights_audit_findings f,
       jsonb_array_elements(f.issues) AS issue_obj
  WHERE f.run_id = v_latest_run_id
  GROUP BY issue_obj->>'category'
  ORDER BY issue_count DESC;
END;
$$;

-- 5. Latest audit findings by URL for the table
CREATE OR REPLACE FUNCTION public.insights_audit_latest_findings(
  p_audit_type text
)
RETURNS TABLE(url text, path text, score integer, issue_count bigint, run_date timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
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
    v_run_date AS run_date
  FROM public.insights_audit_findings f
  WHERE f.run_id = v_latest_run_id
  ORDER BY f.score ASC
  LIMIT 50;
END;
$$;
