-- Restringir SELECT (listagem) dos buckets públicos restantes apenas a admins.
-- O acesso público por URL continua intacto: buckets são `public`, e o CDN serve direto sem checar RLS.

DROP POLICY IF EXISTS "Public can read guide covers" ON storage.objects;
CREATE POLICY "Admins can list guide covers"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'guide-covers' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Public can view tool icons" ON storage.objects;
CREATE POLICY "Admins can list tool icons"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'tools-icons' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Anexos são publicamente acessíveis" ON storage.objects;
CREATE POLICY "Admins can list tools attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'tools-attachments' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Admins can list product images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Public can view vote images" ON storage.objects;
CREATE POLICY "Admins can list vote images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vote-images' AND (SELECT public.is_admin()));