
-- =========================================
-- ANALYTICS MVP - TABLE + RLS + GRANTS + RPCs
-- =========================================

-- 1) TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  event_name text NOT NULL,
  path text,
  entity_type text,
  entity_id text,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  meta jsonb DEFAULT '{}'::jsonb
);

-- 2) INDEXES
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created ON public.analytics_events (event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON public.analytics_events (entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events (session_id, created_at);

-- 3) RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- INSERT: anon/auth pode inserir
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- SELECT: apenas admin
CREATE POLICY "Only admins can select analytics events"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin());

-- UPDATE: apenas admin
CREATE POLICY "Only admins can update analytics events"
  ON public.analytics_events FOR UPDATE
  USING (public.is_admin());

-- DELETE: apenas admin
CREATE POLICY "Only admins can delete analytics events"
  ON public.analytics_events FOR DELETE
  USING (public.is_admin());

-- 4) GRANTS
GRANT INSERT ON TABLE public.analytics_events TO anon, authenticated;

-- 5) RPCs

-- 5.1) Top tools by outbound click
CREATE OR REPLACE FUNCTION public.analytics_top_tools(start_at timestamptz, end_at timestamptz)
RETURNS TABLE(entity_id text, tool_label text, click_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    ae.entity_id,
    COALESCE(ae.meta->>'tool_slug', ae.entity_id) AS tool_label,
    COUNT(*) AS click_count
  FROM public.analytics_events ae
  WHERE ae.event_name = 'tool_outbound_click'
    AND ae.created_at >= start_at
    AND ae.created_at < end_at
    AND ae.entity_type = 'tool'
  GROUP BY ae.entity_id, ae.meta->>'tool_slug'
  ORDER BY click_count DESC
  LIMIT 50;
END;
$$;

-- 5.2) Average read time per concurso
CREATE OR REPLACE FUNCTION public.analytics_concurso_avg_read(start_at timestamptz, end_at timestamptz)
RETURNS TABLE(entity_id text, concurso_label text, avg_read_seconds numeric, total_sessions bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  WITH session_reads AS (
    SELECT
      ae.entity_id,
      ae.session_id,
      COUNT(*) * 15 AS read_seconds
    FROM public.analytics_events ae
    WHERE ae.event_name = 'concurso_read_heartbeat'
      AND ae.created_at >= start_at
      AND ae.created_at < end_at
      AND ae.entity_type = 'concurso'
    GROUP BY ae.entity_id, ae.session_id
  )
  SELECT
    sr.entity_id,
    COALESCE(MAX(ae_open.meta->>'concurso_slug'), sr.entity_id) AS concurso_label,
    ROUND(AVG(sr.read_seconds), 1) AS avg_read_seconds,
    COUNT(DISTINCT sr.session_id) AS total_sessions
  FROM session_reads sr
  LEFT JOIN LATERAL (
    SELECT meta
    FROM public.analytics_events ae_open
    WHERE ae_open.entity_id = sr.entity_id
      AND ae_open.event_name = 'concurso_detail_open'
      AND ae_open.entity_type = 'concurso'
    ORDER BY ae_open.created_at DESC
    LIMIT 1
  ) ae_open ON true
  GROUP BY sr.entity_id
  ORDER BY avg_read_seconds DESC
  LIMIT 50;
END;
$$;

-- 5.3) Event counts per concurso
CREATE OR REPLACE FUNCTION public.analytics_concurso_event_counts(start_at timestamptz, end_at timestamptz)
RETURNS TABLE(entity_id text, concurso_label text, opens bigint, edital_clicks bigint, saves bigint, shares bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    ae.entity_id,
    COALESCE(MAX(ae.meta->>'concurso_slug'), ae.entity_id) AS concurso_label,
    COUNT(*) FILTER (WHERE ae.event_name = 'concurso_detail_open') AS opens,
    COUNT(*) FILTER (WHERE ae.event_name = 'concurso_editais_click') AS edital_clicks,
    COUNT(*) FILTER (WHERE ae.event_name = 'concurso_save_click') AS saves,
    COUNT(*) FILTER (WHERE ae.event_name = 'concurso_share_click') AS shares
  FROM public.analytics_events ae
  WHERE ae.event_name IN (
      'concurso_detail_open',
      'concurso_editais_click',
      'concurso_save_click',
      'concurso_share_click'
    )
    AND ae.created_at >= start_at
    AND ae.created_at < end_at
    AND ae.entity_type = 'concurso'
  GROUP BY ae.entity_id
  ORDER BY opens DESC
  LIMIT 50;
END;
$$;

-- 6) GRANT EXECUTE nas RPCs
GRANT EXECUTE ON FUNCTION public.analytics_top_tools(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_concurso_avg_read(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_concurso_event_counts(timestamptz, timestamptz) TO authenticated;
