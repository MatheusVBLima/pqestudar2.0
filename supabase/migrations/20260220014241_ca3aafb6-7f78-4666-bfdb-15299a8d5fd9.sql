
-- Fix: vote-images INSERT/UPDATE/DELETE policies must use TO public (same as tools-attachments which works)
-- tools-attachments uses roles:{public} + auth.uid() IN (SELECT user_id FROM user_roles WHERE role='admin')
-- vote-images was incorrectly set to roles:{authenticated} — changing to public to match the working pattern

DROP POLICY IF EXISTS "Admins can upload vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vote images" ON storage.objects;

CREATE POLICY "Admins can upload vote images"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (
    bucket_id = 'vote-images'
    AND auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update vote images"
  ON storage.objects FOR UPDATE
  TO public
  USING (
    bucket_id = 'vote-images'
    AND auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can delete vote images"
  ON storage.objects FOR DELETE
  TO public
  USING (
    bucket_id = 'vote-images'
    AND auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );
