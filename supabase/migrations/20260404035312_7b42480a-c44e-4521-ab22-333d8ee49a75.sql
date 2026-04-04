
-- Add cover_image_url column to guides
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Create guide-covers storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide-covers', 'guide-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public can read guide covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guide-covers');

-- Admin can upload guide covers
CREATE POLICY "Admin can upload guide covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guide-covers'
  AND (SELECT public.is_admin())
);

-- Admin can update guide covers
CREATE POLICY "Admin can update guide covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guide-covers'
  AND (SELECT public.is_admin())
);

-- Admin can delete guide covers
CREATE POLICY "Admin can delete guide covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'guide-covers'
  AND (SELECT public.is_admin())
);
