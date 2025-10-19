-- Add views column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0 NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_courses_views ON public.courses(views);

-- Create secure public view for active courses
CREATE OR REPLACE VIEW public.active_courses AS
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
  rating,
  created_at,
  updated_at,
  -- Calculated fields for cards
  COALESCE(upvotes, 0) as likes,
  COALESCE(downvotes, 0) as dislikes,
  CASE 
    WHEN COALESCE(upvotes, 0) + COALESCE(downvotes, 0) = 0 THEN NULL
    ELSE ROUND(
      ((COALESCE(upvotes, 0)::numeric - COALESCE(downvotes, 0)::numeric) 
       / NULLIF(COALESCE(upvotes, 0) + COALESCE(downvotes, 0), 0)::numeric) * 5, 
      1
    )
  END as calculated_rating
FROM public.courses
WHERE is_active = true AND is_hidden = false;

-- Grant SELECT on the view to anon and authenticated users
GRANT SELECT ON public.active_courses TO anon;
GRANT SELECT ON public.active_courses TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.active_courses IS 'Secure public view of active courses without creator/updater information';