-- Criar bucket para logos de ferramentas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tools-icons',
  'tools-icons',
  true,
  1572864, -- 1.5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Qualquer um pode ver os logos
CREATE POLICY "Public can view tool icons"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tools-icons');

-- Policy: Admins podem fazer upload
CREATE POLICY "Admins can upload tool icons"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tools-icons' 
  AND (SELECT public.is_admin())
);

-- Policy: Admins podem atualizar logos
CREATE POLICY "Admins can update tool icons"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tools-icons' 
  AND (SELECT public.is_admin())
);

-- Policy: Admins podem deletar logos
CREATE POLICY "Admins can delete tool icons"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'tools-icons' 
  AND (SELECT public.is_admin())
);