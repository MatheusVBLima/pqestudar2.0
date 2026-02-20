
-- Drop todas as policies atuais de vote-images (qualquer nome que existir)
DROP POLICY IF EXISTS "Admins can upload vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vote images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view vote images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage vote images" ON storage.objects;
DROP POLICY IF EXISTS "vote_images_insert_admin" ON storage.objects;
DROP POLICY IF EXISTS "vote_images_update_admin" ON storage.objects;
DROP POLICY IF EXISTS "vote_images_delete_admin" ON storage.objects;
DROP POLICY IF EXISTS "vote_images_select_public" ON storage.objects;

-- INSERT: idêntico ao tools-icons (TO authenticated + SELECT is_admin())
CREATE POLICY "Admins can upload vote images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

-- UPDATE: idêntico ao tools-icons
CREATE POLICY "Admins can update vote images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

-- DELETE: idêntico ao tools-icons
CREATE POLICY "Admins can delete vote images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

-- SELECT: público (bucket é público)
CREATE POLICY "Public can view vote images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'vote-images');
