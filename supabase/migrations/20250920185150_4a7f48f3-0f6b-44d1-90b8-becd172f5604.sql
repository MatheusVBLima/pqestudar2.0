-- Remove the user_email column from course_suggestions table
-- This eliminates the risk of email harvesting entirely
ALTER TABLE public.course_suggestions DROP COLUMN IF EXISTS user_email;

-- Add a rate limiting mechanism for anonymous users
-- Create a simple IP-based tracking table for anonymous submissions
CREATE TABLE IF NOT EXISTS public.anonymous_course_suggestions_rate_limit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip_address, created_at)
);

-- Enable RLS on the rate limiting table
ALTER TABLE public.anonymous_course_suggestions_rate_limit ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert their own IP
CREATE POLICY "Anonymous users can log their submissions" 
ON public.anonymous_course_suggestions_rate_limit 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading recent submissions for rate limiting
CREATE POLICY "Allow reading recent submissions for rate limiting" 
ON public.anonymous_course_suggestions_rate_limit 
FOR SELECT 
USING (created_at > NOW() - INTERVAL '1 hour');

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_anon_rate_limit_ip_time 
ON public.anonymous_course_suggestions_rate_limit(ip_address, created_at);

-- Clean up old rate limit entries automatically (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limit_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM public.anonymous_course_suggestions_rate_limit 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;