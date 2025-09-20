-- Fix the function search path issue by updating the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limit_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM public.anonymous_course_suggestions_rate_limit 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;