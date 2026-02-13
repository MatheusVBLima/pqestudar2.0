
-- 1) session_id default
ALTER TABLE public.analytics_events ALTER COLUMN session_id SET DEFAULT gen_random_uuid()::text;

-- 2) GRANTS for insert
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.analytics_events TO authenticated;

-- 3) Update analytics_top_tools to include tool_card_click
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
  GROUP BY ae.entity_id, ae.meta->>'tool_slug'
  ORDER BY click_count DESC
  LIMIT 50;
END;
$function$;

-- 4) Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
