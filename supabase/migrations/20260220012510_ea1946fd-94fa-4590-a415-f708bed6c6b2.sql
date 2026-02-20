
-- Fix Storage RLS Policies for vote-images bucket
-- Replace bare is_admin() calls with (SELECT public.is_admin()) subquery pattern
-- This matches the working tools-icons bucket implementation

DROP POLICY IF EXISTS "Admins can upload vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vote images" ON storage.objects;

CREATE POLICY "Admins can upload vote images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

CREATE POLICY "Admins can update vote images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

CREATE POLICY "Admins can delete vote images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );
