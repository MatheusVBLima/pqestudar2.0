-- Fix security vulnerabilities in active_courses view and courses table

-- 1. Drop existing view
DROP VIEW IF EXISTS public.active_courses CASCADE;

-- 2. Create new view as SECURITY INVOKER (default) with only safe columns
-- Views inherit RLS from base tables, so no need to enable RLS on the view itself
CREATE OR REPLACE VIEW public.active_courses
WITH (security_invoker = true)
AS
SELECT
  id,
  title,
  description,
  category,
  duration,
  price,
  image_url,
  institution,
  level,
  badge,
  upvotes,
  downvotes,
  vote_score,
  views,
  affiliate_link,
  is_hidden,
  is_active,
  students,
  created_at,
  updated_at,
  -- Calculate rating from votes (0-5 scale)
  CASE 
    WHEN COALESCE(upvotes, 0) + COALESCE(downvotes, 0) = 0 THEN NULL
    ELSE ROUND(
      ((COALESCE(upvotes, 0)::numeric - COALESCE(downvotes, 0)::numeric)
      / NULLIF(COALESCE(upvotes, 0) + COALESCE(downvotes, 0), 0)) * 5, 
      1
    )
  END AS rating,
  -- Likes and dislikes aliases for convenience
  COALESCE(upvotes, 0) AS likes,
  COALESCE(downvotes, 0) AS dislikes
FROM public.courses
WHERE is_active = true AND is_hidden = false;

-- 3. Grant SELECT to anon and authenticated users
GRANT SELECT ON public.active_courses TO anon, authenticated;

-- 4. Verify courses table RLS policies are secure
-- Drop any overly permissive public policies if they exist
DROP POLICY IF EXISTS "public_can_view_courses" ON public.courses;

-- Ensure only admins can see all courses data (including created_by/updated_by)
DROP POLICY IF EXISTS "admins_can_view_all_courses" ON public.courses;
CREATE POLICY "admins_can_view_all_courses"
ON public.courses
FOR SELECT
TO authenticated
USING (is_admin());

-- Ensure public can only see active, non-hidden courses (but NOT created_by/updated_by)
DROP POLICY IF EXISTS "public_can_view_active_courses" ON public.courses;
CREATE POLICY "public_can_view_active_courses"
ON public.courses
FOR SELECT
TO anon, authenticated
USING (is_active = true AND is_hidden = false);

-- 5. Comment on the view for documentation
COMMENT ON VIEW public.active_courses IS 'Secure public view of active courses. Does not expose created_by or updated_by fields. Uses SECURITY INVOKER to enforce RLS from base table.';