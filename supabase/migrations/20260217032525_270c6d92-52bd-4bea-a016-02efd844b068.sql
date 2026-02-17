
-- 1) Enum
DO $$ BEGIN
  CREATE TYPE public.feature_status AS ENUM ('open', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Feature requests table
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status public.feature_status NOT NULL DEFAULT 'open',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_visible ON public.feature_requests(is_visible);
CREATE INDEX IF NOT EXISTS idx_feature_requests_sort ON public.feature_requests(sort_order);

-- 3) Feature votes table
CREATE TABLE IF NOT EXISTS public.feature_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feature_votes_unique UNIQUE(feature_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_votes_feature ON public.feature_votes(feature_id, created_at);
CREATE INDEX IF NOT EXISTS idx_feature_votes_user ON public.feature_votes(user_id, created_at);

-- 4) Trigger updated_at
DROP TRIGGER IF EXISTS update_feature_requests_updated_at ON public.feature_requests;
CREATE TRIGGER update_feature_requests_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) View with votes count
CREATE OR REPLACE VIEW public.feature_requests_with_votes AS
SELECT
  fr.*,
  COALESCE(v.vote_count, 0)::int AS votes_count
FROM public.feature_requests fr
LEFT JOIN (
  SELECT feature_id, COUNT(*)::int AS vote_count
  FROM public.feature_votes
  GROUP BY feature_id
) v ON v.feature_id = fr.id;

-- 6) RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

-- feature_requests policies
DROP POLICY IF EXISTS "Public can view visible open features" ON public.feature_requests;
CREATE POLICY "Public can view visible open features"
ON public.feature_requests FOR SELECT
USING (status = 'open' AND is_visible = true);

DROP POLICY IF EXISTS "Admins can manage feature_requests" ON public.feature_requests;
CREATE POLICY "Admins can manage feature_requests"
ON public.feature_requests FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- feature_votes policies
DROP POLICY IF EXISTS "Users can vote" ON public.feature_votes;
CREATE POLICY "Users can vote"
ON public.feature_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unvote" ON public.feature_votes;
CREATE POLICY "Users can unvote"
ON public.feature_votes FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can see own votes" ON public.feature_votes;
CREATE POLICY "Users can see own votes"
ON public.feature_votes FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all votes" ON public.feature_votes;
CREATE POLICY "Admins can view all votes"
ON public.feature_votes FOR SELECT
USING (public.is_admin());

-- 7) Notifications tables
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_notifications_unique UNIQUE(notification_id, user_id)
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications"
ON public.notifications FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
CREATE POLICY "Users can view own notifications"
ON public.user_notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications"
ON public.user_notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all user_notifications" ON public.user_notifications;
CREATE POLICY "Admins can view all user_notifications"
ON public.user_notifications FOR SELECT
USING (public.is_admin());

-- 8) RPC: list features with vote count and user_voted
CREATE OR REPLACE FUNCTION public.list_feature_requests(include_hidden boolean DEFAULT false)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  status public.feature_status,
  is_visible boolean,
  sort_order int,
  votes_count int,
  user_voted boolean,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT fr.*
    FROM public.feature_requests fr
    WHERE
      (public.is_admin() AND include_hidden = true)
      OR (fr.status = 'open' AND fr.is_visible = true)
  ),
  counts AS (
    SELECT feature_id, COUNT(*)::int AS votes_count
    FROM public.feature_votes
    GROUP BY feature_id
  ),
  voted AS (
    SELECT feature_id, true AS user_voted
    FROM public.feature_votes
    WHERE user_id = auth.uid()
  )
  SELECT
    b.id, b.title, b.description, b.status, b.is_visible, b.sort_order,
    COALESCE(c.votes_count, 0)::int AS votes_count,
    COALESCE(v.user_voted, false) AS user_voted,
    b.completed_at, b.created_at, b.updated_at
  FROM base b
  LEFT JOIN counts c ON c.feature_id = b.id
  LEFT JOIN voted v ON v.feature_id = b.id
  ORDER BY b.sort_order ASC, b.created_at DESC;
$$;

-- 9) RPC: complete feature + broadcast notification
CREATE OR REPLACE FUNCTION public.complete_feature_request(p_feature_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
  v_notif_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  UPDATE public.feature_requests
  SET status = 'completed',
      completed_at = now()
  WHERE id = p_feature_id
  RETURNING title INTO v_title;

  IF v_title IS NULL THEN
    RAISE EXCEPTION 'feature_not_found';
  END IF;

  INSERT INTO public.notifications(title, body)
  VALUES ('Novo lançamento concluído ✅', v_title)
  RETURNING id INTO v_notif_id;

  INSERT INTO public.user_notifications(notification_id, user_id)
  SELECT v_notif_id, u.id
  FROM auth.users u;
END $$;
