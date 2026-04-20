-- Restringir listagem do bucket guide-link-images apenas a admins
-- O acesso público por URL continua funcionando (bucket é public e o CDN serve direto, sem checar RLS de SELECT)
DROP POLICY IF EXISTS "Public can read guide link images" ON storage.objects;

CREATE POLICY "Admins can list guide link images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'guide-link-images'
  AND (SELECT public.is_admin())
);