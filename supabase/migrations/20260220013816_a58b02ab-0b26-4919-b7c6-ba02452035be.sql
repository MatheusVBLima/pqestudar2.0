
-- Fix: vote-images RLS policies using the same EXISTS pattern as tools-attachments (which works)
-- The (SELECT is_admin()) wrapper still fails in storage context; direct EXISTS query against user_roles works.

DROP POLICY IF EXISTS "Admins can upload vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vote images" ON storage.objects;

CREATE POLICY "Admins can upload vote images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vote-images'
    AND auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update vote images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can delete vote images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );
