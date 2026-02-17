
-- 1) Tabela page_views
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  path text NOT NULL,
  session_id text NOT NULL,
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  meta jsonb DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at);
CREATE INDEX idx_page_views_path_created ON public.page_views (path, created_at);
CREATE INDEX idx_page_views_session_created ON public.page_views (session_id, created_at);

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can select page views"
  ON public.page_views FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can update page views"
  ON public.page_views FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete page views"
  ON public.page_views FOR DELETE
  USING (public.is_admin());

-- 2) RPC: overview stats (visitors 30d, tools active, concursos published, CTR)
CREATE OR REPLACE FUNCTION public.admin_overview_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_visitors bigint;
  v_tools bigint;
  v_concursos bigint;
  v_clicks bigint;
  v_page_views bigint;
  v_ctr numeric;
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- Visitors: distinct sessions last 30 days
  SELECT COUNT(DISTINCT session_id) INTO v_visitors
  FROM public.page_views
  WHERE created_at >= now() - interval '30 days';

  -- Active tools
  SELECT COUNT(*) INTO v_tools
  FROM public.tools
  WHERE is_visible = true;

  -- Published concursos
  SELECT COUNT(*) INTO v_concursos
  FROM public.oportunidades
  WHERE publicado = true AND deleted_at IS NULL;

  -- Clicks on tools last 30d
  SELECT COUNT(*) INTO v_clicks
  FROM public.analytics_events
  WHERE event_name IN ('tool_card_click', 'tool_outbound_click')
    AND created_at >= now() - interval '30 days';

  -- Page views last 30d
  SELECT COUNT(*) INTO v_page_views
  FROM public.page_views
  WHERE created_at >= now() - interval '30 days';

  IF v_page_views > 0 THEN
    v_ctr := ROUND((v_clicks::numeric / v_page_views::numeric) * 100, 1);
  ELSE
    v_ctr := NULL;
  END IF;

  v_result := jsonb_build_object(
    'visitors_30d', COALESCE(v_visitors, 0),
    'tools_active', COALESCE(v_tools, 0),
    'concursos_published', COALESCE(v_concursos, 0),
    'ctr_30d', v_ctr
  );

  RETURN v_result;
END;
$$;

-- 3) RPC: visitors chart (daily unique sessions, last 30 days)
CREATE OR REPLACE FUNCTION public.admin_overview_visitors_chart()
RETURNS TABLE(day date, visitors bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT d::date AS day,
         COALESCE(pv.cnt, 0) AS visitors
  FROM generate_series(
    (now() - interval '29 days')::date,
    now()::date,
    '1 day'
  ) AS d
  LEFT JOIN (
    SELECT created_at::date AS dt, COUNT(DISTINCT session_id) AS cnt
    FROM public.page_views
    WHERE created_at >= now() - interval '30 days'
    GROUP BY created_at::date
  ) pv ON pv.dt = d::date
  ORDER BY d;
END;
$$;

-- 4) RPC: activity feed (recent activity from existing tables)
CREATE OR REPLACE FUNCTION public.admin_overview_activity(p_limit int DEFAULT 20)
RETURNS TABLE(event text, entity text, event_date timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  (
    -- Curation pages
    SELECT 'Curadoria criada' AS event, cp.title AS entity, cp.created_at AS event_date
    FROM public.curation_pages cp
    UNION ALL
    SELECT 'Curadoria atualizada', cp.title, cp.updated_at
    FROM public.curation_pages cp
    WHERE cp.updated_at > cp.created_at + interval '1 second'
  )
  UNION ALL
  (
    -- Premium items
    SELECT 'Item Premium criado', pi.title, pi.created_at
    FROM public.premium_items pi
    UNION ALL
    SELECT 'Item Premium atualizado', pi.title, pi.updated_at
    FROM public.premium_items pi
    WHERE pi.updated_at > pi.created_at + interval '1 second'
  )
  UNION ALL
  (
    -- Audit runs (SEO/Copy)
    SELECT
      CASE WHEN ar.audit_type = 'seo' THEN 'SEO Audit executado'
           WHEN ar.audit_type = 'copywriting' THEN 'Copy Audit executado'
           ELSE ar.audit_type || ' Audit executado'
      END,
      '#' || ar.id::text,
      ar.created_at
    FROM public.insights_audit_runs ar
  )
  ORDER BY event_date DESC
  LIMIT p_limit;
END;
$$;
