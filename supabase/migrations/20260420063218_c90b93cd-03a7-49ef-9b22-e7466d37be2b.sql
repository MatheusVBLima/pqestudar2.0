
-- ============================================================
-- 1) ADICIONAR actor_type EM analytics_events E page_views
-- ============================================================

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS actor_type text NOT NULL DEFAULT 'unknown'
  CHECK (actor_type IN ('public', 'admin', 'unknown'));

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS actor_type text NOT NULL DEFAULT 'unknown'
  CHECK (actor_type IN ('public', 'admin', 'unknown'));

CREATE INDEX IF NOT EXISTS idx_analytics_events_actor_type
  ON public.analytics_events(actor_type);

CREATE INDEX IF NOT EXISTS idx_page_views_actor_type
  ON public.page_views(actor_type);

-- ============================================================
-- 2) CRIAR TABELA admin_activity_events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid,
  admin_email text,
  area text NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  path text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at
  ON public.admin_activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_user
  ON public.admin_activity_events(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_area
  ON public.admin_activity_events(area);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action
  ON public.admin_activity_events(action);

ALTER TABLE public.admin_activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_activity_events"
  ON public.admin_activity_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert admin_activity_events"
  ON public.admin_activity_events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() AND admin_user_id = auth.uid());

-- ============================================================
-- 3) BACKFILL: marcar eventos antigos de admins conhecidos
-- ============================================================

UPDATE public.analytics_events ae
SET actor_type = 'admin'
WHERE ae.user_id IS NOT NULL
  AND ae.actor_type = 'unknown'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = ae.user_id AND ur.role = 'admin'
  );

UPDATE public.analytics_events
SET actor_type = 'public'
WHERE actor_type = 'unknown';

UPDATE public.page_views pv
SET actor_type = 'admin'
WHERE pv.user_id IS NOT NULL
  AND pv.actor_type = 'unknown'
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = pv.user_id AND ur.role = 'admin'
  );

UPDATE public.page_views
SET actor_type = 'public'
WHERE actor_type = 'unknown';

-- ============================================================
-- 4) ATUALIZAR FUNÇÕES PÚBLICAS PARA EXCLUIR ADMIN
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_overview_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  SELECT COUNT(DISTINCT session_id) INTO v_visitors
  FROM public.page_views
  WHERE created_at >= now() - interval '30 days'
    AND actor_type = 'public';

  SELECT COUNT(*) INTO v_tools
  FROM public.tools
  WHERE is_visible = true;

  SELECT COUNT(*) INTO v_concursos
  FROM public.oportunidades
  WHERE publicado = true AND deleted_at IS NULL;

  SELECT COUNT(*) INTO v_clicks
  FROM public.analytics_events
  WHERE event_name IN ('tool_card_click', 'tool_outbound_click')
    AND created_at >= now() - interval '30 days'
    AND actor_type = 'public';

  SELECT COUNT(*) INTO v_page_views
  FROM public.page_views
  WHERE created_at >= now() - interval '30 days'
    AND actor_type = 'public';

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
$function$;

CREATE OR REPLACE FUNCTION public.admin_overview_visitors_chart()
 RETURNS TABLE(day date, visitors bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      AND actor_type = 'public'
    GROUP BY created_at::date
  ) pv ON pv.dt = d::date
  ORDER BY d;
END;
$function$;

