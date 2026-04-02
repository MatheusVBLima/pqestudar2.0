
-- Create storage bucket for guide link images
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide-link-images', 'guide-link-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload
CREATE POLICY "Admins can upload guide link images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guide-link-images'
  AND (SELECT public.is_admin())
);

-- Allow admins to update
CREATE POLICY "Admins can update guide link images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guide-link-images'
  AND (SELECT public.is_admin())
);

-- Allow admins to delete
CREATE POLICY "Admins can delete guide link images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'guide-link-images'
  AND (SELECT public.is_admin())
);

-- Allow public read
CREATE POLICY "Public can read guide link images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guide-link-images');
