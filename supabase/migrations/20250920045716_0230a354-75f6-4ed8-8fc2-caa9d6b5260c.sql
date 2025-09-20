-- Fix security issue: Remove anonymous access to course suggestions
-- This prevents exposure of email addresses to unauthorized users

-- Drop the existing policy that allows anonymous viewing
DROP POLICY IF EXISTS "Users can view their own suggestions" ON public.course_suggestions;

-- Create a new policy that only allows authenticated users to view their own suggestions
CREATE POLICY "Authenticated users can view their own suggestions" 
ON public.course_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Keep the insert policy but make it more secure by ensuring user_id is set for authenticated users
DROP POLICY IF EXISTS "Anyone can create course suggestions" ON public.course_suggestions;

-- Allow anonymous suggestions (user_id will be NULL) and authenticated suggestions (user_id must match)
CREATE POLICY "Users can create course suggestions" 
ON public.course_suggestions 
FOR INSERT 
WITH CHECK (
  -- Either anonymous (no auth.uid() and user_id is NULL)
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  -- Or authenticated (auth.uid() matches user_id)
  (auth.uid() = user_id)
);