-- Atualizar também as RPCs de insights (tools, concursos) para filtrar público
CREATE OR REPLACE FUNCTION public.analytics_top_tools(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS TABLE(entity_id text, tool_label text, click_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE ae.event_name IN ('tool_card_click', 'tool_outbound_click')
    AND ae.created_at >= start_at
    AND ae.created_at < end_at
    AND ae.entity_type = 'tool'
    AND ae.actor_type = 'public'
  GROUP BY ae.entity_id, ae.meta->>'tool_slug'
  ORDER BY click_count DESC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.analytics_concurso_event_counts(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS TABLE(entity_id text, concurso_label text, opens bigint, edital_clicks bigint, saves bigint, shares bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND ae.actor_type = 'public'
  GROUP BY ae.entity_id
  ORDER BY opens DESC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.analytics_concurso_avg_read(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS TABLE(entity_id text, concurso_label text, avg_read_seconds numeric, total_sessions bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      AND ae.actor_type = 'public'
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
      AND ae_open.actor_type = 'public'
    ORDER BY ae_open.created_at DESC
    LIMIT 1
  ) ae_open ON true
  GROUP BY sr.entity_id
  ORDER BY avg_read_seconds DESC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insights_tools_ranking(start_at timestamp with time zone DEFAULT NULL::timestamp with time zone, end_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(tool_id text, tool_name text, clicks bigint, outbound bigint, saves bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      AND ae.actor_type = 'public'
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
$function$;

CREATE OR REPLACE FUNCTION public.insights_concurso_scroll_stats(start_at timestamp with time zone DEFAULT NULL::timestamp with time zone, end_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(entity_id text, concurso_label text, avg_max_scroll numeric, total_sessions bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      AND ae.actor_type = 'public'
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
      AND ae_open.actor_type = 'public'
    ORDER BY ae_open.created_at DESC
    LIMIT 1
  ) ae_open ON true
  GROUP BY sm.entity_id
  ORDER BY avg_max_scroll DESC
  LIMIT 50;
END;
$function$;

-- ============================================================
-- 5) NOVAS RPCs PARA O DASHBOARD ADMINISTRATIVO
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_activity_overview(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_admin_pageviews bigint;
  v_admin_actions bigint;
  v_unique_admins bigint;
  v_unique_areas bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COUNT(*) INTO v_admin_pageviews
  FROM public.page_views
  WHERE actor_type = 'admin'
    AND created_at >= start_at
    AND created_at < end_at;

  SELECT COUNT(*), COUNT(DISTINCT admin_user_id), COUNT(DISTINCT area)
    INTO v_admin_actions, v_unique_admins, v_unique_areas
  FROM public.admin_activity_events
  WHERE created_at >= start_at
    AND created_at < end_at;

  RETURN jsonb_build_object(
    'admin_pageviews', COALESCE(v_admin_pageviews, 0),
    'admin_actions', COALESCE(v_admin_actions, 0),
    'unique_admins', COALESCE(v_unique_admins, 0),
    'unique_areas', COALESCE(v_unique_areas, 0)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_activity_by_area(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS TABLE(area text, total_actions bigint, unique_admins bigint, last_activity timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    aae.area,
    COUNT(*)::bigint AS total_actions,
    COUNT(DISTINCT aae.admin_user_id)::bigint AS unique_admins,
    MAX(aae.created_at) AS last_activity
  FROM public.admin_activity_events aae
  WHERE aae.created_at >= start_at AND aae.created_at < end_at
  GROUP BY aae.area
  ORDER BY total_actions DESC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_activity_by_admin(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS TABLE(admin_user_id uuid, admin_email text, total_actions bigint, unique_areas bigint, last_activity timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    aae.admin_user_id,
    COALESCE(MAX(aae.admin_email), '(sem email)') AS admin_email,
    COUNT(*)::bigint AS total_actions,
    COUNT(DISTINCT aae.area)::bigint AS unique_areas,
    MAX(aae.created_at) AS last_activity
  FROM public.admin_activity_events aae
  WHERE aae.created_at >= start_at AND aae.created_at < end_at
  GROUP BY aae.admin_user_id
  ORDER BY total_actions DESC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_activity_timeline(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS TABLE(day date, total_actions bigint, total_pageviews bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    d::date AS day,
    COALESCE(a.cnt, 0)::bigint AS total_actions,
    COALESCE(p.cnt, 0)::bigint AS total_pageviews
  FROM generate_series(start_at::date, (end_at - interval '1 day')::date, '1 day') AS d
  LEFT JOIN (
    SELECT created_at::date AS dt, COUNT(*) AS cnt
    FROM public.admin_activity_events
    WHERE created_at >= start_at AND created_at < end_at
    GROUP BY created_at::date
  ) a ON a.dt = d::date
  LEFT JOIN (
    SELECT created_at::date AS dt, COUNT(*) AS cnt
    FROM public.page_views
    WHERE created_at >= start_at AND created_at < end_at
      AND actor_type = 'admin'
    GROUP BY created_at::date
  ) p ON p.dt = d::date
  ORDER BY d;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_activity_actions_list(
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  p_area text DEFAULT NULL,
  p_admin_user_id uuid DEFAULT NULL,
  p_action text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
 RETURNS TABLE(
   id uuid,
   admin_user_id uuid,
   admin_email text,
   area text,
   action text,
   entity_type text,
   entity_id text,
   path text,
   meta jsonb,
   created_at timestamp with time zone
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    aae.id, aae.admin_user_id, aae.admin_email, aae.area, aae.action,
    aae.entity_type, aae.entity_id, aae.path, aae.meta, aae.created_at
  FROM public.admin_activity_events aae
  WHERE aae.created_at >= start_at AND aae.created_at < end_at
    AND (p_area IS NULL OR aae.area = p_area)
    AND (p_admin_user_id IS NULL OR aae.admin_user_id = p_admin_user_id)
    AND (p_action IS NULL OR aae.action = p_action)
  ORDER BY aae.created_at DESC
  LIMIT p_limit;
END;
$function$;
