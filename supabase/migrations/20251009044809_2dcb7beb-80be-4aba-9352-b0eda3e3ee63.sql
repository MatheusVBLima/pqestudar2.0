-- Add SELECT policy to anonymous_course_suggestions_rate_limit table
-- This restricts viewing of IP addresses to admin users only
CREATE POLICY "Only admins can view rate limit data"
ON anonymous_course_suggestions_rate_limit
FOR SELECT
TO authenticated
USING (is_admin());